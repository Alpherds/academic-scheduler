<template>
  <v-dialog
    :model-value="show"
    max-width="720"
    @update:model-value="val => emit('update:show', val)"
  >
    <v-card>
      <v-card-title>{{ editing ? 'Edit Schedule' : 'Add Schedule' }}</v-card-title>
      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.day"
                :items="days"
                label="Day"
                required
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.period_number"
                :items="periods.map(p => p.period_number)"
                label="Period"
                required
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.class_id"
                :items="classes"
                item-title="name"
                item-value="id"
                label="Class"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.subject_id"
                :items="subjects"
                item-title="name"
                item-value="id"
                label="Subject"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.teacher_id"
                :items="teachers"
                item-title="full_name"
                item-value="id"
                label="Teacher"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.start_time" label="Start Time" type="time" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.end_time" label="End Time" type="time" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="emit('update:show', false)">Cancel</v-btn>
        <v-btn color="primary" @click="handleSave">
          {{ editing ? 'Save Changes' : 'Add Schedule' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToaster } from '~/composables/useToaster'

interface ScheduleForm {
  day: string
  period_number: number | null
  class_id: string | null
  subject_id: string | null
  teacher_id: string | null
  start_time: string
  end_time: string
}

const props = defineProps<{
  show: boolean
  editing?: any
  periods: any[]
  classes: any[]
  subjects: any[]
  teachers: any[]
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'saved', value: { action: string; payload: any }): void
}>()

const { toast } = useToaster()

const form = ref<ScheduleForm>({
  day: '',
  period_number: null,
  class_id: null,
  subject_id: null,
  teacher_id: null,
  start_time: '',
  end_time: '',
})

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

watch(
  () => props.editing,
  (val) => {
    if (val) form.value = { ...val }
    else
      form.value = {
        day: '',
        period_number: null,
        class_id: null,
        subject_id: null,
        teacher_id: null,
        start_time: '',
        end_time: '',
      }
  },
  { immediate: true }
)

function handleSave() {
  if (!form.value.day || !form.value.period_number) {
    toast('Please fill all required fields', 'error')
    return
  }

  const action = props.editing ? 'update' : 'create'
  emit('saved', { action, payload: { ...form.value, id: props.editing?.id } })
}
</script>
