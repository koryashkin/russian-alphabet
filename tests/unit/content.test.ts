import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { alphabet, letters } from '../../src/content/schema'
import { examples } from '../../src/content/examples'
import { strokeOrderMarkers, tracePaths } from '../../src/features/writing/geometry'

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

  it('has one object image for every example word', () => {
    for (const letter of letters) {
      for (const index of [0, 1, 2]) {
        const filename = `${letter.uppercase.codePointAt(0)?.toString(16)}-${index}.webp`
        expect(existsSync(resolve('public/assets/words', filename)), `${letter.uppercase}, word ${index + 1}`).toBe(true)
      }
    }
  })

  it('has a non-empty writing demonstration for every letter', () => {
    for (const letter of letters) expect(tracePaths[letter.uppercase]?.length, letter.uppercase).toBeGreaterThan(0)
  })

  it('keeps every stroke-order number visually separate', () => {
    for (const letter of letters) {
      const markers = strokeOrderMarkers(tracePaths[letter.uppercase] ?? [])
      for (let first = 0; first < markers.length; first += 1) {
        for (let second = first + 1; second < markers.length; second += 1) {
          const distance = Math.hypot(markers[first].x - markers[second].x, markers[first].y - markers[second].y)
          expect(distance, `${letter.uppercase}: markers ${first + 1} and ${second + 1}`).toBeGreaterThan(6)
        }
      }
    }
  })

  it('uses a consistent print-letter direction for key strokes', () => {
    expect(tracePaths['Н']).toEqual([
      'M 25 18 L 25 82',
      'M 75 18 L 75 82',
      'M 25 50 L 75 50',
    ])
    expect(tracePaths['А']?.[0]).toBe('M 48 18 L 18 82')
    expect(tracePaths['Б']).toEqual(['M 28 20 L 72 20', 'M 28 20 L 28 82', 'M 28 51 L 55 51 C 82 51 82 82 55 82 L 28 82'])
    expect(tracePaths['Г']).toEqual(['M 28 20 L 72 20', 'M 28 20 L 28 82'])
    expect(tracePaths['П']).toEqual(['M 25 20 L 25 82', 'M 25 20 L 75 20', 'M 75 20 L 75 82'])
    expect(tracePaths['М']).toEqual(['M 25 20 L 25 80', 'M 25 20 L 50 58 L 75 20', 'M 75 20 L 75 80'])
    expect(tracePaths['Ц']).toEqual(['M 23 18 L 23 82', 'M 23 82 L 70 82', 'M 70 18 L 70 82 L 82 82 L 82 92'])
    expect(tracePaths['Ш']).toEqual(['M 20 18 L 20 82', 'M 50 18 L 50 82', 'M 80 18 L 80 82', 'M 20 82 L 80 82'])
    expect(tracePaths['Щ']).toEqual(['M 17 18 L 17 82', 'M 45 18 L 45 82', 'M 73 18 L 73 82', 'M 17 82 L 84 82 L 84 92'])
  })
})
