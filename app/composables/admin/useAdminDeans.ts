// /app/composables/admin/useAdminDeans.ts
import { ref } from 'vue'

export function useAdminDeans() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  async function createDean(payload: { full_name: string; email: string; department_id: string; password?: string }) {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const res: any = await $fetch('/api/admin/create-dean', {
        method: 'POST',
        body: payload,
      })

      if (!res?.success) {
        error.value = res?.message || 'Failed to create dean.'
        return null
      }

      success.value = res.message || 'Dean created successfully.'
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
