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
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold">Teachers Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage teachers and their allowed subjects.
        </p>
      </v-col>
      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Teacher
        </v-btn>
      </v-col>
    </v-row>

    <!-- Teachers Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="teachers"
        :loading="loading"
        class="elevation-1"
        density="comfortable"
      >
        <template #item.subjects="{ item }">
          <div class="d-flex flex-wrap">
            <v-chip
              v-for="subject in item.subjects"
              :key="subject.id"
              size="small"
              color="primary"
              variant="outlined"
              class="ma-1"
            >
              {{ subject.code }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon variant="text" color="info" @click="viewTeacher(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="primary" @click="openDialog(true, item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="error" @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Teacher' : 'Add Teacher' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.full_name"
                  label="Full Name"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.bio"
                  label="Bio"
                  variant="outlined"
                  auto-grow
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.subject_ids"
                  :items="subjects"
                  item-title="name"
                  item-value="id"
                  label="Allowed Subjects"
                  multiple
                  chips
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

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog.show" max-width="480">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ viewDialog.item?.full_name }}
        </v-card-title>
        <v-card-subtitle>{{ viewDialog.item?.email }}</v-card-subtitle>
        <v-card-text>
          <p class="mb-2"><strong>Bio:</strong> {{ viewDialog.item?.bio || 'N/A' }}</p>
          <div>
            <strong>Allowed Subjects:</strong>
            <div class="mt-2">
              <v-chip
                v-for="sub in viewDialog.item?.subjects"
                :key="sub.id"
                color="primary"
                variant="outlined"
                size="small"
                class="ma-1"
              >
                {{ sub.code }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="viewDialog.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete -->
    <v-dialog v-model="confirmDialog.show" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ confirmDialog.item?.full_name }}</strong>?
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
import { useTeachers } from '@/composables/dean/useTeachers'


type AlertType = 'success' | 'error' | 'info' | 'warning'

const {
  teachers,
  subjects,
  form,
  loading,
  success,
  error,
  init,
  saveTeacher,
  deleteTeacher,
  editTeacher,
  resetForm,
} = useTeachers()

const dialog = ref(false)
const viewDialog = ref({ show: false, item: null as any })
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })
const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

watch(success, (v) => v && showAlert(v, 'success'))
watch(error, (v) => v && showAlert(v, 'error'))

function showAlert(msg: string, type: AlertType) {
  alert.value = { show: true, type, message: msg }
  setTimeout(() => (alert.value.show = false), 3000)
}

const headers = [
  { title: 'Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Allowed Subjects', key: 'subjects', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

function openDialog(isEdit: boolean, item?: any) {
  editMode.value = isEdit
  if (isEdit && item) editTeacher(item)
  dialog.value = true
}
function closeDialog() {
  dialog.value = false
  resetForm()
}
async function handleSave() {
  await saveTeacher(editMode.value)
  dialog.value = false
}
function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}
async function handleDelete() {
  await deleteTeacher(confirmDialog.value.item?.id)
  confirmDialog.value.show = false
}
function viewTeacher(item: any) {
  viewDialog.value = { show: true, item }
}

onMounted(init)
</script>

<style scoped>
.v-chip {
  font-size: 0.8rem;
}
</style>
