#!/usr/bin/env python3
import os

import aws_cdk as cdk

from lambda_stack import LambdaStack
from appsync_stack import AppSyncStack

app = cdk.App()

env = cdk.Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT"),
    region=os.getenv("CDK_DEFAULT_REGION", "ap-northeast-1"),
)

lambda_stack = LambdaStack(app, "auditive-lambda", env=env)

appsync_stack = AppSyncStack(
    app,
    "auditive-appsync",
    contact_form_fn=lambda_stack.contact_form_fn,
    env=env,
)
appsync_stack.add_dependency(lambda_stack)

app.synth()
