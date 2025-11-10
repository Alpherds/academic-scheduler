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
        <h2 class="text-h5 font-weight-bold">Periods Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage your department’s class periods.
        </p>
      </v-col>
      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Period
        </v-btn>
      </v-col>
    </v-row>

    <!-- PERIODS TABLE -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="periods"
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

    <!-- ADD/EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Period' : 'Add Period' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.period_number"
                  label="Period Number"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model="form.start_time"
                  label="Start Time"
                  type="time"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model="form.end_time"
                  label="End Time"
                  type="time"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.duration_minutes"
                  label="Duration (minutes)"
                  type="number"
                  readonly
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="handleSave">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✅ MODERN DELETE CONFIRM DIALOG -->
    <v-dialog v-model="confirmDialog.show" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>Period #{{ confirmDialog.item?.period_number }}</strong>?
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
import { usePeriods } from '~/composables/dean/usePeriods'

type AlertType = 'success' | 'error' | 'info' | 'warning'

const {
  periods,
  form,
  loading,
  error,
  success,
  fetchPeriods,
  savePeriod,
  deletePeriod,
  editPeriod,
  resetForm,
} = usePeriods()

const dialog = ref(false)
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })
const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

// ✅ Reactive alerts
watch(success, (val) => {
  if (val) showAlert(val, 'success')
})
watch(error, (val) => {
  if (val) showAlert(val, 'error')
})

function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }
  setTimeout(() => (alert.value.show = false), 3000)
}

const headers = [
  { title: 'Period No.', key: 'period_number' },
  { title: 'Start', key: 'start_time' },
  { title: 'End', key: 'end_time' },
  { title: 'Duration (min)', key: 'duration_minutes' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// ✅ Dialog controls
function openDialog(isEdit: boolean, item?: any) {
  editMode.value = isEdit
  if (isEdit && item) editPeriod(item)
  dialog.value = true
}
function closeDialog() {
  dialog.value = false
  resetForm()
}
async function handleSave() {
  await savePeriod(editMode.value)
  dialog.value = false
}

// ✅ Delete confirmation
function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}
async function handleDelete() {
  await deletePeriod(confirmDialog.value.item?.id)
  confirmDialog.value.show = false
}

onMounted(fetchPeriods)
</script>
