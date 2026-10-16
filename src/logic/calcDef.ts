import { roundIntermediate } from './rounding'
import { EFFECT_CATEGORIES, type CalcInput, type DefEffect, type EffectCategory } from './types'

/** 区分ごとに追加％を合算する（spec 4章: 同じ区分の行は足してから1回だけ掛ける） */
function sumAddPercent(effects: DefEffect[]): Record<EffectCategory, number> {
  const sums = Object.fromEntries(EFFECT_CATEGORIES.map((c) => [c, 0])) as Record<
    EffectCategory,
    number
  >
  for (const effect of effects) {
    sums[effect.category] += effect.addPercent
  }
  return sums
}

/**
 * 現在DEFを計算する（spec 4章）。
 *
 * 現在DEF = 画面のDEF × Π(区分ごと) (1 + 反映済み% + 追加%の合計) ÷ (1 + 反映済み%)
 *
 * 参考記事に合わせ、区分は ④-足 → ④-掛 → ⑤ → ⑥ → ⑧ の順に掛け、区分ごとに切り捨てる。
 * 入力は validateInput で検証済みであること（反映済み％ > -100）。
 *
 * @param input 画面のDEF・効果行・反映済み％
 * @returns 現在DEF（切り捨て済みの整数）
 */
export function calcDef(
  input: Pick<CalcInput, 'screenDef' | 'effects' | 'appliedPercent'>,
): number {
  const addSums = sumAddPercent(input.effects)

  let def = input.screenDef
  for (const category of EFFECT_CATEGORIES) {
    const applied = input.appliedPercent[category]
    // ％のまま掛けてから割ると、1.15 のような小数を経由せず誤差が出にくい
    def = roundIntermediate((def * (100 + applied + addSums[category])) / (100 + applied))
  }
  return def
}
