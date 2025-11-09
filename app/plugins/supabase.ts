// /plugins/supabase.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  // Cast through `unknown` to safely assert type
  const config = useRuntimeConfig() as unknown as {
    public: { supabaseUrl: string; supabaseAnonKey: string }
  }

  const url = String(config.public.supabaseUrl || '')
  const key = String(config.public.supabaseAnonKey || '')

  const supabase: SupabaseClient = createClient(url, key)

  return {
    provide: { supabase },
  }
})
