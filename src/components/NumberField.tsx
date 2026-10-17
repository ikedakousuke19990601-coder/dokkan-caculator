import { useId } from 'react'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 小数を入力する項目は decimal（スマホで小数点キーを出す） */
  inputMode?: 'numeric' | 'decimal'
  /** 不正な値のときのエラーメッセージ（赤枠にして入力欄の下に表示する） */
  error?: string
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
  error,
}: Props) {
  const errorId = useId()
  const border = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'

  // エラーは label の外に置く（中に置くと入力欄の名前にメッセージが混ざる）
  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          aria-invalid={error !== undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-right text-lg focus:ring-2 focus:outline-none ${border}`}
        />
      </label>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
