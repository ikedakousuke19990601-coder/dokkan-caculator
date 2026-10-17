import { EFFECT_CATEGORIES, type CalcInput, type EffectCategory } from './types'

/**
 * 入力値の正規化・検証（architecture 4章「計算実装で押さえる点」）。
 * 結果に NaN や Infinity を出さないため、計算の前にここを通す。
 */

/** 全角の数字・記号を半角にそろえる対応表 */
const FULL_TO_HALF: Record<string, string> = {
  '．': '.',
  '－': '-',
  '−': '-', // U+2212 マイナス記号
}

/** 取り除く文字（カンマ・空白・％） */
const IGNORED_CHARS = /[,，\s　%％]/g

/** 許可する数値の表記。0x10 や 1e3 のように Number() なら通る表記は受け付けない */
const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/

/**
 * 入力欄の文字列を数値に変換する。
 * @param text 入力欄の文字列
 * @returns 数値。空欄または数値として読めない場合は null
 */
export function parseNumberInput(text: string): number | null {
  const normalized = text
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[．－−]/g, (c) => FULL_TO_HALF[c])
    .replace(IGNORED_CHARS, '')

  if (!NUMBER_PATTERN.test(normalized)) return null
  return Number(normalized)
}

/**
 * - required: 必須項目が未入力（画面のDEF・敵ATK が 0）
 * - invalid: 範囲外・数値でない
 */
export type ErrorKind = 'required' | 'invalid'

export type ValidationErrors = {
  screenDef?: ErrorKind
  enemyAtk?: ErrorKind
  reductionPercent?: ErrorKind
  fieldCorrection?: ErrorKind
  appliedPercent: Partial<Record<EffectCategory, ErrorKind>>
  /** 効果行の id ごとのエラー */
  effects: Record<string, ErrorKind>
}

/** 必須項目の検証。既定値の 0 を未入力として扱う（types.ts の DEFAULT_INPUT） */
function checkRequired(value: number): ErrorKind | undefined {
  if (!Number.isFinite(value) || value < 0) return 'invalid'
  if (value === 0) return 'required'
  return undefined
}

function checkRange(value: number, min: number, max = Infinity): ErrorKind | undefined {
  if (!Number.isFinite(value) || value < min || value > max) return 'invalid'
  return undefined
}

/**
 * 計算の前に入力を検証する。
 * @param input 計算の入力
 * @returns 項目ごとのエラー。エラーのない項目は含まない
 */
export function validateInput(input: CalcInput): ValidationErrors {
  const errors: ValidationErrors = {
    screenDef: checkRequired(input.screenDef),
    enemyAtk: checkRequired(input.enemyAtk),
    reductionPercent: checkRange(input.reductionPercent, 0, 100),
    fieldCorrection: checkRange(input.fieldCorrection, 0),
    appliedPercent: {},
    effects: {},
  }

  for (const category of EFFECT_CATEGORIES) {
    const percent = input.appliedPercent[category]
    // (1 + 反映済み%) で割るため、-100% 以下は 0除算・符号反転になる
    if (!Number.isFinite(percent) || percent <= -100) {
      errors.appliedPercent[category] = 'invalid'
    }
  }

  for (const effect of input.effects) {
    // DEF低下の効果もあるため、マイナスは許可する
    if (!Number.isFinite(effect.addPercent)) {
      errors.effects[effect.id] = 'invalid'
    }
  }

  return errors
}

/**
 * エラーが1つでもあれば true（計算結果を出さない）。
 * @param kind 指定すると、その種類のエラーだけを対象にする
 */
export function hasErrors(errors: ValidationErrors, kind?: ErrorKind): boolean {
  const { appliedPercent, effects, ...fields } = errors
  return [fields, appliedPercent, effects].some((group) =>
    Object.values(group).some((k) => k !== undefined && (kind === undefined || k === kind)),
  )
}
