<script setup lang="ts">
import { ref, watch } from 'vue'
import { QrCodeIcon } from '@lucide/vue'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { renderBloodyQr } from '@/lib/qr-render'

const props = withDefaults(defineProps<{ payload: string | null, alt: string, size?: number }>(), {
  size: 128
})

// Enlarged view is re-rendered at real high resolution from the same payload rather than just
// CSS-scaling the small one up — a canvas-rendered QR blurs at its edges when stretched, and
// this is specifically for scanning, so it needs to stay crisp.
const LARGE_SIZE = 420

const dataUrl = ref<string | undefined>()
const largeDataUrl = ref<string | undefined>()
const lightboxOpen = ref(false)

// QR rendering must never run during SSR: the `qrcode` package's dependencies (pngjs et al.)
// hit Node APIs Cloudflare Workers' compatibility layer doesn't fully polyfill, which throws a
// (cryptic) 500 on every server render — the payload build is isomorphic-safe, but rendering
// isn't, and this component never actually needed it to run before hydration anyway.
watch(() => props.payload, async (payload) => {
  dataUrl.value = undefined
  largeDataUrl.value = undefined
  if (!import.meta.client || !payload) return
  dataUrl.value = await renderBloodyQr(payload, props.size)
}, { immediate: true })

async function openLightbox() {
  if (!props.payload) return
  lightboxOpen.value = true
  if (!largeDataUrl.value) {
    largeDataUrl.value = await renderBloodyQr(props.payload, LARGE_SIZE)
  }
}
</script>

<template>
  <button
    type="button"
    :disabled="!payload"
    class="block shrink-0 cursor-zoom-in rounded-md border-2 border-white bg-white p-1.5 transition-transform not-disabled:hover:scale-[1.03] disabled:cursor-default"
    :aria-label="`Xem lớn hơn: ${alt}`"
    @click="openLightbox"
  >
    <img v-if="dataUrl" :src="dataUrl" :alt="alt" :style="{ width: `${size}px`, height: `${size}px` }">
    <div v-else class="flex items-center justify-center" :style="{ width: `${size}px`, height: `${size}px` }">
      <QrCodeIcon class="size-6 animate-pulse text-black/30" />
    </div>
  </button>

  <Dialog v-model:open="lightboxOpen">
    <DialogContent class="flex flex-col items-center gap-3 sm:max-w-md">
      <DialogTitle class="sr-only">{{ alt }}</DialogTitle>
      <DialogDescription class="sr-only">Enlarged view of {{ alt }}, for easier scanning.</DialogDescription>
      <div class="rounded-lg border-2 border-white bg-white p-3">
        <img v-if="largeDataUrl" :src="largeDataUrl" :alt="alt" class="size-[min(75vw,380px)]">
        <div v-else class="flex size-[min(75vw,380px)] items-center justify-center">
          <QrCodeIcon class="size-8 animate-pulse text-black/30" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
