// /composables/dean/useDeanDashboard.ts
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

interface StatItem { title: string; value: number; icon: string }
interface AuditLog { id: string; action: string; created_at: string }

export function useDeanDashboard() {
  const { supabase } = useSupabase()
  const stats = ref<StatItem[]>([
    { title: 'Faculty', value: 0, icon: 'mdi-account-tie' },
    { title: 'Subjects', value: 0, icon: 'mdi-book-open' },
    { title: 'Classes', value: 0, icon: 'mdi-account-group' },
    { title: 'Schedules', value: 0, icon: 'mdi-calendar' },
  ])
  const logs = ref<AuditLog[]>([])

  async function loadStats() {
    try {
      const results = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'faculty'),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true }),
      ])
      stats.value[0]!.value = results[0]?.count ?? 0
      stats.value[1]!.value = results[1]?.count ?? 0
      stats.value[2]!.value = results[2]?.count ?? 0
      stats.value[3]!.value = results[3]?.count ?? 0
    } catch (e) { console.error(e) }
  }

  async function loadLogs() {
    const { data, error } = await supabase.from('audit_logs').select('id, action, created_at').order('created_at', { ascending: false }).limit(5)
    if (!error && data) logs.value = data
  }

  return { stats, logs, loadStats, loadLogs }
}
