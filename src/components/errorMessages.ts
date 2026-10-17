import { hasErrors, type ValidationErrors } from '../logic/normalize'

/** 不正な値（invalid）のときに入力欄の下に出す文言。初級者向けに短くする */
export const INVALID_MESSAGES = {
  zeroOrMore: '0以上の数値を入力してください',
  reductionPercent: '0〜100の数値を入力してください',
  appliedPercent: '-100より大きい数値を入力してください',
  number: '数値を入力してください',
} as const

/**
 * 結果を出せないときに結果欄に出す案内。
 * 未入力（required）は入力欄ではなくここで案内し、開いた直後からエラーが並ばないようにする。
 */
export function resultHint(errors: ValidationErrors): string | undefined {
  if (hasErrors(errors, 'invalid')) return '入力内容を確認してください'
  if (hasErrors(errors, 'required')) return '画面のDEFと敵ATKを入力してください'
  return undefined
}
