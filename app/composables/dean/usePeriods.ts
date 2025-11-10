import { ref, reactive, watch, nextTick } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthComposable } from '~/composables/useAuth'

// Helper: generate UUID manually (since Supabase doesn’t auto-generate unless default gen_random_uuid())
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface Period {
  id?: string
  period_number: number
  start_time: string
  end_time: string
  duration_minutes: number
  department_id?: string
}

export function usePeriods() {
  const supabase = useSupabase()
  const { currentUser } = useAuthComposable()

  const periods = ref<Period[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const form = reactive<Period>({
    period_number: 1,
    start_time: '07:00',
    end_time: '07:30',
    duration_minutes: 30,
  })

  /* -----------------------------------
   🧮 AUTO-CALCULATE DURATION
  ----------------------------------- */
  watch([() => form.start_time, () => form.end_time], ([start, end]) => {
    if (!start || !end || !start.includes(':') || !end.includes(':')) {
      form.duration_minutes = 0
      return
    }

    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const startMins = (sh ?? 0) * 60 + (sm ?? 0)
    const endMins = (eh ?? 0) * 60 + (em ?? 0)
    const diff = endMins - startMins
    form.duration_minutes = diff > 0 ? diff : 0
  })

  /* -----------------------------------
   📥 FETCH PERIODS
  ----------------------------------- */
  async function fetchPeriods() {
    try {
      loading.value = true
      const userId = currentUser.value?.id
      if (!userId) throw new Error('User not authenticated.')

      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('department_id')
        .eq('id', userId)
        .maybeSingle()
      if (userErr) throw userErr

      const deptId = userRow?.department_id
      if (!deptId) throw new Error('No department linked to this user.')

      const { data, error: err } = await supabase
        .from('periods')
        .select('*')
        .eq('department_id', deptId)
        .order('period_number', { ascending: true })

      if (err) throw err
      periods.value = data ?? []
    } catch (e: any) {
      error.value = e.message
      console.error('[fetchPeriods error]', e)
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------------
   💾 SAVE PERIOD (INSERT / UPDATE)
  ----------------------------------- */
  async function savePeriod(editMode: boolean) {
    try {
      loading.value = true
      error.value = null
      success.value = null

      const userId = currentUser.value?.id
      if (!userId) throw new Error('User not authenticated.')

      const { data: userRow } = await supabase
        .from('users')
        .select('department_id')
        .eq('id', userId)
        .maybeSingle()
      const department_id = userRow?.department_id
      if (!department_id) throw new Error('No department linked.')

      if (editMode && form.id) {
        // ✅ UPDATE existing
        const { error: err } = await supabase
          .from('periods')
          .update({ ...form, department_id })
          .eq('id', form.id)
        if (err) throw err

        success.value = 'Period updated successfully!'
        const index = periods.value.findIndex((p) => p.id === form.id)
        if (index !== -1)
          periods.value[index] = { ...form, department_id, id: form.id }
      } else {
        // ✅ INSERT new
        const newId = uuidv4()
        const newPeriod = { ...form, id: newId, department_id }

        const { error: err } = await supabase.from('periods').insert([newPeriod])
        if (err) throw err

        success.value = 'Period added successfully!'
        // ✅ Push instantly to the reactive list without waiting for refetch
        periods.value.push({ ...newPeriod })

        // ✅ Sort immediately (client-side)
        periods.value.sort((a, b) => a.period_number - b.period_number)
      }

      // ✅ Reset form + reactivity tick ensures new add is ready
      resetForm()
      await nextTick() // ensures reactivity flush
    } catch (e: any) {
      error.value = e.message
      console.error('[savePeriod error]', e)
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------------
   🗑️ DELETE PERIOD
  ----------------------------------- */
  async function deletePeriod(id?: string) {
    if (!id) return
    const { error: err } = await supabase.from('periods').delete().eq('id', id)
    if (err) {
      error.value = err.message
    } else {
      success.value = 'Period deleted successfully!'
      periods.value = periods.value.filter((p) => p.id !== id)
    }
  }

  /* -----------------------------------
   ✏️ EDIT / RESET
  ----------------------------------- */
  function editPeriod(p: Period) {
    Object.assign(form, p)
  }

  function resetForm() {
    Object.assign(form, {
      id: undefined,
      period_number: (periods.value.length ?? 0) + 1, // auto-suggest next period number
      start_time: '07:00',
      end_time: '07:30',
      duration_minutes: 30,
    })
  }

  return {
    periods,
    form,
    loading,
    error,
    success,
    fetchPeriods,
    savePeriod,
    deletePeriod,
    editPeriod,
    resetForm,
  }
}
