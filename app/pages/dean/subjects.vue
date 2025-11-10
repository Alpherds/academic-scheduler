<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Subjects</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon left>mdi-plus</v-icon>Add Subject
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6">
      <v-data-table
        :headers="headers"
        :items="subjects"
        item-value="id"
        class="elevation-1"
      >
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
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Subject' : 'Add Subject' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="form.code" label="Subject Code" />
            <v-text-field v-model="form.name" label="Subject Name" />
            <v-text-field
              v-model="form.units"
              type="number"
              label="Units"
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

interface Subject {
  id?: string
  code: string
  name: string
  units: number
}

const supabase = useSupabase()
const subjects = ref<Subject[]>([])
const dialog = ref(false)
const editMode = ref(false)
const form = reactive<Subject>({ code: '', name: '', units: 3 })

const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Name', key: 'name' },
  { title: 'Units', key: 'units' },
  { title: 'Actions', key: 'actions' },
]

async function load() {
  const { data } = await supabase.from('subjects').select('*').order('code')
  subjects.value = data ?? []
}

function openDialog() {
  editMode.value = false
  Object.assign(form, { code: '', name: '', units: 3 })
  dialog.value = true
}

function edit(item: Subject) {
  editMode.value = true
  Object.assign(form, item)
  dialog.value = true
}

async function save() {
  if (editMode.value && form.id) {
    await supabase.from('subjects').update(form).eq('id', form.id)
  } else {
    await supabase.from('subjects').insert([form])
  }
  dialog.value = false
  await load()
}

async function remove(id: string | undefined) {
  if (!id) return
  if (!confirm('Delete this subject?')) return
  await supabase.from('subjects').delete().eq('id', id)
  await load()
}

onMounted(load)
</script>
