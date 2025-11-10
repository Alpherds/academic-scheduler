<template>
  <v-container fluid class="pa-6">
    <!-- ✅ Top Alert -->
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
        <h1 class="text-h4 font-weight-bold">Departments Management</h1>
        <p class="text-body-2 text-medium-emphasis">
          Manage departments and their information.
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-md-end text-center">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog(false)">
          Add Department
        </v-btn>
      </v-col>
    </v-row>

    <!-- Departments Table -->
    <v-card class="elevation-2">
      <v-data-table
        :headers="headers"
        :items="departments"
        :loading="loading"
        density="comfortable"
      >
        <template #item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            color="primary"
            @click="openDialog(true, item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            color="error"
            @click="confirmDelete(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Department' : 'Add Department' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.name"
              label="Department Name"
              variant="outlined"
              density="comfortable"
              required
            />
            <v-textarea
              v-model="form.description"
              label="Description (optional)"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveDepartment">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ confirmDialog.item?.name }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteDepartment">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

/* ────────────────
  🔹 Types
──────────────── */
type AlertType = 'success' | 'error' | 'info' | 'warning'

interface Department {
  id: string
  name: string
  description?: string
  created_at?: string
}

/* ────────────────
  🔹 State
──────────────── */
const supabase = useSupabase()

const departments = ref<Department[]>([])
const loading = ref(false)
const dialog = ref(false)
const editMode = ref(false)

const form = ref<Department>({
  id: '',
  name: '',
  description: '',
})

const confirmDialog = ref({
  show: false,
  item: null as Department | null,
})

const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

/* ────────────────
  🔹 DataTable Headers
──────────────── */
const headers = [
  { title: 'Department Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

/* ────────────────
  🔹 Fetch Departments
──────────────── */
async function fetchDepartments() {
  loading.value = true
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) showAlert(error.message, 'error')
  else departments.value = data || []

  loading.value = false
}

/* ────────────────
  🔹 Save Department (Create / Update)
──────────────── */
async function saveDepartment() {
  if (!form.value.name.trim()) {
    showAlert('Department name is required.', 'error')
    return
  }

  const payload = {
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
  }

  try {
    if (editMode.value && form.value.id) {
      const { error } = await supabase
        .from('departments')
        .update(payload)
        .eq('id', form.value.id)
      if (error) throw error
      showAlert('Department updated successfully.', 'success')
    } else {
      const { error } = await supabase.from('departments').insert(payload)
      if (error) throw error
      showAlert('Department added successfully.', 'success')
    }
    dialog.value = false
    await fetchDepartments()
  } catch (err: any) {
    showAlert(err.message, 'error')
  }
}

/* ────────────────
  🔹 Delete Department
──────────────── */
async function deleteDepartment() {
  if (!confirmDialog.value.item?.id) return

  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', confirmDialog.value.item.id)

    if (error) throw error

    confirmDialog.value.show = false
    showAlert('Department deleted successfully.', 'success')
    await fetchDepartments()
  } catch (err: any) {
    showAlert(err.message, 'error')
  }
}

/* ────────────────
  🔹 Dialog Helpers
──────────────── */
function openDialog(isEdit: boolean, item?: Department) {
  editMode.value = isEdit
  if (isEdit && item) {
    form.value = { ...item }
  } else {
    form.value = { id: '', name: '', description: '' }
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

function confirmDelete(item: Department) {
  confirmDialog.value = { show: true, item }
}

/* ────────────────
  🔹 Alert Utility
──────────────── */
function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }
  setTimeout(() => (alert.value.show = false), 3000)
}

/* ────────────────
  🔹 Init
──────────────── */
onMounted(fetchDepartments)
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  transition: all 0.25s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
</style>
