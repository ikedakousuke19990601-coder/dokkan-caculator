/**
 * 受け入れ基準(a)「手計算した期待値と一致する」（spec 8章）。
 * 入力から最終結果までを通して確認する。式を変えたときの回帰テストを兼ねる。
 *
 * 期待値は手計算で出し、過程を各ケースの calc に残している。
 * 「仮仕様」と付いたケースは端数処理の仮仕様に依存するため、
 * 実機検証で端数処理が確定したら期待値を見直すこと（spec 7章）。
 */
import { describe, expect, it } from 'vitest'
import { calcDamage } from './calcDamage'
import { calcDef } from './calcDef'
import { DEFAULT_INPUT, type CalcInput, type EffectCategory } from './types'

type Case = {
  name: string
  /** 手計算の過程 */
  calc: string
  input: Partial<Omit<CalcInput, 'effects' | 'appliedPercent'>> & {
    effects?: [EffectCategory, number][]
    appliedPercent?: Partial<Record<EffectCategory, number>>
  }
  def: number
  noRandom: number
  maxRandom: number
}

function toInput({ effects = [], appliedPercent = {}, ...rest }: Case['input']): CalcInput {
  return {
    ...DEFAULT_INPUT,
    screenDef: 10000,
    enemyAtk: 100000,
    ...rest,
    effects: effects.map(([category, addPercent], i) => ({ id: `e${i}`, category, addPercent })),
    appliedPercent: { ...DEFAULT_INPUT.appliedPercent, ...appliedPercent },
  }
}

// 特に指定がなければ 画面のDEF 10,000 / 敵ATK 100,000 / 効果なし / その他は既定値
const cases: Case[] = [
  // --- DEF側 ---
  {
    name: '同じ区分の行は合算してから1回だけ掛ける',
    calc: 'DEF 10,000 × (1 + 0.2 + 0.3) = 15,000 / 100,000 − 15,000 | 103,000 − 15,000',
    input: {
      effects: [
        ['support', 20],
        ['support', 30],
      ],
    },
    def: 15000,
    noRandom: 85000,
    maxRandom: 88000,
  },
  {
    name: '足し算パッシブと掛け算パッシブは別枠',
    calc: 'DEF 10,000 × 1.5 × 1.5 = 22,500 / 100,000 − 22,500 | 103,000 − 22,500',
    input: {
      effects: [
        ['passiveAdd', 50],
        ['passiveMul', 50],
      ],
    },
    def: 22500,
    noRandom: 77500,
    maxRandom: 80500,
  },
  {
    name: '反映済み％を割り戻す',
    calc: 'DEF 10,000 × (1 + 0.5 + 0.3) ÷ (1 + 0.5) = 12,000 / 100,000 − 12,000 | 103,000 − 12,000',
    input: { effects: [['active', 30]], appliedPercent: { active: 50 } },
    def: 12000,
    noRandom: 88000,
    maxRandom: 91000,
  },
  {
    name: '区分ごとに切り捨てる（DEF側は参考記事に準拠）',
    calc: 'DEF 7 × 1.5 = 10.5 → 10 → × 1.1 = 11 / 1,001 − 11 | 1,001 × 1.03 = 1,031.03 → 1,031 − 11',
    input: {
      screenDef: 7,
      enemyAtk: 1001,
      effects: [
        ['active', 10],
        ['passiveAdd', 50],
      ],
    },
    def: 11,
    noRandom: 990,
    maxRandom: 1020,
  },
  // --- ダメージ側 ---
  {
    name: '軽減率',
    calc: '100,000 × 0.5 = 50,000 − 10,000 | 103,000 × 0.5 = 51,500 − 10,000',
    input: { reductionPercent: 50 },
    def: 10000,
    noRandom: 40000,
    maxRandom: 41500,
  },
  {
    name: '属性防御係数A なし(1.0)',
    calc: '100,000 − 10,000 | 103,000 − 10,000',
    input: { attrGuardA: 1 },
    def: 10000,
    noRandom: 90000,
    maxRandom: 93000,
  },
  {
    name: '属性防御係数A 0.9',
    calc: '100,000 × 0.9 = 90,000 − 10,000 | 103,000 × 0.9 = 92,700 − 10,000',
    input: { attrGuardA: 0.9 },
    def: 10000,
    noRandom: 80000,
    maxRandom: 82700,
  },
  {
    name: '属性防御係数A 0.8',
    calc: '100,000 × 0.8 = 80,000 − 10,000 | 103,000 × 0.8 = 82,400 − 10,000',
    input: { attrGuardA: 0.8 },
    def: 10000,
    noRandom: 70000,
    maxRandom: 72400,
  },
  {
    name: '属性防御係数A 0.7',
    calc: '100,000 × 0.7 = 70,000 − 10,000 | 103,000 × 0.7 = 72,100 − 10,000',
    input: { attrGuardA: 0.7 },
    def: 10000,
    noRandom: 60000,
    maxRandom: 62100,
  },
  {
    name: '属性防御係数A 0.6',
    calc: '100,000 × 0.6 = 60,000 − 10,000 | 103,000 × 0.6 = 61,800 − 10,000',
    input: { attrGuardA: 0.6 },
    def: 10000,
    noRandom: 50000,
    maxRandom: 51800,
  },
  {
    name: '全属性ガードB オン',
    calc: '(100,000 − 10,000) × 0.5 | (103,000 − 10,000) × 0.5',
    input: { allAttrGuardB: true },
    def: 10000,
    noRandom: 45000,
    maxRandom: 46500,
  },
  {
    name: 'フィールド補正（DEFを引いたあとに掛かる）',
    calc: '(100,000 − 10,000) × 2 | (103,000 − 10,000) × 2',
    input: { fieldCorrection: 2 },
    def: 10000,
    noRandom: 180000,
    maxRandom: 186000,
  },
  {
    name: 'max(0): 現在DEF が攻撃を上回る',
    calc: '5,000 − 10,000 < 0 → 0 | 5,150 − 10,000 < 0 → 0',
    input: { enemyAtk: 5000 },
    def: 10000,
    noRandom: 0,
    maxRandom: 0,
  },
  {
    name: '途中の値は切り捨てる（仮仕様）',
    calc: '333,333 × 0.9 = 299,999.7 → 299,999 − 1 | 333,333 × 1.03 = 343,332.99 → 343,332 × 0.9 = 308,998.8 → 308,998 − 1',
    input: { screenDef: 1, enemyAtk: 333333, attrGuardA: 0.9 },
    def: 1,
    noRandom: 299998,
    maxRandom: 308997,
  },
  {
    name: '最終値のみ四捨五入する（仮仕様）',
    calc: '(100,000 − 10,000) × 1.000006 = 90,000.54 → 90,001 | 93,000 × 1.000006 = 93,000.558 → 93,001',
    input: { fieldCorrection: 1.000006 },
    def: 10000,
    noRandom: 90001,
    maxRandom: 93001,
  },
  // --- 総合 ---
  {
    name: '全項目を使った総合ケース',
    calc: [
      'DEF 50,000 × 2.0 = 100,000 → × 1.5 = 150,000 → × 1.1 = 165,000 → × 1.2 = 198,000 → × 1.3 = 257,400',
      'r=1.00: 2,000,000 × 0.7 = 1,400,000 → × 0.8 = 1,120,000 → − 257,400 = 862,600 → × 0.5 = 431,300 → × 1.2 = 517,560',
      'r=1.03: 2,060,000 × 0.7 = 1,442,000 → × 0.8 = 1,153,600 → − 257,400 = 896,200 → × 0.5 = 448,100 → × 1.2 = 537,720',
    ].join(' / '),
    input: {
      screenDef: 50000,
      effects: [
        ['passiveAdd', 100],
        ['passiveMul', 50],
        ['support', 10],
        ['active', 20],
        ['superAttack', 30],
      ],
      enemyAtk: 2000000,
      reductionPercent: 20,
      attrGuardA: 0.7,
      allAttrGuardB: true,
      fieldCorrection: 1.2,
    },
    def: 257400,
    noRandom: 517560,
    maxRandom: 537720,
  },
]

describe('受け入れテスト（手計算の期待値）', () => {
  it.each(cases)('$name', ({ input, def, noRandom, maxRandom }) => {
    const calcInput = toInput(input)
    expect(calcDef(calcInput)).toBe(def)
    expect(calcDamage(calcInput)).toEqual({ noRandom, maxRandom })
  })
})
