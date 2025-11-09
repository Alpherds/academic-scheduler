// /composables/useSupabase.ts
import type { SupabaseClient } from '@supabase/supabase-js'
export function useSupabase() {
  const nuxt = useNuxtApp()
  const supabase = nuxt.$supabase as SupabaseClient
  return { supabase }
}
