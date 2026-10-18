import { calcDamage } from './calcDamage'
import { hasErrors, validateInput } from './normalize'
import type { CalcInput, CalcResult } from './types'

/**
 * 探索する敵ATKの上限。ここでもダメージが0なら「上限なし」とする。
 * rounding.ts が扱える有効桁数（12桁）に収まる範囲にしている。
 */
const SEARCH_LIMIT_ATK = 1e10

/** 完封できる敵ATKの上限。Infinity は「どんなATKでもダメージ0」、0 は「ATK 1 でもダメージが出る」 */
export type ShutoutAtk = {
  noRandom: number
  maxRandom: number
}

/**
 * 被ダメージが0になる最大の敵ATKを探す。
 * 敵ATKが大きいほど被ダメージは増える（減らない）ので、二分探索で求める。
 * 計算式と端数処理は calcDamage に任せ、ここでは持たない。
 */
function findMaxShutoutAtk(damageAt: (enemyAtk: number) => number): number {
  if (damageAt(1) > 0) return 0

  // ダメージが0でなくなるATKを、倍々に増やして見つける
  let zero = 1
  let nonZero = 2
  while (damageAt(nonZero) === 0) {
    if (nonZero >= SEARCH_LIMIT_ATK) return Infinity
    zero = nonZero
    nonZero *= 2
  }

  // zero ではダメージ0、nonZero ではダメージが出る。その境目を探す
  while (nonZero - zero > 1) {
    const middle = Math.floor((zero + nonZero) / 2)
    if (damageAt(middle) === 0) zero = middle
    else nonZero = middle
  }
  return zero
}

/**
 * 完封（被ダメージ0）できる敵ATKの上限を、乱数なし・最大乱数で計算する（spec 5章）。
 * 敵ATK以外の入力を使うので、敵ATKが未入力でも計算できる。
 * @param input 計算の入力（enemyAtk は使わない）
 * @returns 上限。画面のDEFが未入力・入力にエラーがあるときは null
 */
export function calcShutoutAtk(input: CalcInput): ShutoutAtk | null {
  // 敵ATKは探索で決めるため、検証では妥当な値（1）に差し替える
  if (hasErrors(validateInput({ ...input, enemyAtk: 1 }))) return null

  const damageOf = (enemyAtk: number): CalcResult => {
    const result = calcDamage({ ...input, enemyAtk })
    // 検証済みの入力で ATK ≥ 1 なので、null にはならない
    if (result === null) throw new Error('検証済みの入力で計算できませんでした')
    return result
  }

  return {
    noRandom: findMaxShutoutAtk((atk) => damageOf(atk).noRandom),
    maxRandom: findMaxShutoutAtk((atk) => damageOf(atk).maxRandom),
  }
}
