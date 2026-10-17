type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 小数を入力する項目は decimal（スマホで小数点キーを出す） */
  inputMode?: 'numeric' | 'decimal'
  /** 不正な値のとき true（枠を赤くする） */
  invalid?: boolean
}

/**
 * 数値の入力欄。
 * type="number" は全角入力やカンマ付きの値を受け付けないため、text + inputMode にする。
 */
export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'numeric',
  invalid = false,
}: Props) {
  const border = invalid
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-right text-lg focus:ring-2 focus:outline-none ${border}`}
      />
    </label>
  )
}
