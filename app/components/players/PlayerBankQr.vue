<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '#shared/types'
import { buildVietQrPayload, getBankByKey } from '#shared/utils/vietqr'
import { pickTransferMessage, TRANSFER_AMOUNT } from '#shared/utils/transfer-messages'
import QrPreview from '@/components/QrPreview.vue'

const props = defineProps<{ player: Player, size?: number }>()

const bankShortName = computed(() => {
  const bankAccount = props.player.bankAccount
  return bankAccount ? getBankByKey(bankAccount.bankKey)?.shortName ?? bankAccount.bankKey : ''
})

// One randomly-picked trash-talk line, stable for as long as this component stays mounted —
// read-only preview, so it reuses the same fixed-amount/random-message convention as the team
// payout QRs on /event rather than inventing a second one (see TeamQrPanel.vue).
const message = pickTransferMessage()

const payload = computed(() => {
  const bankAccount = props.player.bankAccount
  if (!bankAccount) return null
  return buildVietQrPayload({
    bankKey: bankAccount.bankKey,
    accountNumber: bankAccount.accountNumber,
    amount: TRANSFER_AMOUNT,
    purpose: message
  })
})
</script>

<template>
  <div v-if="player.bankAccount" class="flex items-center gap-3">
    <QrPreview :payload="payload" :alt="`Payment QR for ${player.name}`" :size="size ?? 112" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{{ player.bankAccount.accountName || player.name }}</p>
      <p class="text-xs text-muted-foreground">{{ bankShortName }} · {{ player.bankAccount.accountNumber }}</p>
    </div>
  </div>
</template>
