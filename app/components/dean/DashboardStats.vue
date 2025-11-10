<template>
  <v-row dense>
    <v-col
      v-for="(card, index) in cards"
      :key="index"
      cols="12"
      sm="6"
      md="3"
    >
      <v-card
        class="pa-5 text-center hover-elevate"
        elevation="2"
        rounded="lg"
      >
        <v-icon size="40" color="primary" class="mb-2">
          {{ card.icon }}
        </v-icon>
        <div class="text-subtitle-1 font-weight-medium text-grey-darken-2">
          {{ card.title }}
        </div>
        <div class="text-h4 font-weight-bold text-primary mt-1">
          {{ card.value }}
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
interface DashboardCard {
  title: string
  icon: string
  value: number | string
}

defineProps<{
  cards: DashboardCard[]
}>()
</script>

<style scoped>
.hover-elevate:hover {
  transition: all 0.2s ease;
  transform: translateY(-3px);
  box-shadow: 0px 4px 15px rgba(30, 64, 175, 0.15);
}
</style>
