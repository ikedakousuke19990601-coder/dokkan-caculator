import { useState } from 'react'
import type { EffectForm } from '../hooks/useCalcInput'
import type { ErrorKind } from '../logic/normalize'
import { EFFECT_CATEGORIES, EFFECT_CATEGORY_LABELS, type EffectCategory } from '../logic/types'
import { EffectRow } from './EffectRow'
import { NumberField } from './NumberField'

type Props = {
  screenDef: string
  onScreenDefChange: (value: string) => void
  effects: EffectForm[]
  onAddEffect: () => void
  onUpdateEffect: (id: string, patch: Partial<Omit<EffectForm, 'id'>>) => void
  onRemoveEffect: (id: string) => void
  appliedPercent: Record<EffectCategory, string>
  appliedPercentErrors: Partial<Record<EffectCategory, ErrorKind>>
  onAppliedPercentChange: (category: EffectCategory, value: string) => void
}

/** A. 自分のDEF */
export function DefSection({
  screenDef,
  onScreenDefChange,
  effects,
  onAddEffect,
  onUpdateEffect,
  onRemoveEffect,
  appliedPercent,
  appliedPercentErrors,
  onAppliedPercentChange,
}: Props) {
  // 反映済み％は通常0のため、初級者の入力を増やさないよう「詳細」に隠す（spec 3章）
  const [showDetail, setShowDetail] = useState(false)
  // 閉じていても値は計算に使うため、入力があることを見出しで知らせる
  const hasApplied = EFFECT_CATEGORIES.some((c) => appliedPercent[c].trim() !== '')

  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">自分のDEF</h2>
      <NumberField label="画面のDEF" value={screenDef} onChange={onScreenDefChange} />

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">これから上がる効果</h3>
        {effects.map((effect) => (
          <EffectRow
            key={effect.id}
            effect={effect}
            onChange={(patch) => onUpdateEffect(effect.id, patch)}
            onRemove={() => onRemoveEffect(effect.id)}
          />
        ))}
        <button
          type="button"
          onClick={onAddEffect}
          className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          ＋ 効果を追加
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          aria-expanded={showDetail}
          className="text-sm text-sky-700 hover:underline"
        >
          {showDetail ? '▼' : '▶'} 詳細{hasApplied && !showDetail && '（入力あり）'}
        </button>
        {showDetail && (
          <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">
            <h3 className="text-sm font-bold text-slate-700">反映済みの％</h3>
            <div className="grid grid-cols-2 gap-2">
              {EFFECT_CATEGORIES.map((category) => (
                <NumberField
                  key={category}
                  label={EFFECT_CATEGORY_LABELS[category]}
                  value={appliedPercent[category]}
                  onChange={(value) => onAppliedPercentChange(category, value)}
                  placeholder="0"
                  inputMode="decimal"
                  invalid={appliedPercentErrors[category] !== undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
