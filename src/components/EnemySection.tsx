import { NumberField } from './NumberField'

type Props = {
  enemyAtk: string
  onEnemyAtkChange: (value: string) => void
}

/** B. 敵の攻撃 */
export function EnemySection({ enemyAtk, onEnemyAtkChange }: Props) {
  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">敵の攻撃</h2>
      <NumberField label="敵ATK" value={enemyAtk} onChange={onEnemyAtkChange} />
    </section>
  )
}
