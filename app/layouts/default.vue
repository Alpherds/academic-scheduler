<template>
  <v-app>
    <AppSidebar />
    <v-main>
      <AppNavbar />
      <v-container fluid class="py-6 px-8">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import AppNavbar from '~/components/AppNavbar.vue'
</script>
