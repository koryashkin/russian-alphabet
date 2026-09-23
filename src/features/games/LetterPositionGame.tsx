import { useMemo, useState } from 'react'
import { Check, Volume2 } from 'lucide-react'
import { gameWordsForLetter, positionChoices, positionInWord } from './gameData'

const positionCopy = { 'В начале': 'первой', 'В середине': 'в середине слова', 'В конце': 'последней' } as const

export function LetterPositionGame({ letter, words, speak }: { letter: string, words: string[], speak: (text: string) => void }) {
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const rounds = useMemo(() => gameWordsForLetter(letter, words).map(word => ({ word, answer: positionInWord(letter, word) })), [letter, words])
  const current = rounds[round] ?? rounds[0]
  const isCorrect = picked === current.answer

  const choose = (choice: string) => {
    setPicked(choice)
    speak(choice === current.answer ? `Правильно. Буква ${letter} стоит ${positionCopy[current.answer]}.` : 'Послушай слово ещё раз и попробуй снова.')
  }

  const next = () => {
    setPicked(null)
    setRound(value => (value + 1) % rounds.length)
  }

  return <section className="letter-game" aria-labelledby="position-game-title">
    <div className="game-kicker">ИГРА С БУКВОЙ {letter} · {round + 1} ИЗ {rounds.length}</div>
    <h3 id="position-game-title">Где в слове буква {letter}?</h3>
    <p className="game-instruction">Скажи ответ вслух, а потом нажми на него.</p>
    <div className="game-prompt">
      <button className="game-speak" onClick={() => speak(current.word)} aria-label={`Послушать слово ${current.word}`}><Volume2 size={21}/></button>
      <strong>{current.word}</strong>
    </div>
    <div className="game-choices position-choices">
      {positionChoices.map(choice => <button key={choice} className={picked === choice ? (choice === current.answer ? 'correct' : 'wrong') : ''} onClick={() => choose(choice)}>{choice}</button>)}
    </div>
    {picked && <div className={`game-result ${isCorrect ? 'success' : ''}`} role="status">
      {isCorrect ? <><Check size={17}/> Буква {letter} стоит {positionCopy[current.answer]}.</> : 'Послушай слово ещё раз.'}
      <button onClick={next}>{round === rounds.length - 1 ? 'Играть сначала' : 'Следующее слово'}</button>
    </div>}
  </section>
}
