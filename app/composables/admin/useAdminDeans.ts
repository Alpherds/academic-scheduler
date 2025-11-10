// /composables/admin/useAdminDeans.ts
import { ref } from 'vue'

export function useAdminDeans() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  async function createDean(payload: { full_name: string; email: string; department_id: string }) {
    loading.value = true
    error.value = null
    success.value = null
    try {
      const res = await $fetch('/api/admin/create-dean', {
        method: 'POST',
        body: payload,
      })
      if ((res as any).error) {
        error.value = (res as any).error
        return null
      }
      success.value = (res as any).success ?? 'Dean created'
      return res
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      return null
    } finally {
      loading.value = false
    }
  }

  return { createDean, loading, error, success }
}
