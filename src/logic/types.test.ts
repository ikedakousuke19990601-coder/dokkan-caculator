import { describe, expect, it } from 'vitest'
import {
  ATTR_GUARD_A_VALUES,
  DEFAULT_INPUT,
  EFFECT_CATEGORIES,
  EFFECT_CATEGORY_LABELS,
} from './types'

describe('区分の定義', () => {
  it('spec 3章の5区分（④-足・④-掛・⑤・⑥・⑧）と一致する', () => {
    expect(EFFECT_CATEGORIES).toEqual([
      'passiveAdd',
      'passiveMul',
      'support',
      'active',
      'superAttack',
    ])
  })

  it('表示名が spec 3章の表記と一致する', () => {
    expect(EFFECT_CATEGORY_LABELS).toEqual({
      passiveAdd: 'パッシブ（足し算）',
      passiveMul: 'パッシブ（掛け算）',
      support: 'サポートメモリー・アイテム',
      active: 'アクティブスキル',
      superAttack: '必殺技の追加効果',
    })
  })

  it('属性防御係数Aの選択肢が なし(1.0)/0.9/0.8/0.7/0.6 である', () => {
    expect(ATTR_GUARD_A_VALUES).toEqual([1, 0.9, 0.8, 0.7, 0.6])
  })
})

describe('既定値（spec 3章の初期値）', () => {
  it('効果行を2行あらかじめ用意し、追加％は0', () => {
    expect(DEFAULT_INPUT.effects).toHaveLength(2)
    expect(DEFAULT_INPUT.effects.every((e) => e.addPercent === 0)).toBe(true)
  })

  it('効果行の id が重複しない', () => {
    const ids = DEFAULT_INPUT.effects.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('反映済み％は全区分0', () => {
    for (const category of EFFECT_CATEGORIES) {
      expect(DEFAULT_INPUT.appliedPercent[category]).toBe(0)
    }
  })

  it('軽減率0・A=なし(1.0)・B=オフ・フィールド補正1', () => {
    expect(DEFAULT_INPUT.reductionPercent).toBe(0)
    expect(DEFAULT_INPUT.attrGuardA).toBe(1)
    expect(DEFAULT_INPUT.allAttrGuardB).toBe(false)
    expect(DEFAULT_INPUT.fieldCorrection).toBe(1)
  })
})
