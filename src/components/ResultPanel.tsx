import type { ShutoutAtk } from '../logic/calcShutoutAtk'
import type { CalcResult } from '../logic/types'

type Props = {
  /** 計算できないとき（未入力・エラー）は null */
  result: CalcResult | null
  /** 完封できる敵ATKの上限。計算できないときは null */
  shutout: ShutoutAtk | null
  /** 計算できないときの案内 */
  hint?: string
}

function formatDamage(value: number | undefined): string {
  return value === undefined ? '―' : value.toLocaleString('ja-JP')
}

/** 完封できる敵ATKの表示。Infinity はどんなATKでも0、0 は ATK 1 でもダメージが出る（spec 5章） */
function formatShutout(value: number | undefined): string {
  if (value === Infinity) return '上限なし'
  if (value === 0) return 'なし'
  return formatDamage(value)
}

/** 被ダメージの2つの数値と、完封できる敵ATKの上限だけを表示する（内訳・残りHP・判定は出さない: spec 2章） */
export function ResultPanel({ result, shutout, hint }: Props) {
  const rows = [
    { label: '乱数なし', value: result?.noRandom, shutout: shutout?.noRandom },
    { label: '最大乱数', value: result?.maxRandom, shutout: shutout?.maxRandom },
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
      <div className="mt-3 border-t border-slate-600 pt-2">
        <p className="text-xs text-slate-300">完封できる敵ATKの上限（ダメージ0）</p>
        <div className="mt-1 grid grid-cols-2 gap-3">
          {rows.map(({ label, shutout: value }) => (
            <p key={label} className="text-lg font-bold tabular-nums" data-testid={`完封-${label}`}>
              {formatShutout(value)}
            </p>
          ))}
        </div>
      </div>
      {result === null && hint && (
        <p role="status" className="mt-2 text-sm text-amber-300">
          {hint}
        </p>
      )}
    </section>
  )
}
