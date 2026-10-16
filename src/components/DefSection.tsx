import { NumberField } from './NumberField'

type Props = {
  screenDef: string
  onScreenDefChange: (value: string) => void
}

/** A. 自分のDEF */
export function DefSection({ screenDef, onScreenDefChange }: Props) {
  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">自分のDEF</h2>
      <NumberField label="画面のDEF" value={screenDef} onChange={onScreenDefChange} />
    </section>
  )
}
