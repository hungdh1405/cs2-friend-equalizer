<script setup lang="ts">
import { computed } from 'vue'
import { resolveIcon } from '@/lib/icons'

const props = defineProps<{ name: string }>()
const icon = computed(() => resolveIcon(props.name))
</script>

<template>
  <component :is="icon" />
</template>
