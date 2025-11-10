// /app/composables/useSupabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function useSupabase(): SupabaseClient {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.SUPABASE_URL
  const supabaseAnonKey = config.public.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
      supabaseUrl,
      supabaseAnonKey,
    })
    throw new Error('Supabase URL or anon key is missing. Check .env and nuxt.config.ts')
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }

  return client
}

export function createSupabaseAdminClient(): SupabaseClient {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.SUPABASE_URL
  const serviceKey = config.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase admin credentials.')
    throw new Error('Missing Supabase admin credentials in runtime config.')
  }

  return createClient(supabaseUrl, serviceKey)
}
