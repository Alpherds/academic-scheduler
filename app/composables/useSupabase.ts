// /composables/useSupabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app'

let supabase: SupabaseClient | null = null

export function useSupabase() {
  const config = useRuntimeConfig()
  if (!supabase) {
    supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )
  }
  return supabase
}
