import type { EffectForm } from '../hooks/useCalcInput'
import {
  EFFECT_CATEGORIES,
  EFFECT_CATEGORY_LABELS,
  SUPER_ATTACK_PRESETS,
  type EffectCategory,
} from '../logic/types'
import { NumberField } from './NumberField'

type Props = {
  effect: EffectForm
  onChange: (patch: Partial<Omit<EffectForm, 'id'>>) => void
  onRemove: () => void
  /** 追加％が不正なときのエラーメッセージ */
  error?: string
}

/** 「これから上がる効果」1行（区分＋％） */
export function EffectRow({ effect, onChange, onRemove, error }: Props) {
  // エラーメッセージで％欄が縦に伸びても揃うよう、上端で合わせる。
  // 360px 幅でも区分の名前が途切れにくいよう、％欄と削除ボタンは細くしている
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-1.5">
        <label className="block min-w-0 flex-1">
          <span className="text-sm font-medium text-slate-700">区分</span>
          <select
            value={effect.category}
            onChange={(e) => onChange({ category: e.target.value as EffectCategory })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2.5 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          >
            {EFFECT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EFFECT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <div className="w-20 shrink-0">
          <NumberField
            label="追加％"
            value={effect.addPercent}
            onChange={(addPercent) => onChange({ addPercent })}
            placeholder="0"
            inputMode="decimal"
            error={error}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="この行を削除"
          className="mt-6 size-11 shrink-0 rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ×
        </button>
      </div>
      {/* 必殺技の追加効果は「上昇」「大幅上昇」表記が多く％が分からないため、ボタンで入力を補助する（spec 3章） */}
      {effect.category === 'superAttack' && (
        <div className="flex gap-1.5">
          {SUPER_ATTACK_PRESETS.map(({ label, percent }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ addPercent: String(percent) })}
              aria-pressed={effect.addPercent === String(percent)}
              className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 hover:bg-slate-50 aria-pressed:border-sky-500 aria-pressed:bg-sky-50 aria-pressed:text-sky-800"
            >
              {label} {percent}%
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
