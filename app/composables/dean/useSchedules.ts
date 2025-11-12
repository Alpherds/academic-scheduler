import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

export function useSchedules() {
  const supabase = useSupabase()
  const periods = ref<any[]>([])
  const schedules = ref<any[]>([])
  const classes = ref<any[]>([])
  const teachers = ref<any[]>([])
  const subjects = ref<any[]>([])

  async function fetchAll() {
    const [pRes, sRes, cRes, tRes, subRes] = await Promise.all([
      supabase.from('periods').select('*').order('period_number'),
      supabase.from('schedules').select('*'),
      supabase.from('classes').select('*'),
      supabase.from('users').select('id,full_name,department_id').eq('role', 'faculty'),
      supabase.from('subjects').select('*'),
    ])
    periods.value = pRes.data ?? []
    schedules.value = sRes.data ?? []
    classes.value = cRes.data ?? []
    teachers.value = tRes.data ?? []
    subjects.value = subRes.data ?? []
  }

  async function createSchedule(payload: Record<string, any>) {
    const { data, error } = await supabase.from('schedules').insert([payload]).select()
    if (error) return { error: error.message }
    schedules.value.push(data?.[0])
    return { data: data?.[0] }
  }

  async function updateSchedule(id: string, payload: Record<string, any>) {
    const { data, error } = await supabase.from('schedules').update(payload).eq('id', id).select()
    if (error) return { error: error.message }
    const idx = schedules.value.findIndex((s) => s.id === id)
    if (idx !== -1) schedules.value[idx] = data?.[0]
    return { data: data?.[0] }
  }

  async function deleteSchedule(id: string) {
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) return { error: error.message }
    schedules.value = schedules.value.filter((s) => s.id !== id)
    return {}
  }

  return { periods, schedules, classes, teachers, subjects, fetchAll, createSchedule, updateSchedule, deleteSchedule }
}
