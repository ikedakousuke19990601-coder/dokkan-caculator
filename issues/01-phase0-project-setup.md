### 【Issue タイトル】
`[Phase 0 / Setup] Vite + React + TypeScript + Tailwind + Vitest の雛形作成`

#### 🧭 依存関係・前提条件
- **先行するIssue**: なし
- **対象レイヤー**: プロジェクトルート、`src/`

#### 📋 概要
architecture.md の技術スタックに沿った開発環境を用意し、以降のロジック実装（テスト駆動）とUI実装をすぐ始められる状態にする。

#### 🛠️ タスク一覧
- [ ] Vite の React + TypeScript テンプレートでプロジェクトを作成する
- [ ] Tailwind CSS を導入し、`App.tsx` でクラスが効くことを確認する
- [ ] Vitest を導入し、`npm test` で実行できるようにする
- [ ] architecture.md 3章のディレクトリ（`logic/` `storage/` `components/` `hooks/`）を作成する
- [ ] TypeScript を `strict` で設定する
- [ ] ESLint / Prettier を設定する（任意）
- [ ] `.gitignore` を整備し、Git リポジトリを初期化する

#### 🎯 受け入れ基準（Definition of Done）
- [ ] `npm run dev` で空の画面がブラウザに表示される
- [ ] `npm test` でサンプルテストが1件パスする
- [ ] `npm run build` がエラーなく完了する
