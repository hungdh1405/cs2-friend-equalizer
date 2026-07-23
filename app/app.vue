<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

// Roster/tags are public reads — safe to load for every visitor, no PIN needed.
await ensureRosterLoaded()
// Reflects whether *this* session already holds a live CRUD token (e.g. a refresh within
// the 15-minute window), so the unlock indicator in the nav starts correct instead of blank.
await callOnce('crud-token-check', refreshCrudTokenState)
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CrudPinDialog />
    <Toaster />
  </div>
</template>
