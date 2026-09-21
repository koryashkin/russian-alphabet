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
})
