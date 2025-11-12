<template>
  <v-card class="pa-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h3 class="text-h6 mb-0">Weekly Schedule</h3>
        <div class="text-caption">Click cells to add or edit schedules</div>
      </div>
    </div>

    <div class="schedule-grid">
      <div class="grid-header">
        <div class="time-col">Time</div>
        <div v-for="d in days" :key="d" class="day-col">{{ d }}</div>
      </div>

      <div class="grid-body">
        <div v-for="period in periods" :key="period.period_number" class="grid-row">
          <div class="time-col">
            <div class="time">{{ formatTime(period.start_time) }} - {{ formatTime(period.end_time) }}</div>
            <div class="caption">Period {{ period.period_number }}</div>
          </div>

          <div v-for="d in days" :key="`${d}-${period.period_number}`" class="day-col">
            <div class="cell">
              <template v-for="s in cellSchedules(d, period)" :key="s.id">
                <v-chip
                  small
                  class="ma-1"
                  :style="{ backgroundColor: deptColor(s.department_id) }"
                  @click="$emit('edit', s)"
                >
                  <div class="chip-title">{{ subjectName(s.subject_id) }} · {{ className(s.class_id) }}</div>
                  <div class="chip-sub">{{ teacherName(s.teacher_id) }}</div>
                </v-chip>
              </template>

              <div
                v-if="cellSchedules(d, period).length === 0"
                class="empty"
                @click="$emit('edit', { day: d, period })"
              >
                <v-icon small>mdi-plus</v-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
interface PeriodItem {
  period_number: number
  start_time: string
  end_time: string
}
interface ScheduleItem {
  id: string
  day: string
  period_number: number
  class_id: string
  subject_id: string
  teacher_id: string
  start_time: string
  end_time: string
  department_id?: string
}

const props = defineProps<{
  periods: PeriodItem[]
  schedules: ScheduleItem[]
  classes: any[]
  teachers: any[]
  subjects: any[]
}>()

const emit = defineEmits<{
  (e: 'edit', item: any): void
  (e: 'delete', item: any): void
}>()

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function cellSchedules(day: string, period: PeriodItem): ScheduleItem[] {
  return props.schedules.filter(
    (s: ScheduleItem) => s.day === day && s.period_number === period.period_number
  )
}

function formatTime(t: string): string {
  const [hhStr, mmStr] = (t || '').split(':')
  const hh = Number(hhStr ?? 0)
  const mm = Number(mmStr ?? 0)
  if (isNaN(hh) || isNaN(mm)) return t
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const h = ((hh + 11) % 12) + 1
  return `${h}:${String(mm).padStart(2, '0')} ${ampm}`
}

function className(classId: string): string {
  const c = props.classes.find((x: any) => x.id === classId)
  return c ? `${c.name}${c.section ? ' - ' + c.section : ''}` : '—'
}
function teacherName(tid: string): string {
  const t = props.teachers.find((x: any) => x.id === tid)
  return t ? t.full_name : '—'
}
function subjectName(sid: string): string {
  const s = props.subjects.find((x: any) => x.id === sid)
  return s ? s.name : '—'
}

function deptColor(deptId?: string): string {
  const map: Record<string, string> = {
    BSIT: '#9E9E9E',
    BSCS: '#1E88E5',
    BSCPE: '#FB8C00',
    BSHM: '#EC407A',
    BSCRIM: '#8E2430',
    BSBA: '#FDD835',
    IHC: '#8E24AA',
  }
  return map[deptId ?? ''] || '#CFD8DC'
}
</script>

<style scoped>
.schedule-grid { width: 100%; overflow-x: auto; }
.grid-header { display: flex; border-bottom: 1px solid #e8eaf6; }
.grid-row { display: flex; border-bottom: 1px dashed #eee; }
.time-col { width: 160px; padding: 12px; border-right: 1px solid #f1f5f9; }
.day-col { flex: 1; min-width: 200px; padding: 8px; border-right: 1px solid #f1f5f9; }
.cell { min-height: 64px; display: flex; flex-wrap: wrap; gap: 6px; }
.empty { color: #90a4ae; display: flex; align-items: center; cursor: pointer; }
.caption { font-size: 12px; color: #90a4ae; }
.chip-title { font-weight: 600; font-size: 12px; }
.chip-sub { font-size: 11px; opacity: 0.85; }
</style>
