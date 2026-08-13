<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Player } from '#shared/types'
import { ROLES } from '#shared/types'
import { QrCodeIcon } from '@lucide/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'
import { renderBloodyQr } from '@/lib/qr-render'
import { buildVietQrPayload, getBankByKey } from '#shared/utils/vietqr'
import { pickTransferMessage, TRANSFER_AMOUNT } from '#shared/utils/transfer-messages'
import TagBadge from './TagBadge.vue'

const props = defineProps<{ open: boolean, player: Player | null }>()
const emit = defineEmits<{ 'update:open': [boolean], 'edit': [Player], 'delete': [Player] }>()

const { tagById } = useTags()
const isUnlocked = useIsCrudUnlocked()

const initials = computed(() => props.player?.name.trim().slice(0, 2).toUpperCase() ?? '?')
const roleLabel = computed(() => ROLES.find(role => role.value === props.player?.role)?.label ?? props.player?.role)
const tagIds = computed(() => Object.keys(props.player?.tagLevels ?? {}))
const tier = computed(() => getTier(props.player?.score ?? 0))

const bankShortName = computed(() => {
  const bankAccount = props.player?.bankAccount
  return bankAccount ? getBankByKey(bankAccount.bankKey)?.shortName ?? bankAccount.bankKey : ''
})

// Regenerated fresh each time the dialog opens on a (possibly different) player — this is a
// read-only preview, so it reuses the same fixed-amount/random-message convention as the
// team payout QRs on /event rather than inventing a second one.
const qrDataUrl = ref<string | undefined>()
watch([() => props.open, () => props.player?.id], async () => {
  qrDataUrl.value = undefined
  const bankAccount = props.player?.bankAccount
  if (!props.open || !bankAccount) return
  const payload = buildVietQrPayload({
    bankKey: bankAccount.bankKey,
    accountNumber: bankAccount.accountNumber,
    amount: TRANSFER_AMOUNT,
    purpose: pickTransferMessage()
  })
  if (!payload) return
  qrDataUrl.value = await renderBloodyQr(payload, 200)
}, { immediate: true })

function tagPropsFor(tagId: string) {
  const tag = tagById(tagId)
  return {
    label: tag?.label ?? tagId,
    icon: tag?.icon ?? 'Tag',
    kind: tag?.kind ?? 'neutral' as const,
    level: props.player?.tagLevels[tagId] ?? 3
  }
}

// Only real uploaded photos are worth a full-size look — the generic default-avatar
// fallback has nothing more to show, so it stays a plain (non-clickable) image.
const lightboxOpen = ref(false)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      v-if="player"
      class="max-h-[85vh] w-full overflow-y-auto border-none bg-transparent p-0 ring-0 sm:max-w-md data-open:slide-in-from-bottom-3 data-closed:slide-out-to-bottom-3 duration-300"
      :animate-zoom="false"
      :show-close-button="false"
    >
      <DialogTitle class="sr-only">{{ player.name }}</DialogTitle>
      <DialogDescription class="sr-only">Full player details, tags, and score for {{ player.name }}.</DialogDescription>
      <Card
        class="player-card carbon-fiber hud-frame-right dialog-materialize h-full border-border/60 bg-card/80"
        :class="tier.cardBorderClass"
        :style="{ '--hud-accent': tier.colorVar }"
      >
        <div class="scanlines-diagonal" />
        <div class="holo-sheen" />
        <div class="holo-grid pointer-events-none absolute inset-0 opacity-90" />
        <div class="spark-particles">
          <span /><span /><span />
        </div>

        <CardHeader class="flex-row items-start gap-3 space-y-0">
          <div class="avatar-halo shrink-0">
            <button
              v-if="player.hasPhoto"
              type="button"
              class="avatar-aura block cursor-zoom-in rounded-full"
              aria-label="View full-size photo"
              @click="lightboxOpen = true"
            >
              <Avatar class="size-14 ring-1 ring-border">
                <AvatarImage :src="`/api/players/${player.id}/photo`" alt="" />
                <AvatarFallback>{{ initials }}</AvatarFallback>
              </Avatar>
            </button>
            <Avatar v-else class="avatar-aura size-14 ring-1 ring-border">
              <AvatarImage src="/default-avatar.png" alt="" />
              <AvatarFallback>{{ initials }}</AvatarFallback>
            </Avatar>
          </div>
          <div class="min-w-0 flex-1">
            <CardTitle class="name-underline w-fit truncate font-heading text-lg tracking-wide">
              {{ player.name }}
            </CardTitle>
            <p class="role-capsule mt-1.5 text-xs text-muted-foreground uppercase">
              <span class="inline-block size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: tier.colorVar, boxShadow: `0 0 4px ${tier.colorVar}` }" />
              {{ roleLabel }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <div
              :class="cn('tier-pulse tier-badge-3d flex size-11 shrink-0 items-center justify-center font-heading text-2xl font-black', tier.badgeClass, tier.badgeGlowClass)"
              :title="tier.label"
            >
              {{ tier.key }}
            </div>
            <div class="score-module flex flex-col items-end px-2 py-1">
              <span class="font-mono text-[9px] tracking-widest text-muted-foreground">SCORE</span>
              <div class="font-heading text-xl leading-none font-bold tabular-nums">{{ player.score }}</div>
            </div>
          </div>
        </CardHeader>

        <div class="-mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted px-4">
          <div
            :class="cn('h-full rounded-full', tier.badgeClass)"
            :style="{ width: `${Math.min(100, player.score)}%` }"
          />
        </div>

        <CardContent>
          <div class="tag-panel carbon-fiber flex flex-wrap gap-1.5 bg-background/30 p-3">
            <TagBadge v-for="tagId in tagIds" :key="tagId" v-bind="tagPropsFor(tagId)" />
            <span v-if="!tagIds.length" class="text-xs text-muted-foreground">No tags yet.</span>
          </div>

          <div v-if="player.bankAccount" class="mt-3 flex items-center gap-3 rounded-lg border border-border/60 bg-background/30 p-3">
            <div class="shrink-0 rounded-md border-2 border-white bg-white p-1">
              <img v-if="qrDataUrl" :src="qrDataUrl" :alt="`Payment QR for ${player.name}`" class="size-20">
              <div v-else class="flex size-20 items-center justify-center">
                <QrCodeIcon class="size-5 animate-pulse text-black/30" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ player.bankAccount.accountName || player.name }}</p>
              <p class="text-xs text-muted-foreground">{{ bankShortName }} · {{ player.bankAccount.accountNumber }}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter class="justify-end gap-2">
          <Button variant="outline" size="sm" @click="emit('update:open', false)">
            Close
          </Button>
          <template v-if="isUnlocked">
            <Button variant="outline" size="sm" class="btn-neon" @click="emit('edit', player)">
              Edit
            </Button>
            <Button variant="ghost" size="sm" class="btn-neon text-destructive" @click="emit('delete', player)">
              Delete
            </Button>
          </template>
        </CardFooter>
      </Card>
    </DialogContent>
  </Dialog>

  <Dialog v-if="player?.hasPhoto" :open="lightboxOpen" @update:open="lightboxOpen = $event">
    <DialogContent class="flex items-center justify-center border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-lg">
      <DialogTitle class="sr-only">{{ player.name }}'s photo</DialogTitle>
      <DialogDescription class="sr-only">Full-size photo of {{ player.name }}.</DialogDescription>
      <img
        :src="`/api/players/${player.id}/photo`"
        :alt="`${player.name}'s photo`"
        class="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
      >
    </DialogContent>
  </Dialog>
</template>
