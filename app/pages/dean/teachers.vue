<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Teachers</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon left>mdi-plus</v-icon>Add Teacher
      </v-btn>
    </div>

    <v-card class="pa-4 mb-6">
      <v-data-table
        :headers="headers"
        :items="teachers"
        class="elevation-1"
        item-value="id"
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
        <v-card-title>{{ editMode ? 'Edit Teacher' : 'Add Teacher' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="form.full_name" label="Full Name" />
            <v-text-field v-model="form.email" label="Email" type="email" />
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

interface Teacher {
  id?: string
  full_name: string
  email: string
}

const supabase = useSupabase()
const teachers = ref<Teacher[]>([])
const dialog = ref(false)
const editMode = ref(false)
const form = reactive<Teacher>({ full_name: '', email: '' })

const headers = [
  { title: 'Full Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', key: 'actions' },
]

async function load() {
  const { data } = await supabase.from('users').select('*').eq('role', 'faculty')
  teachers.value = data ?? []
}

function openDialog() {
  editMode.value = false
  Object.assign(form, { full_name: '', email: '' })
  dialog.value = true
}

function edit(item: Teacher) {
  editMode.value = true
  Object.assign(form, item)
  dialog.value = true
}

async function save() {
  if (editMode.value && form.id) {
    await supabase.from('users').update(form).eq('id', form.id)
  } else {
    await supabase.from('users').insert([{ ...form, role: 'faculty' }])
  }
  dialog.value = false
  await load()
}

async function remove(id: string | undefined) {
  if (!id) return
  if (!confirm('Delete this teacher?')) return
  await supabase.from('users').delete().eq('id', id)
  await load()
}

onMounted(load)
</script>
