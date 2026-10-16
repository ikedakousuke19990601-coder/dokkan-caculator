// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

function input(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function shown(label: '乱数なし' | '最大乱数') {
  return screen.getByTestId(label).textContent
}

describe('App（最小UI）', () => {
  it('未入力のときは結果に「―」を表示する', () => {
    render(<App />)
    expect(shown('乱数なし')).toBe('―')
    expect(shown('最大乱数')).toBe('―')
  })

  it('画面のDEF・敵ATK を入力すると、ボタンなしで結果が3桁区切りで出る', () => {
    render(<App />)
    input('画面のDEF', '19500')
    input('敵ATK', '1000000')
    // calcDamage.test.ts の基本ケースと同じ
    expect(shown('乱数なし')).toBe('980,500')
    expect(shown('最大乱数')).toBe('1,010,500')
  })

  it('入力を変えると結果がすぐ変わる', () => {
    render(<App />)
    input('画面のDEF', '19500')
    input('敵ATK', '1000000')
    input('敵ATK', '10000')
    expect(shown('乱数なし')).toBe('0')
  })

  it('数値入力欄はスマホで数字キーを出す', () => {
    render(<App />)
    expect(screen.getByLabelText('画面のDEF').getAttribute('inputmode')).toBe('numeric')
    expect(screen.getByLabelText('敵ATK').getAttribute('inputmode')).toBe('numeric')
  })
})
