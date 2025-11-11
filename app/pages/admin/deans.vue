<template>
  <v-container fluid class="pa-6">
    <!-- ✅ Snackbar Alert -->
    <transition name="slide-fade">
      <v-alert
        v-if="alert.show"
        :type="alert.type"
        border="start"
        prominent
        class="mb-4"
        style="position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 320px"
      >
        {{ alert.message }}
      </v-alert>
    </transition>

    <!-- Header -->
    <v-row class="align-center justify-space-between mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold">Deans Management</h1>
        <p class="text-body-2 text-medium-emphasis">
          Create and manage dean accounts associated with their departments.
        </p>
      </v-col>

      <v-col cols="12" md="4" class="text-md-end text-center">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog(false)">
          Add Dean
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="deans"
        :loading="loading"
        density="comfortable"
      >
        <template #item.department_id="{ item }">
          <span>{{ mapDepartmentName(item.department_id) }}</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon variant="text" color="primary" @click="openDialog(true, item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="error" @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dean Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Dean' : 'Add Dean' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.full_name"
              label="Full Name"
              required
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              required
              :disabled="editMode"
              variant="outlined"
              density="comfortable"
            />
            <v-select
              v-model="form.department_id"
              :items="departments"
              item-title="name"
              item-value="id"
              label="Department"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-if="!editMode"
              v-model="form.password"
              label="Password (optional - leave blank to auto-generate)"
              type="password"
              variant="outlined"
              density="comfortable"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="handleSave">
            {{ editMode ? 'Save' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ confirmDialog.item?.full_name }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteDean">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAdminDeans } from '~/composables/admin/useAdminDeans'

const supabase = useSupabase()
const { createDean, loading } = useAdminDeans()

// ─── Data ─────────────────────────────────────────────
const deans = ref<any[]>([])
const departments = ref<any[]>([])
const dialog = ref(false)
const editMode = ref(false)

// ─── Typed Alert ──────────────────────────────────────
type AlertType = 'success' | 'error' | 'info' | 'warning'

const alert = ref<{
  show: boolean
  type: AlertType
  message: string
}>({
  show: false,
  type: 'success',
  message: '',
})

function showAlert(message: string, type: AlertType = 'success') {
  alert.value = { show: true, type, message }
  setTimeout(() => (alert.value.show = false), 3000)
}

// ─── Form ─────────────────────────────────────────────
const form = ref({
  id: '',
  full_name: '',
  email: '',
  password: '',
  department_id: '',
})

const confirmDialog = ref({
  show: false,
  item: null as any,
})

// ─── Table Headers ────────────────────────────────────
const headers = [
  { title: 'Full Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Department', key: 'department_id' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// ─── Methods ───────────────────────────────────────────
async function fetchDeans() {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, department_id, created_at')
    .eq('role', 'dean')
    .order('created_at', { ascending: false })

  if (error) showAlert(error.message, 'error')
  else deans.value = data || []
}

async function fetchDepartments() {
  const { data, error } = await supabase.from('departments').select('id, name')
  if (!error) departments.value = data || []
}

function mapDepartmentName(id: string) {
  const dept = departments.value.find((d) => d.id === id)
  return dept ? dept.name : '-'
}

function openDialog(isEdit = false, item?: any) {
  editMode.value = isEdit
  if (isEdit && item) {
    form.value = { ...item, password: '' }
  } else {
    form.value = { id: '', full_name: '', email: '', password: '', department_id: '' }
  }
  dialog.value = true
}

async function handleSave() {
  if (!form.value.full_name || !form.value.email || !form.value.department_id) {
    showAlert('All fields are required.', 'error')
    return
  }

  try {
    if (editMode.value && form.value.id) {
      // 🔧 Update existing dean
      const res: any = await $fetch('/api/admin/update-dean', {
        method: 'PUT',
        body: {
          id: form.value.id,
          full_name: form.value.full_name,
          department_id: form.value.department_id,
        },
      })

      if (res?.success) {
        showAlert('Dean updated successfully.', 'success')
        dialog.value = false
        await fetchDeans()
      } else {
        showAlert(res?.message || 'Failed to update dean.', 'error')
      }
      return
    }

    // 🆕 Create new dean (existing logic)
    const payload = {
      full_name: form.value.full_name,
      email: form.value.email,
      department_id: form.value.department_id,
      password: form.value.password || '',
    }

    const res: any = await createDean(payload)

    if (res?.success) {
      showAlert(res.message || 'Dean created successfully.', 'success')
      dialog.value = false
      await fetchDeans()
    } else {
      showAlert(res?.message || 'Failed to create dean.', 'error')
    }
  } catch (e: any) {
    showAlert(e.message || 'An error occurred.', 'error')
  }
}



async function deleteDean() {
  if (!confirmDialog.value.item?.id) return
  const { error } = await supabase.from('users').delete().eq('id', confirmDialog.value.item.id)
  if (error) showAlert(error.message, 'error')
  else {
    showAlert('Dean deleted successfully.', 'success')
    await fetchDeans()
  }
  confirmDialog.value.show = false
}

function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-10)
}

onMounted(async () => {
  await fetchDepartments()
  await fetchDeans()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
</style>
