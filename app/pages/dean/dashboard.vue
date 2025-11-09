<template>
  <v-container fluid>
    <h2 class="text-h5 mb-4">Dean Dashboard</h2>

    <!-- STATS OVERVIEW -->
    <v-row dense>
      <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-h6 font-weight-medium">{{ stat.title }}</div>
            <div class="text-h4 font-weight-bold mt-1">{{ stat.value }}</div>
          </div>
          <v-icon size="36" color="primary">{{ stat.icon }}</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <!-- QUICK LINKS -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="item in quickLinks" :key="item.title" cols="12" sm="6" md="4" lg="2">
                <v-card
                  class="pa-4 text-center hover-scale cursor-pointer"
                  elevation="2"
                  @click="navigateTo(item.route)"
                >
                  <v-icon size="36" color="primary" class="mb-2">{{ item.icon }}</v-icon>
                  <div class="text-subtitle-1">{{ item.title }}</div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- RECENT ACTIVITY -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Schedule Changes</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="log in logs"
                :key="log.id"
                :title="log.action"
                :subtitle="dayjs(log.created_at).format('MMM D, YYYY h:mm A')"
              >
                <template #prepend>
                  <v-icon color="primary">mdi-calendar-clock</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useDeanDashboard } from '~/composables/dean/useDeanDashboard'

definePageMeta({
  layout: 'dashboard',
})

const { stats, logs, loadStats, loadLogs } = useDeanDashboard()

const quickLinks = [
  { title: 'Schedules', icon: 'mdi-calendar', route: '/dean/schedules' },
  { title: 'Faculty', icon: 'mdi-account-tie', route: '/dean/teachers' },
  { title: 'Classes', icon: 'mdi-account-group', route: '/dean/classes' },
  { title: 'Subjects', icon: 'mdi-book-open', route: '/dean/subjects' },
  { title: 'Rooms', icon: 'mdi-door', route: '/dean/rooms' },
  { title: 'Reports', icon: 'mdi-chart-bar', route: '/dean/reports' },
]

onMounted(async () => {
  await loadStats()
  await loadLogs()
})
</script>

<style scoped>
.hover-scale {
  transition: all 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.04);
}
</style>
