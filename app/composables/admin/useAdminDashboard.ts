// /app/composables/admin/useAdminDashboard.ts
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

export function useAdminDashboard() {
  const supabase = useSupabase()

  const departmentsCount = ref(0)
  const deansCount = ref(0)
  const teachersCount = ref(0)
  const subjectsCount = ref(0)
  const classesCount = ref(0)
  const schedulesCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboardStats() {
    try {
      loading.value = true
      error.value = null

      const [
        { count: deptCount },
        { count: deanCount },
        { count: teacherCount },
        { count: subjectCount },
        { count: classCount },
        { count: schedCount }
      ] = await Promise.all([
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'dean'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'faculty'),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true })
      ])

      departmentsCount.value = deptCount ?? 0
      deansCount.value = deanCount ?? 0
      teachersCount.value = teacherCount ?? 0
      subjectsCount.value = subjectCount ?? 0
      classesCount.value = classCount ?? 0
      schedulesCount.value = schedCount ?? 0
    } catch (e: any) {
      console.error('[Admin Dashboard Error]', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    departmentsCount,
    deansCount,
    teachersCount,
    subjectsCount,
    classesCount,
    schedulesCount,
    loading,
    error,
    fetchDashboardStats
  }
}
