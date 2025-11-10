// /app/composables/dean/useTeachers.ts
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

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
  subjects?: Subject[]
  subject_ids?: string[]
}

export function useTeachers() {
  const supabase = useSupabase()
  const teachers = ref<Teacher[]>([])
  const subjects = ref<Subject[]>([])
  const loading = ref(false)
  const success = ref<string | null>(null)
  const error = ref<string | null>(null)

  const form = ref<Teacher>({
    full_name: '',
    email: '',
    bio: '',
    subject_ids: [],
  })

  // ✅ Fetch all teachers
  async function fetchTeachers() {
    try {
      loading.value = true
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id, full_name, email, bio, role')
        .eq('role', 'faculty')
        .order('full_name', { ascending: true })

      if (userErr) throw userErr

      const { data: fsData, error: fsErr } = await supabase
        .from('faculty_subjects')
        .select('faculty_id, subject_id, subjects(id, code, name)')

      if (fsErr) throw fsErr

      const map: Record<string, Teacher> = {}
      userData.forEach((t) => {
        map[t.id] = {
          id: t.id,
          full_name: t.full_name,
          email: t.email,
          bio: t.bio || '',
          subjects: [],
        }
      })

      fsData.forEach((fs) => {
        const teacher = map[fs.faculty_id]
        if (!teacher) return
        const subs = Array.isArray(fs.subjects) ? fs.subjects : [fs.subjects]
        subs.filter(Boolean).forEach((sub) => {
          teacher.subjects?.push({
            id: sub.id,
            code: sub.code,
            name: sub.name,
          })
        })
      })

      teachers.value = Object.values(map)
    } catch (e: any) {
      console.error('[fetchTeachers error]', e.message)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ✅ Fetch all subjects
  async function fetchSubjects() {
    try {
      const { data, error: subErr } = await supabase
        .from('subjects')
        .select('id, code, name')
        .order('code', { ascending: true })
      if (subErr) throw subErr
      subjects.value = data ?? []
    } catch (e: any) {
      console.error('[fetchSubjects error]', e.message)
      error.value = e.message
    }
  }

  // ✅ Insert or update teacher
  async function saveTeacher(isEdit: boolean) {
    try {
      loading.value = true
      error.value = null
      success.value = null

      // -- UPDATE EXISTING --
      if (isEdit && form.value.id) {
        const { error: upErr } = await supabase
          .from('users')
          .update({
            full_name: form.value.full_name,
            email: form.value.email,
            bio: form.value.bio,
          })
          .eq('id', form.value.id)

        if (upErr) throw upErr

        await updateFacultySubjects(form.value.id, [...(form.value.subject_ids ?? [])])
        success.value = 'Teacher updated successfully!'
      } 
      
      // -- CREATE NEW --
      else {
        const { data: newUser, error: insErr } = await supabase
          .from('users')
          .insert([
            {
              full_name: form.value.full_name,
              email: form.value.email,
              bio: form.value.bio,
              role: 'faculty',
            },
          ])
          .select('id')
          .single()

        if (insErr) throw insErr

        const facultyId = newUser?.id
        if (!facultyId) throw new Error('No faculty ID returned.')

        // ✅ Delay to ensure Supabase propagation (prevents FK constraint timing)
        await new Promise((resolve) => setTimeout(resolve, 200))

        // ✅ Save allowed subjects (if any)
        if (form.value.subject_ids && form.value.subject_ids.length > 0) {
          await updateFacultySubjects(facultyId, [...form.value.subject_ids])
        }

        success.value = 'Teacher added successfully!'
      }

      // ✅ Refetch and reset form after insert/update
      await fetchTeachers()
      resetForm()
    } catch (e: any) {
      console.error('[saveTeacher error]', e.message)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ✅ Manage subject assignments
  async function updateFacultySubjects(facultyId: string, subjectIds: string[]) {
    try {
      await supabase.from('faculty_subjects').delete().eq('faculty_id', facultyId)

      if (subjectIds.length > 0) {
        const rows = subjectIds.map((sid) => ({
          faculty_id: facultyId,
          subject_id: sid,
        }))
        const { error: insertErr } = await supabase.from('faculty_subjects').insert(rows)
        if (insertErr) throw insertErr
      }
    } catch (e: any) {
      console.error('[updateFacultySubjects error]', e.message)
    }
  }

  // ✅ Delete teacher
  async function deleteTeacher(id: string) {
    try {
      loading.value = true
      await supabase.from('faculty_subjects').delete().eq('faculty_id', id)
      const { error: delErr } = await supabase.from('users').delete().eq('id', id)
      if (delErr) throw delErr

      success.value = 'Teacher deleted successfully!'
      await fetchTeachers()
    } catch (e: any) {
      console.error('[deleteTeacher error]', e.message)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ✅ Edit form helper
  function editTeacher(item: Teacher) {
    form.value = {
      id: item.id,
      full_name: item.full_name,
      email: item.email,
      bio: item.bio ?? '',
      subject_ids: item.subjects?.map((s) => s.id) ?? [],
    }
  }

  // ✅ Reset form
  function resetForm() {
    form.value = { full_name: '', email: '', bio: '', subject_ids: [] }
  }

  // ✅ Initialize
  async function init() {
    await fetchSubjects()
    await fetchTeachers()
  }

  return {
    teachers,
    subjects,
    form,
    loading,
    success,
    error,
    init,
    saveTeacher,
    deleteTeacher,
    editTeacher,
    resetForm,
  }
}
