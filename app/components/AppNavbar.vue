<template>
  <v-app-bar color="white" elevate-on-scroll flat>
    <v-container>
      <v-row class="align-center" no-gutters>
        <v-col cols="6">
          <v-btn text @click="goHome" class="pa-0">
            <v-icon left>mdi-school</v-icon>
            <span class="text-h6">Academic Scheduler+</span>
          </v-btn>
        </v-col>
        <v-col cols="6" class="d-flex justify-end">
          <v-btn icon @click="goNotifications">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon>
                <v-avatar size="32">
                  <span class="white--text">{{ initials }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="signOut">
                <v-list-item-title>Sign out</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthComposable } from '@/composables/useAuth'
import { ref } from 'vue'
const initials = ref('AD')

function goHome() {
  navigateTo('/')
}
function goNotifications() {
  navigateTo('/notifications')
}
function signOut() {
  const { signOut } = useAuthComposable()
  signOut()
  navigateTo('/login')
}
</script>

<style scoped>
.v-avatar {
  background: #1E88E5;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:600;
}
</style>
