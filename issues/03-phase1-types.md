### 【Issue タイトル】
`[Phase 1 / Logic] 入出力の型定義と既定値の実装`

#### 🧭 依存関係・前提条件
- **先行するIssue**: #01 Vite + React + TypeScript + Tailwind + Vitest の雛形作成
- **対象レイヤー**: `src/logic/types.ts`

#### 📋 概要
計算ロジック・UI・保存層のすべてが共有する入出力の型と既定値を定義し、区分や係数の取り違えをコンパイル時に防ぐ。

#### 🛠️ タスク一覧
- [ ] `EffectCategory`（`passiveAdd` / `passiveMul` / `support` / `active` / `superAttack`）を定義する
- [ ] `DefEffect`（`id` / `category` / `addPercent`）を定義する
- [ ] `CalcInput`（画面のDEF、効果行、反映済み％、敵ATK、軽減率、属性防御A/B、フィールド補正）を定義する
- [ ] `AttrGuardA` を `1.0 | 0.9 | 0.8 | 0.7 | 0.6` のリテラル型で定義する
- [ ] `CalcResult`（`noRandom` / `maxRandom`）を定義する
- [ ] 区分の表示名（「パッシブ（足し算）」など）の対応表を定数で用意する
- [ ] spec 3章の初期値に沿った既定値 `DEFAULT_INPUT` を定義する（効果行は2行をあらかじめ用意、反映済み％は全区分0、軽減率0、A=1.0、B=オフ、フィールド補正=1）
- [ ] React・DOM・localStorage を import していないことを確認する

#### 🎯 受け入れ基準（Definition of Done）
- [ ] `tsc --noEmit` がエラーなく通る
- [ ] 区分の選択肢が spec 3章の5種類（④-足・④-掛・⑤・⑥・⑧）と一致している
- [ ] 既定値が spec 3章の初期値と一致している
