import { describe, expect, it } from 'vitest'
import { calcDamage } from './calcDamage'
import { calcShutoutAtk } from './calcShutoutAtk'
import { DEFAULT_INPUT, type CalcInput } from './types'

/**
 * 基本の入力: 画面のDEF 10000、④-足 +50%、⑥ +30% → 現在DEF 19500（calcDamage.test.ts と同じ）
 * 敵ATK は使わないので未入力（0）のまま
 */
const baseInput: CalcInput = {
  ...DEFAULT_INPUT,
  screenDef: 10000,
  effects: [
    { id: 'a', category: 'passiveAdd', addPercent: 50 },
    { id: 'b', category: 'active', addPercent: 30 },
  ],
}

/** 画面のDEF 10000 だけの入力（効果なし） */
const plainInput: CalcInput = { ...DEFAULT_INPUT, screenDef: 10000, effects: [] }

describe('calcShutoutAtk（完封できる敵ATKの上限）', () => {
  it('基本ケース → 乱数なし 19,500 / 最大乱数 18,933', () => {
    // 現在DEF 19,500
    // r=1.00: ATK − 19,500 ≤ 0 → ATK ≤ 19,500（19,501 だと 1 が出る）
    // r=1.03: 18,933 × 1.03 = 19,500.99 → 19,500 − 19,500 = 0（18,934 × 1.03 = 19,502.02 → 2）
    expect(calcShutoutAtk(baseInput)).toEqual({ noRandom: 19500, maxRandom: 18933 })
  })

  it('上限ではダメージ0、上限+1ではダメージが出る（乱数なし・最大乱数とも）', () => {
    const limit = calcShutoutAtk(baseInput)
    if (limit === null) throw new Error('計算できるはず')

    const at = (enemyAtk: number) => calcDamage({ ...baseInput, enemyAtk })
    expect(at(limit.noRandom)?.noRandom).toBe(0)
    expect(at(limit.noRandom + 1)?.noRandom).toBeGreaterThan(0)
    expect(at(limit.maxRandom)?.maxRandom).toBe(0)
    expect(at(limit.maxRandom + 1)?.maxRandom).toBeGreaterThan(0)
  })

  it('敵ATKの入力値には左右されない', () => {
    expect(calcShutoutAtk({ ...baseInput, enemyAtk: 5 })).toEqual(
      calcShutoutAtk({ ...baseInput, enemyAtk: 1000000 }),
    )
  })

  it('全属性ガード → 乱数なし 24,377 / 最大乱数 23,667（A=0.8・B=0.5）', () => {
    // DEF を引いた値が 1 でも × 0.5 で 0 に切り捨てられるため、DEF 19,500 を少し超えても完封になる
    // r=1.00: 24,377 × 0.8 = 19,501.6 → 19,501 − 19,500 = 1 → × 0.5 = 0.5 → 0（24,378 × 0.8 = 19,502.4 → 2 → 1）
    // r=1.03: 23,667 × 1.03 = 24,377.01 → 24,377 × 0.8 = 19,501.6 → 19,501 − 19,500 = 1 → 0
    //         （23,668 × 1.03 = 24,378.04 → 24,378 × 0.8 = 19,502.4 → 19,502 − 19,500 = 2 → 1）
    expect(calcShutoutAtk({ ...baseInput, allAttrGuardB: true })).toEqual({
      noRandom: 24377,
      maxRandom: 23667,
    })
  })

  it('全属性ガードがオンなら、選んだ属性防御係数A は使わない', () => {
    expect(calcShutoutAtk({ ...baseInput, allAttrGuardB: true, attrGuardA: 0.6 })).toEqual(
      calcShutoutAtk({ ...baseInput, allAttrGuardB: true }),
    )
  })

  it('軽減率50% → 乱数なし 20,001 / 最大乱数 19,419', () => {
    // DEF 10,000。r=1.00: 20,001 × 0.5 = 10,000.5 → 10,000 − 10,000 = 0（20,002 → 10,001 → 1）
    // r=1.03: 19,419 × 1.03 = 20,001.57 → 20,001 × 0.5 = 10,000.5 → 10,000 → 0（19,420 → 20,002 → 10,001 → 1）
    expect(calcShutoutAtk({ ...plainInput, reductionPercent: 50 })).toEqual({
      noRandom: 20001,
      maxRandom: 19419,
    })
  })

  it('効果でDEFが上がると、上限も上がる → 乱数なし 20,000 / 最大乱数 19,418', () => {
    // DEF 10,000 × 2.0 = 20,000
    // r=1.00: ATK ≤ 20,000
    // r=1.03: 19,418 × 1.03 = 20,000.54 → 20,000 − 20,000 = 0（19,419 × 1.03 = 20,001.57 → 1）
    const input: CalcInput = {
      ...plainInput,
      effects: [{ id: 'a', category: 'passiveAdd', addPercent: 100 }],
    }
    expect(calcShutoutAtk(input)).toEqual({ noRandom: 20000, maxRandom: 19418 })
  })

  it('どんなATKでもダメージが0（軽減率100%・フィールド補正0）→ 上限なし', () => {
    expect(calcShutoutAtk({ ...plainInput, reductionPercent: 100 })).toEqual({
      noRandom: Infinity,
      maxRandom: Infinity,
    })
    expect(calcShutoutAtk({ ...plainInput, fieldCorrection: 0 })).toEqual({
      noRandom: Infinity,
      maxRandom: Infinity,
    })
  })

  it('敵ATK 1 でもダメージが出る（現在DEF が 0）→ 0', () => {
    // ④-足 −100% で現在DEF 0。ATK 1 − 0 = 1 でダメージが出る
    const input: CalcInput = {
      ...plainInput,
      effects: [{ id: 'a', category: 'passiveAdd', addPercent: -100 }],
    }
    expect(calcShutoutAtk(input)).toEqual({ noRandom: 0, maxRandom: 0 })
  })

  it('画面のDEFが未入力・入力にエラーがあるときは null', () => {
    expect(calcShutoutAtk({ ...plainInput, screenDef: 0 })).toBeNull()
    expect(calcShutoutAtk({ ...plainInput, reductionPercent: 101 })).toBeNull()
    expect(calcShutoutAtk({ ...plainInput, screenDef: Number.NaN })).toBeNull()
  })
})
