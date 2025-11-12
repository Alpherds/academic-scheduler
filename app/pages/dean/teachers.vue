<template>
  <v-container fluid class="pa-6">
    <!-- ✅ Alert -->
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
        <h2 class="text-h5 font-weight-bold">Teachers Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage faculty members and their allowed subjects.
        </p>
      </v-col>
      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Teacher
        </v-btn>
      </v-col>
    </v-row>

    <!-- 🔍 Search -->
    <v-text-field
      v-model="search"
      label="Search teachers"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
    />

    <!-- TABLE -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredTeachers"
        :loading="loading"
        class="elevation-1"
        density="comfortable"
      >
        <template #item.allowed_subjects="{ item }">
          <v-chip
            v-for="(subject, index) in item.allowed_subjects"
            :key="index"
            class="ma-1 bg-primary text-white"
            size="small"
          >
            {{ typeof subject === 'string' ? subject : subject.name }}
          </v-chip>
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

    <!-- ADD / EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Teacher' : 'Add Teacher' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.full_name" label="Full Name" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.email" label="Email" type="email" variant="outlined" />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.bio"
                  label="Bio"
                  variant="outlined"
                  auto-grow
                  rows="2"
                />
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="form.allowed_subjects"
                  :items="subjects"
                  item-title="name"
                  item-value="id"
                  label="Allowed Subjects"
                  multiple
                  chips
                  clearable
                  density="comfortable"
                  variant="outlined"
                  hide-selected
                  :search-input.sync="searchSubject"
                  prepend-inner-icon="mdi-magnify"
                  :loading="subjectsLoading"
                  placeholder="Search subjects"
                >
                  <template #chip="{ props, item }">
                    <v-chip
                      v-bind="props"
                      class="bg-primary text-white"
                      size="small"
                      closable
                    >
                      {{ item.raw.name }}
                    </v-chip>
                  </template>
                </v-autocomplete>
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

    <!-- DELETE DIALOG -->
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
import { ref, watch, computed, onMounted } from 'vue'
import { useTeachers } from '~/composables/dean/useTeachers'
import { useAuthComposable } from '~/composables/useAuth'

const { currentUser } = useAuthComposable()
const {
  teachers,
  subjects,
  form,
  loading,
  error,
  success,
  fetchTeachers,
  fetchSubjects,
  saveTeacher,
  deleteTeacher,
  editTeacher,
  resetForm,
} = useTeachers()

const dialog = ref(false)
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })

// ✅ Explicit type-safe alert fix
type AlertType = 'success' | 'error' | 'info' | 'warning'
const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

// 🔍 Search
const search = ref('')
const searchSubject = ref('')
const subjectsLoading = ref(false)

// Filtered teachers based on search
const filteredTeachers = computed(() => {
  if (!search.value.trim()) return teachers.value

  const query = search.value.toLowerCase()
  return teachers.value.filter((t) => {
    const nameMatch = t.full_name?.toLowerCase().includes(query)
    const emailMatch = t.email?.toLowerCase().includes(query)
    const subjectMatch = t.allowed_subjects?.some((s: any) =>
      (typeof s === 'string' ? s : s.name)?.toLowerCase().includes(query)
    )
    return nameMatch || emailMatch || subjectMatch
  })
})

function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }
  setTimeout(() => (alert.value.show = false), 3000)
}

watch(success, (val) => val && showAlert(val, 'success'))
watch(error, (val) => val && showAlert(val, 'error'))

const headers = [
  { title: 'Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Bio', key: 'bio' },
  { title: 'Allowed Subjects', key: 'allowed_subjects' },
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
  await saveTeacher(editMode.value, currentUser.value?.id || '')
  dialog.value = false
}

function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}

async function handleDelete() {
  await deleteTeacher(confirmDialog.value.item?.id, currentUser.value?.id || '')
  confirmDialog.value.show = false
}

onMounted(async () => {
  await fetchSubjects()
  await fetchTeachers(currentUser.value?.id || '')
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
</style>
