# Auditive

## 📁 Project Structure

```
src/
├── api/            # API呼び出し関数（fetch ラッパー）
├── auth/           # Authentication context & routes
├── components/
│   ├── Content/    # Page creation, editing, display
│   ├── Menu/       # Navigation system
│   ├── BackgroundVideo/
│   └── CyberCursor/  # Custom cursor effect
├── hooks/          # Custom hooks (useSiteSettings)
├── lib/amplify/    # AWS Amplify configuration
└── types/          # TypeScript definitions
```

## インフラ最適化検討メモ

### 現状の課題

- 一般ユーザーの読み取り（Markdown コンテンツ取得）が全て AppSync → DynamoDB 経由
- DynamoDB のコストは低いが、AppSync のリクエスト課金が高トラフィック時に問題になる
- AppSync のキャッシュ機能はリクエスト課金自体を削減できない
- Subscription も使っておらず、GraphQL のメリットを活かしきれていない

### 決定：AppSync を廃止し API Gateway に完全移行

#### 理由

- API Gateway は AppSync よりレイテンシが低く、料金も安い
- 今回のユースケース（シンプルな Markdown CRUD）に GraphQL は不要
- Subscription も使っていないため AppSync のメリットがない

#### 構成

```
[Admin CRUD] → API Gateway → Lambda → DynamoDB
                                  └→ S3 に .md ファイル出力

[一般User] GitHub Pages（auditive.tokyo）
     ↓ fetch()（CORS設定必要）
[API Gateway REST API] → S3（.md ファイル取得・AWS統合で Lambda 不要）
```

#### コスト比較（月 100 万リクエスト想定）

|            | AppSync（現状）         | API Gateway + Lambda（移行後）         |
| ---------- | ----------------------- | -------------------------------------- |
| 無料枠     | 25 万/月                | API GW: 100 万/月、Lambda: 100 万/月   |
| 超過後単価 | \$4.00/100 万           | API GW \$3.50/100 万 + Lambda ほぼ無料 |
| 接続課金   | あり（Subscription 時） | なし                                   |

#### 実装ステップ

1. API Gateway REST API を作成（Admin CRUD 用）
2. Lambda で DynamoDB CRUD を実装し、書き込み時に S3 へ .md ファイルを出力
3. Cognito Authorizer を API Gateway に設定
4. API Gateway の AWS 統合で一般ユーザー向け読み取りを S3 に直接接続
5. API Gateway の実行ロールに S3 読み取り権限（IAM）を付与
6. S3 バケットに CORS 設定を追加
7. フロントエンドの API 呼び出しを GraphQL → fetch (REST) に変更
8. AppSync・関連 CloudFormation リソースを削除

#### カスタムドメイン（任意・後から付与可能）

|            | デフォルト URL                                  | カスタムドメイン例        |
| ---------- | ----------------------------------------------- | ------------------------- |
| URL        | `xxxx.execute-api.ap-northeast-1.amazonaws.com` | `api.auditive.tokyo`      |
| 設定コスト | ゼロ                                            | ACM 証明書 + Route53 設定 |

#### 注意点

- GraphQL → REST への変更でフロントエンドの書き直しが必要
- HTTP API ではなく **REST API** を使う（HTTP API は AWS 統合非対応）
- S3 の CORS 設定を忘れると GitHub Pages からのアクセスが失敗する
- Admin 書き込みから S3 反映まで数秒のラグがある
- CloudFormation/SAM テンプレートの書き直しが必要

#### ステータス

- [ ] 実装予定
