<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6 font-weight-bold text-primary">Schedules Overview</span>
      <v-chip color="primary" variant="flat">{{ schedules.length }} total</v-chip>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="schedules"
      class="elevation-0"
      density="comfortable"
      :items-per-page="5"
    >
      <template #item.start_time="{ item }: { item: ScheduleItem }">
        {{ formatTime(item.start_time) }}
      </template>
      <template #item.end_time="{ item }: { item: ScheduleItem }">
        {{ formatTime(item.end_time) }}
      </template>

      <template #no-data>
        <v-alert type="info" variant="tonal" color="primary" border="start">
          No schedules available.
        </v-alert>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

interface ScheduleItem {
  classes: { name: string }
  subjects: { name: string }
  users: { full_name: string }
  rooms: { name: string }
  day: string
  start_time: string
  end_time: string
}

defineProps<{
  schedules: ScheduleItem[]
}>()

const headers = [
  { title: 'Class', key: 'classes.name' },
  { title: 'Subject', key: 'subjects.name' },
  { title: 'Faculty', key: 'users.full_name' },
  { title: 'Room', key: 'rooms.name' },
  { title: 'Day', key: 'day' },
  { title: 'Start', key: 'start_time' },
  { title: 'End', key: 'end_time' }
]

function formatTime(t: string) {
  return dayjs(t, 'HH:mm:ss').format('h:mm A')
}
</script>

<style scoped>
.v-data-table {
  border-top: 1px solid #e5e7eb;
}
</style>
