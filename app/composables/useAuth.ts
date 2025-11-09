// /composables/useAuth.ts
import { ref } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { useSupabase } from '@/composables/useSupabase'

const currentUser = ref<User | null>(null)
const userRole = ref<string | null>(null)

export function useAuthComposable() {
  const { supabase } = useSupabase()

  async function init() {
    const { data } = await supabase.auth.getUser()
    currentUser.value = data?.user ?? null
    if (currentUser.value) await fetchUserRole(currentUser.value.id)
    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      currentUser.value = session?.user ?? null
      if (session?.user) fetchUserRole(session.user.id)
      else userRole.value = null
    })
  }

  async function fetchUserRole(userId: string) {
    const { data, error } = await supabase.from('users').select('role').eq('id', userId).single()
    if (!error && data) userRole.value = data.role
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    currentUser.value = data.user ?? null
    if (data.user) await fetchUserRole(data.user.id)
    return data.user
  }

  async function signOut() {
    await supabase.auth.signOut()
    currentUser.value = null
    userRole.value = null
  }

  return { currentUser, userRole, init, signIn, signOut }
}
