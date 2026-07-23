<script setup lang="ts">
import { ref } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const props = defineProps<{ modelValue?: string | null, fallback: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const fileInput = ref<HTMLInputElement>()

function pick() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const maxSize = 256
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      emit('update:modelValue', canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
  ;(event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar class="size-16">
      <AvatarImage :src="modelValue || '/default-avatar.png'" alt="" />
      <AvatarFallback>{{ fallback }}</AvatarFallback>
    </Avatar>
    <Button type="button" variant="outline" size="sm" @click="pick">
      Upload photo
    </Button>
    <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="onFileChange">
  </div>
</template>
