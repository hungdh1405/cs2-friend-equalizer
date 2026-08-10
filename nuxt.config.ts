import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'CS2 Friend Equalizer',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/icon-16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/icon-180.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#05070d' }
      ]
    }
  },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@nuxtjs/color-mode'],
  components: {
    dirs: [
      { path: '~/components', extensions: ['vue'] }
    ]
  },
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark'
  },
  vite: {
    plugins: [tailwindcss()]
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      nodeCompat: true,
      deployConfig: true
    },
    storage: {
      // Production: bound to the real Cloudflare KV namespace (see wrangler.toml's kv_namespaces).
      kv: { driver: 'cloudflare-kv-binding', binding: 'CS2_KV' }
    },
    devStorage: {
      // Local dev: plain filesystem, no Cloudflare account needed for day-to-day work.
      kv: { driver: 'fs', base: './.data/kv' }
    },
    // Scheduled tasks (server/tasks/discord/*.ts) for the Discord bot's host/vote reminders.
    // Wired to Cloudflare's `scheduled()` handler by the cloudflare_module preset, but ONLY
    // when this flag is on — and wrangler.toml's [triggers].crons is NOT auto-generated from
    // scheduledTasks below, so the two must be kept in sync by hand (see DESIGN.md).
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      '0 3 * * *': ['discord:hostReminder'],
      '0 5 * * *': ['discord:voteReminder'],
      '0 9 * * *': ['discord:voteReminder'],
      '0 13 * * *': ['discord:voteReminder']
    }
  },
  runtimeConfig: {
    appPin: '',
    sessionPassword: '',
    discordBotToken: '',
    discordPublicKey: '',
    discordChannelId: '',
    eventTargetVotes: 10,
    // 'true' makes the bot log instead of actually posting to Discord — for safely testing
    // scheduled tasks / interactions locally without spamming the real channel.
    discordDryRun: false
  }
})
