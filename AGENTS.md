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
├── lib/amplify/    # AWS Amplify configuration (Cognito auth only)
└── types/          # TypeScript definitions
```

## ⚡ パフォーマンス改善メモ（PageSpeed mobile: 78）

### 主なボトルネック

- JSバンドルが単一ファイル（vite v8移行後: 1,410KB / gzip: 393KB）
- 未使用JS削減余地 204 KiB、JS実行時間 2.6s、3 long tasks
- `mermaid` が重い（mermaid-parser: 603KB、cytoscape: 434KB）—Mermaidはサイトの主要機能のため削除不可

### 対応候補

| 施策 | 効果 | 実装コスト | ステータス |
|--|--|--|--|
| `@monaco-editor/react` 削除（未使用だった） | 小 | 済 | ✅ 完了 |
| `mermaid` を `React.lazy` で遅延ロード | **大**（初期バンドルから600KB+削減） | 低 | 未着手 |
| Admin系コンポーネントを `React.lazy` で遅延ロード | 大（初期バンドル削減） | 中 | 未着手 |
| `manualChunks` でライブラリを別チャンクに分割 | 中（並列取得・キャッシュ効率化） | 低 | 未着手 |
| S3レスポンスに `Cache-Control: max-age` を付与 | 中（再訪問時） | 低 | 未着手 |

### メモ

- **背景動画のlazyload**は意味なし（初期表示から必要なため）
- **背景動画の複数読み込み**は実際は無問題。ブラウザが同URLをキャッシュするため実ダウンロードは1回（PageSpeedの表示が複数エントリになるだけ）
- **CSSブロッキング**（160ms）はSPAの構造上ほぼ対処不可・誤差レベルなので無視でOK
- **GitHub Pagesのキャッシュ**はデフォルト `max-age=600`（10分）でユーザー側で変更不可
- `aws-amplify` はCognito (`signIn`/`signOut`/`fetchAuthSession`) に必要なため削除不可
- API GatewayはS3直接統合（Lambda不使用）なのでキャッシュ不要。月100万リクエスト無料枠で十分
