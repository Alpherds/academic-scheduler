// /app/composables/dean/useClasses.ts
import { ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useSupabase } from '~/composables/useSupabase'

interface ClassRecord {
  id: string
  name: string
  section: string | null
  department_id?: string | null
  teacher_ids?: string[] | null
}

interface SubjectRecord {
  id: string
  code?: string | null
  name: string
  department_id?: string | null
}

interface UserRecord {
  id: string
  full_name?: string | null
  email?: string | null
  role?: string | null
  department_id?: string | null
}

export function useClasses() {
  // ✅ always non-null using non-null assertion and runtime check
  const supabase = useSupabase() as SupabaseClient
  if (!supabase) throw new Error('Supabase client not initialized.')

  const classes = ref<any[]>([])
  const subjects = ref<SubjectRecord[]>([])
  const teachers = ref<UserRecord[]>([])
  const loading = ref(false)
  const success = ref<string | null>(null)
  const error = ref<string | null>(null)

  const form = ref({
    id: null as string | null,
    name: '',
    section: '',
    teacher_ids: [] as string[],
    subject_ids: [] as string[],
    department_id: null as string | null,
  })

  /** Utility: check if table exists */
  async function tableExists(tableName: string) {
    try {
      const { error: tableError } = await supabase.from(tableName).select('id').limit(1)
      return !tableError
    } catch {
      return false
    }
  }

  /** Fetch subjects + teachers */
  async function fetchSubjectsAndTeachers() {
    loading.value = true
    error.value = null
    try {
      // ✅ Subjects
      const { data: sdata, error: sErr } = await supabase
        .from('subjects')
        .select('id, code, name, department_id')
        .order('name', { ascending: true })
      if (sErr) throw sErr
      subjects.value = sdata ?? []

      // ✅ Teachers
      const { data: tdata, error: tErr } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .order('full_name', { ascending: true })

      if (tErr) throw tErr
      teachers.value = (tdata ?? []).filter(
        (u) => ['teacher', 'faculty', 'faculty_member'].includes(u.role ?? '')
      )
    } catch (err: any) {
      console.error('[fetchSubjectsAndTeachers]', err)
      error.value = err.message || 'Unable to load teachers or subjects.'
    } finally {
      loading.value = false
    }
  }

  /** Fetch classes + joined data */
  async function fetchClasses() {
    loading.value = true
    error.value = null
    try {
      const { data: rawClasses, error: cErr } = await supabase
        .from('classes')
        .select('id, name, section, department_id, teacher_ids')
        .order('name', { ascending: true })
      if (cErr) throw cErr

      const { data: csRows, error: csErr } = await supabase
        .from('class_subjects')
        .select('class_id, subject:subjects(id, code, name)')
      if (csErr) throw csErr

      const hasClassTeachers = await tableExists('class_teachers')
      let classTeachersMap = new Map<string, UserRecord[]>()

      if (hasClassTeachers) {
        const { data: ctRows, error: ctErr } = await supabase
          .from('class_teachers')
          .select('class_id, teacher:users(id, full_name, email, role)')
        if (ctErr) throw ctErr
        ctRows?.forEach((r: any) => {
          const cid = r.class_id
          if (!classTeachersMap.has(cid)) classTeachersMap.set(cid, [])
          classTeachersMap.get(cid)!.push(r.teacher)
        })
      }

      const classSubjectsMap = new Map<string, SubjectRecord[]>()
      csRows?.forEach((r: any) => {
        const cid = r.class_id
        if (!classSubjectsMap.has(cid)) classSubjectsMap.set(cid, [])
        classSubjectsMap.get(cid)!.push(r.subject)
      })

      classes.value =
        rawClasses?.map((c) => ({
          ...c,
          teachers: hasClassTeachers
            ? classTeachersMap.get(c.id) ?? []
            : teachers.value.filter((t) => (c.teacher_ids ?? []).includes(t.id)),
          subjects: classSubjectsMap.get(c.id) ?? [],
        })) ?? []
    } catch (err: any) {
      console.error('[fetchClasses]', err)
      error.value = err.message || 'Unable to load classes.'
    } finally {
      loading.value = false
    }
  }

  /** Reset form */
  function resetForm() {
    form.value = {
      id: null,
      name: '',
      section: '',
      teacher_ids: [],
      subject_ids: [],
      department_id: null,
    }
  }

  /** Edit mode */
  function editClass(payload: any) {
    form.value = {
      id: payload?.id ?? null,
      name: payload?.name ?? '',
      section: payload?.section ?? '',
      teacher_ids: payload?.teachers?.map((t: any) => t.id) ?? payload?.teacher_ids ?? [],
      subject_ids: payload?.subjects?.map((s: any) => s.id) ?? [],
      department_id: payload?.department_id ?? null,
    }
  }

  /** Save (add/update) */
  async function saveClass(edit = false) {
    loading.value = true
    error.value = null
    success.value = null
    try {
      const basePayload = {
        name: form.value.name?.trim(),
        section: form.value.section?.trim() || null,
        department_id: form.value.department_id,
        teacher_ids: form.value.teacher_ids.length ? form.value.teacher_ids : null,
      }

      if (edit && form.value.id) {
        const { error: upErr } = await supabase
          .from('classes')
          .update(basePayload)
          .eq('id', form.value.id)
        if (upErr) throw upErr
        await upsertClassSubjects(form.value.id, form.value.subject_ids)
        const hasCT = await tableExists('class_teachers')
        if (hasCT) await syncClassTeachers(form.value.id, form.value.teacher_ids)
        success.value = 'Class updated successfully.'
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('classes')
          .insert([basePayload])
          .select('id')
          .single()
        if (insErr) throw insErr
        const newId = inserted.id
        await upsertClassSubjects(newId, form.value.subject_ids)
        const hasCT = await tableExists('class_teachers')
        if (hasCT) await syncClassTeachers(newId, form.value.teacher_ids)
        success.value = 'Class created successfully.'
      }

      await fetchClasses()
      resetForm()
    } catch (err: any) {
      console.error('[saveClass]', err)
      error.value = err.message || 'Failed to save class.'
    } finally {
      loading.value = false
    }
  }

  /** Delete class */
  async function deleteClass(id: string) {
    if (!id) return
    loading.value = true
    try {
      await supabase.from('class_subjects').delete().eq('class_id', id)
      const hasCT = await tableExists('class_teachers')
      if (hasCT) await supabase.from('class_teachers').delete().eq('class_id', id)
      const { error: cErr } = await supabase.from('classes').delete().eq('id', id)
      if (cErr) throw cErr
      success.value = 'Class deleted.'
      await fetchClasses()
    } catch (err: any) {
      console.error('[deleteClass]', err)
      error.value = err.message || 'Error deleting class.'
    } finally {
      loading.value = false
    }
  }

  /** Helper: upsert subjects */
  async function upsertClassSubjects(classId: string, subjectIds: string[]) {
    await supabase.from('class_subjects').delete().eq('class_id', classId)
    if (!subjectIds?.length) return
    const rows = subjectIds.map((sid) => ({ class_id: classId, subject_id: sid }))
    const { error: insErr } = await supabase.from('class_subjects').insert(rows)
    if (insErr) throw insErr
  }

  /** Helper: sync teachers join */
  async function syncClassTeachers(classId: string, teacherIds: string[]) {
    const { error: delErr } = await supabase.from('class_teachers').delete().eq('class_id', classId)
    if (delErr) console.warn('[syncClassTeachers delete]', delErr.message)
    if (!teacherIds?.length) return
    const rows = teacherIds.map((tid) => ({ class_id: classId, teacher_id: tid }))
    const { error: insErr } = await supabase.from('class_teachers').insert(rows)
    if (insErr) throw insErr
  }

  /** Initialize on mount */
  async function init() {
    await fetchSubjectsAndTeachers()
    await fetchClasses()
  }

  return {
    classes,
    subjects,
    teachers,
    form,
    loading,
    success,
    error,
    init,
    fetchSubjectsAndTeachers,
    fetchClasses,
    saveClass,
    deleteClass,
    editClass,
    resetForm,
  }
}
