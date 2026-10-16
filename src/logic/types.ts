/**
 * 「これから上がる効果」の区分（spec 3章）。
 * 画面のDEFにすでに入っている ①②③⑦ は選択肢に含めない。
 */
export const EFFECT_CATEGORIES = [
  'passiveAdd', // ④-足
  'passiveMul', // ④-掛
  'support', // ⑤
  'active', // ⑥
  'superAttack', // ⑧
] as const

export type EffectCategory = (typeof EFFECT_CATEGORIES)[number]

/** 区分の表示名。ラベルはゲーム内の表記に合わせる（spec 2章） */
export const EFFECT_CATEGORY_LABELS: Record<EffectCategory, string> = {
  passiveAdd: 'パッシブ（足し算）',
  passiveMul: 'パッシブ（掛け算）',
  support: 'サポートメモリー・アイテム',
  active: 'アクティブスキル',
  superAttack: '必殺技の追加効果',
}

/** 「これから上がる効果」の1行 */
export type DefEffect = {
  id: string
  category: EffectCategory
  /** これから上がる％（例: 50 → +50%） */
  addPercent: number
}

/** 属性防御係数A（属性ガード）の選択肢。1 は「なし」 */
export const ATTR_GUARD_A_VALUES = [1, 0.9, 0.8, 0.7, 0.6] as const

export type AttrGuardA = (typeof ATTR_GUARD_A_VALUES)[number]

/** 計算の入力。％の項目はすべて「50 → 50%」の形で持つ */
export type CalcInput = {
  /** 画面のDEF（リーダー・リンク・現在のパッシブ・フィールド効果込み） */
  screenDef: number
  effects: DefEffect[]
  /** 画面のDEFに反映済みの％（通常0、「詳細」で入力） */
  appliedPercent: Record<EffectCategory, number>
  enemyAtk: number
  /** ダメージ軽減率（％） */
  reductionPercent: number
  attrGuardA: AttrGuardA
  /** 全属性ガード。true のとき係数B = 0.5 */
  allAttrGuardB: boolean
  /** フィールド補正（最終ダメージに掛かる倍率） */
  fieldCorrection: number
}

/** 計算結果。乱数なし（r=1.00）と最大乱数（r=1.03）の2つ */
export type CalcResult = {
  noRandom: number
  maxRandom: number
}

/**
 * 入力の既定値（spec 3章の初期値）。
 * 効果行は「通常は2項目のみ」のため2行をあらかじめ用意する。
 * 画面のDEF・敵ATKは必須入力のため、未入力扱いの 0 にしておく。
 */
export const DEFAULT_INPUT: CalcInput = {
  screenDef: 0,
  effects: [
    { id: 'default-1', category: 'passiveAdd', addPercent: 0 },
    { id: 'default-2', category: 'passiveMul', addPercent: 0 },
  ],
  appliedPercent: {
    passiveAdd: 0,
    passiveMul: 0,
    support: 0,
    active: 0,
    superAttack: 0,
  },
  enemyAtk: 0,
  reductionPercent: 0,
  attrGuardA: 1,
  allAttrGuardB: false,
  fieldCorrection: 1,
}
