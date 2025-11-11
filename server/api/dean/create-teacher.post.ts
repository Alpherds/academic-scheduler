// /server/api/dean/create-teacher.post.ts
import { defineEventHandler, readBody } from 'h3'
import { createSupabaseAdminClient } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const supabaseAdmin = createSupabaseAdminClient()
  const body = await readBody(event)

  try {
    const { full_name, email, password, bio, allowed_subjects = [], dean_id } = body
    if (!dean_id) throw new Error('Dean ID is required.')

    // 🔹 1. Get Dean’s department
    const { data: deanData, error: deanError } = await supabaseAdmin
      .from('users')
      .select('department_id')
      .eq('id', dean_id)
      .maybeSingle()
    if (deanError || !deanData?.department_id)
      throw new Error('Dean has no assigned department.')

    // 🔹 2. Create user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-10),
      email_confirm: true,
      user_metadata: {
        role: 'faculty',
        department_id: deanData.department_id,
        full_name,
      },
    })
    if (authError) throw authError

    const teacherId = authData.user?.id
    if (!teacherId) throw new Error('Auth user creation failed.')

    // 🔹 3. Insert in public.users
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: teacherId,
      full_name,
      email,
      role: 'faculty',
      bio,
      department_id: deanData.department_id,
      email_confirmed_at: new Date().toISOString(),
    })
    if (insertError) throw insertError

    // 🔹 4. Insert allowed subjects
    if (allowed_subjects.length > 0) {
      const insertData = allowed_subjects.map((subj: any) => ({
        faculty_id: teacherId,
        subject_id: typeof subj === 'string' ? subj : subj.id,
      }))
      const { error: subjError } = await supabaseAdmin
        .from('faculty_subjects')
        .insert(insertData)
      if (subjError) throw subjError
    }

    return { success: true, message: 'Teacher created successfully.' }
  } catch (err: any) {
    console.error('[CreateTeacher Error]', err)
    return { success: false, message: err.message }
  }
})
