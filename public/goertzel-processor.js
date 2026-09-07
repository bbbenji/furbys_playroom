// AudioWorklet processor: classifies each analysis window as the strongest of
// the 5 ComAir tones (or silence) using the Goertzel algorithm, and posts the
// result to the main thread. Plain JS (not TS) because AudioWorkletGlobalScope
// isn't part of the app's DOM lib and this file is loaded standalone via
// audioWorklet.addModule(), not bundled by Vite.

const FREQUENCIES = { X: 17500, '0': 16386, '1': 16943, '3': 18057, '2': 18614 }
const WINDOW_SIZE = 1024

function goertzelMagnitude(samples, freq, sr) {
  const n = samples.length
  const k = Math.round((n * freq) / sr)
  const omega = (2 * Math.PI * k) / n
  const cosine = Math.cos(omega)
  const coeff = 2 * cosine
  let q0 = 0
  let q1 = 0
  let q2 = 0
  for (let i = 0; i < n; i++) {
    q0 = coeff * q1 - q2 + samples[i]
    q2 = q1
    q1 = q0
  }
  const real = q1 - q2 * cosine
  const imag = q2 * Math.sin(omega)
  return Math.sqrt(real * real + imag * imag) / n
}

class GoertzelProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(WINDOW_SIZE)
    this.index = 0
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true

    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.index++] = channel[i]
      if (this.index >= WINDOW_SIZE) {
        this.analyzeWindow()
        this.index = 0
      }
    }
    return true
  }

  analyzeWindow() {
    let best = null
    let bestMag = 0
    const magnitudes = {}
    for (const symbol in FREQUENCIES) {
      const mag = goertzelMagnitude(this.buffer, FREQUENCIES[symbol], sampleRate)
      magnitudes[symbol] = mag
      if (mag > bestMag) {
        bestMag = mag
        best = symbol
      }
    }
    this.port.postMessage({ symbol: best, magnitude: bestMag, magnitudes })
  }
}

registerProcessor('goertzel-processor', GoertzelProcessor)
