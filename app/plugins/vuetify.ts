// /plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 👇 Import MDI icons set
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1E40AF',
            secondary: '#475569',
            surface: '#FFFFFF',
            background: '#F9FAFB',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
