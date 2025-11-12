<template>
  <v-container fluid class="pa-6">
    <!-- ✅ Snackbar -->
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
        <h2 class="text-h5 font-weight-bold">Classes Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage your department’s class details and teacher assignments.
        </p>
      </v-col>
      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Class
        </v-btn>
      </v-col>
    </v-row>

    <!-- 🔍 Search Bar -->
    <v-text-field
      v-model="search"
      label="Search classes"
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
        :items="filteredClasses"
        :loading="loading"
        class="elevation-1"
        density="comfortable"
      >
        <template #item.teachers="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="teacher in item.teachers"
              :key="teacher.id"
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ teacher.full_name }}
            </v-chip>
          </div>
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

    <!-- ADD/EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Class' : 'Add Class' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.name" label="Class Name" variant="outlined" required />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.section" label="Section" variant="outlined" required />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.department_id"
                  :items="departments"
                  item-title="name"
                  item-value="id"
                  label="Department (optional)"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="form.teachers"
                  :items="teachers"
                  item-title="full_name"
                  item-value="id"
                  label="Assigned Teachers (optional)"
                  multiple
                  chips
                  variant="outlined"
                  clearable
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
import { ref, watch, onMounted, computed } from 'vue'
import { useClasses } from '~/composables/dean/useClasses'

type AlertType = 'success' | 'error' | 'info' | 'warning'

const {
  classes,
  teachers,
  departments,
  form,
  loading,
  success,
  error,
  fetchClasses,
  fetchTeachers,
  fetchDepartments,
  saveClass,
  deleteClass,
  editClass,
  resetForm,
} = useClasses()

const dialog = ref(false)
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })
const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

// 🔍 Search
const search = ref('')

// Filter classes based on search text
const filteredClasses = computed(() => {
  if (!search.value.trim()) return classes.value
  const query = search.value.toLowerCase()
  return classes.value.filter((cls) => {
    const nameMatch = cls.name?.toLowerCase().includes(query)
    const sectionMatch = cls.section?.toLowerCase().includes(query)
    const deptMatch = cls.department_name?.toLowerCase().includes(query)
    const teacherMatch = cls.teachers?.some((t) =>
      t.full_name?.toLowerCase().includes(query)
    )
    return nameMatch || sectionMatch || deptMatch || teacherMatch
  })
})

watch(success, (val) => val && showAlert(val, 'success'))
watch(error, (val) => val && showAlert(val, 'error'))

function showAlert(message: string, type: AlertType) {
  alert.value = { show: true, message, type }
  setTimeout(() => (alert.value.show = false), 3000)
}

const headers = [
  { title: 'Class Name', key: 'name' },
  { title: 'Section', key: 'section' },
  { title: 'Department', key: 'department_name' },
  { title: 'Teachers', key: 'teachers' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function openDialog(isEdit: boolean, item?: any) {
  editMode.value = isEdit
  if (isEdit && item) editClass(item)
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  resetForm()
}

async function handleSave() {
  await saveClass(editMode.value)
  dialog.value = false
}

function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}

async function handleDelete() {
  await deleteClass(confirmDialog.value.item?.id)
  confirmDialog.value.show = false
}

onMounted(async () => {
  await fetchClasses()
  await fetchTeachers()
  await fetchDepartments()
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
