<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Schedules</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon left>mdi-plus</v-icon>Add Schedule
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6">
      <v-data-table :headers="headers" :items="schedules" class="elevation-1">
        <template #item.actions="{ item }">
          <v-btn icon color="primary" variant="text" @click="edit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="error" variant="text" @click="remove(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Schedule' : 'Add Schedule' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-select v-model="form.class_id" :items="classOptions" label="Class" />
            <v-select v-model="form.subject_id" :items="subjectOptions" label="Subject" />
            <v-select v-model="form.teacher_id" :items="teacherOptions" label="Teacher" />
            <v-select v-model="form.day" :items="days" label="Day" />
            <v-text-field v-model="form.start_time" label="Start Time (HH:MM)" />
            <v-text-field v-model="form.end_time" label="End Time (HH:MM)" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

interface Schedule {
  id?: string
  class_id: string
  subject_id: string
  teacher_id: string
  day: string
  start_time: string
  end_time: string
}

const supabase = useSupabase()
const schedules = ref<Schedule[]>([])
const classOptions = ref<any[]>([])
const subjectOptions = ref<any[]>([])
const teacherOptions = ref<any[]>([])
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const dialog = ref(false)
const editMode = ref(false)
const form = reactive<Schedule>({
  class_id: '',
  subject_id: '',
  teacher_id: '',
  day: 'Monday',
  start_time: '07:00',
  end_time: '08:00',
})

const headers = [
  { title: 'Class', key: 'class_id' },
  { title: 'Subject', key: 'subject_id' },
  { title: 'Teacher', key: 'teacher_id' },
  { title: 'Day', key: 'day' },
  { title: 'Time', key: 'start_time' },
  { title: 'Actions', key: 'actions' },
]

async function load() {
  const { data } = await supabase.from('schedules').select('*')
  schedules.value = data ?? []
}

async function loadOptions() {
  const [classes, subjects, teachers] = await Promise.all([
    supabase.from('classes').select('id, name'),
    supabase.from('subjects').select('id, name'),
    supabase.from('users').select('id, full_name').eq('role', 'faculty'),
  ])
  classOptions.value = classes.data?.map(c => ({ title: c.name, value: c.id })) ?? []
  subjectOptions.value = subjects.data?.map(s => ({ title: s.name, value: s.id })) ?? []
  teacherOptions.value = teachers.data?.map(t => ({ title: t.full_name, value: t.id })) ?? []
}

function openDialog() {
  editMode.value = false
  Object.assign(form, {
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day: 'Monday',
    start_time: '07:00',
    end_time: '08:00',
  })
  dialog.value = true
}

function edit(item: Schedule) {
  editMode.value = true
  Object.assign(form, item)
  dialog.value = true
}

async function save() {
  if (editMode.value && form.id) {
    await supabase.from('schedules').update(form).eq('id', form.id)
  } else {
    await supabase.from('schedules').insert([form])
  }
  dialog.value = false
  await load()
}

async function remove(id: string | undefined) {
  if (!id) return
  if (!confirm('Delete this schedule?')) return
  await supabase.from('schedules').delete().eq('id', id)
  await load()
}

onMounted(async () => {
  await load()
  await loadOptions()
})
</script>
