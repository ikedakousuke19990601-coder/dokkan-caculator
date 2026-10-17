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

describe('App（これから上がる効果）', () => {
  const rows = () => ({
    categories: screen.getAllByLabelText('区分') as HTMLSelectElement[],
    percents: screen.getAllByLabelText('追加％') as HTMLInputElement[],
    removes: screen.getAllByRole('button', { name: 'この行を削除' }),
  })

  function setRow(index: number, category: string, percent: string) {
    fireEvent.change(rows().categories[index], { target: { value: category } })
    fireEvent.change(rows().percents[index], { target: { value: percent } })
  }

  function renderWithBase() {
    render(<App />)
    input('画面のDEF', '10000')
    input('敵ATK', '100000')
  }

  it('初期状態で効果行が2行表示される', () => {
    render(<App />)
    expect(rows().categories).toHaveLength(2)
  })

  it('区分の選択肢が spec 3章の5種類', () => {
    render(<App />)
    const labels = Array.from(rows().categories[0].options).map((o) => o.textContent)
    expect(labels).toEqual([
      'パッシブ（足し算）',
      'パッシブ（掛け算）',
      'サポートメモリー・アイテム',
      'アクティブスキル',
      '必殺技の追加効果',
    ])
  })

  it('行の入力が結果に即時反映される', () => {
    renderWithBase()
    // DEF 10,000 × 1.5 = 15,000 → 100,000 − 15,000
    setRow(0, 'passiveAdd', '50')
    expect(shown('乱数なし')).toBe('85,000')
  })

  it('同じ区分を2行入力すると、合算してから1回だけ掛ける', () => {
    renderWithBase()
    // DEF 10,000 × (1 + 0.2 + 0.3) = 15,000（1.2 × 1.3 = 15,600 にはならない）
    setRow(0, 'support', '20')
    setRow(1, 'support', '30')
    expect(shown('乱数なし')).toBe('85,000')
    expect(shown('最大乱数')).toBe('88,000')
  })

  it('行を追加・削除でき、結果に即時反映される', () => {
    renderWithBase()
    fireEvent.click(screen.getByRole('button', { name: '＋ 効果を追加' }))
    expect(rows().categories).toHaveLength(3)

    // 追加した行を ⑥ +50% → DEF 15,000
    setRow(2, 'active', '50')
    expect(shown('乱数なし')).toBe('85,000')

    fireEvent.click(rows().removes[2])
    expect(rows().categories).toHaveLength(2)
    expect(shown('乱数なし')).toBe('90,000')
  })

  it('行を全部削除しても画面が壊れず、計算できる', () => {
    renderWithBase()
    fireEvent.click(rows().removes[0])
    fireEvent.click(rows().removes[0])
    expect(screen.queryAllByLabelText('区分')).toHaveLength(0)
    expect(shown('乱数なし')).toBe('90,000')

    // 全部消したあとも追加できる
    fireEvent.click(screen.getByRole('button', { name: '＋ 効果を追加' }))
    expect(rows().categories).toHaveLength(1)
  })
})
