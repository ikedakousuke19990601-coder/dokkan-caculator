import { calcDef } from './calcDef'
import { hasErrors, validateInput } from './normalize'
import { roundFinal, roundIntermediate } from './rounding'
import type { CalcInput, CalcResult } from './types'

/** 乱数（％）。乱数なし r=1.00、最大乱数 r=1.03（spec 4章） */
const RANDOM_NONE_PERCENT = 100
const RANDOM_MAX_PERCENT = 103

/** 全属性ガードがオンのときの属性防御係数B */
const ALL_ATTR_GUARD_B = 0.5

/**
 * 乱数 r のときの被ダメージを計算する。
 *
 * 基本ダメージ(r) = { 敵ATK × r × A × (1 − 軽減率) − 現在DEF } × B × フィールド補正
 * 結果(r) = max(0, 基本ダメージ(r))
 *
 * 仮仕様: ダメージ側の端数処理は未確認（spec 7章）。
 * DEF側に合わせ、フィールド補正の手前までは掛けるたびに切り捨て、最終値のみ四捨五入する。
 */
function calcDamageAt(input: CalcInput, currentDef: number, randomPercent: number): number {
  const b = input.allAttrGuardB ? ALL_ATTR_GUARD_B : 1

  let damage = roundIntermediate((input.enemyAtk * randomPercent) / 100)
  damage = roundIntermediate(damage * input.attrGuardA)
  damage = roundIntermediate((damage * (100 - input.reductionPercent)) / 100)
  damage = roundIntermediate((damage - currentDef) * b)

  return roundFinal(Math.max(0, damage * input.fieldCorrection))
}

/**
 * 被ダメージを計算する。
 * @param input 計算の入力
 * @returns 乱数なし・最大乱数の被ダメージ。入力にエラーがあるときは null
 */
export function calcDamage(input: CalcInput): CalcResult | null {
  if (hasErrors(validateInput(input))) return null

  const currentDef = calcDef(input)
  return {
    noRandom: calcDamageAt(input, currentDef, RANDOM_NONE_PERCENT),
    maxRandom: calcDamageAt(input, currentDef, RANDOM_MAX_PERCENT),
  }
}
