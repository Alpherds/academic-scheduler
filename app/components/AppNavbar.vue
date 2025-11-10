<template> 
  <v-app-bar color="white" flat elevation="1" height="64" class="navbar px-4" >
     <div class="d-flex align-center justify-space-between w-100"> <!-- LEFT -->
       <div class="d-flex align-center">
         <v-btn icon class="mr-2" density="comfortable" @click="$emit('toggle-sidebar')" > 
          <v-icon size="26">mdi-menu</v-icon> </v-btn> <!-- Title (hide on small screens) --> 
          <span v-if="isDesktop" class="font-weight-bold text-h6 scheduler-title" > SNC Academic Scheduler </span> 
          </div> <!-- RIGHT --> <div class="d-flex align-center gap-3"> <v-btn icon density="comfortable"> 
            <v-icon size="24">mdi-bell-outline</v-icon> </v-btn> 
            <v-menu transition="fade-transition" location="bottom end">
               <template #activator="{ props }"> <v-btn v-bind="props" icon> 
                <v-avatar size="32" class="bg-primary text-white font-weight-bold" > {{ initials }} </v-avatar>
                 </v-btn> </template> <v-list> <v-list-item @click="goToProfile"> 
                  <v-list-item-title>Profile</v-list-item-title> </v-list-item> 
                  <v-list-item @click="handleSignOut"> <v-list-item-title>Logout</v-list-item-title> </v-list-item>
                   </v-list> </v-menu> </div> </div> </v-app-bar>
                    </template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthComposable } from '@/composables/useAuth' 

const props = defineProps<{ isDesktop: boolean; isCollapsed: boolean }>() 
const { currentUser, signOut } = useAuthComposable() 
const router = useRouter() 
const initials = computed(() => { 
  const name = currentUser.value?.user_metadata?.full_name || currentUser.value?.email || 'U' 
  return name.charAt(0).toUpperCase() }) 
  function goToProfile() { router.push('/profile') } 
  async function handleSignOut() { await signOut() 
  router.push('/login') }
  </script>
  
  <style scoped> 
  .navbar { border-bottom: 1px solid #e0e0e0; } 
  .scheduler-title { margin-left: 2px; letter-spacing: -0.2px; color: #222; }
   .gap-3 { gap: 12px; } .v-btn { min-width: 0 !important; }
    </style>