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
        <h2 class="text-h5 font-weight-bold">Classes Management</h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage all department classes and their assigned teachers & subjects.
        </p>
      </v-col>
      <v-col cols="12" md="6" class="text-md-end text-center">
        <v-btn color="primary" @click="openDialog(false)">
          <v-icon left>mdi-plus</v-icon>
          Add Class
        </v-btn>
      </v-col>
    </v-row>

    <!-- TABLE -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="classes"
        :loading="loading"
        class="elevation-1"
        density="comfortable"
      >
        <template #item.teachers="{ item }">
          <v-chip
            v-for="t in item.teachers"
            :key="t.id"
            class="ma-1"
            color="primary"
            text-color="white"
            size="small"
            label
          >
            {{ t.full_name }}
          </v-chip>
        </template>

        <template #item.subjects="{ item }">
          <v-chip
            v-for="s in item.subjects"
            :key="s.id"
            class="ma-1"
            color="success"
            text-color="white"
            size="small"
            label
          >
            {{ s.code }} {{ s.name }}
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

    <!-- ADD/EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Class' : 'Add New Class' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Class Name"
                  placeholder="e.g. BSIT 2nd Year"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.section"
                  label="Section"
                  placeholder="e.g. A, B, C"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>

              <!-- Teachers -->
              <v-col cols="12">
                <v-select
                  v-model="form.teacher_ids"
                  :items="teachers"
                  item-title="full_name"
                  item-value="id"
                  label="Teachers"
                  multiple
                  chips
                  variant="outlined"
                  hint="Select teachers to assign to this class (optional)"
                  persistent-hint
                />
              </v-col>

              <!-- Subjects -->
              <v-col cols="12">
                <v-select
                  v-model="form.subject_ids"
                  :items="subjects"
                  item-title="name"
                  item-value="id"
                  label="Subjects"
                  multiple
                  chips
                  variant="outlined"
                  hint="Select subjects taught in this class (optional)"
                  persistent-hint
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
          <strong>{{ confirmDialog.item?.name }}</strong> - Section
          <strong>{{ confirmDialog.item?.section }}</strong>?
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
import { useClasses } from '~/composables/dean/useClasses'

type AlertType = 'success' | 'error' | 'info' | 'warning'

const {
  classes,
  subjects,
  teachers,
  form,
  loading,
  success,
  error,
  fetchClasses,
  saveClass,
  deleteClass,
  editClass,
  resetForm,
  fetchSubjectsAndTeachers,
} = useClasses()

const dialog = ref(false)
const editMode = ref(false)
const confirmDialog = ref({ show: false, item: null as any })
const alert = ref<{ show: boolean; type: AlertType; message: string }>({
  show: false,
  type: 'success',
  message: '',
})

/* ✅ Reactive alerts */
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

/* ✅ Data table columns */
const headers = [
  { title: 'Class Name', key: 'name' },
  { title: 'Section', key: 'section' },
  { title: 'Teachers', key: 'teachers' },
  { title: 'Subjects', key: 'subjects' },
  { title: 'Actions', key: 'actions', sortable: false },
]

/* ✅ Dialog controls */
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

/* ✅ Delete confirmation */
function confirmDelete(item: any) {
  confirmDialog.value = { show: true, item }
}
async function handleDelete() {
  await deleteClass(confirmDialog.value.item?.id)
  confirmDialog.value.show = false
}

onMounted(async () => {
  await fetchSubjectsAndTeachers()
  await fetchClasses()
})
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
