// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUT, type CalcInput } from '../logic/types'
import { loadInput, saveInput, STORAGE_KEY } from './inputStorage'

/** 既定値以外の値を全項目に入れた入力 */
const filledInput: CalcInput = {
  screenDef: 19500,
  effects: [
    { id: 'a', category: 'passiveAdd', addPercent: 50 },
    { id: 'b', category: 'superAttack', addPercent: 12.5 },
  ],
  appliedPercent: { passiveAdd: 0, passiveMul: 10, support: 0, active: 50, superAttack: 0 },
  enemyAtk: 1000000,
  reductionPercent: 30,
  attrGuardA: 0.8,
  allAttrGuardB: true,
  fieldCorrection: 1.5,
}

function saveRaw(value: string) {
  localStorage.setItem(STORAGE_KEY, value)
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('saveInput / loadInput', () => {
  it('保存 → 復元で同じ入力が得られる', () => {
    saveInput(filledInput)
    expect(loadInput()).toEqual(filledInput)
  })

  it('キー dokkan-damage-calc:v1 に JSON で保存する', () => {
    saveInput(filledInput)
    expect(JSON.parse(localStorage.getItem('dokkan-damage-calc:v1') ?? '')).toEqual(filledInput)
  })

  it('保存データがないときは既定値', () => {
    expect(loadInput()).toEqual(DEFAULT_INPUT)
  })
})

describe('loadInput（壊れたデータ）', () => {
  it('JSON として読めないときは既定値', () => {
    saveRaw('{broken')
    expect(loadInput()).toEqual(DEFAULT_INPUT)
  })

  it('オブジェクトでないときは既定値', () => {
    for (const raw of ['null', '123', '"text"', '[1,2]']) {
      saveRaw(raw)
      expect(loadInput()).toEqual(DEFAULT_INPUT)
    }
  })

  it('型が違う項目だけ既定値に戻し、他の項目は復元する', () => {
    saveRaw(
      JSON.stringify({
        ...filledInput,
        screenDef: '19500', // 文字列
        enemyAtk: null, // NaN は JSON で null になる
        allAttrGuardB: 'yes',
      }),
    )
    expect(loadInput()).toEqual({
      ...filledInput,
      screenDef: DEFAULT_INPUT.screenDef,
      enemyAtk: DEFAULT_INPUT.enemyAtk,
      allAttrGuardB: DEFAULT_INPUT.allAttrGuardB,
    })
  })

  it('選択肢にない属性防御係数A は既定値に戻す', () => {
    saveRaw(JSON.stringify({ ...filledInput, attrGuardA: 0.5 }))
    expect(loadInput().attrGuardA).toBe(1)
  })

  it('未知の区分・id のない効果行は捨て、追加％だけ壊れた行は 0 にして残す', () => {
    saveRaw(
      JSON.stringify({
        ...filledInput,
        effects: [
          { id: 'a', category: 'passiveAdd', addPercent: 50 },
          { id: 'x', category: 'leaderSkill', addPercent: 30 }, // 未知の区分
          { category: 'active', addPercent: 30 }, // id なし
          'row', // オブジェクトでない
          { id: 'b', category: 'active', addPercent: null }, // 追加％だけ壊れている
        ],
      }),
    )
    expect(loadInput().effects).toEqual([
      { id: 'a', category: 'passiveAdd', addPercent: 50 },
      { id: 'b', category: 'active', addPercent: 0 },
    ])
  })

  it('効果行が配列でないときは既定の2行に戻す', () => {
    saveRaw(JSON.stringify({ ...filledInput, effects: 'none' }))
    expect(loadInput().effects).toEqual(DEFAULT_INPUT.effects)
  })

  it('反映済み％ は区分ごとに既定値へ戻す', () => {
    saveRaw(JSON.stringify({ ...filledInput, appliedPercent: { active: 50, support: 'x' } }))
    expect(loadInput().appliedPercent).toEqual({ ...DEFAULT_INPUT.appliedPercent, active: 50 })

    saveRaw(JSON.stringify({ ...filledInput, appliedPercent: null }))
    expect(loadInput().appliedPercent).toEqual(DEFAULT_INPUT.appliedPercent)
  })
})

describe('localStorage が使えない環境', () => {
  it('setItem が例外を投げても saveInput はエラーにならない', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => saveInput(filledInput)).not.toThrow()
  })

  it('getItem が例外を投げても loadInput は既定値を返す', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError')
    })
    expect(loadInput()).toEqual(DEFAULT_INPUT)
  })
})
