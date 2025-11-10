// nuxt.config.ts
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: true,

  app: {
    head: {
      title: 'Academic Scheduler+',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },

  runtimeConfig: {
    // Server-only key (safe)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // Client-exposed keys
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
  },

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/main.scss',
  ],

  build: { transpile: ['vuetify'] },

  vite: {
    ssr: { noExternal: ['vuetify'] },
    plugins: [vuetify({ autoImport: true })],
  },

  nitro: {
    preset: 'node-server',
  },
})
