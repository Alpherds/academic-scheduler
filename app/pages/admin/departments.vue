<template>
  <v-container fluid class="pa-6">
    <!-- ✅ Modern Top Alert -->
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

    <!-- HEADER -->
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold">Department Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage your institution’s departments.
        </p>
      </v-col>

      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Department
        </v-btn>
      </v-col>
    </v-row>

    <!-- TABLE -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="departments"
        :loading="loading"
        class="elevation-1"
        density="comfortable"
      >
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

    <!-- ADD / EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Department' : 'Add Department' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.name"
              label="Department Name"
              variant="outlined"
              required
            />
            <v-textarea
              v-model="form.description"
              label="Description"
              variant="outlined"
              rows="3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="handleSave">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRMATION -->
    <v-dialog v-model="confirmDialog.show" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ confirmDialog.item?.name }}</strong>?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn color="error" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useDepartments } from '~/composables/admin/useDepartments'

// ✅ composable
const {
  departments,
  form,
  loading,
  success,
  error,
  fetchDepartments,
  saveDepartment,
  deleteDepartment,
  editDepartment,
  resetForm
} = useDepartments()

// ✅ dialog states
const dialog = ref(false)
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })

// ✅ properly typed alert
type AlertType = 'success' | 'error' | 'info' | 'warning'

const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: ''
})

// ✅ watchers for alert
watch(success, (val) => val && showAlert(val, 'success'))
watch(error, (val) => val && showAlert(val, 'error'))

function showAlert(message: string, type: AlertType = 'success') {
  alert.value = { show: true, type, message }
  setTimeout(() => (alert.value.show = false), 3000)
}

// ✅ table headers
const headers = [
  { title: 'Department Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false }
]

// ✅ dialog controls
function openDialog(isEdit: boolean, item?: any) {
  editMode.value = isEdit
  if (isEdit && item) editDepartment(item)
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  resetForm()
}

async function handleSave() {
  await saveDepartment(editMode.value)
  dialog.value = false
}

function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}

async function handleDelete() {
  await deleteDepartment(confirmDialog.value.item?.id)
  confirmDialog.value.show = false
}

// ✅ load on mount
onMounted(fetchDepartments)
</script>

<style scoped>
.v-card-title {
  font-weight: 600;
}

.v-data-table {
  background-color: white !important;
}

.v-btn {
  text-transform: none !important;
}
</style>
