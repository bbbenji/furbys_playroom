import { KEEP_ALIVE_COMMAND, KEEP_ALIVE_INTERVAL_MS } from './commands'
import { ComAirPlayer } from './player'

/**
 * High-level send API: queues commands through a single ComAirPlayer and
 * manages the keep-alive daemon Furby expects while in "listening mode".
 */
export class ComAirTransmitter {
  private player = new ComAirPlayer()
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null
  private startingKeepAlive: Promise<void> | null = null
  private sentHandlers: Array<(command: number) => void> = []

  onSent(handler: (command: number) => void): void {
    this.sentHandlers.push(handler)
  }

  /** Call synchronously from the first user tap to satisfy iOS/Safari's autoplay gate. */
  unlock(): void {
    this.player.unlock()
  }

  async send(command: number): Promise<void> {
    await this.player.send(command)
    this.sentHandlers.forEach((h) => h(command))
  }

  get keepAliveActive(): boolean {
    return this.keepAliveTimer !== null
  }

  async startKeepAlive(): Promise<void> {
    if (this.keepAliveTimer) return
    if (this.startingKeepAlive) return this.startingKeepAlive
    this.startingKeepAlive = (async () => {
      try {
        await this.send(KEEP_ALIVE_COMMAND)
        if (!this.keepAliveTimer) {
          this.keepAliveTimer = setInterval(() => {
            void this.send(KEEP_ALIVE_COMMAND)
          }, KEEP_ALIVE_INTERVAL_MS)
        }
      } finally {
        this.startingKeepAlive = null
      }
    })()
    return this.startingKeepAlive
  }

  stopKeepAlive(): void {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
    this.keepAliveTimer = null
    this.startingKeepAlive = null
  }
}
