type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 小数を入力する項目は decimal（スマホで小数点キーを出す） */
  inputMode?: 'numeric' | 'decimal'
}

/**
 * 数値の入力欄。
 * type="number" は全角入力やカンマ付きの値を受け付けないため、text + inputMode にする。
 */
export function NumberField({ label, value, onChange, placeholder, inputMode = 'numeric' }: Props) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-right text-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none"
      />
    </label>
  )
}
