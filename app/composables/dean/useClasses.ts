// /app/composables/dean/useClasses.ts
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

type TeacherInput = { id: string; full_name?: string } | string

interface Teacher {
  id: string
  full_name: string
}

interface Department {
  id: string
  name: string
}

interface ClassRecord {
  id?: string
  name: string
  section: string
  department_id?: string | null
  teachers?: Teacher[]
  department_name?: string
}

export function useClasses() {
  const supabase = useSupabase()
  const classes = ref<ClassRecord[]>([])
  const teachers = ref<Teacher[]>([])
  const departments = ref<Department[]>([])
  const form = ref<ClassRecord>({
    name: '',
    section: '',
    department_id: null,
    teachers: [],
  })

  const loading = ref(false)
  const success = ref<string | null>(null)
  const error = ref<string | null>(null)

  /* ------------------ FETCHERS ------------------ */

  async function fetchTeachers() {
    try {
      const { data, error: err } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'faculty')
        .order('full_name', { ascending: true })

      if (err) throw err
      teachers.value = (data ?? []) as Teacher[]
    } catch (err: any) {
      console.error('[fetchTeachers]', err.message ?? err)
    }
  }

  async function fetchDepartments() {
    try {
      const { data, error: err } = await supabase
        .from('departments')
        .select('id, name')
        .order('name', { ascending: true })

      if (err) throw err
      departments.value = (data ?? []) as Department[]
    } catch (err: any) {
      console.error('[fetchDepartments]', err.message ?? err)
    }
  }

  async function fetchClasses() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          section,
          department_id,
          departments(name),
          class_teachers(
            teacher_id,
            users(id, full_name)
          )
        `)
        .order('name', { ascending: true })

      if (err) throw err

      classes.value =
        (data ?? []).map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          section: cls.section,
          department_id: cls.department_id,
          department_name: cls.departments?.name ?? '',
          teachers:
            cls.class_teachers?.map((ct: any) => ({
              id: ct.users?.id,
              full_name: ct.users?.full_name,
            })).filter((t: any) => t.id) ?? [],
        })) as ClassRecord[]
    } catch (err: any) {
      console.error('[fetchClasses]', err.message ?? err)
      error.value = err.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  /* --------- SAVE / UPDATE CLASS (with teachers) --------- */

  async function saveClass(isEdit: boolean) {
    try {
      loading.value = true
      success.value = null
      error.value = null

      let classId: string | undefined

      if (isEdit && form.value.id) {
        const { error: updateError } = await supabase
          .from('classes')
          .update({
            name: form.value.name,
            section: form.value.section,
            department_id: form.value.department_id || null,
          })
          .eq('id', form.value.id)

        if (updateError) throw updateError
        classId = form.value.id
        success.value = 'Class updated successfully!'
      } else {
        const { data, error: insertError } = await supabase
          .from('classes')
          .insert([
            {
              name: form.value.name,
              section: form.value.section,
              department_id: form.value.department_id || null,
            },
          ])
          .select('id')
          .single()

        if (insertError) throw insertError
        classId = data.id
        success.value = 'Class created successfully!'
      }

      // Update class_teachers safely
      if (classId) {
        await updateClassTeachers(classId, form.value.teachers ?? [])
      }

      // Refresh list so UI shows assigned teachers immediately
      await fetchClasses()
      resetForm()
    } catch (err: any) {
      console.error('[saveClass error]', err)
      error.value = err.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates the class_teachers for a given classId.
   * Accepts teacher array of either {id, full_name} or string ids.
   * Filters invalid/empty values so teacher_id is never null.
   */
  async function updateClassTeachers(classId: string, selectedTeachers: TeacherInput[]) {
    if (!classId) return

    try {
      // 1) delete existing assignments
      const { error: delErr } = await supabase.from('class_teachers').delete().eq('class_id', classId)
      if (delErr) {
        // don't throw immediately — log and continue, but surface the error
        console.warn('[updateClassTeachers] delete error', delErr)
      }

      // 2) normalize selectedTeachers -> array of ids, filter invalid/null/empty
      const teacherIds = (selectedTeachers ?? [])
        .map((t) => (typeof t === 'string' ? t : (t as any).id))
        .filter((id) => typeof id === 'string' && id.length > 0)

      if (teacherIds.length === 0) {
        // nothing to insert
        return
      }

      // build insert payload
      const payload = teacherIds.map((teacher_id) => ({ class_id: classId, teacher_id }))

      // 3) bulk insert
      const { error: insertErr } = await supabase.from('class_teachers').insert(payload)
      if (insertErr) throw insertErr
    } catch (err: any) {
      console.error('[updateClassTeachers error]', err.message ?? err)
      // bubble up or set error ref if you want UI to show it
      error.value = err.message ?? String(err)
      throw err
    }
  }

  /* ---------------- DELETE ---------------- */

  async function deleteClass(id: string | undefined) {
    if (!id) return
    try {
      // remove class_teacher relations first
      const { error: delCT } = await supabase.from('class_teachers').delete().eq('class_id', id)
      if (delCT) console.warn('[deleteClass] delete class_teachers error', delCT)

      const { error: delClass } = await supabase.from('classes').delete().eq('id', id)
      if (delClass) throw delClass

      // update reactive array
      classes.value = classes.value.filter((c) => c.id !== id)
      success.value = 'Class deleted successfully!'
    } catch (err: any) {
      console.error('[deleteClass error]', err)
      error.value = err.message ?? String(err)
    }
  }

  /* ---------------- HELPERS ---------------- */

  function editClass(item: any) {
    form.value = {
      id: item.id,
      name: item.name,
      section: item.section,
      department_id: item.department_id,
      teachers: item.teachers ?? [],
    }
  }

  function resetForm() {
    form.value = {
      name: '',
      section: '',
      department_id: null,
      teachers: [],
    }
  }

  /* ---------------- INITIAL LOAD ---------------- */

  // expose fetchers so parent page can call onMounted in the page
  return {
    classes,
    teachers,
    departments,
    form,
    loading,
    success,
    error,
    fetchClasses,
    fetchTeachers,
    fetchDepartments,
    saveClass,
    deleteClass,
    editClass,
    resetForm,
    updateClassTeachers,
  }
}
