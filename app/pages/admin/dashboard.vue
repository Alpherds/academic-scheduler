<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="align-center justify-space-between mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold">Admin Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis">
          Overview of all departments, deans, teachers, and schedules.
        </p>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="card in cards"
        :key="card.title"
      >
        <v-card
          class="pa-4 d-flex align-center justify-space-between elevation-2 hover:shadow-md transition-all"
        >
          <div>
            <h3 class="text-h6 font-weight-semibold">{{ card.title }}</h3>
            <p class="text-h5 font-weight-bold mt-1">{{ card.value }}</p>
          </div>
          <v-icon size="36" color="primary">{{ card.icon }}</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Links -->
    <v-row class="mt-8">
      <v-col cols="12">
        <h2 class="text-h6 mb-3">Quick Management Access</h2>
      </v-col>

      <v-col
        cols="12"
        sm="6"
        md="3"
        v-for="link in quickLinks"
        :key="link.title"
      >
        <v-card
          class="pa-4 d-flex align-center justify-space-between hover:shadow-md cursor-pointer transition-all"
          @click="navigateTo(link.to)"
        >
          <div>
            <p class="text-subtitle-1 font-weight-medium mb-1">
              {{ link.title }}
            </p>
            <p class="text-body-2 text-medium-emphasis">{{ link.subtitle }}</p>
          </div>
          <v-icon size="28" color="primary">{{ link.icon }}</v-icon>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAdminDashboard } from '~/composables/admin/useAdminDashboard'
import { useRouter } from 'vue-router'

const router = useRouter()

const {
  departmentsCount,
  deansCount,
  teachersCount,
  subjectsCount,
  classesCount,
  schedulesCount,
  fetchDashboardStats
} = useAdminDashboard()

onMounted(fetchDashboardStats)

const cards = computed(() => [
  { title: 'Departments', value: departmentsCount.value, icon: 'mdi-office-building' },
  { title: 'Deans', value: deansCount.value, icon: 'mdi-account-tie' },
  { title: 'Teachers', value: teachersCount.value, icon: 'mdi-account-school' },
  { title: 'Subjects', value: subjectsCount.value, icon: 'mdi-book-open-page-variant' },
  { title: 'Classes', value: classesCount.value, icon: 'mdi-google-classroom' },
  { title: 'Schedules', value: schedulesCount.value, icon: 'mdi-calendar-clock' }
])

const quickLinks = [
  { title: 'Manage Departments', subtitle: 'Add or edit department info', icon: 'mdi-domain', to: '/admin/departments' },
  { title: 'Manage Deans', subtitle: 'Assign deans to departments', icon: 'mdi-account-tie-outline', to: '/admin/deans' },
  { title: 'Manage Teachers', subtitle: 'View or manage teacher accounts', icon: 'mdi-account-multiple-outline', to: '/admin/teachers' },
  { title: 'View All Classes', subtitle: 'Review departmental classes', icon: 'mdi-google-classroom', to: '/admin/classes' }
]

function navigateTo(path: string) {
  router.push(path)
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
</style>
