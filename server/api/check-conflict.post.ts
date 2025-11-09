// /server/api/check-conflict.post.ts
import { readBody } from 'h3'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body) throw createError({ statusCode:400, statusMessage: 'Missing body' })
  const { faculty_id, room_id, day, start_time, end_time, department_id, schedule_id } = body as any
  const supabase = createClient(url, key)
  let q = supabase.from('schedules').select('*').eq('day', day)
  if (department_id) q = q.eq('department_id', department_id)
  if (schedule_id) q = q.not('id', 'eq', schedule_id)
  const { data, error } = await q
  if (error) throw createError({ statusCode:500, statusMessage: error.message })
  const conflicts = []
  for (const s of data || []) {
    if (start_time < s.end_time && s.start_time < end_time) {
      if (faculty_id && s.faculty_id === faculty_id) conflicts.push({ type:'faculty', schedule: s })
      if (room_id && s.room_id === room_id) conflicts.push({ type:'room', schedule: s })
    }
  }
  return { conflicts }
})
