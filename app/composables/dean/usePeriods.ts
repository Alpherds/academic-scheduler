// // app/composables/dean/usePeriods.ts
// import { ref, reactive, watch } from 'vue'
// import { useSupabase } from '~/composables/useSupabase'
// import { useAuthComposable } from '~/composables/useAuth'

// export interface Period {
//   id?: string
//   period_number: number
//   start_time: string
//   end_time: string
//   duration_minutes: number
//   department_id?: string
// }

// export function usePeriods() {
//   const supabase = useSupabase()
//   const { currentUser } = useAuthComposable()

//   const periods = ref<Period[]>([])
//   const loading = ref(false)
//   const error = ref<string | null>(null)
//   const success = ref<string | null>(null)

//   const form = reactive<Period>({
//     period_number: 1,
//     start_time: '07:00',
//     end_time: '07:30',
//     duration_minutes: 30,
//   })

//   /* ✅ AUTO-CALCULATE DURATION MINUTES SAFELY */
//   watch([() => form.start_time, () => form.end_time], ([start, end]) => {
//     if (start && end && start.includes(':') && end.includes(':')) {
//       const startParts = start.split(':')
//       const endParts = end.split(':')

//       const startHour = Number(startParts[0] ?? 0)
//       const startMinute = Number(startParts[1] ?? 0)
//       const endHour = Number(endParts[0] ?? 0)
//       const endMinute = Number(endParts[1] ?? 0)

//       const startTotal = startHour * 60 + startMinute
//       const endTotal = endHour * 60 + endMinute
//       const diff = endTotal - startTotal

//       if (!isNaN(diff) && diff > 0) {
//         form.duration_minutes = diff
//       }
//     }
//   })

//   /* ✅ FETCH PERIODS */
//   async function fetchPeriods() {
//     try {
//       loading.value = true
//       error.value = null

//       const userId = currentUser.value?.id
//       if (!userId) throw new Error('User not authenticated.')

//       const { data: userRow, error: userErr } = await supabase
//         .from('users')
//         .select('department_id')
//         .eq('id', userId)
//         .maybeSingle()

//       if (userErr) throw userErr
//       const deptId = userRow?.department_id
//       if (!deptId) throw new Error('No department linked to this user.')

//       const { data, error: err } = await supabase
//         .from('periods')
//         .select('*')
//         .eq('department_id', deptId)
//         .order('period_number', { ascending: true })

//       if (err) throw err
//       periods.value = data ?? []
//     } catch (e: any) {
//       error.value = e.message
//       console.error('[fetchPeriods error]', e)
//     } finally {
//       loading.value = false
//     }
//   }

//   /* ✅ SAVE (INSERT / UPDATE) */
//   async function savePeriod(editMode: boolean) {
//     try {
//       loading.value = true
//       error.value = null
//       success.value = null

//       const userId = currentUser.value?.id
//       if (!userId) throw new Error('User not authenticated.')

//       const { data: userRow, error: userErr } = await supabase
//         .from('users')
//         .select('department_id')
//         .eq('id', userId)
//         .maybeSingle()

//       if (userErr) throw userErr
//       const department_id = userRow?.department_id
//       if (!department_id) throw new Error('No department linked to your account.')

//       if (editMode && form.id) {
//         const { error: err } = await supabase
//           .from('periods')
//           .update({ ...form, department_id })
//           .eq('id', form.id)
//         if (err) throw err
//         success.value = '✅ Period updated successfully!'
//       } else {
//         const { error: err } = await supabase
//           .from('periods')
//           .insert([{ ...form, department_id }])
//         if (err) throw err
//         success.value = '✅ Period added successfully!'
//       }

//       await fetchPeriods()
//       resetForm()
//     } catch (e: any) {
//       error.value = e.message
//       console.error('[savePeriod error]', e)
//     } finally {
//       loading.value = false
//     }
//   }

//   /* ✅ DELETE */
//   async function deletePeriod(id?: string) {
//     if (!id) return
//     if (!confirm('Are you sure you want to delete this period?')) return

//     const { error: err } = await supabase.from('periods').delete().eq('id', id)
//     if (err) {
//       error.value = err.message
//     } else {
//       success.value = '🗑️ Period deleted successfully!'
//     }

//     await fetchPeriods()
//   }

//   /* ✅ EDIT (Prefill Form) */
//   function editPeriod(p: Period) {
//     Object.assign(form, p)
//   }

//   /* ✅ RESET FORM */
//   function resetForm() {
//     Object.assign(form, {
//       id: undefined,
//       period_number: 1,
//       start_time: '07:00',
//       end_time: '07:30',
//       duration_minutes: 30,
//     })
//   }

//   return {
//     periods,
//     form,
//     loading,
//     error,
//     success,
//     fetchPeriods,
//     savePeriod,
//     deletePeriod,
//     editPeriod,
//     resetForm,
//   }
// }


// app/composables/dean/usePeriods.ts
import { ref, reactive, watch } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthComposable } from '~/composables/useAuth'

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

  // ✅ Auto calculate duration safely
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

  // ✅ Fetch periods (no reload needed)
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

  // ✅ Save (insert/update)
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

      let newPeriod: Period | null = null

      if (editMode && form.id) {
        const { data, error: err } = await supabase
          .from('periods')
          .update({ ...form, department_id })
          .eq('id', form.id)
          .select()
        if (err) throw err
        newPeriod = data?.[0] ?? null
        success.value = '✅ Period updated successfully!'
        const index = periods.value.findIndex((p) => p.id === form.id)
        if (index !== -1 && newPeriod) periods.value[index] = newPeriod
      } else {
        const { data, error: err } = await supabase
          .from('periods')
          .insert([{ ...form, department_id }])
          .select()
        if (err) throw err
        newPeriod = data?.[0] ?? null
        success.value = '✅ Period added successfully!'
        if (newPeriod) periods.value.push(newPeriod)
      }

      resetForm()
    } catch (e: any) {
      error.value = e.message
      console.error('[savePeriod error]', e)
    } finally {
      loading.value = false
    }
  }

  // ✅ Delete (reactive)
  async function deletePeriod(id?: string) {
    if (!id) return
    const { error: err } = await supabase.from('periods').delete().eq('id', id)
    if (err) {
      error.value = err.message
    } else {
      periods.value = periods.value.filter((p) => p.id !== id)
      success.value = '🗑️ Period deleted successfully!'
    }
  }

  // ✅ Edit
  function editPeriod(p: Period) {
    Object.assign(form, p)
  }

  // ✅ Reset
  function resetForm() {
    Object.assign(form, {
      id: undefined,
      period_number: 1,
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
