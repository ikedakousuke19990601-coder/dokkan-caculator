### 【Issue タイトル】
`[Phase 3 / Release] 対応ブラウザ確認と本番公開`

#### 🧭 依存関係・前提条件
- **先行するIssue**: #02 GitHub連携とホスティングの自動デプロイ設定、#17 レスポンシブ対応とスマホ入力の最適化
- **対象レイヤー**: アプリ全体、ホスティング

#### 📋 概要
対応ブラウザ（最新のChrome・Safari）の実機で動作を確認し、本番環境に公開して使い始められる状態にする。

#### 🛠️ タスク一覧
- [ ] 実機の iPhone Safari で全入力・結果表示・保存復元を確認する
- [ ] Android / PC の Chrome で同様に確認する
- [ ] Safari のプライベートブラウズで localStorage が使えなくても起動することを確認する
- [ ] ページタイトル・favicon・`<meta name="viewport">` を整える
- [ ] 本番デプロイし、公開URLで動作を確認する
- [ ] README に使い方・「目安」である旨・計算式の参考資料を記載する

#### 🎯 受け入れ基準（Definition of Done）
- [ ] 実機の Safari・Chrome で全機能が操作できる
- [ ] 公開URL（HTTPS）で誰でも利用できる
- [ ] `npm test` と `npm run build` がすべてパスしている
