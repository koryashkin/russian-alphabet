import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Eraser, Undo2, Play } from 'lucide-react'
import { normalizePoint, strokeOrderMarkers, tracePaths } from './geometry'
import type { Stroke } from './geometry'

export function WritingPad({ letter }: { letter: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const active = useRef<number | null>(null)
  const [copy, setCopy] = useState(false)
  const [demo, setDemo] = useState(0)
  const [count, setCount] = useState(0)
  const [limit, setLimit] = useState(false)
  const redraw = () => {
    const el = canvas.current; if (!el) return
    const rect = el.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1
    el.width = rect.width * dpr; el.height = rect.height * dpr
    const ctx = el.getContext('2d'); if (!ctx) return
    ctx.scale(el.width / 100, el.height / 100); ctx.strokeStyle = '#285f4c'; ctx.fillStyle = '#285f4c'; ctx.lineWidth = 2.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    for (const stroke of strokes.current) {
      if (!stroke.length) continue
      ctx.beginPath(); ctx.moveTo(stroke[0].x, stroke[0].y)
      if (stroke.length === 1) { ctx.arc(stroke[0].x, stroke[0].y, 1.15, 0, Math.PI * 2); ctx.fill() }
      else { for (const p of stroke.slice(1)) ctx.lineTo(p.x, p.y); ctx.stroke() }
    }
  }
  useEffect(() => {
    const el = canvas.current; if (!el) return
    const observer = new ResizeObserver(redraw); observer.observe(el)
    return () => observer.disconnect()
  }, [])
  function finish(event: PointerEvent<HTMLCanvasElement>) {
    if (active.current !== event.pointerId) return
    active.current = null; setCount(strokes.current.length)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return <section className="writing-section">
    <div className="section-heading"><div><span className="eyebrow">ПОПРОБУЕМ РУКОЙ</span><h2>У каждой буквы свой путь</h2></div><div className="segmented"><button aria-pressed={!copy} onClick={() => setCopy(false)}>Обведи</button><button aria-pressed={copy} onClick={() => setCopy(true)}>Напиши рядом</button></div></div>
    <div className="writing-layout">
      <div className="writing-board">
        {copy && <span className="copy-model" aria-label={`Образец ${letter}`}>{letter}</span>}
        {!copy && <svg key={demo} className={`trace-reference ${demo ? 'demonstrating' : ''}`} viewBox="0 0 100 100" aria-label={`Образец написания ${letter}`}>
          {tracePaths[letter]?.map((path, i) => <path className="trace-guide" key={`guide-${i}`} d={path} pathLength="1" />)}
          {strokeOrderMarkers(tracePaths[letter] ?? []).map((marker, i) => <g className="stroke-order" key={`order-${i}`}>
            <line className="stroke-marker-leader" x1={marker.start.x} y1={marker.start.y} x2={marker.x} y2={marker.y}/>
            <circle cx={marker.x} cy={marker.y} r="3.2"/><text x={marker.x} y={marker.y + 1.35}>{i + 1}</text>
          </g>)}
          {demo > 0 && tracePaths[letter]?.map((path, i) => <path className="demo-stroke" key={`demo-${i}`} d={path} pathLength="1" style={{ animationDelay: `${i * 0.9}s` }} />)}
        </svg>}
        <canvas ref={canvas} aria-label="Поле для рисования" onPointerDown={e => {
          if (active.current !== null || e.button !== 0) return
          if (strokes.current.length >= 150) { setLimit(true); return }
          active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId)
          strokes.current.push([normalizePoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())]); setCount(strokes.current.length); redraw()
        }} onPointerMove={e => {
          if (active.current !== e.pointerId) return
          const current = strokes.current.at(-1)!
          if (current.length < 3000) current.push(normalizePoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()))
          redraw()
        }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} />
        <span className="board-caption">{copy ? 'Можно по-своему' : 'Начни с дорожки — и не спеши'}</span>
      </div>
      <div className="writing-tools">
        <button onClick={() => { setCopy(false); setDemo(d => d + 1) }}><Play size={21}/>{demo ? 'Показать ещё раз' : 'Показать по шагам'}</button>
        <button disabled={!count} onClick={() => { strokes.current.pop(); setCount(strokes.current.length); setLimit(false); redraw() }}><Undo2 size={21}/>Отменить</button>
        <button disabled={!count} onClick={() => { strokes.current = []; setCount(0); setLimit(false); redraw() }}><Eraser size={21}/>Новый лист</button>
      </div>
    </div>
    {limit && <p role="status">Лист заполнен. Можно отменить штрих или начать новый лист.</p>}
    {demo > 0 && !copy && <p className="demo-message" role="status">Смотри на оранжевую линию: штрихи появляются по порядку от цифры 1.</p>}
    <p className="quiet">Здесь можно пробовать. Красиво и правильно с первого раза — не обязательно.</p>
  </section>
}
