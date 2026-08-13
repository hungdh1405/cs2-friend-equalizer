<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Player } from '#shared/types'
import { QrCodeIcon } from '@lucide/vue'
import { renderBloodyQr } from '@/lib/qr-render'
import { buildVietQrPayload, getBankByKey } from '#shared/utils/vietqr'
import { pickTransferMessage, TRANSFER_AMOUNT } from '#shared/utils/transfer-messages'

const props = defineProps<{ player: Player, size?: number }>()

const bankShortName = computed(() => {
  const bankAccount = props.player.bankAccount
  return bankAccount ? getBankByKey(bankAccount.bankKey)?.shortName ?? bankAccount.bankKey : ''
})

// Regenerated whenever the player (or their linked account) changes — read-only preview, so it
// reuses the same fixed-amount/random-message convention as the team payout QRs on /event
// rather than inventing a second one (see TeamQrPanel.vue, shared/utils/transfer-messages.ts).
const qrDataUrl = ref<string | undefined>()
watch(() => [props.player.id, props.player.bankAccount?.bankKey, props.player.bankAccount?.accountNumber], async () => {
  qrDataUrl.value = undefined
  const bankAccount = props.player.bankAccount
  if (!bankAccount) return
  const payload = buildVietQrPayload({
    bankKey: bankAccount.bankKey,
    accountNumber: bankAccount.accountNumber,
    amount: TRANSFER_AMOUNT,
    purpose: pickTransferMessage()
  })
  if (!payload) return
  qrDataUrl.value = await renderBloodyQr(payload, props.size ?? 200)
}, { immediate: true })
</script>

<template>
  <div v-if="player.bankAccount" class="flex items-center gap-3">
    <div class="shrink-0 rounded-md border-2 border-white bg-white p-1.5">
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
</template>
