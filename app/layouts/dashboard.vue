<template>
  <v-app>
    <AppNavbar />
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="2" class="pa-0">
            <AppSidebar />
          </v-col>
          <v-col cols="12" md="10">
            <slot />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/AppNavbar.vue'
import AppSidebar from '~/components/AppSidebar.vue'
</script>

<style scoped>
/* small tweaks */
.v-main {
  background: #f7f9fc;
  min-height: 100vh;
  padding-top: 16px;
}
</style>
