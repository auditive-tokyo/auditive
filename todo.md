# Auditive

## インフラ最適化検討メモ

### 現状の課題

- 一般ユーザーの読み取り（Markdown コンテンツ取得）が全て AppSync → DynamoDB 経由
- DynamoDB のコストは低いが、AppSync のリクエスト課金が高トラフィック時に問題になる
- AppSync のキャッシュ機能はリクエスト課金自体を削減できない

### 提案：CloudFront + S3 による読み取りの分離

#### 概要

一般ユーザーの読み取りを AppSync から切り離し、CloudFront + S3 で配信する。
Admin の書き込み（CRUD）は引き続き AppSync + DynamoDB を使用する。

#### 構成

```
[Admin] → AppSync → DynamoDB → (Lambda trigger) → S3 に .md ファイル出力
                                                        ↓
[一般User] → CloudFront → S3（キャッシュヒット率ほぼ100%）
```

#### 実装ステップ

1. DynamoDB Streams + Lambda trigger を設定
2. Lambda で Markdown を S3 に書き出す
3. S3 の前段に CloudFront を配置
4. フロントエンドの一般ユーザー向け読み取りを CloudFront の URL に切り替える
5. Admin 向けの CRUD 操作は AppSync のまま維持

#### 期待される効果

- 一般ユーザーの読み取りで AppSync リクエスト課金が発生しなくなる
- CloudFront のキャッシュにより高速配信 & 低コスト
- DynamoDB の読み取りも一般ユーザー分はゼロになる
- 月 100 万リクエスト想定: AppSync ~$4.00 → CloudFront + S3 ~$0.85

#### 注意点

- Admin が書き込んでから S3 に反映されるまで若干のラグがある（数秒程度）
- CloudFront の TTL 設定によっては、キャッシュ無効化（Invalidation）の考慮が必要
- S3 のファイル構成・命名規則を DynamoDB のキー設計と合わせる必要あり

#### ステータス

- [ ] 検討中
