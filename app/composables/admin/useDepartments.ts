// /composables/admin/useDepartments.ts
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

export function useDepartments() {
  const supabase = useSupabase()

  const departments = ref<any[]>([])
  const form = ref({ id: '', name: '', description: '' })
  const loading = ref(false)
  const success = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function fetchDepartments() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('departments')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) error.value = err.message
    else departments.value = data ?? []
    loading.value = false
  }

  async function saveDepartment(isEdit: boolean) {
    success.value = error.value = null
    loading.value = true
    try {
      const payload = { name: form.value.name, description: form.value.description }
      let res
      if (isEdit) {
        res = await supabase.from('departments').update(payload).eq('id', form.value.id)
      } else {
        res = await supabase.from('departments').insert(payload)
      }
      if (res.error) throw res.error
      success.value = isEdit ? 'Department updated!' : 'Department added!'
      await fetchDepartments()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function deleteDepartment(id: string) {
    success.value = error.value = null
    const { error: err } = await supabase.from('departments').delete().eq('id', id)
    if (err) error.value = err.message
    else success.value = 'Department deleted!'
    await fetchDepartments()
  }

  function editDepartment(item: any) {
    form.value = { ...item }
  }

  function resetForm() {
    form.value = { id: '', name: '', description: '' }
  }

  return { departments, form, loading, success, error, fetchDepartments, saveDepartment, deleteDepartment, editDepartment, resetForm }
}
