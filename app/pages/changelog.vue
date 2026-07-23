<script setup lang="ts">
import ChangeLogFeed from '@/components/changelog/ChangeLogFeed.vue'
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="font-heading text-xl font-semibold tracking-wide">Change log</h1>
      <p class="text-sm text-muted-foreground">
        Every profile edit, who made it (by IP), and when — visible to everyone, no sign-in required.
      </p>
    </div>
    <ChangeLogFeed />
  </div>
</template>
