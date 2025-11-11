// /app/composables/dean/useTeachers.ts
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

export function useTeachers() {
  const supabase = useSupabase()
  const teachers = ref<any[]>([])
  const subjects = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const form = ref({
    id: '',
    full_name: '',
    email: '',
    bio: '',
    password: '',
    allowed_subjects: [] as any[],
  })

  async function fetchSubjects() {
    const { data } = await supabase.from('subjects').select('id, name, code').order('code')
    subjects.value = data || []
  }

  async function fetchTeachers() {
    loading.value = true
    const { data, error: err } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        bio,
        department_id,
        role,
        faculty_subjects (
          subject_id,
          subjects ( id, code, name )
        )
      `)
      .eq('role', 'faculty')
      .order('full_name')
    loading.value = false

    if (err) {
      error.value = err.message
      return
    }

    teachers.value =
      data?.map((t: any) => ({
        ...t,
        allowed_subjects:
          t.faculty_subjects?.map((fs: any) => ({
            id: fs.subjects?.id,
            name: fs.subjects?.name,
            code: fs.subjects?.code,
          })) ?? [],
      })) ?? []
  }

  async function saveTeacher(isEdit: boolean, deanId: string) {
    loading.value = true
    error.value = null
    success.value = null

    try {
      const payload = {
        id: form.value.id,
        full_name: form.value.full_name,
        email: form.value.email,
        bio: form.value.bio,
        password: form.value.password,
        allowed_subjects: form.value.allowed_subjects,
        dean_id: deanId,
      }

      const endpoint = isEdit ? '/api/dean/update-teacher' : '/api/dean/create-teacher'
      const method = isEdit ? 'PUT' : 'POST'

      const res: any = await $fetch(endpoint, { method, body: payload })
      if (!res.success) throw new Error(res.message)

      success.value = res.message
      await fetchTeachers()
      resetForm()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function deleteTeacher(id: string) {
    const res: any = await $fetch(`/api/dean/delete-teacher?id=${id}`, { method: 'DELETE' })
    if (!res.success) error.value = res.message
    else {
      success.value = res.message
      teachers.value = teachers.value.filter((t) => t.id !== id)
    }
  }

  function editTeacher(item: any) {
    form.value = {
      id: item.id,
      full_name: item.full_name,
      email: item.email,
      bio: item.bio ?? '',
      password: '',
      allowed_subjects: item.allowed_subjects || [],
    }
  }

  function resetForm() {
    form.value = {
      id: '',
      full_name: '',
      email: '',
      bio: '',
      password: '',
      allowed_subjects: [],
    }
  }

  return {
    teachers,
    subjects,
    form,
    loading,
    error,
    success,
    fetchTeachers,
    fetchSubjects,
    saveTeacher,
    deleteTeacher,
    editTeacher,
    resetForm,
  }
}
