import { describe, expect, it } from 'vitest'
import { roundFinal, roundIntermediate } from './rounding'

describe('roundIntermediate（途中計算の切り捨て）', () => {
  it('小数を切り捨てる', () => {
    expect(roundIntermediate(19500.9)).toBe(19500)
    expect(roundIntermediate(0.5)).toBe(0)
  })

  it('整数はそのまま', () => {
    expect(roundIntermediate(980500)).toBe(980500)
    expect(roundIntermediate(0)).toBe(0)
  })

  it('負数は小さい方へ切り捨てる', () => {
    expect(roundIntermediate(-0.5)).toBe(-1)
    expect(roundIntermediate(-19500.1)).toBe(-19501)
  })

  it('-0 を返さない', () => {
    expect(roundIntermediate(-0)).toBe(0)
  })

  it('浮動小数点誤差で1小さくならない', () => {
    // 100 × 1.15 は JavaScript では 114.99999999999999 になる
    expect(roundIntermediate(100 * 1.15)).toBe(115)
    // 700 × 0.7 は 489.99999999999994 になる
    expect(roundIntermediate(700 * 0.7)).toBe(490)
  })
})

describe('roundFinal（最終値の四捨五入）', () => {
  it('0.5 以上は切り上げ、未満は切り捨てる', () => {
    expect(roundFinal(270250.5)).toBe(270251)
    expect(roundFinal(270250.49)).toBe(270250)
  })

  it('整数・0 はそのまま', () => {
    expect(roundFinal(278650)).toBe(278650)
    expect(roundFinal(0)).toBe(0)
  })

  it('負数は絶対値で四捨五入する', () => {
    expect(roundFinal(-2.5)).toBe(-3)
    expect(roundFinal(-2.4)).toBe(-2)
  })

  it('-0 を返さない', () => {
    expect(roundFinal(-0.4)).toBe(0)
  })

  it('浮動小数点誤差で四捨五入の結果がずれない', () => {
    // 50 × 1.15 は 57.49999999999999 になるが、本来は 57.5 なので 58
    expect(roundFinal(50 * 1.15)).toBe(58)
    // 45 × 0.7 は 31.499999999999996 になるが、本来は 31.5 なので 32
    expect(roundFinal(45 * 0.7)).toBe(32)
  })
})
