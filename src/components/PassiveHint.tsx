import { useState } from 'react'

type Props = {
  /** 「?」ボタンの左に並べる見出し */
  heading: string
}

/**
 * 足し算・掛け算パッシブの見分け方ヒント。
 * spec 2章の「説明は付けない」方針の例外のため、常時表示せず「?」で開いたときだけ出す（spec 3章）
 */
export function PassiveHint({ heading }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">{heading}</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="足し算・掛け算パッシブの見分け方"
          className="size-11 shrink-0 rounded-full text-sm font-bold text-sky-700 hover:bg-sky-50"
        >
          ?
        </button>
      </div>
      {open && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            <span className="font-bold">足し算パッシブ</span>
            <br />
            「攻撃時」が書かれていないもの。自分の行動が主体でないもの。
            <br />
            例: 「ターン開始時にDEF+20%」「HP50%以上でDEF+20%」
            <br />
            ※「〇〇の敵を攻撃すると」「〇番目で攻撃すると」は、「攻撃」と書かれていても足し算です。
          </p>
          <p>
            <span className="font-bold">掛け算パッシブ</span>
            <br />
            「攻撃時」が書かれているもの。攻撃中の行動がきっかけのもの。アクティブスキル発動時や「ターン終了時」。
            <br />
            例: 「攻撃時にDEF+20%」「ガードするたび」「敵の攻撃を受けると」「ターン終了時」
          </p>
          <p className="text-xs text-slate-500">
            初期キャラなど例外もあります。迷ったときは目安として入力してください。
          </p>
        </div>
      )}
    </div>
  )
}
