import { onMounted, onUnmounted } from "vue"

export function useEvent(target, event, cb) {
  onMounted(() => target.addEventListener(event, cb))
  onUnmounted(() => target.removeEventListener(event, cb))
}