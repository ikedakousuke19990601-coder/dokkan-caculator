import type { CalcResult } from '../logic/types'

type Props = {
  /** 計算できないとき（未入力・エラー）は null */
  result: CalcResult | null
  /** 計算できないときの案内 */
  hint?: string
}

function formatDamage(value: number | undefined): string {
  return value === undefined ? '―' : value.toLocaleString('ja-JP')
}

/** 被ダメージの2つの数値だけを表示する（内訳・残りHP・判定は出さない: spec 2章） */
export function ResultPanel({ result, hint }: Props) {
  const rows = [
    { label: '乱数なし', value: result?.noRandom },
    { label: '最大乱数', value: result?.maxRandom },
  ]

  return (
    <section aria-label="被ダメージ" className="rounded-xl bg-slate-800 p-4 text-white">
      <div className="grid grid-cols-2 gap-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <p className="text-sm text-slate-300">{label}</p>
            <p className="text-2xl font-bold tabular-nums" data-testid={label}>
              {formatDamage(value)}
            </p>
          </div>
        ))}
      </div>
      {result === null && hint && (
        <p role="status" className="mt-2 text-sm text-amber-300">
          {hint}
        </p>
      )}
    </section>
  )
}
