/**
 * 端数処理（spec 4章）。
 * 「途中の計算は都度切り捨て、最終値のみ四捨五入」とする。
 *
 * 仮仕様: DEF側は参考記事に準拠しているが、ダメージ側は記事に明記がなく未確認（spec 7章）。
 * 実機検証で方針が変わった場合は、このファイルだけを直す。
 */

/**
 * 浮動小数点誤差を取り除くための有効桁数。
 * 扱う値は最大でも10桁程度の整数と小数点以下数桁の％なので、12桁あれば誤差だけを落とせる。
 */
const SIGNIFICANT_DIGITS = 12

/** 100 × 1.15 = 114.99999999999999 のような誤差を 115 に戻す */
function removeFloatError(value: number): number {
  return Number(value.toPrecision(SIGNIFICANT_DIGITS))
}

/**
 * 途中計算の切り捨て。
 * @param value 計算途中の値
 * @returns 小さい方へ切り捨てた整数
 */
export function roundIntermediate(value: number): number {
  // + 0 で -0 を 0 にそろえる
  return Math.floor(removeFloatError(value)) + 0
}

/**
 * 最終値の四捨五入。負数は絶対値で四捨五入する（-2.5 → -3）。
 * @param value 最終的なダメージの値
 * @returns 四捨五入した整数
 */
export function roundFinal(value: number): number {
  const fixed = removeFloatError(value)
  return Math.sign(fixed) * Math.round(Math.abs(fixed)) + 0
}
