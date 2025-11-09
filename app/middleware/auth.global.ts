// /app/middleware/auth.global.ts
import { useAuthComposable } from '@/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, userRole, init } = useAuthComposable()
  await init()

  // If no user and not on login page -> redirect to login
  if (!currentUser.value && to.path !== '/login') return navigateTo('/login')

  // If on login and already logged in, redirect by role
  if (to.path === '/login' && currentUser.value) {
    if (userRole.value === 'admin') return navigateTo('/admin/dashboard')
    if (userRole.value === 'dean') return navigateTo('/dean/dashboard')
    if (userRole.value === 'faculty') return navigateTo('/faculty/schedules')
  }

  // protect role-specific routes
  if (to.path.startsWith('/admin') && userRole.value !== 'admin') return navigateTo('/login')
  if (to.path.startsWith('/dean') && userRole.value !== 'dean') return navigateTo('/login')
  if (to.path.startsWith('/faculty') && userRole.value !== 'faculty') return navigateTo('/login')
})
