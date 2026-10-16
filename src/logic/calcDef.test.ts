import { describe, expect, it } from 'vitest'
import { calcDef } from './calcDef'
import { DEFAULT_INPUT, type CalcInput, type DefEffect, type EffectCategory } from './types'

const NO_APPLIED = DEFAULT_INPUT.appliedPercent

/** テスト用の入力を作る。効果行は [区分, 追加％] で渡す */
function makeInput(
  screenDef: number,
  effects: [EffectCategory, number][],
  appliedPercent: Partial<Record<EffectCategory, number>> = {},
): Pick<CalcInput, 'screenDef' | 'effects' | 'appliedPercent'> {
  return {
    screenDef,
    effects: effects.map(([category, addPercent], i): DefEffect => ({
      id: `e${i}`,
      category,
      addPercent,
    })),
    appliedPercent: { ...NO_APPLIED, ...appliedPercent },
  }
}

describe('calcDef（現在DEF）', () => {
  it('効果なし → 画面のDEFがそのまま', () => {
    expect(calcDef(makeInput(10000, []))).toBe(10000)
  })

  it('追加％ 0 の行だけ → 画面のDEFがそのまま', () => {
    expect(
      calcDef(
        makeInput(10000, [
          ['passiveAdd', 0],
          ['passiveMul', 0],
        ]),
      ),
    ).toBe(10000)
  })

  it('④-足 +50%、⑥ +30% → 19500', () => {
    // 10000 × 1.5 = 15000 → × 1.3 = 19500
    expect(
      calcDef(
        makeInput(10000, [
          ['passiveAdd', 50],
          ['active', 30],
        ]),
      ),
    ).toBe(19500)
  })

  it('同じ区分の2行（+20% と +30%）は合算して +50% を1回だけ掛ける', () => {
    // 10000 × (1 + 0.2 + 0.3) = 15000（1.2 × 1.3 = 15600 にはならない）
    expect(
      calcDef(
        makeInput(10000, [
          ['support', 20],
          ['support', 30],
        ]),
      ),
    ).toBe(15000)
  })

  it('④-足 +50% と ④-掛 +50% は別枠で 1.5 × 1.5 = 2.25倍', () => {
    expect(
      calcDef(
        makeInput(10000, [
          ['passiveAdd', 50],
          ['passiveMul', 50],
        ]),
      ),
    ).toBe(22500)
  })

  it('反映済み 50%、追加 +30% → × (1 + 0.5 + 0.3) ÷ (1 + 0.5)', () => {
    // 10000 × 1.8 ÷ 1.5 = 12000
    expect(calcDef(makeInput(10000, [['active', 30]], { active: 50 }))).toBe(12000)
  })

  it('反映済み％ があっても追加がない区分は変わらない', () => {
    expect(calcDef(makeInput(10000, [], { active: 50, support: 20 }))).toBe(10000)
  })

  it('全区分を使ったとき 5区分すべてが掛かる', () => {
    // 10000 × 1.1 = 11000 → × 1.2 = 13200 → × 1.3 = 17160 → × 1.4 = 24024 → × 1.5 = 36036
    const input = makeInput(10000, [
      ['superAttack', 50],
      ['active', 40],
      ['support', 30],
      ['passiveMul', 20],
      ['passiveAdd', 10],
    ])
    expect(calcDef(input)).toBe(36036)
  })

  it('行の並びに関係なく ④-足 → ④-掛 → ⑤ → ⑥ → ⑧ の順に掛ける', () => {
    // 正しい順: 7 × 1.5 = 10.5 → 10 → × 1.1 = 11
    // 行の並び（⑥ → ④-足）で掛けると: 7 × 1.1 = 7.7 → 7 → × 1.5 = 10.5 → 10
    expect(
      calcDef(
        makeInput(7, [
          ['active', 10],
          ['passiveAdd', 50],
        ]),
      ),
    ).toBe(11)
  })

  it('区分ごとに都度切り捨てる（最後にまとめて切り捨てない）', () => {
    // 5 × 1.5 = 7.5 → 7 → × 1.5 = 10.5 → 10
    // まとめて計算すると 5 × 2.25 = 11.25 → 11 になる
    expect(
      calcDef(
        makeInput(5, [
          ['passiveAdd', 50],
          ['passiveMul', 50],
        ]),
      ),
    ).toBe(10)
  })

  it('浮動小数点誤差で1小さくならない', () => {
    // 100 × 1.15 は JavaScript では 114.99999999999999 になる
    expect(calcDef(makeInput(100, [['active', 15]]))).toBe(115)
  })

  it('DEF低下（マイナスの追加％）も計算できる', () => {
    // 10000 × (1 - 0.3) = 7000
    expect(calcDef(makeInput(10000, [['active', -30]]))).toBe(7000)
  })

  it('同じ入力なら同じ結果を返し、入力を書き換えない', () => {
    const input = makeInput(10000, [['passiveAdd', 50]])
    const snapshot = structuredClone(input)
    expect(calcDef(input)).toBe(calcDef(input))
    expect(input).toEqual(snapshot)
  })
})
