import { describe, expect, it } from 'vitest'
import { hasErrors, parseNumberInput, validateInput } from './normalize'
import { DEFAULT_INPUT, type CalcInput } from './types'

describe('parseNumberInput（入力文字列 → 数値）', () => {
  it('半角の整数・小数・負数を読める', () => {
    expect(parseNumberInput('12345')).toBe(12345)
    expect(parseNumberInput('1.5')).toBe(1.5)
    expect(parseNumberInput('-30')).toBe(-30)
    expect(parseNumberInput('.5')).toBe(0.5)
  })

  it('全角数字・全角記号を半角として読む', () => {
    expect(parseNumberInput('１２３４５')).toBe(12345)
    expect(parseNumberInput('１．５')).toBe(1.5)
    expect(parseNumberInput('－３０')).toBe(-30)
    expect(parseNumberInput('−30')).toBe(-30)
  })

  it('カンマ・空白・％を取り除く', () => {
    expect(parseNumberInput('1,000,000')).toBe(1000000)
    expect(parseNumberInput('１，０００')).toBe(1000)
    expect(parseNumberInput(' 50 ')).toBe(50)
    expect(parseNumberInput('50%')).toBe(50)
    expect(parseNumberInput('５０％')).toBe(50)
  })

  it('入力途中の「12.」は 12 として読む', () => {
    expect(parseNumberInput('12.')).toBe(12)
  })

  it('空欄は null（未入力）', () => {
    expect(parseNumberInput('')).toBeNull()
    expect(parseNumberInput('   ')).toBeNull()
  })

  it('数値でない文字列は null で、NaN を返さない', () => {
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('1a')).toBeNull()
    expect(parseNumberInput('-')).toBeNull()
    expect(parseNumberInput('.')).toBeNull()
    expect(parseNumberInput('1.2.3')).toBeNull()
  })

  it('Number() なら通ってしまう表記も数値として扱わない', () => {
    expect(parseNumberInput('0x10')).toBeNull()
    expect(parseNumberInput('1e3')).toBeNull()
    expect(parseNumberInput('Infinity')).toBeNull()
  })
})

/** 必須項目を埋めた、エラーのない入力 */
const validInput: CalcInput = { ...DEFAULT_INPUT, screenDef: 10000, enemyAtk: 1000000 }

describe('validateInput（入力の検証）', () => {
  it('正しい入力ではエラーなし', () => {
    const errors = validateInput(validInput)
    expect(hasErrors(errors)).toBe(false)
  })

  it('画面のDEF・敵ATK が 0 のときは未入力（required）', () => {
    const errors = validateInput(DEFAULT_INPUT)
    expect(errors.screenDef).toBe('required')
    expect(errors.enemyAtk).toBe('required')
    expect(hasErrors(errors)).toBe(true)
  })

  it('画面のDEF・敵ATK の負数は invalid', () => {
    const errors = validateInput({ ...validInput, screenDef: -1, enemyAtk: -1 })
    expect(errors.screenDef).toBe('invalid')
    expect(errors.enemyAtk).toBe('invalid')
  })

  it('軽減率は 0〜100 の範囲', () => {
    expect(validateInput({ ...validInput, reductionPercent: 0 }).reductionPercent).toBeUndefined()
    expect(validateInput({ ...validInput, reductionPercent: 100 }).reductionPercent).toBeUndefined()
    expect(validateInput({ ...validInput, reductionPercent: -1 }).reductionPercent).toBe('invalid')
    expect(validateInput({ ...validInput, reductionPercent: 101 }).reductionPercent).toBe('invalid')
  })

  it('フィールド補正は 0 以上', () => {
    expect(validateInput({ ...validInput, fieldCorrection: 0 }).fieldCorrection).toBeUndefined()
    expect(validateInput({ ...validInput, fieldCorrection: -0.1 }).fieldCorrection).toBe('invalid')
  })

  it('反映済み％ が -100 以下は 0除算になるため invalid', () => {
    const at = (percent: number) =>
      validateInput({
        ...validInput,
        appliedPercent: { ...validInput.appliedPercent, active: percent },
      }).appliedPercent.active

    expect(at(-99)).toBeUndefined()
    expect(at(-100)).toBe('invalid')
    expect(at(-150)).toBe('invalid')
  })

  it('効果行の追加％ はマイナス（DEF低下）も許可し、行の id ごとにエラーを返す', () => {
    const errors = validateInput({
      ...validInput,
      effects: [
        { id: 'a', category: 'active', addPercent: -30 },
        { id: 'b', category: 'support', addPercent: Number.NaN },
      ],
    })
    expect(errors.effects.a).toBeUndefined()
    expect(errors.effects.b).toBe('invalid')
  })

  it('NaN・Infinity が紛れ込んでも invalid として検出する', () => {
    const errors = validateInput({
      ...validInput,
      screenDef: Number.NaN,
      enemyAtk: Number.POSITIVE_INFINITY,
      fieldCorrection: Number.NaN,
    })
    expect(errors.screenDef).toBe('invalid')
    expect(errors.enemyAtk).toBe('invalid')
    expect(errors.fieldCorrection).toBe('invalid')
  })
})
