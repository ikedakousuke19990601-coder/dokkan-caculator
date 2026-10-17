type Props = {
  onReset: () => void
}

/** すべての入力を初期状態に戻すボタン */
export function ResetButton({ onReset }: Props) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-3 text-sm text-slate-600 hover:bg-slate-50"
    >
      入力をリセット
    </button>
  )
}
