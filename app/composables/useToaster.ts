import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'info'

const last = ref<{ show: boolean; message: string; type: ToastType }>({
  show: false,
  message: '',
  type: 'info',
})

export function useToaster() {
  function toast(message: string, type: ToastType = 'info') {
    last.value = { show: true, message, type }
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  return { toast, last }
}
