import { useFurbyStore } from '../../stores/furby'

/** Best-effort tactile feedback for taps. No-ops silently where unsupported (e.g. iOS Safari, desktop) or disabled. */
export function vibrate(pattern: number | number[] = 15): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  if (!useFurbyStore().hapticsEnabled) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // ignore
  }
}
