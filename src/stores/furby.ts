import { defineStore } from 'pinia'
import { describeCommand, isPersonalityResponse } from '../comair/commands'
import { ComAirReceiver, friendlyReceiverError } from '../comair/receiver'
import { ComAirTransmitter } from '../comair/transmitter'

export interface LogEntry {
  id: number
  direction: 'tx' | 'rx'
  command: number
  label: string
  at: number
}

export interface PersonalitySighting {
  id: number
  label: string
  at: number
}

const LOG_STORAGE_KEY = 'furby-console:log:v1'
const LOG_LIMIT = 200
const PERSONALITY_STORAGE_KEY = 'furby-console:personality:v1'
const PERSONALITY_LIMIT = 50

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

function persistJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable (e.g. private browsing) — just won't survive a reload.
  }
}

const initialLog = loadJson<LogEntry[]>(LOG_STORAGE_KEY, [])
let nextLogId = initialLog.reduce((max, entry) => Math.max(max, entry.id), 0) + 1

const initialPersonalityHistory = loadJson<PersonalitySighting[]>(PERSONALITY_STORAGE_KEY, [])

const transmitter = new ComAirTransmitter()
let receiver: ComAirReceiver | null = null

export const useFurbyStore = defineStore('furby', {
  state: () => ({
    keepAliveActive: false,
    micActive: false,
    micError: null as string | null,
    sendError: null as string | null,
    log: initialLog as LogEntry[],
    personalityHistory: initialPersonalityHistory as PersonalitySighting[],
    sending: null as number | null,
  }),

  getters: {
    currentPersonality(state): PersonalitySighting | null {
      return state.personalityHistory[0] ?? null
    },
  },

  actions: {
    _log(direction: 'tx' | 'rx', command: number) {
      const label = describeCommand(command)?.label ?? `#${command}`
      this.log.unshift({ id: nextLogId++, direction, command, label, at: Date.now() })
      if (this.log.length > LOG_LIMIT) this.log.length = LOG_LIMIT
      persistJson(LOG_STORAGE_KEY, this.log)

      if (direction === 'rx' && isPersonalityResponse(command)) {
        this._recordPersonality(command, label)
      }
    },

    _recordPersonality(id: number, label: string) {
      // Skip consecutive repeats (e.g. re-confirmed on every keep-alive handshake) —
      // only log actual sightings/transitions.
      if (this.personalityHistory[0]?.id === id) return
      this.personalityHistory.unshift({ id, label, at: Date.now() })
      if (this.personalityHistory.length > PERSONALITY_LIMIT) this.personalityHistory.length = PERSONALITY_LIMIT
      persistJson(PERSONALITY_STORAGE_KEY, this.personalityHistory)
    },

    clearLog() {
      this.log = []
      persistJson(LOG_STORAGE_KEY, this.log)
    },

    clearPersonalityHistory() {
      this.personalityHistory = []
      persistJson(PERSONALITY_STORAGE_KEY, this.personalityHistory)
    },

    /** Call synchronously on the very first tap anywhere in the app (iOS/Safari autoplay gate). */
    unlockAudio() {
      transmitter.unlock()
    },

    async send(command: number) {
      this.sending = command
      this.sendError = null
      try {
        await transmitter.send(command)
        this._log('tx', command)
      } catch (err) {
        this.sendError = err instanceof Error ? err.message : String(err)
      } finally {
        this.sending = null
      }
    },

    async toggleKeepAlive() {
      if (transmitter.keepAliveActive) {
        transmitter.stopKeepAlive()
        this.keepAliveActive = false
        return
      }

      this.sendError = null
      try {
        await transmitter.startKeepAlive()
        this._log('tx', 820)
        this.keepAliveActive = true
      } catch (err) {
        this.sendError = err instanceof Error ? err.message : String(err)
      }
    },

    async toggleMic() {
      if (this.micActive) {
        receiver?.stop()
        receiver = null
        this.micActive = false
        return
      }

      this.micError = null
      try {
        receiver = new ComAirReceiver()
        receiver.onCommand(({ command }) => this._log('rx', command))
        await receiver.start()
        this.micActive = true
      } catch (err) {
        this.micError = friendlyReceiverError(err)
        receiver = null
        this.micActive = false
      }
    },
  },
})
