import os
import json
import time
import smtplib
import boto3
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

dynamodb = boto3.resource('dynamodb')

RATE_LIMIT = 3  # 1分間に3回まで
RATE_LIMIT_WINDOW = 60  # 60秒

def check_rate_limit(ip):
    """IPごとのレートリミットをチェック"""
    table_name = os.environ.get('RATE_LIMIT_TABLE')
    if not table_name:
        return True  # テーブル未設定時はスキップ
    
    table = dynamodb.Table(table_name)
    now = int(time.time())
    ttl = now + RATE_LIMIT_WINDOW
    
    try:
        response = table.update_item(
            Key={'ip': ip},
            UpdateExpression='SET #count = if_not_exists(#count, :zero) + :inc, #ttl = :ttl',
            ExpressionAttributeNames={'#count': 'count', '#ttl': 'ttl'},
            ExpressionAttributeValues={':zero': 0, ':inc': 1, ':ttl': ttl},
            ReturnValues='ALL_NEW'
        )
        count = response['Attributes']['count']
        return count <= RATE_LIMIT
    except Exception as e:
        print(f"Rate limit check error: {e}")
        return True  # エラー時は許可

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    # IPアドレス取得（AppSync経由）
    # AppSync Lambda Resolverでは request.headers からIPを取得
    ip = 'unknown'
    request_context = event.get('request', {})
    headers = request_context.get('headers', {})
    
    # CloudFront/ALB経由の場合は x-forwarded-for を確認
    if 'x-forwarded-for' in headers:
        # x-forwarded-for は "client, proxy1, proxy2" 形式なので最初のIPを取得
        ip = headers['x-forwarded-for'].split(',')[0].strip()
    elif 'sourceIp' in event.get('identity', {}):
        ip = event['identity']['sourceIp']
    
    print(f"Client IP: {ip}")
    
    # レートリミットチェック
    if not check_rate_limit(ip):
        return {"success": False, "message": "Too many requests. Please try again later."}

    # AppSync Lambda Resolver format
    args = event.get('arguments', {})
    name = args.get('name')
    email = args.get('email')
    message = args.get('message')

    if not all([name, email, message]):
        return {"success": False, "message": "Missing required fields"}

    sender_email = os.environ['SENDER_EMAIL']
    receiver_email = os.environ['RECEIVER_EMAIL']
    password = os.environ['APP_PASSWORD']
    smtp_server = "smtp.zoho.jp"
    smtp_port = 465

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = f"New contact from {name}"

    body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "message": "Failed to send email"}