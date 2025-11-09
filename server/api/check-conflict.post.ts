// server/api/check-conflict.post.ts
import { defineEventHandler, readBody } from 'h3'
import type { IncomingMessage } from 'http'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    faculty_id?: string
    room_id?: string
    day: string
    start_time: string
    end_time: string
    department_id?: string
    schedule_id?: string | null
  }

  // Basic validation
  if (!body.day || !body.start_time || !body.end_time) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Query schedules that overlap
  let query = supabase
    .from('schedules')
    .select('*')
    .eq('day', body.day)

  if (body.department_id) {
    query = query.eq('department_id', body.department_id)
  }

  if (body.schedule_id) {
    query = query.not('id', 'eq', body.schedule_id)
  }

  const { data, error } = await query

  if (error) {
    throw createError({ statusCode: 500, statusMessage: String(error.message) })
  }

  const overlapping: any[] = []

  const startA = body.start_time
  const endA = body.end_time

  for (const s of data || []) {
    // check overlap: startA < s.end_time && s.start_time < endA
    if (startA < s.end_time && s.start_time < endA) {
      if (body.faculty_id && s.faculty_id === body.faculty_id) {
        overlapping.push({ type: 'faculty', schedule: s })
      } else if (body.room_id && s.room_id === body.room_id) {
        overlapping.push({ type: 'room', schedule: s })
      }
    }
  }

  return { conflicts: overlapping }
})
