<template>
  <v-container fluid class="pa-6">
    <PageHeader title="Schedules" subtitle="Create and review class & teacher schedules" />

    <v-row class="mb-4 align-center">
      <v-col cols="12" md="4">
        <v-select
          v-model="filter.type"
          :items="['All', 'By Class', 'By Teacher']"
          label="View mode"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-autocomplete
          v-if="filter.type !== 'All'"
          v-model="filter.selected"
          :items="filterItems"
          item-title="display"
          item-value="id"
          :label="filter.type === 'By Class' ? 'Select Class' : 'Select Teacher'"
          clearable
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4" class="text-md-end">
        <v-btn color="primary" @click="openAddDialog" prepend-icon="mdi-plus">
          Add Schedule
        </v-btn>
      </v-col>
    </v-row>

    <ScheduleGrid
      :periods="periods"
      :schedules="visibleSchedules"
      :classes="classes"
      :teachers="teachers"
      :subjects="subjects"
      @edit="openEditDialog"
      @delete="confirmDelete"
    />

    <AddScheduleDialog
      v-model:show="dialog"
      :editing="editing"
      :periods="periods"
      :classes="classes"
      :teachers="teachers"
      :subjects="subjects"
      @saved="onSaved"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '~/components/dean/PageHeader.vue'
import ScheduleGrid from '~/components/ScheduleGrid.vue'
import AddScheduleDialog from '~/components/AddScheduleDialog.vue'
import { useSchedules } from '~/composables/dean/useSchedules'
import { useToaster } from '~/composables/useToaster'

interface FilterState {
  type: 'All' | 'By Class' | 'By Teacher'
  selected: string | null
}

const { 
  periods, schedules, classes, teachers, subjects,
  fetchAll, createSchedule, updateSchedule, deleteSchedule
} = useSchedules()

const { toast } = useToaster()

const dialog = ref(false)
const editing = ref<any>(null)

const filter = ref<FilterState>({
  type: 'All',
  selected: null,
})

const filterItems = computed(() => {
  if (filter.value.type === 'By Class') {
    return classes.value.map((c: any) => ({ id: c.id, display: `${c.name} ${c.section || ''}` }))
  }
  if (filter.value.type === 'By Teacher') {
    return teachers.value.map((t: any) => ({ id: t.id, display: t.full_name }))
  }
  return []
})

const visibleSchedules = computed(() => {
  if (filter.value.type === 'All') return schedules.value
  if (!filter.value.selected) return []
  if (filter.value.type === 'By Class') {
    return schedules.value.filter((s: any) => s.class_id === filter.value.selected)
  }
  return schedules.value.filter((s: any) => s.teacher_id === filter.value.selected)
})

function openAddDialog() {
  editing.value = null
  dialog.value = true
}

function openEditDialog(item: any) {
  editing.value = item
  dialog.value = true
}

async function confirmDelete(item: any) {
  if (!item?.id) return
  if (!confirm(`Delete schedule for ${item.day} ${item.start_time} - ${item.end_time}?`)) return
  const { error } = await deleteSchedule(item.id)
  if (error) toast(error, 'error')
  else toast('Schedule deleted', 'success')
}

async function onSaved(result: { action: string; payload: any }) {
  try {
    if (result.action === 'create') {
      const { error } = await createSchedule(result.payload)
      if (error) toast(error, 'error')
      else toast('Schedule created', 'success')
    } else if (result.action === 'update') {
      const { error } = await updateSchedule(result.payload.id, result.payload)
      if (error) toast(error, 'error')
      else toast('Schedule updated', 'success')
    }
    dialog.value = false
  } catch (e: any) {
    toast(e.message, 'error')
  }
}

onMounted(fetchAll)
</script>
