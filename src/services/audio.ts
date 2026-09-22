export type SoundIssue = 'unavailable' | 'voice-unavailable' | 'audio-output'

/** Temporary word/explanation speech only. Never used as isolated phoneme audio. */
class PrototypeAudio {
  private utterance?: SpeechSynthesisUtterance
  private voicesReady = false
  constructor() {
    if (typeof window !== 'undefined' && typeof window.speechSynthesis?.getVoices === 'function') {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener('voiceschanged', () => { this.voicesReady = true })
    }
  }
  stop() { if (typeof window !== 'undefined' && typeof window.speechSynthesis?.cancel === 'function') window.speechSynthesis.cancel(); this.utterance = undefined }
  speak(text: string, onIssue: (issue: SoundIssue) => void) {
    this.stop()
    if (typeof window === 'undefined' || typeof window.speechSynthesis?.speak !== 'function') { onIssue('unavailable'); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ru-RU'; utterance.rate = 0.8
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang.toLowerCase().startsWith('ru'))
    if (voice) utterance.voice = voice
    if (!voice && this.voicesReady) { onIssue('voice-unavailable'); return }
    utterance.onerror = event => {
      if (event.error === 'interrupted' || event.error === 'canceled') return
      onIssue(event.error === 'audio-busy' || event.error === 'audio-hardware' ? 'audio-output' : 'unavailable')
    }
    this.utterance = utterance
    window.speechSynthesis.speak(this.utterance)
  }
}
export const audio = new PrototypeAudio()
