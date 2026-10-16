import { describe, expect, it } from 'vitest'

// Vitest の動作確認用。#03 以降で実際のテストを追加したら削除する
describe('テスト環境', () => {
  it('Vitest が実行できる', () => {
    expect(1 + 1).toBe(2)
  })
})
