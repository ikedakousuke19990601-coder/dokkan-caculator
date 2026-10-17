// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import type { EffectForm } from '../hooks/useCalcInput'
import { EffectRow } from './EffectRow'

afterEach(cleanup)

/** 親の状態管理を省くため、EffectRow を状態付きで包む */
function Harness({ initial }: { initial: EffectForm }) {
  const [effect, setEffect] = useState(initial)
  return (
    <EffectRow
      effect={effect}
      onChange={(patch) => setEffect((prev) => ({ ...prev, ...patch }))}
      onRemove={() => {}}
    />
  )
}

const superAttack: EffectForm = { id: 'a', category: 'superAttack', addPercent: '' }

describe('EffectRow（必殺技の追加効果の補助ボタン）', () => {
  it('区分が必殺技の追加効果のときだけ、補助ボタンを表示する', () => {
    render(<Harness initial={superAttack} />)
    expect(screen.getByRole('button', { name: /^上昇/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^大幅上昇/ })).toBeTruthy()

    cleanup()
    render(<Harness initial={{ ...superAttack, category: 'active' }} />)
    expect(screen.queryByRole('button', { name: /^上昇/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^大幅上昇/ })).toBeNull()
  })

  it('押すと追加％に 20 / 50 が入る', () => {
    render(<Harness initial={superAttack} />)
    const percent = screen.getByLabelText('追加％') as HTMLInputElement

    fireEvent.click(screen.getByRole('button', { name: /^上昇/ }))
    expect(percent.value).toBe('20')

    fireEvent.click(screen.getByRole('button', { name: /^大幅上昇/ }))
    expect(percent.value).toBe('50')
  })

  it('入力後も数字を書き換えられ、値が違えば押下状態が外れる', () => {
    render(<Harness initial={superAttack} />)
    const percent = screen.getByLabelText('追加％') as HTMLInputElement
    const button = screen.getByRole('button', { name: /^大幅上昇/ })

    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('true')

    fireEvent.change(percent, { target: { value: '45' } })
    expect(percent.value).toBe('45')
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  it('区分を変えるとボタンは消え、入力済みの％は残る', () => {
    render(<Harness initial={superAttack} />)
    fireEvent.click(screen.getByRole('button', { name: /^大幅上昇/ }))

    fireEvent.change(screen.getByLabelText('区分'), { target: { value: 'active' } })

    expect(screen.queryByRole('button', { name: /^大幅上昇/ })).toBeNull()
    expect((screen.getByLabelText('追加％') as HTMLInputElement).value).toBe('50')
  })
})
