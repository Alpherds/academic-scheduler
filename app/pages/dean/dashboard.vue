<template>
  <v-container fluid>
    <h2 class="text-h5 mb-4">Dean Dashboard</h2>
    <v-row dense>
      <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-h6">{{ stat.title }}</div>
            <div class="text-h4 font-weight-bold mt-1">{{ stat.value }}</div>
          </div>
          <v-icon size="36" color="primary">{{ stat.icon }}</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col>
        <v-card>
          <v-card-title>Recent Schedule Changes</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="log in logs" :key="log.id">
                <template #prepend><v-icon color="primary">mdi-calendar-clock</v-icon></template>
                <v-list-item-content>
                  <v-list-item-title>{{ log.action }}</v-list-item-title>
                  <v-list-item-subtitle>{{ new Date(log.created_at).toLocaleString() }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDeanDashboard } from '@/composables/dean/useDeanDashboard'
definePageMeta({ layout: 'dashboard' })
const { stats, logs, loadStats, loadLogs } = useDeanDashboard()
onMounted(async () => { await loadStats(); await loadLogs() })
</script>


<style scoped>
.hover-scale {
  transition: all 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.04);
}
</style>
