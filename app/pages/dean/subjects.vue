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
        <h2 class="text-h5 font-weight-bold">Subjects Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage your department’s subjects list.
        </p>
      </v-col>
      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Subject
        </v-btn>
      </v-col>
    </v-row>

    <!-- 🔍 Search Bar -->
    <v-text-field
      v-model="search"
      label="Search subjects..."
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
    />

    <!-- SUBJECTS TABLE -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredSubjects"
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
        <v-card-title>{{ editMode ? 'Edit Subject' : 'Add Subject' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.code"
                  label="Subject Code"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="form.name"
                  label="Subject Name"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="form.units"
                  label="Units"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  min="0"
                  required
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
          <strong>{{ confirmDialog.item?.name }}</strong> ({{ confirmDialog.item?.code }})?
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
import { ref, watch, onMounted, computed } from 'vue'
import { useSubjects } from '~/composables/dean/useSubjects'

type AlertType = 'success' | 'error' | 'info' | 'warning'

const {
  subjects,
  form,
  loading,
  error,
  success,
  fetchSubjects,
  saveSubject,
  deleteSubject,
  editSubject,
  resetForm,
} = useSubjects()

const dialog = ref(false)
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })
const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

/* ✅ Reactive alerts */
watch(success, (val) => val && showAlert(val, 'success'))
watch(error, (val) => val && showAlert(val, 'error'))

function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }
  setTimeout(() => (alert.value.show = false), 3000)
}

const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Name', key: 'name' },
  { title: 'Units', key: 'units' },
  { title: 'Actions', key: 'actions', sortable: false },
]

/* 🔍 Search Logic */
const search = ref('')
const filteredSubjects = computed(() => {
  if (!search.value.trim()) return subjects.value
  const query = search.value.toLowerCase()
  return subjects.value.filter((subj) => {
    return (
      subj.code.toLowerCase().includes(query) ||
      subj.name.toLowerCase().includes(query) ||
      String(subj.units).includes(query)
    )
  })
})

/* ✅ Dialog controls */
function openDialog(isEdit: boolean, item?: any) {
  editMode.value = isEdit
  if (isEdit && item) editSubject(item)
  dialog.value = true
}
function closeDialog() {
  dialog.value = false
  resetForm()
}
async function handleSave() {
  await saveSubject(editMode.value)
  dialog.value = false
}

/* ✅ Delete confirmation */
function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}
async function handleDelete() {
  await deleteSubject(confirmDialog.value.item?.id)
  confirmDialog.value.show = false
}

onMounted(fetchSubjects)
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
