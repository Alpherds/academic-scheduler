<template>
  <v-container fluid class="pa-6">
    <PageHeader
      title="Dean Dashboard"
      subtitle="Overview of Faculty, Classes, and Schedules"
    >
      <template #actions>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus">
          Add Schedule
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="!loading">
      <DashboardStats :cards="cards" class="mb-8" />
      <ScheduleTable :schedules="schedules" />
    </div>

    <div v-else class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-2">Loading dashboard data...</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDeanDashboard } from '@/composables/dean/useDeanDashboard'
import PageHeader from '@/components/dean/PageHeader.vue'
import DashboardStats from '@/components/dean/DashboardStats.vue'
import ScheduleTable from '@/components/dean/ScheduleTable.vue'

definePageMeta({ ssr: false }) // ✅ Fix hydration mismatch

const {
  facultyCount,
  classCount,
  subjectCount,
  scheduleCount,
  schedules,
  loading,
  fetchDashboardData
} = useDeanDashboard()

onMounted(() => fetchDashboardData())

const cards = computed(() => [
  { title: 'Faculty', icon: 'mdi-account-school', value: facultyCount.value },
  { title: 'Classes', icon: 'mdi-google-classroom', value: classCount.value },
  { title: 'Subjects', icon: 'mdi-book-open-page-variant', value: subjectCount.value },
  { title: 'Schedules', icon: 'mdi-calendar-clock', value: scheduleCount.value }
])
</script>

<style scoped>
.v-main {
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fafb 0%, #f0f4ff 100%);
}
</style>
