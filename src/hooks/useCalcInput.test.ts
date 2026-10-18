// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUT, type CalcInput } from '../logic/types'
import { STORAGE_KEY } from '../storage/inputStorage'
import { toCalcForm, toCalcInput, useCalcInput } from './useCalcInput'

// 前のテストで保存された入力が復元されないようにする
beforeEach(() => localStorage.clear())
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

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
    // 全属性ガードで A=0.8・B=0.5
    // r=1.00: 100,000 × 0.8 = 80,000 − 10,000 = 70,000 → × 0.5 = 35,000
    // r=1.03: 103,000 × 0.8 = 82,400 − 10,000 = 72,400 → × 0.5 = 36,200
    expect(result.current.result).toEqual({ noRandom: 35000, maxRandom: 36200 })
  })

  it('画面のDEFだけで、完封できる敵ATKの上限を計算する（敵ATKは不要）', () => {
    const { result } = renderHook(() => useCalcInput())
    expect(result.current.shutout).toBeNull()

    act(() => result.current.setField('screenDef', '10000'))
    // r=1.00: ATK ≤ 10,000
    // r=1.03: 9,709 × 1.03 = 10,000.27 → 10,000 − 10,000 = 0（9,710 × 1.03 = 10,001.3 → 1）
    expect(result.current.shutout).toEqual({ noRandom: 10000, maxRandom: 9709 })
    // 敵ATK が未入力なので被ダメージは出ない
    expect(result.current.result).toBeNull()
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

describe('useCalcInput（保存・復元）', () => {
  const saved: CalcInput = {
    ...DEFAULT_INPUT,
    screenDef: 10000,
    effects: [{ id: 'a', category: 'active', addPercent: 30 }],
    appliedPercent: { ...DEFAULT_INPUT.appliedPercent, active: 50 },
    enemyAtk: 100000,
  }

  function storedInput(): unknown {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  }

  it('前回の入力（効果行・反映済み％を含む）を復元し、すぐ計算する', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const { result } = renderHook(() => useCalcInput())
    expect(result.current.form.screenDef).toBe('10000')
    expect(result.current.form.effects).toEqual([{ id: 'a', category: 'active', addPercent: '30' }])
    expect(result.current.form.appliedPercent.active).toBe('50')
    // DEF 10,000 × 1.8 ÷ 1.5 = 12,000
    expect(result.current.result).toEqual({ noRandom: 88000, maxRandom: 91000 })
  })

  it('reset すると、復元した入力を含めてすべて既定値に戻る', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const { result } = renderHook(() => useCalcInput())
    act(() => result.current.reset())
    expect(result.current.form).toEqual(toCalcForm(DEFAULT_INPUT))
    expect(result.current.result).toBeNull()
  })

  it('reset 後は既定値が保存され、次回起動時に前の入力が復元されない', () => {
    vi.useFakeTimers()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const { result, unmount } = renderHook(() => useCalcInput())
    act(() => result.current.reset())
    act(() => vi.advanceTimersByTime(300))
    expect(storedInput()).toEqual(DEFAULT_INPUT)

    unmount()
    const { result: next } = renderHook(() => useCalcInput())
    expect(next.current.form).toEqual(toCalcForm(DEFAULT_INPUT))
  })

  it('壊れた保存データでも既定値で起動する', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    const { result } = renderHook(() => useCalcInput())
    expect(result.current.form).toEqual(toCalcForm(DEFAULT_INPUT))
  })

  it('入力が止まってから 300ms 後に1回だけ保存する', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCalcInput())
    act(() => vi.advanceTimersByTime(300)) // 起動時の保存を済ませる
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    // 100ms おきに連続入力している間は保存しない
    // 保存タイマーは effect（act の終了後）で設定されるため、入力と時間送りは別の act にする
    for (const text of ['1', '10', '100']) {
      act(() => result.current.setField('enemyAtk', text))
      act(() => vi.advanceTimersByTime(100))
    }
    expect(setItem).not.toHaveBeenCalled()

    // 最後の入力から 300ms 経つと、最新の値で1回だけ保存する
    act(() => vi.advanceTimersByTime(200))
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(storedInput()).toMatchObject({ enemyAtk: 100 })
  })

  it('アンマウントすると保存待ちのタイマーを片付ける', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useCalcInput())
    act(() => vi.advanceTimersByTime(300))
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    act(() => result.current.setField('enemyAtk', '100'))
    unmount()
    act(() => vi.advanceTimersByTime(300))
    expect(setItem).not.toHaveBeenCalled()
  })
})
