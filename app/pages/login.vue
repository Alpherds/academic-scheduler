<template>
  <v-app>
    <v-container
      fluid
      class="d-flex align-center justify-center fill-height"
      style="background: #f9fafb;"
    >
      <v-card class="pa-6" max-width="420" elevation="3" rounded="lg">
        <!-- Logo + Title -->
        <div class="text-center mb-6">
          <v-img
            src="/logo.png"
            alt="SNC Logo"
            max-width="80"
            class="mx-auto mb-2"
          />
          <h2 class="text-h5 font-weight-bold text-primary">
            SNC Academic Scheduler
          </h2>
          <p class="text-subtitle-2 mt-1 text-grey-darken-1">
            Sign in to manage your schedules
          </p>
        </div>

        <!-- Login Form -->
        <v-form ref="formRef" @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-email"
            required
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            required
          />

          <v-btn
            block
            color="primary"
            class="mt-4"
            size="large"
            :loading="loading"
            type="submit"
          >
            Login
          </v-btn>
        </v-form>

        <!-- Error Message -->
        <v-alert
          v-if="errorMessage"
          type="error"
          class="mt-4"
          variant="tonal"
          border="start"
          color="error"
          title="Login Failed"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Footer -->
        <div class="text-center mt-6 text-caption text-grey-darken-1">
          © {{ new Date().getFullYear() }} St. Nicolas College of Business and Technology
        </div>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthComposable } from '@/composables/useAuth'

definePageMeta({ layout: false })

const { signIn, userRole } = useAuthComposable()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const formRef = ref()

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const user = await signIn(email.value, password.value)
    if (!user) throw new Error('Invalid credentials.')

    if (userRole.value === 'admin') navigateTo('/admin/dashboard')
    else if (userRole.value === 'dean') navigateTo('/dean/dashboard')
    else if (userRole.value === 'faculty') navigateTo('/faculty/schedules')
    else throw new Error('Unknown role. Please contact admin.')
  } catch (err: any) {
    errorMessage.value = err.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border: 1px solid #e5e7eb;
}

.text-primary {
  color: #1E40AF !important; /* SNC Blue */
}

.v-btn {
  text-transform: none;
  font-weight: 600;
}
</style>
