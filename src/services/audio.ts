/** Temporary word/explanation speech only. Never used as isolated phoneme audio. */
class PrototypeAudio {
  private utterance?: SpeechSynthesisUtterance
  private voicesReady = false
  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener('voiceschanged', () => { this.voicesReady = true })
    }
  }
  stop() { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); this.utterance = undefined }
  speak(text: string, onError: () => void) {
    this.stop()
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onError(); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ru-RU'; utterance.rate = 0.8
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang.toLowerCase().startsWith('ru'))
    if (voice) utterance.voice = voice
    if (!voice && this.voicesReady) { onError(); return }
    utterance.onerror = event => { if (event.error !== 'interrupted' && event.error !== 'canceled') onError() }
    this.utterance = utterance
    window.speechSynthesis.speak(this.utterance)
  }
}
export const audio = new PrototypeAudio()
