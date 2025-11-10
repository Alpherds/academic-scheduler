<template>
  <v-navigation-drawer app permanent width="240">
    <v-list>
      <v-list-item class="py-4 px-3">
        <v-img src="/logo.png" max-width="420" contain />
      </v-list-item>
      <v-divider class="my-2" />
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        link
        class="py-2"
      >
        <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const items = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dean/dashboard' },
  { title: 'Schedules', icon: 'mdi-calendar-clock', to: '/dean/schedules' },
  { title: 'Teachers', icon: 'mdi-account-tie', to: '/dean/teachers' },
  { title: 'Classes', icon: 'mdi-school', to: '/dean/classes' },
  { title: 'Subjects', icon: 'mdi-book-open-variant', to: '/dean/subjects' },
  { title: 'Periods', icon: 'mdi-timer-sand', to: '/dean/periods' },
]
</script>

<style scoped>
.v-list-item--active {
  background-color: #e3f2fd !important;
  border-radius: 8px;
}
</style>
