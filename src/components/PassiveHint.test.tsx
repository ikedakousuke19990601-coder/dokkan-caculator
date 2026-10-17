// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PassiveHint } from './PassiveHint'

afterEach(cleanup)

const BUTTON_NAME = '足し算・掛け算パッシブの見分け方'

describe('PassiveHint', () => {
  it('初期状態では閉じていて、説明は表示されない', () => {
    render(<PassiveHint heading="見出し" />)
    const button = screen.getByRole('button', { name: BUTTON_NAME })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText(/足し算パッシブ/)).toBeNull()
  })

  it('押すと説明が開き、もう一度押すと閉じる', () => {
    render(<PassiveHint heading="見出し" />)
    const button = screen.getByRole('button', { name: BUTTON_NAME })

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(/足し算パッシブ/)).toBeTruthy()
    expect(screen.getByText(/掛け算パッシブ/)).toBeTruthy()

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText(/足し算パッシブ/)).toBeNull()
  })

  it('「攻撃」と書かれていても足し算になる例外を載せている', () => {
    render(<PassiveHint heading="見出し" />)
    fireEvent.click(screen.getByRole('button', { name: BUTTON_NAME }))
    expect(screen.getByText(/の敵を攻撃すると/)).toBeTruthy()
    expect(screen.getByText(/番目で攻撃すると/)).toBeTruthy()
  })

  it('初期キャラなど例外がある旨の注記を載せている', () => {
    render(<PassiveHint heading="見出し" />)
    fireEvent.click(screen.getByRole('button', { name: BUTTON_NAME }))
    expect(screen.getByText(/初期キャラなど例外もあります/)).toBeTruthy()
  })
})
