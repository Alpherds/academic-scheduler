<template>
  <v-container class="pa-6" max-width="720">
    <v-card class="pa-6">
      <h2 class="text-h6 mb-4">Create Dean</h2>

      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="full_name" label="Full Name" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="email" label="Email" type="email" required />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="department_id"
              :items="departments"
              item-title="name"
              item-value="id"
              label="Department"
              required
            />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn color="primary" :loading="loading" type="submit">Create Dean</v-btn>
          </v-col>
        </v-row>
      </v-form>

      <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
      <v-alert v-if="success" type="success" class="mt-4">{{ success }}</v-alert>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminDeans } from '~/composables/admin/useAdminDeans'
import { useSupabase } from '~/composables/useSupabase'

const full_name = ref('')
const email = ref('')
const department_id = ref('')

const { createDean, loading, error, success } = useAdminDeans()
const supabase = useSupabase() // ✅ fixed here

const departments = ref<{ id: string; name: string }[]>([])

async function loadDepartments() {
  const { data } = await supabase.from('departments').select('id, name').order('name')
  departments.value = data ?? []
}

async function handleSubmit() {
  if (!full_name.value || !email.value || !department_id.value) return
  await createDean({
    full_name: full_name.value,
    email: email.value,
    department_id: department_id.value,
  })
  if (success.value) {
    full_name.value = ''
    email.value = ''
    department_id.value = ''
  }
}

onMounted(loadDepartments)
</script>
