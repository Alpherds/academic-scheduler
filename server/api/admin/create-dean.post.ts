// /server/api/admin/create-dean.post.ts
import { defineEventHandler, readBody } from 'h3'
import { createSupabaseAdminClient } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = createSupabaseAdminClient()

  try {
    // 1️⃣ If password provided → create verified dean directly
    if (body.password && body.password.trim() !== '') {
      const { data, error } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          role: 'dean',
          department_id: body.department_id,
          full_name: body.full_name,
        },
      })

      if (error) throw new Error(error.message)

      // Also insert dean record into your custom `users` table
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user?.id,
        full_name: body.full_name,
        email: body.email,
        role: 'dean',
        department_id: body.department_id,
        email_confirmed_at: new Date().toISOString(),
      })

      if (insertError) throw new Error(insertError.message)

      console.log(`✅ Dean created manually: ${body.email}`)
      return { success: true, message: 'Dean account created successfully.' }
    }

    // 2️⃣ If password NOT provided → send invite via email
    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      email_confirm: false,
      user_metadata: {
        role: 'dean',
        department_id: body.department_id,
        full_name: body.full_name,
      },
    })

    if (error) throw new Error(error.message)

    // 3️⃣ Insert dean into your `users` table
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user?.id,
      full_name: body.full_name,
      email: body.email,
      role: 'dean',
      department_id: body.department_id,
    })

    if (insertError) throw new Error(insertError.message)

    // 4️⃣ Send password setup email (recovery link)
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: body.email,
      options: {
        redirectTo: 'http://localhost:3000/reset-password', // ✅ your password reset page
      },
    })

    if (inviteError) {
      console.warn('⚠️ Invite email failed to send:', inviteError.message)
      return { success: true, message: 'Dean created, but email failed to send.' }
    }

    console.log('📧 Invite sent to:', body.email)
    console.log('🔗 Manual recovery link:', inviteData.properties?.action_link)

    return { success: true, message: 'Dean created and invite email sent.' }
  } catch (err: any) {
    console.error('[AdminCreateDean Error]', err.message)
    return { success: false, message: err.message || 'Unexpected error occurred.' }
  }
})
