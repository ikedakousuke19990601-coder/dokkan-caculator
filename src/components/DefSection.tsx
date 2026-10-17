import type { EffectForm } from '../hooks/useCalcInput'
import { EffectRow } from './EffectRow'
import { NumberField } from './NumberField'

type Props = {
  screenDef: string
  onScreenDefChange: (value: string) => void
  effects: EffectForm[]
  onAddEffect: () => void
  onUpdateEffect: (id: string, patch: Partial<Omit<EffectForm, 'id'>>) => void
  onRemoveEffect: (id: string) => void
}

/** A. 自分のDEF */
export function DefSection({
  screenDef,
  onScreenDefChange,
  effects,
  onAddEffect,
  onUpdateEffect,
  onRemoveEffect,
}: Props) {
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
    </section>
  )
}
