// /server/api/admin/create-dean.post.ts
import { defineEventHandler, readBody } from 'h3'
import { createSupabaseAdminClient } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = createSupabaseAdminClient()

  // Create dean account securely using the service role
  const { data, error } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    user_metadata: {
      role: 'dean',
      department_id: body.department_id,
      full_name: body.full_name,
    },
  })

  if (error) {
    console.error('[AdminCreateDean] Error:', error.message)
    return { success: false, message: error.message }
  }

  return { success: true, data }
})
