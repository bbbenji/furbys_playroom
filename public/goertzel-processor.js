// AudioWorklet processor: classifies each analysis window as the strongest of
// the 5 ComAir tones (or silence) using the Goertzel algorithm, and posts the
// result to the main thread. Plain JS (not TS) because AudioWorkletGlobalScope
// isn't part of the app's DOM lib and this file is loaded standalone via
// audioWorklet.addModule(), not bundled by Vite.

const FREQUENCIES = { X: 17500, '0': 16386, '1': 16943, '3': 18057, '2': 18614 }
// 512 samples (~11.6ms at 44.1kHz / ~10.7ms at 48kHz) fits snugly inside the
// 16-20ms symbol duration without straddling symbol boundaries, while preserving
// ~86Hz frequency resolution (far finer than the 557Hz ComAir tone spacing).
const WINDOW_SIZE = 512

function computeCoeffs(sr) {
  const coeffs = {}
  for (const symbol in FREQUENCIES) {
    const freq = FREQUENCIES[symbol]
    const k = Math.round((WINDOW_SIZE * freq) / sr)
    const omega = (2 * Math.PI * k) / WINDOW_SIZE
    const cosine = Math.cos(omega)
    coeffs[symbol] = {
      coeff: 2 * cosine,
      cosine,
      sinOmega: Math.sin(omega),
    }
  }
  return coeffs
}

function goertzelMagnitude(samples, config) {
  const n = samples.length
  const { coeff, cosine, sinOmega } = config
  let q0 = 0
  let q1 = 0
  let q2 = 0
  for (let i = 0; i < n; i++) {
    q0 = coeff * q1 - q2 + samples[i]
    q2 = q1
    q1 = q0
  }
  const real = q1 - q2 * cosine
  const imag = q2 * sinOmega
  return Math.sqrt(real * real + imag * imag) / n
}

class GoertzelProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(WINDOW_SIZE)
    this.index = 0
    this.lastSampleRate = sampleRate
    this.coeffs = computeCoeffs(sampleRate)
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true

    if (sampleRate !== this.lastSampleRate) {
      this.lastSampleRate = sampleRate
      this.coeffs = computeCoeffs(sampleRate)
    }

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
    for (const symbol in this.coeffs) {
      const mag = goertzelMagnitude(this.buffer, this.coeffs[symbol])
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
