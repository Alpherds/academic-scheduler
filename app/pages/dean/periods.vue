<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Periods</h1>
      <v-btn color="primary" @click="dialog = true">
        <v-icon left>mdi-plus</v-icon>Add Period
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6">
      <v-data-table
        :headers="headers"
        :items="periods"
        class="elevation-1"
        item-value="id"
      >
        <template #item.actions="{ item }">
          <v-btn icon variant="text" color="primary" @click="edit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="error" @click="remove(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit' : 'Add' }} Period</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="form.period_number" label="Period Number" />
            <v-text-field v-model="form.start_time" label="Start Time (HH:MM)" />
            <v-text-field v-model="form.end_time" label="End Time (HH:MM)" />
            <v-text-field
              v-model="form.duration_minutes"
              label="Duration (Minutes)"
              type="number"
            />
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

interface Period {
  id?: string
  period_number: number
  start_time: string
  end_time: string
  duration_minutes: number
}

const supabase = useSupabase()
const dialog = ref(false)
const editMode = ref(false)
const periods = ref<Period[]>([])
const form = reactive<Period>({
  period_number: 1,
  start_time: '07:00',
  end_time: '07:30',
  duration_minutes: 30
})

const headers = [
  { title: 'Period Number', key: 'period_number' },
  { title: 'Start Time', key: 'start_time' },
  { title: 'End Time', key: 'end_time' },
  { title: 'Duration', key: 'duration_minutes' },
  { title: 'Actions', key: 'actions' }
]

async function load() {
  const { data } = await supabase.from('periods').select('*').order('period_number')
  periods.value = data ?? []
}

function edit(item: Period) {
  editMode.value = true
  Object.assign(form, item)
  dialog.value = true
}

async function save() {
  if (editMode.value && form.id) {
    await supabase.from('periods').update(form).eq('id', form.id)
  } else {
    await supabase.from('periods').insert([form])
  }
  dialog.value = false
  editMode.value = false
  await load()
}

async function remove(id: string | undefined) {
  if (!id) return
  if (!confirm('Delete this period?')) return
  await supabase.from('periods').delete().eq('id', id)
  await load()
}

onMounted(load)
</script>
