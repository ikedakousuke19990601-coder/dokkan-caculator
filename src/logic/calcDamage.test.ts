import { describe, expect, it } from 'vitest'
import { calcDamage } from './calcDamage'
import { DEFAULT_INPUT, type CalcInput } from './types'

/**
 * 基本の入力: 画面のDEF 10000、④-足 +50%、⑥ +30% → 現在DEF 19500（calcDef.test.ts と同じ）
 * 敵ATK 1,000,000、その他は既定値
 */
const baseInput: CalcInput = {
  ...DEFAULT_INPUT,
  screenDef: 10000,
  effects: [
    { id: 'a', category: 'passiveAdd', addPercent: 50 },
    { id: 'b', category: 'active', addPercent: 30 },
  ],
  enemyAtk: 1000000,
}

describe('calcDamage（被ダメージ）', () => {
  it('既定値のまま → 乱数なし 980,500 / 最大乱数 1,010,500', () => {
    // r=1.00: 1,000,000 − 19,500 = 980,500
    // r=1.03: 1,030,000 − 19,500 = 1,010,500
    expect(calcDamage(baseInput)).toEqual({ noRandom: 980500, maxRandom: 1010500 })
  })

  it('軽減率30%・A=0.8・B=オン → 乱数なし 270,250 / 最大乱数 278,650', () => {
    // r=1.00: 1,000,000 × 0.8 = 800,000 → × 0.7 = 560,000 → − 19,500 = 540,500 → × 0.5 = 270,250
    // r=1.03: 1,030,000 × 0.8 = 824,000 → × 0.7 = 576,800 → − 19,500 = 557,300 → × 0.5 = 278,650
    const input: CalcInput = {
      ...baseInput,
      reductionPercent: 30,
      attrGuardA: 0.8,
      allAttrGuardB: true,
    }
    expect(calcDamage(input)).toEqual({ noRandom: 270250, maxRandom: 278650 })
  })

  it('フィールド補正は最後（DEFを引いたあと）に掛かる', () => {
    // r=1.00: 980,500 × 1.5 = 1,470,750（ATK に先に掛けると 1,480,500 になる）
    // r=1.03: 1,010,500 × 1.5 = 1,515,750
    expect(calcDamage({ ...baseInput, fieldCorrection: 1.5 })).toEqual({
      noRandom: 1470750,
      maxRandom: 1515750,
    })
  })

  it('属性防御係数A の各段階が掛かる', () => {
    // r=1.00: 1,000,000 × A − 19,500
    const noRandomAt = (attrGuardA: CalcInput['attrGuardA']) =>
      calcDamage({ ...baseInput, attrGuardA })?.noRandom

    expect(noRandomAt(1)).toBe(980500)
    expect(noRandomAt(0.9)).toBe(880500)
    expect(noRandomAt(0.8)).toBe(780500)
    expect(noRandomAt(0.7)).toBe(680500)
    expect(noRandomAt(0.6)).toBe(580500)
  })

  it('全属性ガードB がオフなら 1.0、オンなら 0.5', () => {
    expect(calcDamage({ ...baseInput, allAttrGuardB: false })?.noRandom).toBe(980500)
    expect(calcDamage({ ...baseInput, allAttrGuardB: true })?.noRandom).toBe(490250)
  })

  it('途中の値は切り捨てる（仮仕様）', () => {
    // 敵ATK 333,333、画面のDEF 1（効果なし）、A=0.9
    // r=1.00: 333,333 × 0.9 = 299,999.7 → 299,999 → − 1 = 299,998
    // r=1.03: 333,333 × 1.03 = 343,332.99 → 343,332 → × 0.9 = 308,998.8 → 308,998 → − 1 = 308,997
    const input: CalcInput = {
      ...DEFAULT_INPUT,
      screenDef: 1,
      effects: [],
      enemyAtk: 333333,
      attrGuardA: 0.9,
    }
    expect(calcDamage(input)).toEqual({ noRandom: 299998, maxRandom: 308997 })
  })

  it('最終値だけ四捨五入する（仮仕様）', () => {
    // フィールド補正 1.0000006（切り捨てなら端数が消える値）
    // r=1.00: 980,500 × 1.0000006 = 980,500.5883 → 980,501
    // r=1.03: 1,010,500 × 1.0000006 = 1,010,500.6063 → 1,010,501
    expect(calcDamage({ ...baseInput, fieldCorrection: 1.0000006 })).toEqual({
      noRandom: 980501,
      maxRandom: 1010501,
    })
    // 敵ATK 1,000,001: 980,501 × 0.5 = 490,250.5 → 途中なので切り捨て 490,250
    expect(calcDamage({ ...baseInput, enemyAtk: 1000001, allAttrGuardB: true })?.noRandom).toBe(
      490250,
    )
  })

  it('現在DEF が攻撃を上回る → 0', () => {
    // 現在DEF 19,500 > 敵ATK 10,000
    expect(calcDamage({ ...baseInput, enemyAtk: 10000 })).toEqual({ noRandom: 0, maxRandom: 0 })
  })

  it('乱数なしだけ 0 になり、最大乱数ではダメージが残る', () => {
    // 現在DEF 19,500。敵ATK 19,000: r=1.00 は 0、r=1.03 は 19,570 − 19,500 = 70
    expect(calcDamage({ ...baseInput, enemyAtk: 19000 })).toEqual({ noRandom: 0, maxRandom: 70 })
  })

  it('軽減率100% → 0', () => {
    expect(calcDamage({ ...baseInput, reductionPercent: 100 })).toEqual({
      noRandom: 0,
      maxRandom: 0,
    })
  })

  it('入力にエラーがあるときは null（NaN・Infinity を返さない）', () => {
    expect(calcDamage(DEFAULT_INPUT)).toBeNull() // 必須項目が未入力
    expect(calcDamage({ ...baseInput, enemyAtk: Number.NaN })).toBeNull()
    expect(calcDamage({ ...baseInput, fieldCorrection: Number.POSITIVE_INFINITY })).toBeNull()
    expect(
      calcDamage({
        ...baseInput,
        appliedPercent: { ...baseInput.appliedPercent, active: -100 },
      }),
    ).toBeNull()
  })
})
