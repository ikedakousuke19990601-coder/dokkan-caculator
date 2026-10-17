import type { CalcForm, SimpleField } from '../hooks/useCalcInput'
import type { ValidationErrors } from '../logic/normalize'
import { ATTR_GUARD_A_VALUES } from '../logic/types'
import { NumberField } from './NumberField'

type EnemyField =
  'enemyAtk' | 'reductionPercent' | 'attrGuardA' | 'allAttrGuardB' | 'fieldCorrection'

type Props = {
  form: Pick<CalcForm, EnemyField>
  errors: Pick<ValidationErrors, 'enemyAtk' | 'reductionPercent' | 'fieldCorrection'>
  onChange: <K extends SimpleField>(key: K, value: CalcForm[K]) => void
}

/** B. 敵の攻撃 */
export function EnemySection({ form, errors, onChange }: Props) {
  function changeAttrGuardA(text: string) {
    // 選択肢は ATTR_GUARD_A_VALUES から作っているので必ず見つかる
    const value = ATTR_GUARD_A_VALUES.find((v) => String(v) === text)
    if (value !== undefined) onChange('attrGuardA', value)
  }

  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">敵の攻撃</h2>
      <NumberField
        label="敵ATK"
        value={form.enemyAtk}
        onChange={(value) => onChange('enemyAtk', value)}
        invalid={errors.enemyAtk === 'invalid'}
      />
      <NumberField
        label="ダメージ軽減率（％）"
        value={form.reductionPercent}
        onChange={(value) => onChange('reductionPercent', value)}
        placeholder="0"
        inputMode="decimal"
        invalid={errors.reductionPercent === 'invalid'}
      />

      <label className="block">
        <span className="text-sm font-medium text-slate-700">属性防御係数A（属性ガード）</span>
        <select
          value={String(form.attrGuardA)}
          onChange={(e) => changeAttrGuardA(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2.5 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
        >
          {ATTR_GUARD_A_VALUES.map((value) => (
            <option key={value} value={String(value)}>
              {value === 1 ? 'なし(1.0)' : value}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center justify-between gap-3 py-1">
        <span className="text-sm font-medium text-slate-700">属性防御係数B（全属性ガード）</span>
        <input
          type="checkbox"
          checked={form.allAttrGuardB}
          onChange={(e) => onChange('allAttrGuardB', e.target.checked)}
          className="size-6 accent-sky-600"
        />
      </label>

      <NumberField
        label="フィールド補正（最終ダメージ）"
        value={form.fieldCorrection}
        onChange={(value) => onChange('fieldCorrection', value)}
        placeholder="1"
        inputMode="decimal"
        invalid={errors.fieldCorrection === 'invalid'}
      />
    </section>
  )
}
