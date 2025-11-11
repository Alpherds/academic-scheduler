// /app/middleware/auth.global.ts
import { useAuthComposable } from '@/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, userRole, init } = useAuthComposable()
  await init()

  // ✅ Allow password reset page even if user auto-logged in
  if (to.path.startsWith('/reset-password')) return

  // ✅ If not logged in, redirect to login
  if (!currentUser.value && to.path !== '/login') return navigateTo('/login')

  // ✅ If on login but already logged in → route by role
  if (to.path === '/login' && currentUser.value) {
    if (userRole.value === 'admin') return navigateTo('/admin/dashboard')
    if (userRole.value === 'dean') return navigateTo('/dean/dashboard')
    if (userRole.value === 'faculty') return navigateTo('/faculty/schedules')
  }

  // ✅ Protect role-based routes
  if (to.path.startsWith('/admin') && userRole.value !== 'admin') return navigateTo('/login')
  if (to.path.startsWith('/dean') && userRole.value !== 'dean') return navigateTo('/login')
  if (to.path.startsWith('/faculty') && userRole.value !== 'faculty') return navigateTo('/login')
})
