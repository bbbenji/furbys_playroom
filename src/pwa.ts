import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

export const offlineReady = ref(false)
export const needRefresh = ref(false)

const updateSW = registerSW({
  onOfflineReady() {
    offlineReady.value = true
  },
  onNeedRefresh() {
    needRefresh.value = true
  },
})

export function reloadApp(): void {
  void updateSW(true)
}

export function dismissPwaToast(): void {
  offlineReady.value = false
  needRefresh.value = false
}
