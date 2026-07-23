<script setup lang="ts">
import { ref } from 'vue'
import type { TagKind } from '#shared/types'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TagIconPicker from './TagIconPicker.vue'

const emit = defineEmits<{ created: [{ label: string, icon: string, kind: TagKind }] }>()

const label = ref('')
const icon = ref('Tag')
const kind = ref<TagKind>('positive')

function submit() {
  if (!label.value.trim()) return
  emit('created', { label: label.value.trim(), icon: icon.value, kind: kind.value })
  label.value = ''
  icon.value = 'Tag'
  kind.value = 'positive'
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
    <Field class="min-w-32 flex-1">
      <FieldLabel>New tag</FieldLabel>
      <Input v-model="label" placeholder="e.g. Clutch King" @keydown.enter.prevent="submit" />
    </Field>
    <TagIconPicker v-model="icon" />
    <Select v-model="kind">
      <SelectTrigger class="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <Button type="button" size="sm" :disabled="!label.trim()" @click="submit">
      Add tag
    </Button>
  </div>
</template>
