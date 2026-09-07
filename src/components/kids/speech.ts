/** Read-aloud helper for pre-readers, using the browser's built-in speech synthesis. */
export function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.15
  window.speechSynthesis.speak(utterance)
}
