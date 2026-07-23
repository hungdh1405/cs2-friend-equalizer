<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineProps<{ modelValue: number, error?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2">
      <Label for="team-count" class="text-xs text-muted-foreground">Teams (default 2)</Label>
      <Input
        id="team-count"
        type="number"
        min="2"
        class="w-16"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', Number($event))"
      />
    </div>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
