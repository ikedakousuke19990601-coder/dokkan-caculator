import {
  ATTR_GUARD_A_VALUES,
  DEFAULT_INPUT,
  EFFECT_CATEGORIES,
  type AttrGuardA,
  type CalcInput,
  type DefEffect,
  type EffectCategory,
} from '../logic/types'

/**
 * 前回の入力の保存・復元（architecture 4章）。
 * 保存するのは CalcInput 1件だけで、外部には送信しない。
 */

/** 保存形式を変えたら v2 にする */
export const STORAGE_KEY = 'dokkan-damage-calc:v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 有限の数値ならそのまま、それ以外は fallback */
function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function isCategory(value: unknown): value is EffectCategory {
  return EFFECT_CATEGORIES.some((c) => c === value)
}

function toAttrGuardA(value: unknown): AttrGuardA {
  return ATTR_GUARD_A_VALUES.find((v) => v === value) ?? DEFAULT_INPUT.attrGuardA
}

/** id・区分が壊れた行は捨て、追加％だけが壊れた行は 0 にして残す */
function toEffects(value: unknown): DefEffect[] {
  if (!Array.isArray(value)) return DEFAULT_INPUT.effects
  return value.flatMap((row): DefEffect[] => {
    if (!isRecord(row) || typeof row.id !== 'string' || !isCategory(row.category)) return []
    return [{ id: row.id, category: row.category, addPercent: toNumber(row.addPercent, 0) }]
  })
}

function toAppliedPercent(value: unknown): Record<EffectCategory, number> {
  const source = isRecord(value) ? value : {}
  return Object.fromEntries(
    EFFECT_CATEGORIES.map((c) => [c, toNumber(source[c], DEFAULT_INPUT.appliedPercent[c])]),
  ) as Record<EffectCategory, number>
}

/**
 * 保存データを CalcInput にする。
 * 1項目が壊れていても他の項目は復元できるよう、項目ごとに既定値へフォールバックする。
 * 値の範囲（負数など）は検証しない（計算前に validateInput が行う）。
 */
function toCalcInput(data: unknown): CalcInput {
  if (!isRecord(data)) return DEFAULT_INPUT
  return {
    screenDef: toNumber(data.screenDef, DEFAULT_INPUT.screenDef),
    effects: toEffects(data.effects),
    appliedPercent: toAppliedPercent(data.appliedPercent),
    enemyAtk: toNumber(data.enemyAtk, DEFAULT_INPUT.enemyAtk),
    reductionPercent: toNumber(data.reductionPercent, DEFAULT_INPUT.reductionPercent),
    attrGuardA: toAttrGuardA(data.attrGuardA),
    allAttrGuardB:
      typeof data.allAttrGuardB === 'boolean' ? data.allAttrGuardB : DEFAULT_INPUT.allAttrGuardB,
    fieldCorrection: toNumber(data.fieldCorrection, DEFAULT_INPUT.fieldCorrection),
  }
}

/**
 * 前回の入力を読み込む。
 * @returns 保存データがない・壊れている・localStorage が使えないときは DEFAULT_INPUT
 */
export function loadInput(): CalcInput {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json === null) return DEFAULT_INPUT
    return toCalcInput(JSON.parse(json))
  } catch {
    // プライベートモード等で localStorage が使えない、または JSON が壊れている
    return DEFAULT_INPUT
  }
}

/**
 * 入力を保存する。保存できない環境では何もしない（アプリは止めない）。
 * @param input 保存する入力
 */
export function saveInput(input: CalcInput): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
  } catch {
    // 容量超過・プライベートモード等。保存できなくても計算は続けられる
  }
}
