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
          <v-img src="/logo.png" alt="SNC Logo" max-width="200" class="mx-auto mb-2" />
          <h2 class="text-h5 font-weight-bold text-primary">SNC Academic Scheduler</h2>
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

const { signIn, userRole, loading, error } = useAuthComposable()
const email = ref('')
const password = ref('')
const formRef = ref()
const errorMessage = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  errorMessage.value = ''
  const user = await signIn(email.value, password.value)

  if (!user) {
    errorMessage.value = error.value ?? 'Invalid credentials.'
    return
  }

  if (userRole.value === 'admin') navigateTo('/admin/dashboard')
  else if (userRole.value === 'dean') navigateTo('/dean/dashboard')
  else if (userRole.value === 'faculty') navigateTo('/faculty/schedules')
  else errorMessage.value = 'Unknown role. Please contact administrator.'
}
</script>

<style scoped>
.v-card {
  border: 1px solid #e5e7eb;
}
.text-primary {
  color: #1E40AF !important;
}
.v-btn {
  text-transform: none;
  font-weight: 600;
}
</style>
