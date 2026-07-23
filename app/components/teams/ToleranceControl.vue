<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()
</script>

<template>
  <div class="flex items-center gap-2">
    <Label for="tolerance" class="text-xs text-muted-foreground">Acceptable diff</Label>
    <Input
      id="tolerance"
      type="number"
      min="0"
      class="w-16"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', Number($event))"
    />
  </div>
</template>
