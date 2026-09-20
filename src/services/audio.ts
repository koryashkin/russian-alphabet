/** Temporary word/explanation speech only. Never used as isolated phoneme audio. */
class PrototypeAudio {
  private utterance?: SpeechSynthesisUtterance
  stop() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); this.utterance = undefined }
  speak(text: string, onError: () => void) {
    this.stop()
    if (!('speechSynthesis' in window)) { onError(); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ru-RU'; utterance.rate = 0.8
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('ru'))
    if (voice) utterance.voice = voice
    utterance.onerror = event => { if (event.error !== 'interrupted' && event.error !== 'canceled') onError() }
    this.utterance = utterance
    window.speechSynthesis.speak(this.utterance)
  }
}
export const audio = new PrototypeAudio()
