<template>
  <v-container class="pa-6" style="min-height: 80vh;">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card class="pa-6">
          <h2 class="text-h6">Set Your Password</h2>
          <p class="text-body-2 mb-4">Enter a new password for your account.</p>

          <v-text-field v-model="password" label="New password" type="password" />
          <v-text-field v-model="confirmPassword" label="Confirm password" type="password" />

          <v-btn color="primary" class="mt-4" :loading="loading" @click="updatePassword">Set password</v-btn>

          <v-alert v-if="message" :type="alertType" class="mt-4">{{ message }}</v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const alertType = ref<'success' | 'error'>('success')
const loading = ref(false)

const supabase = useSupabase() // ✅ fixed

async function updatePassword() {
  if (!password.value || password.value !== confirmPassword.value) {
    alertType.value = 'error'
    message.value = 'Passwords must match'
    return
  }
  loading.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false

  if (error) {
    alertType.value = 'error'
    message.value = error.message
  } else {
    alertType.value = 'success'
    message.value = 'Password updated successfully. You can now log in.'
  }
}
</script>
