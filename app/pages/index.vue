<template>
  <div class="pa-6">
    <v-container>
      <v-row>
        <v-col cols="12" md="8">
          <h1 class="text-h4">Academic Scheduler+</h1>
          <p>Welcome. Use the sidebar to navigate. Login to continue.</p>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-text>
              <v-btn block color="primary" @click="goLogin">Login</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
function goLogin() {
  navigateTo('/login')
}
</script>
