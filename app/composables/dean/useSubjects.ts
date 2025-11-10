import { ref, reactive, nextTick } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthComposable } from '~/composables/useAuth'

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface Subject {
  id?: string
  code: string
  name: string
  units: number
  department_id?: string
}

export function useSubjects() {
  const supabase = useSupabase()
  const { currentUser } = useAuthComposable()

  const subjects = ref<Subject[]>([])
  const form = reactive<Subject>({
    code: '',
    name: '',
    units: 3,
  })

  const loading = ref(false)
  const success = ref<string | null>(null)
  const error = ref<string | null>(null)

  /* -----------------------------
   FETCH SUBJECTS
  ----------------------------- */
  async function fetchSubjects() {
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
      if (!deptId) throw new Error('No department linked.')

      const { data, error: err } = await supabase
        .from('subjects')
        .select('*')
        .eq('department_id', deptId)
        .order('code', { ascending: true })
      if (err) throw err

      subjects.value = data ?? []
    } catch (e: any) {
      console.error('[fetchSubjects error]', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   SAVE SUBJECT (ADD / UPDATE)
  ----------------------------- */
  async function saveSubject(editMode: boolean) {
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
        const { error: err } = await supabase
          .from('subjects')
          .update({ ...form, department_id })
          .eq('id', form.id)
        if (err) throw err

        success.value = 'Subject updated successfully!'
        const i = subjects.value.findIndex((s) => s.id === form.id)
        if (i !== -1) subjects.value[i] = { ...form, department_id, id: form.id }
      } else {
        const newId = uuidv4()
        const newSubject = { ...form, id: newId, department_id }
        const { error: err } = await supabase.from('subjects').insert([newSubject])
        if (err) throw err

        success.value = 'Subject added successfully!'
        subjects.value.push(newSubject)
        subjects.value.sort((a, b) => a.code.localeCompare(b.code))
      }

      resetForm()
      await nextTick()
    } catch (e: any) {
      console.error('[saveSubject error]', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   DELETE SUBJECT
  ----------------------------- */
  async function deleteSubject(id?: string) {
    if (!id) return
    const { error: err } = await supabase.from('subjects').delete().eq('id', id)
    if (err) {
      error.value = err.message
    } else {
      success.value = 'Subject deleted successfully!'
      subjects.value = subjects.value.filter((s) => s.id !== id)
    }
  }

  /* -----------------------------
   EDIT / RESET
  ----------------------------- */
  function editSubject(s: Subject) {
    Object.assign(form, s)
  }

  function resetForm() {
    Object.assign(form, { id: undefined, code: '', name: '', units: 3 })
  }

  return {
    subjects,
    form,
    loading,
    success,
    error,
    fetchSubjects,
    saveSubject,
    deleteSubject,
    editSubject,
    resetForm,
  }
}

