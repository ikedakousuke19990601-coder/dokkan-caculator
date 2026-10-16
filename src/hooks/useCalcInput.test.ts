// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUT } from '../logic/types'
import { toCalcForm, toCalcInput, useCalcInput } from './useCalcInput'

describe('toCalcForm / toCalcInput（入力欄の値 ⇔ CalcInput）', () => {
  it('既定値の 0 は空欄で表示し、フィールド補正の 1 はそのまま表示する', () => {
    const form = toCalcForm(DEFAULT_INPUT)
    expect(form.screenDef).toBe('')
    expect(form.enemyAtk).toBe('')
    expect(form.effects.map((e) => e.addPercent)).toEqual(['', ''])
    expect(form.appliedPercent.active).toBe('')
    expect(form.fieldCorrection).toBe('1')
  })

  it('既定値は往復しても変わらない', () => {
    expect(toCalcInput(toCalcForm(DEFAULT_INPUT))).toEqual(DEFAULT_INPUT)
  })

  it('空欄は既定値として扱う（フィールド補正は 1）', () => {
    const input = toCalcInput({ ...toCalcForm(DEFAULT_INPUT), fieldCorrection: '' })
    expect(input.fieldCorrection).toBe(1)
  })

  it('全角・カンマ付きの入力も数値になる', () => {
    const input = toCalcInput({ ...toCalcForm(DEFAULT_INPUT), enemyAtk: '１,０００,０００' })
    expect(input.enemyAtk).toBe(1000000)
  })

  it('数値として読めない入力は NaN にして検証で弾く', () => {
    const input = toCalcInput({ ...toCalcForm(DEFAULT_INPUT), screenDef: 'abc' })
    expect(input.screenDef).toBeNaN()
  })
})

describe('useCalcInput', () => {
  it('初期状態は必須項目が未入力のため結果なし', () => {
    const { result } = renderHook(() => useCalcInput())
    expect(result.current.result).toBeNull()
    expect(result.current.errors.screenDef).toBe('required')
    expect(result.current.errors.enemyAtk).toBe('required')
    expect(result.current.form.effects).toHaveLength(2)
  })

  it('画面のDEF・敵ATK を入力すると結果が出る', () => {
    const { result } = renderHook(() => useCalcInput())
    act(() => {
      result.current.setField('screenDef', '10000')
      result.current.setField('enemyAtk', '100000')
    })
    expect(result.current.result).toEqual({ noRandom: 90000, maxRandom: 93000 })
  })

  it('入力を変えると結果が変わる', () => {
    const { result } = renderHook(() => useCalcInput())
    act(() => {
      result.current.setField('screenDef', '10000')
      result.current.setField('enemyAtk', '100000')
      result.current.setField('allAttrGuardB', true)
    })
    expect(result.current.result).toEqual({ noRandom: 45000, maxRandom: 46500 })
  })

  it('入力途中の文字列（「12.」）をそのまま保持する', () => {
    const { result } = renderHook(() => useCalcInput())
    act(() => result.current.setField('fieldCorrection', '1.'))
    expect(result.current.form.fieldCorrection).toBe('1.')
  })

  it('効果行を追加・更新・削除でき、結果に反映される', () => {
    const { result } = renderHook(() => useCalcInput())
    act(() => {
      result.current.setField('screenDef', '10000')
      result.current.setField('enemyAtk', '100000')
    })

    act(() => result.current.addEffect())
    expect(result.current.form.effects).toHaveLength(3)
    const added = result.current.form.effects[2]
    expect(added.addPercent).toBe('')
    expect(new Set(result.current.form.effects.map((e) => e.id)).size).toBe(3)

    // 追加した行を ⑥ +50% にする → DEF 15,000
    act(() => result.current.updateEffect(added.id, { category: 'active', addPercent: '50' }))
    expect(result.current.form.effects[2]).toMatchObject({ category: 'active', addPercent: '50' })
    expect(result.current.result).toEqual({ noRandom: 85000, maxRandom: 88000 })

    act(() => result.current.removeEffect(added.id))
    expect(result.current.form.effects).toHaveLength(2)
    expect(result.current.result).toEqual({ noRandom: 90000, maxRandom: 93000 })
  })

  it('反映済み％ を更新でき、結果に反映される', () => {
    const { result } = renderHook(() => useCalcInput())
    const firstId = result.current.form.effects[0].id
    act(() => {
      result.current.setField('screenDef', '10000')
      result.current.setField('enemyAtk', '100000')
      result.current.updateEffect(firstId, { category: 'active', addPercent: '30' })
      result.current.setAppliedPercent('active', '50')
    })
    // DEF 10,000 × 1.8 ÷ 1.5 = 12,000
    expect(result.current.result).toEqual({ noRandom: 88000, maxRandom: 91000 })
  })

  it('不正な入力ではエラーを返し、結果は null', () => {
    const { result } = renderHook(() => useCalcInput())
    act(() => {
      result.current.setField('screenDef', '10000')
      result.current.setField('enemyAtk', 'abc')
    })
    expect(result.current.errors.enemyAtk).toBe('invalid')
    expect(result.current.result).toBeNull()
  })
})
