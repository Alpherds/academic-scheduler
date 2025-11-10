<template>
  <v-row dense class="dashboard-stats">
    <v-col
      v-for="(card, index) in cards"
      :key="index"
      cols="12"
      sm="6"
      md="3"
    >
      <v-card
        class="stat-card d-flex align-center justify-space-between pa-5"
        elevation="3"
        rounded="lg"
        hover
      >
        <div>
          <h3 class="text-h6 font-weight-semibold mb-1 text-grey-darken-4">
            {{ card.title }}
          </h3>
          <p class="text-h4 font-weight-bold text-primary">
            {{ animatedValues[index] }}
          </p>
        </div>
        <v-icon
          :icon="card.icon"
          size="36"
          class="icon-bg"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

interface Card {
  title: string
  icon: string
  value: number
}

const props = defineProps<{
  cards: Card[]
}>()

const animatedValues = ref<number[]>([])

function animateCount(index: number, target: number) {
  const duration = 800 // ms
  const start = animatedValues.value[index] || 0
  const startTime = performance.now()

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    animatedValues.value[index] = Math.floor(start + (target - start) * progress)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

function updateAnimations() {
  props.cards.forEach((card, index) => {
    if (animatedValues.value[index] !== card.value) {
      animateCount(index, card.value)
    }
  })
}

watch(
  () => props.cards.map(c => c.value),
  () => nextTick(updateAnimations),
  { deep: true, immediate: true }
)

onMounted(() => {
  animatedValues.value = props.cards.map(c => c.value)
})
</script>

<style scoped>
.dashboard-stats {
  margin-bottom: 1rem;
}

.stat-card {
  transition: all 0.25s ease;
  background: white;
  border: 1px solid #e5e7eb;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08) !important;
}

.icon-bg {
  background: #e3f2fd;
  border-radius: 50%;
  padding: 10px;
  color: #1E88E5;
}
</style>
