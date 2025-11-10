// /composables/useAuth.ts
import { ref } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { useSupabase } from '~/composables/useSupabase'

const currentUser = ref<User | null>(null)
const userRole = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuthComposable() {
  const supabase = useSupabase() // ✅ correct now

  async function init() {
    try {
      const { data } = await supabase.auth.getUser()
      currentUser.value = data.user ?? null
      if (currentUser.value) await fetchUserRole(currentUser.value.id)

      supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        currentUser.value = session?.user ?? null
        if (session?.user) fetchUserRole(session.user.id)
        else userRole.value = null
      })
    } catch (e: any) {
      console.error('[Auth Init Error]', e?.message ?? e)
    }
  }

  async function fetchUserRole(userId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle()
      if (fetchError) throw fetchError
      userRole.value = data?.role ?? null
    } catch (err: any) {
      console.error('[fetchUserRole]', err.message)
      userRole.value = null
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      error.value = loginError.message
      loading.value = false
      return null
    }
    currentUser.value = data.user ?? null
    if (data.user) await fetchUserRole(data.user.id)
    loading.value = false
    return data.user
  }

  async function signOut() {
    await supabase.auth.signOut()
    currentUser.value = null
    userRole.value = null
  }

  return { currentUser, userRole, loading, error, init, signIn, signOut }
}
