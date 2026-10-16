### 【Issue タイトル】
`[Phase 0 / Setup] GitHub連携とホスティングの自動デプロイ設定`

#### 🧭 依存関係・前提条件
- **先行するIssue**: #01 Vite + React + TypeScript + Tailwind + Vitest の雛形作成
- **対象レイヤー**: リポジトリ設定、ホスティング（Vercel または Cloudflare Pages）

#### 📋 概要
GitHub への push で静的ファイルが自動デプロイされるようにし、早い段階から公開URLで動作確認できるようにする。

#### 🛠️ タスク一覧
- [ ] GitHub にリポジトリを作成して push する
- [ ] Vercel または Cloudflare Pages（無料枠）を選び、リポジトリと連携する
- [ ] ビルドコマンド（`npm run build`）と出力先（`dist`）を設定する
- [ ] プレビューデプロイ（ブランチ・PRごと）が動くことを確認する
- [ ] （任意）GitHub Actions で push 時に `npm test` を実行する

#### 🎯 受け入れ基準（Definition of Done）
- [ ] main ブランチへの push で自動デプロイされる
- [ ] 公開URL（HTTPS）で空の画面が表示される
