// /app/composables/dean/useTeachers.ts
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

interface Subject {
  id: string
  code: string
  name: string
}

interface Teacher {
  id?: string
  full_name: string
  email: string
  bio?: string
  role?: string
  allowed_subjects: (Subject | string)[]
}

export function useTeachers() {
  const supabase = useSupabase()
  const teachers = ref<Teacher[]>([])
  const subjects = ref<Subject[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const form = ref<Teacher>({
    full_name: '',
    email: '',
    bio: '',
    role: 'faculty',
    allowed_subjects: [],
  })

  /* ========================================
     🔹 FETCH SUBJECTS
  ======================================== */
  async function fetchSubjects() {
    try {
      const { data, error: err } = await supabase
        .from('subjects')
        .select('id, code, name')
        .order('code', { ascending: true })
      if (err) throw err
      subjects.value = data ?? []
    } catch (err: any) {
      error.value = err.message
    }
  }

  /* ========================================
     🔹 FETCH TEACHERS
  ======================================== */
  async function fetchTeachers() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          bio,
          role,
          faculty_subjects (
            subject_id,
            subjects ( id, code, name )
          )
        `)
        .eq('role', 'faculty')
        .order('full_name', { ascending: true })

      if (err) throw err

      teachers.value =
        data?.map((t: any) => ({
          ...t,
          allowed_subjects:
            t.faculty_subjects
              ?.filter((fs: any) => fs?.subjects !== null)
              ?.map((fs: any) => ({
                id: fs.subjects?.id ?? '',
                code: fs.subjects?.code ?? '',
                name: fs.subjects?.name ?? '',
              })) ?? [],
        })) ?? []
    } catch (err: any) {
      console.error('[fetchTeachers error]', err.message)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /* ========================================
     🔹 SAVE OR UPDATE TEACHER
  ======================================== */
  async function saveTeacher(isEdit: boolean) {
    try {
      loading.value = true
      error.value = null
      success.value = null

      if (isEdit && form.value.id) {
        // --- Update teacher info
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: form.value.full_name,
            email: form.value.email,
            bio: form.value.bio,
          })
          .eq('id', form.value.id)
        if (updateError) throw updateError

        // --- Update allowed subjects
        await updateFacultySubjects(form.value.id, form.value.allowed_subjects)
        success.value = 'Teacher updated successfully!'
      } else {
        // --- Create teacher record
        const { data: insertedUsers, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              full_name: form.value.full_name,
              email: form.value.email,
              bio: form.value.bio,
              role: 'faculty',
            },
          ])
          .select()

        if (insertError) throw insertError

        // --- Make sure Supabase returned the new user
        const newUser = insertedUsers?.[0]
        if (!newUser?.id) throw new Error('Failed to retrieve new user ID')

        // --- Insert allowed subjects if any
        if (form.value.allowed_subjects?.length > 0) {
          await updateFacultySubjects(newUser.id, form.value.allowed_subjects)
        }

        // --- Add instantly to local state
        teachers.value.push({
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          bio: newUser.bio,
          role: 'faculty',
          allowed_subjects: form.value.allowed_subjects ?? [],
        })

        success.value = 'Teacher created successfully!'
      }

      await fetchTeachers() // refresh UI
      resetForm()
    } catch (err: any) {
      console.error('[saveTeacher error]', err.message)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /* ========================================
     🔹 UPDATE FACULTY SUBJECTS (FIXED)
  ======================================== */
  async function updateFacultySubjects(
    facultyId: string,
    allowedSubjects: (Subject | string)[]
  ) {
    try {
      // --- Delete old relationships first
      const { error: delErr } = await supabase
        .from('faculty_subjects')
        .delete()
        .eq('faculty_id', facultyId)
      if (delErr) throw delErr

      if (!allowedSubjects?.length) return

      // --- Handle both string IDs and full objects
      const insertData = allowedSubjects.map((s) => ({
        faculty_id: facultyId,
        subject_id: typeof s === 'string' ? s : s.id,
      }))

      console.log('[updateFacultySubjects] inserting:', insertData)

      const { error: insertErr } = await supabase
        .from('faculty_subjects')
        .insert(insertData)
      if (insertErr) throw insertErr

      console.log('[updateFacultySubjects] success for faculty_id:', facultyId)
    } catch (err: any) {
      console.error('[updateFacultySubjects error]', err.message)
      throw err
    }
  }

  /* ========================================
     🔹 DELETE TEACHER
  ======================================== */
  async function deleteTeacher(id: string | undefined) {
    if (!id) return
    try {
      const { error: delErr } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      if (delErr) throw delErr
      teachers.value = teachers.value.filter((t) => t.id !== id)
      success.value = 'Teacher deleted successfully!'
    } catch (err: any) {
      console.error('[deleteTeacher error]', err.message)
      error.value = err.message
    }
  }

  /* ========================================
     🔹 EDIT + RESET
  ======================================== */
  function editTeacher(item: Teacher) {
    form.value = {
      id: item.id,
      full_name: item.full_name,
      email: item.email,
      bio: item.bio ?? '',
      role: 'faculty',
      allowed_subjects: item.allowed_subjects.map((s) =>
        typeof s === 'string'
          ? s
          : {
              id: s.id,
              code: s.code,
              name: s.name,
            }
      ),
    }
  }

  function resetForm() {
    form.value = {
      full_name: '',
      email: '',
      bio: '',
      role: 'faculty',
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
