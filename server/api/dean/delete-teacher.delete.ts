// /server/api/dean/delete-teacher.delete.ts
import { defineEventHandler, getQuery } from 'h3'
import { createSupabaseAdminClient } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const supabaseAdmin = createSupabaseAdminClient()
  const query = getQuery(event)
  const teacherId = query.id as string

  if (!teacherId) return { success: false, message: 'Missing teacher ID.' }

  try {
    // 🔹 Delete related tables (cascade)
    await supabaseAdmin.from('faculty_subjects').delete().eq('faculty_id', teacherId)
    await supabaseAdmin.from('class_teachers').delete().eq('teacher_id', teacherId)
    await supabaseAdmin.from('classes').delete().eq('teacher_id', teacherId)

    // 🔹 Delete from public.users
    await supabaseAdmin.from('users').delete().eq('id', teacherId)

    // 🔹 Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(teacherId)
    if (authError) throw authError

    return { success: true, message: 'Teacher deleted successfully.' }
  } catch (err: any) {
    console.error('[DeleteTeacher Error]', err.message)
    return { success: false, message: err.message }
  }
})
