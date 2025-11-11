// /server/api/admin/update-dean.put.ts
import { defineEventHandler, readBody } from 'h3'
import { createSupabaseAdminClient } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseAdminClient()
  const body = await readBody(event)

  try {
    if (!body.id) throw new Error('Dean ID required.')

    const { error } = await supabase
      .from('users')
      .update({
        full_name: body.full_name,
        department_id: body.department_id,
      })
      .eq('id', body.id)

    if (error) throw error

    return { success: true, message: 'Dean updated successfully.' }
  } catch (err: any) {
    console.error('[UpdateDean Error]', err.message)
    return { success: false, message: err.message || 'Update failed.' }
  }
})
