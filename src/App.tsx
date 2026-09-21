import { useState } from 'react'
import { Volume2, ChevronRight, Sparkles, Settings2 } from 'lucide-react'
import { letters, type Letter } from './content/schema'
import { audio } from './services/audio'
import { WritingPad } from './features/writing/WritingPad'
import { examples } from './content/examples'
import { EGame } from './features/games/EGame'
import './App.css'
import './word-list.css'
import './features/games/games.css'

function App() {
  const [selected, setSelected] = useState<Letter>(letters[0])
  const [view, setView] = useState<'alphabet'|'card'|'write'>('alphabet')
  const [soundError, setSoundError] = useState(false)
  const available = letters
  const speak = (text: string) => { setSoundError(false); audio.speak(text, () => setSoundError(true)) }
  const imagePath = `/assets/letters/${selected.uppercase.codePointAt(0)?.toString(16)}.png`
  return <main>
    <header className="topbar"><button className="brand" onClick={() => setView('alphabet')}><span className="brand-mark">А</span><span>Русская азбука</span></button><div className="top-actions"><span className="prototype-pill"><Sparkles size={14}/> прототип</span><button className="icon-button" aria-label="Настройки"><Settings2 size={22}/></button></div></header>
    {view === 'alphabet' && <section className="page-shell alphabet-view"><div className="section-heading"><div><span className="eyebrow">РУССКАЯ АЗБУКА · 4–6 ЛЕТ</span><h1 className="catalog-title">Выбери букву</h1></div></div><p className="intro">Нажми на букву, чтобы послушать слово, увидеть картинку и попробовать написать её рукой. Четыре карточки уже интерактивны; остальные подготовлены для следующего шага.</p><div className="letter-grid">{available.map(letter => <button className={`letter-tile ${letter.prototype ? 'ready' : ''}`} key={letter.id} onClick={() => { setSelected(letter); setView('card') }}><span>{letter.uppercase}</span><small>{letter.lowercase}</small><b>{letter.word}</b>{letter.prototype && <i>можно играть</i>}</button>)}</div></section>}
    {view === 'card' && <section className="page-shell card-view"><button className="back-link" onClick={() => setView('alphabet')}>← Вся азбука</button><div className="card-layout"><div className="letter-card"><span className="eyebrow">ЗНАКОМСТВО</span><div className="big-glyph">{selected.uppercase}<small>{selected.lowercase}</small></div><div className="word-art generated" role="img" aria-label={`Иллюстрация: ${selected.word}`} style={{backgroundImage:`url(${imagePath})`}} /><div className="word-list">{(examples[selected.uppercase] ?? [selected.accentedWord]).map(word => <button key={word} onClick={() => speak(word)}><Volume2 size={16}/><strong>{word}</strong></button>)}</div><div className="audio-actions"><button onClick={() => speak(`Буква ${selected.uppercase}`)}><Volume2 size={20}/> Слушать букву</button></div>{soundError && <p className="error">Звук не запустился. Нажми ещё раз после касания.</p>}</div><div className="lesson-card"><span className="eyebrow">СЕЙЧАС</span><h2>{selected.uppercase === 'Ь' ? 'Мягкий знак живёт внутри слова' : `Узнаем букву ${selected.uppercase}`}</h2><p>{selected.note}</p>{selected.uppercase === 'Е' && <EGame speak={speak}/>}<button className="primary full" onClick={() => setView('write')}>Попробовать рукой <ChevronRight size={20}/></button><button className="text-button" onClick={() => speak(selected.uppercase === 'Ь' ? 'У мягкого знака нет своего звука' : selected.word)}>Послушать ещё раз</button></div></div></section>}
    {view === 'write' && <section className="page-shell write-view"><button className="back-link" onClick={() => setView('card')}>← К букве {selected.uppercase}</button><WritingPad letter={selected.uppercase}/></section>}
    <footer><span>Прототип · содержание проверяется</span><span>Работает на устройстве, без аккаунта</span></footer>
  </main>
}
export default App
