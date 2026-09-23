import { useState } from 'react'
import { ChevronRight, GitBranch, Headphones, Images, PencilLine, Volume2 } from 'lucide-react'
import { letters, type Letter } from './content/schema'
import { audio, type SoundIssue } from './services/audio'
import { WritingPad } from './features/writing/WritingPad'
import { examples } from './content/examples'
import { LetterPositionGame } from './features/games/LetterPositionGame'
import './App.css'
import './word-list.css'
import './features/games/games.css'

type View = 'alphabet' | 'card' | 'write'
type SoundHelp = SoundIssue | 'manual'
const vowels = new Set('АЕЁИОУЫЭЮЯ')

function App() {
  const [selected, setSelected] = useState<Letter>(letters[0])
  const [selectedWordIndex, setSelectedWordIndex] = useState(0)
  const [illustrationRevealed, setIllustrationRevealed] = useState(false)
  const [view, setView] = useState<View>('alphabet')
  const [soundHelp, setSoundHelp] = useState<SoundHelp | null>(null)
  const words = examples[selected.uppercase] ?? [selected.accentedWord]
  const selectedWord = words[selectedWordIndex] ?? words[0]
  const codePoint = selected.uppercase.codePointAt(0)?.toString(16)
  const imagePath = `${import.meta.env.BASE_URL}assets/words/${codePoint}-${selectedWordIndex}.webp`

  const speak = (text: string) => {
    setSoundHelp(null)
    audio.speak(text, setSoundHelp)
  }

  const showView = (nextView: View) => {
    setView(nextView)
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const openLetter = (letter: Letter) => {
    setSelected(letter)
    setSelectedWordIndex(0)
    setIllustrationRevealed(false)
    setSoundHelp(null)
    showView('card')
  }

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => showView('alphabet')} aria-label="Открыть всю азбуку">
        <span className="brand-mark" aria-hidden="true">А</span>
        <span className="brand-copy"><strong>Русская азбука</strong><small>слушаем, смотрим, пишем</small></span>
      </button>
    </header>

    {view === 'alphabet' && <section className="page-shell alphabet-view">
      <div className="welcome-card">
        <div className="welcome-copy">
          <span className="eyebrow">АЗБУКА ДЛЯ ДЕТЕЙ 4–6 ЛЕТ</span>
          <h1>Буквы, которые хочется <em>исследовать</em></h1>
          <p>Выбирай букву, слушай знакомые слова, рассматривай картинки и учись писать по шагам.</p>
          <div className="feature-row" aria-label="Возможности азбуки">
            <span><Headphones size={18}/> Слушай</span>
            <span><Images size={18}/> Смотри</span>
            <span><PencilLine size={18}/> Пиши</span>
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="sun-shape"/>
          <span className="hero-glyph">А<small>а</small></span>
          <span className="floating-letter letter-one">Б</span>
          <span className="floating-letter letter-two">Я</span>
          <span className="floating-letter letter-three">Ё</span>
        </div>
      </div>

      <div className="alphabet-heading">
        <div><span className="eyebrow">ВСЕ БУКВЫ</span><h2 className="catalog-title">Выбери букву</h2></div>
        <div className="alphabet-key" aria-label="Цвета букв"><span className="vowel-key">Гласные</span><span className="consonant-key">Согласные</span><span className="sign-key">Знаки</span></div>
      </div>
      <div className="letter-grid">
        {letters.map(letter => <button
          className={`letter-tile ${vowels.has(letter.uppercase) ? 'vowel' : letter.kind === 'sign' ? 'sign' : 'consonant'}`}
          aria-label={`Открыть букву ${letter.uppercase}: ${letter.word}`}
          key={letter.id}
          onClick={() => openLetter(letter)}
        >
          <span className="tile-glyph">{letter.uppercase}<small>{letter.lowercase}</small></span>
          <b>{letter.word}</b>
          <span className="tile-arrow" aria-hidden="true">→</span>
        </button>)}
      </div>
    </section>}

    {view === 'card' && <section className="page-shell card-view">
      <button className="back-link" onClick={() => showView('alphabet')}>← Вся азбука</button>
      <div className="card-layout">
        <div className="letter-card">
          <div className="letter-card-heading">
            <span className="eyebrow">ЗНАКОМСТВО</span>
            <button className="listen-letter" onClick={() => speak(`Буква ${selected.uppercase}`)}><Volume2 size={18}/> Слушать букву</button>
          </div>
          <div className="big-glyph">{selected.uppercase}<small>{selected.lowercase}</small></div>
          <div className="illustration-stage">
            {illustrationRevealed
              ? <img key={imagePath} className="letter-illustration" src={imagePath} alt={`Иллюстрация: ${selectedWord}`} />
              : <div className="illustration-prompt" role="status"><Headphones size={27}/><strong>Послушай слово</strong><span>Представь его, а потом проверь себя.</span></div>}
          </div>
          <div className="word-list">
            {words.map((word, index) => <button
              key={`${word}-${index}`}
              aria-pressed={selectedWordIndex === index}
              onClick={() => { setSelectedWordIndex(index); setIllustrationRevealed(false); speak(word) }}
            ><Volume2 size={17}/><strong>{word}</strong></button>)}
          </div>
          {!illustrationRevealed && <button className="reveal-illustration" onClick={() => setIllustrationRevealed(true)}><Images size={18}/> Показать картинку</button>}
          <div className="audio-support">
            <button className="sound-help-button" onClick={() => setSoundHelp('manual')}>Нет звука?</button>
            {soundHelp && <p className="error" role="status">{soundHelp === 'voice-unavailable'
              ? 'Русский голос недоступен в этом браузере. Проверьте настройки речи устройства.'
              : 'Звук не слышно? Увеличьте громкость мультимедиа, выключите беззвучный режим или «Не беспокоить».'}
            </p>}
          </div>
        </div>

        <div className="lesson-card">
          <span className="lesson-number" aria-hidden="true">{String(selected.alphabetIndex).padStart(2, '0')}</span>
          <span className="eyebrow">СЕЙЧАС</span>
          <h2>{selected.uppercase === 'Ь' ? 'Мягкий знак живёт внутри слова' : `Узнаем букву ${selected.uppercase}`}</h2>
          <p>{selected.note}</p>
          <LetterPositionGame key={selected.uppercase} letter={selected.uppercase} words={words} speak={speak}/>
          <div className="lesson-actions">
            <button className="primary full" onClick={() => showView('write')}>Попробовать рукой <ChevronRight size={20}/></button>
            <button className="text-button" onClick={() => speak(selected.uppercase === 'Ь' ? 'У мягкого знака нет своего звука' : selectedWord)}><Volume2 size={17}/> Послушать выбранное слово</button>
          </div>
        </div>
      </div>
    </section>}

    {view === 'write' && <section className="page-shell write-view">
      <button className="back-link" onClick={() => showView('card')}>← К букве {selected.uppercase}</button>
      <WritingPad letter={selected.uppercase}/>
    </section>}

    <footer className="site-footer">
      <span>Нашли ошибку или есть идея?</span>
      <a href="https://github.com/koryashkin/russian-alphabet/issues" target="_blank" rel="noreferrer"><GitBranch size={17}/> Напишите в GitHub</a>
    </footer>
  </main>
}

export default App
