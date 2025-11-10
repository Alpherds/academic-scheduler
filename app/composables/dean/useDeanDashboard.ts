// /app/composables/dean/useDeanDashboard.ts
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export function useDeanDashboard() {
  const supabase = useSupabase() // ✅ FIXED: no destructuring

  const facultyCount = ref<number>(0)
  const classCount = ref<number>(0)
  const subjectCount = ref<number>(0)
  const scheduleCount = ref<number>(0)
  const schedules = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboardData() {
    try {
      loading.value = true
      error.value = null

      // ✅ Count data efficiently
      const [faculty, classes, subjects, scheds] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase
          .from('schedules')
          .select(`
            id, day, start_time, end_time,
            subjects(name),
            classes(name, section),
            rooms(name),
            users(full_name)
          `)
      ])

      // ✅ Assign values safely
      facultyCount.value = faculty.count ?? 0
      classCount.value = classes.count ?? 0
      subjectCount.value = subjects.count ?? 0
      scheduleCount.value = scheds.data?.length ?? 0
      schedules.value = scheds.data ?? []
    } catch (e: any) {
      console.error('[DeanDashboard Error]', e.message)
      error.value = 'Failed to load dashboard data.'
    } finally {
      loading.value = false
    }
  }

  return {
    facultyCount,
    classCount,
    subjectCount,
    scheduleCount,
    schedules,
    loading,
    error,
    fetchDashboardData
  }
}
