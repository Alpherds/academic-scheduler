// /server/api/dean/update-teacher.put.ts
import { defineEventHandler, readBody } from 'h3'
import { createSupabaseAdminClient } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const supabaseAdmin = createSupabaseAdminClient()
  const body = await readBody(event)

  try {
    const { id, full_name, email, bio, allowed_subjects = [], department_id } = body
    if (!id) throw new Error('Teacher ID is required.')

    // 🔹 1. Update in users
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ full_name, email, bio, department_id })
      .eq('id', id)
    if (updateError) throw updateError

    // 🔹 2. Update email in Auth (if changed)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { email })
    if (authError) throw authError

    // 🔹 3. Update allowed subjects
    const { error: delErr } = await supabaseAdmin
      .from('faculty_subjects')
      .delete()
      .eq('faculty_id', id)
    if (delErr) throw delErr

    if (allowed_subjects.length > 0) {
      const insertData = allowed_subjects.map((s: any) => ({
        faculty_id: id,
        subject_id: typeof s === 'string' ? s : s.id,
      }))
      const { error: insErr } = await supabaseAdmin
        .from('faculty_subjects')
        .insert(insertData)
      if (insErr) throw insErr
    }

    return { success: true, message: 'Teacher updated successfully.' }
  } catch (err: any) {
    console.error('[UpdateTeacher Error]', err)
    return { success: false, message: err.message }
  }
})
