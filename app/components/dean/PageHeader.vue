<template>
  <v-row class="align-center mb-4">
    <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1 text-primary">{{ title }}</h1>
        <p class="text-body-2 text-grey-darken-1" v-if="subtitle">{{ subtitle }}</p>
      </div>

      <div>
        <slot name="actions"></slot>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.text-primary {
  color: #1E40AF;
}
</style>
