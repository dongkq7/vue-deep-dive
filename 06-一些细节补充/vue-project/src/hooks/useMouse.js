import { ref } from 'vue'
import { useEvent } from './useEvent'
export function useMouse() {

  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  useEvent(window, 'mousemove', update)
  
  return {x, y}
}