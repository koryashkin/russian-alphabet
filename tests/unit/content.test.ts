import { describe, expect, it } from 'vitest'
import { alphabet, letters } from '../../src/content/schema'
import { examples } from '../../src/content/examples'

describe('alphabet content contract', () => {
  it('contains the complete Russian alphabet in order', () => {
    expect(letters).toHaveLength(33)
    expect(letters.map(letter => letter.uppercase).join('')).toBe(alphabet)
    expect(new Set(letters.map(letter => letter.id)).size).toBe(33)
  })

  it('has at least three examples for every letter', () => {
    for (const letter of letters) expect(examples[letter.uppercase]).toHaveLength(3)
  })

  it('does not treat hard or soft signs as phonemes', () => {
    expect(letters.find(letter => letter.uppercase === 'Ь')?.kind).toBe('sign')
    expect(letters.find(letter => letter.uppercase === 'Ъ')?.kind).toBe('sign')
  })
})
