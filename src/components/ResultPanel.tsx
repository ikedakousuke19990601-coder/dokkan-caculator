import type { CalcResult } from '../logic/types'

type Props = {
  /** 計算できないとき（未入力・エラー）は null */
  result: CalcResult | null
}

function formatDamage(value: number | undefined): string {
  return value === undefined ? '―' : value.toLocaleString('ja-JP')
}

/** 被ダメージの2つの数値だけを表示する（内訳・残りHP・判定は出さない: spec 2章） */
export function ResultPanel({ result }: Props) {
  const rows = [
    { label: '乱数なし', value: result?.noRandom },
    { label: '最大乱数', value: result?.maxRandom },
  ]

  return (
    <section
      aria-label="被ダメージ"
      className="grid grid-cols-2 gap-3 rounded-xl bg-slate-800 p-4 text-white"
    >
      {rows.map(({ label, value }) => (
        <div key={label}>
          <p className="text-sm text-slate-300">{label}</p>
          <p className="text-2xl font-bold tabular-nums" data-testid={label}>
            {formatDamage(value)}
          </p>
        </div>
      ))}
    </section>
  )
}
