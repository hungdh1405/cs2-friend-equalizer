<script setup lang="ts">
import { CalendarIcon, ScrollTextIcon, ShieldHalfIcon, TagsIcon, UsersIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import MatchCountdownAlert from '@/components/event/MatchCountdownAlert.vue'

const navItems = [
  { to: '/', label: 'Roster', icon: UsersIcon },
  { to: '/event', label: 'Event', icon: CalendarIcon },
  { to: '/teams', label: 'Teams', icon: ShieldHalfIcon },
  { to: '/tags', label: 'Tags', icon: TagsIcon },
  { to: '/changelog', label: 'Log', icon: ScrollTextIcon }
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <ClientOnly>
      <MatchCountdownAlert />
    </ClientOnly>

    <header class="sticky top-0 z-20 border-b border-primary/25 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div class="mx-auto flex min-h-12 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3 py-1.5 sm:px-4">
        <div class="flex min-w-0 items-center gap-2 sm:gap-4">
          <NuxtLink to="/" class="flex shrink-0 items-center gap-1.5">
            <img src="/icons/icon-32.png" alt="" class="size-6 rounded-sm sm:size-7">
            <span class="neon-text font-heading text-sm font-bold tracking-wide text-primary sm:text-base">
              CS2//EQ
            </span>
          </NuxtLink>
          <nav class="flex items-center gap-0.5 sm:gap-1">
            <Button v-for="item in navItems" :key="item.to" as-child variant="ghost" size="sm" class="px-2 sm:px-3">
              <NuxtLink :to="item.to" class="flex items-center gap-1.5">
                <component :is="item.icon" class="size-4" />
                <span class="hidden sm:inline">{{ item.label }}</span>
              </NuxtLink>
            </Button>
          </nav>
        </div>
        <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <UnlockIndicator />
          <ModeToggle />
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-3 py-4 sm:px-4">
      <slot />
    </main>

    <footer class="mx-auto max-w-6xl px-3 py-4 text-center text-xs text-muted-foreground sm:px-4">
      <NuxtLink to="/terms" class="hover:text-foreground hover:underline">Terms of Service</NuxtLink>
      <span class="mx-2">·</span>
      <NuxtLink to="/privacy" class="hover:text-foreground hover:underline">Privacy Policy</NuxtLink>
    </footer>
  </div>
</template>
