import { useState } from 'react'
import { BookOpen, Volume2, ChevronRight, Sparkles, Settings2 } from 'lucide-react'
import { letters, prototypeLetters, type Letter } from './content/schema'
import { audio } from './services/audio'
import { WritingPad } from './features/writing/WritingPad'
import './App.css'

function App() {
  const [selected, setSelected] = useState<Letter>(prototypeLetters[0])
  const [view, setView] = useState<'home'|'alphabet'|'card'|'write'>('home')
  const [soundError, setSoundError] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const available = showDraft ? letters : prototypeLetters
  const speak = (text: string) => { setSoundError(false); audio.speak(text, () => setSoundError(true)) }
  return <main>
    <header className="topbar"><button className="brand" onClick={() => setView('home')}><span className="brand-mark">А</span><span>Буква</span></button><div className="top-actions"><span className="prototype-pill"><Sparkles size={14}/> прототип</span><button className="icon-button" aria-label="Настройки"><Settings2 size={22}/></button></div></header>
    {view === 'home' && <section className="home page-shell"><div className="home-copy"><span className="eyebrow">РУССКАЯ АЗБУКА · 4–6 ЛЕТ</span><h1>Маленькие<br/><em>открытия</em><br/>каждый день.</h1><p>Послушай букву, найди знакомое слово и попробуй провести её рукой. Можно остановиться в любой момент.</p><div className="home-actions"><button className="primary" onClick={() => setView('card')}>Поиграем <ChevronRight size={20}/></button><button className="secondary" onClick={() => setView('alphabet')}><BookOpen size={19}/> Вся азбука</button></div><p className="parent-note">Сегодня: короткая встреча · 5 минут</p></div><div className="home-art"><div className="sun"/><div className="letter-orbit orbit-one">М</div><div className="letter-orbit orbit-two">О</div><div className="letter-orbit orbit-three">Ё</div><div className="hero-letter">А<span>а</span></div><div className="art-caption">Сначала слушаем,<br/>потом пробуем.</div></div></section>}
    {view === 'alphabet' && <section className="page-shell alphabet-view"><div className="section-heading"><div><span className="eyebrow">КАТАЛОГ</span><h2>Все буквы рядом</h2></div><button className="secondary small" onClick={() => setShowDraft(v => !v)}>{showDraft ? 'Скрыть черновики' : 'Показать все черновики'}</button></div><p className="intro">Четыре карточки уже можно пробовать в прототипе. Остальные буквы доступны как черновая карта содержания.</p><div className="letter-grid">{available.map(letter => <button className={`letter-tile ${letter.prototype ? 'ready' : ''}`} key={letter.id} onClick={() => { setSelected(letter); setView('card') }}><span>{letter.uppercase}</span><small>{letter.lowercase}</small><b>{letter.word}</b>{letter.prototype && <i>готово</i>}</button>)}</div></section>}
    {view === 'card' && <section className="page-shell card-view"><button className="back-link" onClick={() => setView('alphabet')}>← Вся азбука</button><div className="card-layout"><div className="letter-card"><span className="eyebrow">ЗНАКОМСТВО</span><div className="big-glyph">{selected.uppercase}<small>{selected.lowercase}</small></div><div className="card-word"><div className="word-art">{selected.uppercase === 'М' ? '🧶' : selected.uppercase === 'О' ? '☀️' : selected.uppercase === 'Ё' ? '🌲' : '🐴'}</div><strong>{selected.accentedWord}</strong></div><div className="audio-actions"><button onClick={() => speak(`Буква ${selected.uppercase}`)}><Volume2 size={20}/> Слушать букву</button><button onClick={() => speak(selected.word)}><Volume2 size={20}/> Слушать слово</button></div>{soundError && <p className="error">Звук не запустился. Нажми ещё раз после касания.</p>}</div><div className="lesson-card"><span className="eyebrow">СЕЙЧАС</span><h2>{selected.uppercase === 'Ь' ? 'Мягкий знак живёт внутри слова' : `Узнаем букву ${selected.uppercase}`}</h2><p>{selected.note}</p><button className="primary full" onClick={() => setView('write')}>Попробовать рукой <ChevronRight size={20}/></button><button className="text-button" onClick={() => speak(selected.uppercase === 'Ь' ? 'У мягкого знака нет своего звука' : selected.word)}>Послушать ещё раз</button></div></div></section>}
    {view === 'write' && <section className="page-shell write-view"><button className="back-link" onClick={() => setView('card')}>← К букве {selected.uppercase}</button><WritingPad letter={selected.uppercase}/></section>}
    <footer><span>Прототип · содержание проверяется</span><span>Работает на устройстве, без аккаунта</span></footer>
  </main>
}
export default App
