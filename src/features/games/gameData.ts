export const positionChoices = ['В начале', 'В середине', 'В конце'] as const
export type WordPosition = typeof positionChoices[number]

const dedicatedRounds: Record<string, string[]> = {
  Е: ['еда́', 'по́езд', 'кафе́'],
}

export function gameWordsForLetter(letter: string, words: string[]) {
  return dedicatedRounds[letter] ?? words
}

export function positionInWord(letter: string, word: string): WordPosition {
  const plainWord = word.normalize('NFD').replace(/[\u0300\u0301]/g, '').normalize('NFC').toLowerCase()
  const index = plainWord.indexOf(letter.toLowerCase())
  if (index === 0) return 'В начале'
  if (index + letter.length === plainWord.length) return 'В конце'
  return 'В середине'
}
