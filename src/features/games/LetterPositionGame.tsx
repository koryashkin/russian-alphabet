import { useState } from 'react'
import { Check, Volume2 } from 'lucide-react'

const rounds = [
  { word: 'еда́', answer: 'В начале', explanation: 'Буква Е стоит первой.' },
  { word: 'по́езд', answer: 'В середине', explanation: 'Буква Е стоит в середине слова.' },
  { word: 'кафе́', answer: 'В конце', explanation: 'Буква Е стоит последней.' },
]
const choices = ['В начале', 'В середине', 'В конце']

export function LetterPositionGame({ speak }: { speak: (text: string) => void }) {
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const current = rounds[round]
  const isCorrect = picked === current.answer

  const choose = (choice: string) => {
    setPicked(choice)
    speak(choice === current.answer ? `Правильно. ${current.explanation}` : 'Послушай слово ещё раз и попробуй снова.')
  }

  const next = () => {
    setPicked(null)
    setRound(value => (value + 1) % rounds.length)
  }

  return <section className="e-game" aria-labelledby="position-game-title">
    <div className="game-kicker">ИГРА С Е · {round + 1} ИЗ {rounds.length}</div>
    <h3 id="position-game-title">Где в слове буква Е?</h3>
    <p className="game-instruction">Скажи ответ вслух, а потом нажми на него.</p>
    <div className="game-prompt">
      <button className="game-speak" onClick={() => speak(current.word)} aria-label={`Послушать слово ${current.word}`}><Volume2 size={21}/></button>
      <strong>{current.word}</strong>
    </div>
    <div className="game-choices position-choices">
      {choices.map(choice => <button key={choice} className={picked === choice ? (choice === current.answer ? 'correct' : 'wrong') : ''} onClick={() => choose(choice)}>{choice}</button>)}
    </div>
    {picked && <div className={`game-result ${isCorrect ? 'success' : ''}`} role="status">
      {isCorrect ? <><Check size={17}/> {current.explanation}</> : 'Послушай слово ещё раз.'}
      <button onClick={next}>{round === rounds.length - 1 ? 'Играть сначала' : 'Следующее слово'}</button>
    </div>}
  </section>
}
