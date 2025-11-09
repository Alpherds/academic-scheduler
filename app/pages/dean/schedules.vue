<template>
  <div>
    <v-card>
      <v-card-title>
        Faculty Schedules
        <v-spacer />
        <v-btn color="primary" @click="openNew">Add Schedule</v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table :headers="headers" :items="schedules" dense>
          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="editItem(item)">Edit</v-btn>
            <v-btn size="small" color="error" variant="text" @click="deleteItem(item)">Delete</v-btn>
          </template>

          <template #item.conflict="{ item }">
            <v-chip v-if="item._conflict" color="error" text-color="white" size="small">
              Conflict
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for add/edit -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit' : 'Add' }} Schedule</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.subject" label="Subject code/title" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.faculty_id" label="Faculty ID (UUID)" />
              </v-col>

              <v-col cols="6">
                <v-select :items="days" v-model="form.day" label="Day" />
              </v-col>

              <v-col cols="3">
                <v-text-field v-model="form.start_time" label="Start (HH:MM)" />
              </v-col>

              <v-col cols="3">
                <v-text-field v-model="form.end_time" label="End (HH:MM)" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="form.room_id" label="Room ID (UUID)" />
              </v-col>
            </v-row>

            <v-alert
              v-if="conflictMessages.length"
              type="error"
              density="compact"
              class="mt-2"
            >
              <div v-for="m in conflictMessages" :key="m">{{ m }}</div>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">
            {{ editMode ? 'Save' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from 'axios'

// ✅ Page uses dashboard layout
definePageMeta({
  layout: 'dashboard',
})

// ====== TYPE DEFINITIONS ======
interface ScheduleItem {
  id: string
  class_id: string
  subject: string
  faculty_id: string
  room_id: string
  day: string
  start_time: string
  end_time: string
  _conflict: boolean
}

interface FormState {
  id: string | null
  class_id: string
  subject: string
  faculty_id: string
  room_id: string
  day: string
  start_time: string
  end_time: string
}

// ====== STATIC DATA ======
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const headers = [
  { title: 'Class', key: 'class_id' },
  { title: 'Subject', key: 'subject' },
  { title: 'Faculty', key: 'faculty_id' },
  { title: 'Room', key: 'room_id' },
  { title: 'Day', key: 'day' },
  { title: 'Start', key: 'start_time' },
  { title: 'End', key: 'end_time' },
  { title: 'Conflict', key: 'conflict' },
  { title: 'Actions', key: 'actions' },
]

// ====== MOCK DATA ======
const schedules = ref<ScheduleItem[]>([
  {
    id: '1',
    class_id: 'BSIT-2A',
    subject: 'MATH101',
    faculty_id: '33333333-3333-3333-3333-333333333333',
    room_id: 'R101',
    day: 'Monday',
    start_time: '09:00:00',
    end_time: '10:00:00',
    _conflict: false,
  },
  {
    id: '2',
    class_id: 'BSIT-2A',
    subject: 'CS102',
    faculty_id: '44444444-4444-4444-4444-444444444444',
    room_id: 'R101',
    day: 'Monday',
    start_time: '09:30:00',
    end_time: '10:30:00',
    _conflict: true,
  },
])

// ====== STATE MANAGEMENT ======
const dialog = ref(false)
const editMode = ref(false)
const formRef = ref()
const saving = ref(false)
const conflictMessages = ref<string[]>([])

const form = reactive<FormState>({
  id: null,
  class_id: '',
  subject: '',
  faculty_id: '',
  room_id: '',
  day: 'Monday',
  start_time: '09:00:00',
  end_time: '10:00:00',
})

// ====== METHODS ======
function openNew() {
  editMode.value = false
  Object.assign(form, {
    id: null,
    class_id: '',
    subject: '',
    faculty_id: '',
    room_id: '',
    day: 'Monday',
    start_time: '09:00:00',
    end_time: '10:00:00',
  })
  conflictMessages.value = []
  dialog.value = true
}

function editItem(item: ScheduleItem) {
  editMode.value = true
  Object.assign(form, item)
  conflictMessages.value = []
  dialog.value = true
}

function deleteItem(item: ScheduleItem) {
  const idx = schedules.value.findIndex((s) => s.id === item.id)
  if (idx > -1) schedules.value.splice(idx, 1)
}

async function save() {
  saving.value = true
  conflictMessages.value = []

  try {
    const payload = {
      faculty_id: form.faculty_id,
      room_id: form.room_id,
      day: form.day,
      start_time: form.start_time,
      end_time: form.end_time,
      department_id: '11111111-1111-1111-1111-111111111111',
      schedule_id: form.id,
    }

    const res = await axios.post('/api/check-conflict', payload)
    const conflicts = res.data?.conflicts || []

    if (conflicts.length) {
      conflicts.forEach((c: any) => {
        if (c.type === 'faculty') {
          conflictMessages.value.push(`Faculty conflict with schedule id: ${c.schedule.id}`)
        } else if (c.type === 'room') {
          conflictMessages.value.push(`Room conflict with schedule id: ${c.schedule.id}`)
        }
      })
      saving.value = false
      return
    }

    // ====== ADD OR UPDATE LOCAL DATA ======
    if (!form.id) {
      const newItem: ScheduleItem = {
        id: Math.random().toString(36).substring(2, 9),
        class_id: form.class_id,
        subject: form.subject,
        faculty_id: form.faculty_id,
        room_id: form.room_id,
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        _conflict: false,
      }
      schedules.value.push(newItem)
    } else {
      const idx = schedules.value.findIndex((s) => s.id === form.id)
      if (idx > -1) {
        schedules.value[idx] = {
          id: form.id,
          class_id: form.class_id,
          subject: form.subject,
          faculty_id: form.faculty_id,
          room_id: form.room_id,
          day: form.day,
          start_time: form.start_time,
          end_time: form.end_time,
          _conflict: false,
        }
      }
    }

    dialog.value = false
  } catch (err: any) {
    conflictMessages.value.push(err.message || 'Failed to check conflicts')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.v-data-table {
  font-size: 14px;
}
</style>
