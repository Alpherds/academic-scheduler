<template>
  <v-app>
    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="260"
      :rail="isCollapsed"
      :temporary="!isDesktop"
      class="elevation-1 sidebar-wrapper"
    >
      <AppSidebar />
    </v-navigation-drawer>

    <!-- MAIN CONTENT -->
    <v-main>
      <AppNavbar
        :is-desktop="isDesktop"
        :is-collapsed="isCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
      <v-container fluid class="main-container">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import AppSidebar from '~/components/AppSidebar.vue'
import AppNavbar from '~/components/AppNavbar.vue'

const drawer = ref(true)
const isCollapsed = ref(false)
const isDesktop = ref(true)

provide('isCollapsed', isCollapsed)

function updateView() {
  isDesktop.value = window.innerWidth >= 1024
  drawer.value = isDesktop.value
  if (!isDesktop.value) isCollapsed.value = false
}

function toggleSidebar() {
  if (isDesktop.value) {
    isCollapsed.value = !isCollapsed.value
  } else {
    drawer.value = !drawer.value
  }
}

onMounted(() => {
  updateView()
  window.addEventListener('resize', updateView)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateView))
</script>

<style scoped>
.main-container {
  background-color: #f9fafb;
  min-height: 100vh;
  padding-bottom: 80px;
}
.sidebar-wrapper {
  transition: width 0.25s ease;
}
</style>
