// nuxt.config.ts
import vuetify from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  app: {
    head: {
      title: 'Academic Scheduler+',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },

  runtimeConfig: {
    // Private keys (server only)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    // Public keys (exposed to client)
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
  },

  css: [
  'vuetify/styles',
  '@mdi/font/css/materialdesignicons.css', // ✅ add this
  '@/assets/main.scss',
],

  build: {
    transpile: ['vuetify'],
  },

  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
    plugins: [
      // ✅ Register Vuetify plugin for Vite explicitly
      vuetify({
        autoImport: true,
      }),
    ],
  },

  nitro: {
    // ✅ Enables server/api routes (used for conflict checks, email notifications, etc.)
  },
})
