import { useMemo, useState } from 'react'
import { calcDamage } from '../logic/calcDamage'
import { parseNumberInput, validateInput } from '../logic/normalize'
import {
  DEFAULT_INPUT,
  EFFECT_CATEGORIES,
  type AttrGuardA,
  type CalcInput,
  type EffectCategory,
} from '../logic/types'

/** 効果行の入力欄の値。％は入力途中（空欄・「12.」など）を保つため文字列で持つ */
export type EffectForm = {
  id: string
  category: EffectCategory
  addPercent: string
}

/** 画面の入力欄の値 */
export type CalcForm = {
  screenDef: string
  effects: EffectForm[]
  appliedPercent: Record<EffectCategory, string>
  enemyAtk: string
  reductionPercent: string
  attrGuardA: AttrGuardA
  allAttrGuardB: boolean
  fieldCorrection: string
}

/** 1つの値だけを更新できる項目 */
type SimpleField = Exclude<keyof CalcForm, 'effects' | 'appliedPercent'>

/** 既定値の 0 は空欄で表示する（入力前に 0 を消す手間をなくす） */
function toText(value: number): string {
  return value === 0 ? '' : String(value)
}

/**
 * 入力欄の文字列を数値にする。
 * 空欄は fallback、数値として読めない文字列は NaN（validateInput で invalid になる）。
 */
function toNumber(text: string, fallback: number): number {
  if (text.trim() === '') return fallback
  return parseNumberInput(text) ?? Number.NaN
}

/** CalcInput → 入力欄の値 */
export function toCalcForm(input: CalcInput): CalcForm {
  return {
    screenDef: toText(input.screenDef),
    effects: input.effects.map((e) => ({ ...e, addPercent: toText(e.addPercent) })),
    appliedPercent: Object.fromEntries(
      EFFECT_CATEGORIES.map((c) => [c, toText(input.appliedPercent[c])]),
    ) as Record<EffectCategory, string>,
    enemyAtk: toText(input.enemyAtk),
    reductionPercent: toText(input.reductionPercent),
    attrGuardA: input.attrGuardA,
    allAttrGuardB: input.allAttrGuardB,
    fieldCorrection: toText(input.fieldCorrection),
  }
}

/** 入力欄の値 → CalcInput。空欄は DEFAULT_INPUT の値として扱う */
export function toCalcInput(form: CalcForm): CalcInput {
  return {
    screenDef: toNumber(form.screenDef, DEFAULT_INPUT.screenDef),
    effects: form.effects.map((e) => ({ ...e, addPercent: toNumber(e.addPercent, 0) })),
    appliedPercent: Object.fromEntries(
      EFFECT_CATEGORIES.map((c) => [c, toNumber(form.appliedPercent[c], 0)]),
    ) as Record<EffectCategory, number>,
    enemyAtk: toNumber(form.enemyAtk, DEFAULT_INPUT.enemyAtk),
    reductionPercent: toNumber(form.reductionPercent, DEFAULT_INPUT.reductionPercent),
    attrGuardA: form.attrGuardA,
    allAttrGuardB: form.allAttrGuardB,
    fieldCorrection: toNumber(form.fieldCorrection, DEFAULT_INPUT.fieldCorrection),
  }
}

/**
 * 入力の状態を管理し、入力が変わるたびに再計算する。
 * 計算式は持たず、logic/ の関数を呼ぶだけにする。
 */
export function useCalcInput() {
  const [form, setForm] = useState<CalcForm>(() => toCalcForm(DEFAULT_INPUT))

  const { errors, result } = useMemo(() => {
    const input = toCalcInput(form)
    return { errors: validateInput(input), result: calcDamage(input) }
  }, [form])

  function setField<K extends SimpleField>(key: K, value: CalcForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setAppliedPercent(category: EffectCategory, value: string) {
    setForm((prev) => ({ ...prev, appliedPercent: { ...prev.appliedPercent, [category]: value } }))
  }

  function addEffect() {
    const effect: EffectForm = { id: crypto.randomUUID(), category: 'passiveAdd', addPercent: '' }
    setForm((prev) => ({ ...prev, effects: [...prev.effects, effect] }))
  }

  function updateEffect(id: string, patch: Partial<Omit<EffectForm, 'id'>>) {
    setForm((prev) => ({
      ...prev,
      effects: prev.effects.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
  }

  function removeEffect(id: string) {
    setForm((prev) => ({ ...prev, effects: prev.effects.filter((e) => e.id !== id) }))
  }

  return {
    form,
    errors,
    result,
    setField,
    setAppliedPercent,
    addEffect,
    updateEffect,
    removeEffect,
  }
}
