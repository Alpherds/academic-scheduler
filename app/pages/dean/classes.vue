<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Classes</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon left>mdi-plus</v-icon>Add Class
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6">
      <v-data-table :headers="headers" :items="classes" class="elevation-1">
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
        <v-card-title>{{ editMode ? 'Edit Class' : 'Add Class' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="form.name" label="Class Name" />
            <v-text-field v-model="form.section" label="Section" />
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

interface ClassRow {
  id?: string
  name: string
  section: string
}

const supabase = useSupabase()
const classes = ref<ClassRow[]>([])
const dialog = ref(false)
const editMode = ref(false)
const form = reactive<ClassRow>({ name: '', section: '' })

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Section', key: 'section' },
  { title: 'Actions', key: 'actions' },
]

async function load() {
  const { data } = await supabase.from('classes').select('*')
  classes.value = data ?? []
}

function openDialog() {
  editMode.value = false
  Object.assign(form, { name: '', section: '' })
  dialog.value = true
}

function edit(item: ClassRow) {
  editMode.value = true
  Object.assign(form, item)
  dialog.value = true
}

async function save() {
  if (editMode.value && form.id) {
    await supabase.from('classes').update(form).eq('id', form.id)
  } else {
    await supabase.from('classes').insert([form])
  }
  dialog.value = false
  await load()
}

async function remove(id: string | undefined) {
  if (!id) return
  if (!confirm('Delete this class?')) return
  await supabase.from('classes').delete().eq('id', id)
  await load()
}

onMounted(load)
</script>
