### 【Issue タイトル】
`[Phase 3 / Storage] localStorage 読み書きモジュールの実装`

#### 🧭 依存関係・前提条件
- **先行するIssue**: #03 入出力の型定義と既定値の実装
- **対象レイヤー**: `src/storage/inputStorage.ts`

#### 📋 概要
前回の入力（`CalcInput` 1件）を localStorage に保存・復元するモジュールを作る。壊れたデータや保存不可の環境でも、アプリが落ちずに既定値で起動できるようにする。

#### 🛠️ タスク一覧
- [ ] キー `dokkan-damage-calc:v1` で `CalcInput` をJSON保存する `saveInput` を実装する
- [ ] `loadInput` を実装し、JSONを検証してから使う（型・範囲・区分名・Aの値など）
- [ ] 不正なデータ・パース失敗時は `DEFAULT_INPUT` にフォールバックする
- [ ] localStorage が使えない環境（プライベートモード等）で例外を握りつぶし、落ちないようにする
- [ ] 外部への送信が一切ないことを確認する
- [ ] `inputStorage.test.ts` を作成する

#### 🎯 受け入れ基準（Definition of Done）
- [ ] 保存 → 復元で同じ `CalcInput` が得られるテストがパスする
- [ ] 壊れたJSON・型違い・未知の区分を含むデータで `DEFAULT_INPUT` が返るテストがパスする
- [ ] `localStorage.setItem` が例外を投げる環境でもエラーにならないテストがパスする
