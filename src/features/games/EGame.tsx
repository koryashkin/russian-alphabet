import { useState } from 'react'
import { Check, Volume2 } from 'lucide-react'

const choices = ['Е', 'И', 'Ё']

export function EGame({ speak }: { speak: (text: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [round, setRound] = useState(0)
  const words = ['ель', 'еда́', 'е́хать']
  const word = words[round % words.length]
  const choose = (letter: string) => { setPicked(letter); speak(letter === 'Е' ? 'Правильно, это Е' : `Это ${letter}. Попробуй ещё`) }
  return <section className="e-game" aria-labelledby="e-game-title"><div className="game-kicker">ИГРА С Е</div><h3 id="e-game-title">Слышим Е в начале слова</h3><div className="game-prompt"><button className="game-speak" onClick={() => speak(word)} aria-label={`Послушать слово ${word}`}><Volume2 size={21}/></button><strong>{word}</strong><span>Какая буква первая?</span></div><div className="game-choices">{choices.map(letter => <button key={letter} className={picked === letter ? (letter === 'Е' ? 'correct' : 'wrong') : ''} onClick={() => choose(letter)}>{letter}</button>)}</div>{picked && <div className={`game-result ${picked === 'Е' ? 'success' : ''}`} role="status">{picked === 'Е' ? <><Check size={17}/> Верно!</> : 'Послушай слово ещё раз.'}<button onClick={() => { setPicked(null); setRound(value => value + 1) }}>Следующее слово</button></div>}</section>
}
