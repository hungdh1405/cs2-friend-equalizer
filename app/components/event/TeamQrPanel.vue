<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { EventVoter } from '#shared/types'
import { BanknoteIcon, QrCodeIcon } from '@lucide/vue'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { buildVietQrPayload, getBankByKey } from '#shared/utils/vietqr'
import { pickTransferMessage } from '#shared/utils/transfer-messages'
import { renderBloodyQr } from '@/lib/qr-render'

const props = defineProps<{
  teamA: EventVoter[]
  teamB: EventVoter[]
  leaderA?: string
  leaderB?: string
}>()

const { players } = usePlayers()

// Fixed per the feature request — not user-configurable.
const TRANSFER_AMOUNT = 50000

function avatarUrl(voter: { discordUserId: string, avatar: string | null }) {
  return voter.avatar ? `https://cdn.discordapp.com/avatars/${voter.discordUserId}/${voter.avatar}.png` : undefined
}

function bankAccountFor(discordUserId: string) {
  return players.value.find(p => p.discordUserId === discordUserId)?.bankAccount
}

// The leader gets the QR spotlight if they've linked a bank account; otherwise fall back to
// whoever on the team has one, so a team never shows "no QR" just because its leader forgot to
// link theirs.
function qrPersonFor(team: EventVoter[], leaderId?: string) {
  const leader = leaderId ? team.find(v => v.discordUserId === leaderId) : undefined
  if (leader && bankAccountFor(leader.discordUserId)) return leader
  return team.find(v => bankAccountFor(v.discordUserId))
}

const qrPersonA = computed(() => qrPersonFor(props.teamA, props.leaderA))
const qrPersonB = computed(() => qrPersonFor(props.teamB, props.leaderB))

// Each person gets one randomly-picked trash-talk line, stable for as long as this panel stays
// mounted — re-picking on every render would make the QR image flicker/regenerate pointlessly.
const messageCache = new Map<string, string>()
function messageFor(discordUserId: string) {
  if (!messageCache.has(discordUserId)) messageCache.set(discordUserId, pickTransferMessage())
  return messageCache.get(discordUserId)!
}

// QR payload building + rendering both happen client-side only (see shared/utils/vietqr.ts) —
// no server round trip needed, so this is just an in-memory cache of discordUserId -> data URL.
const qrDataUrls = ref<Record<string, string>>({})

async function renderQr(discordUserId: string) {
  if (qrDataUrls.value[discordUserId]) return
  const bankAccount = bankAccountFor(discordUserId)
  if (!bankAccount) return
  const payload = buildVietQrPayload({
    bankKey: bankAccount.bankKey,
    accountNumber: bankAccount.accountNumber,
    amount: TRANSFER_AMOUNT,
    purpose: messageFor(discordUserId)
  })
  if (!payload) return
  const dataUrl = await renderBloodyQr(payload)
  qrDataUrls.value = { ...qrDataUrls.value, [discordUserId]: dataUrl }
}

watchEffect(() => {
  if (qrPersonA.value) renderQr(qrPersonA.value.discordUserId)
  if (qrPersonB.value) renderQr(qrPersonB.value.discordUserId)
})

function bankShortName(discordUserId: string) {
  const bankAccount = bankAccountFor(discordUserId)
  if (!bankAccount) return ''
  return getBankByKey(bankAccount.bankKey)?.shortName ?? bankAccount.bankKey
}

function accountHolder(voter: EventVoter) {
  return bankAccountFor(voter.discordUserId)?.accountName || voter.username
}

function accountNumber(discordUserId: string) {
  return bankAccountFor(discordUserId)?.accountNumber ?? ''
}

const viewAllOpen = ref(false)
const allWithBank = computed(() => [...props.teamA, ...props.teamB].filter(v => bankAccountFor(v.discordUserId)))

watchEffect(() => {
  if (!viewAllOpen.value) return
  for (const voter of allWithBank.value) renderQr(voter.discordUserId)
})
</script>

<template>
  <div v-if="qrPersonA || qrPersonB || allWithBank.length" class="border-t border-red-900/40 pt-3">
    <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-yellow-400/80 uppercase">
      <BanknoteIcon class="size-3" /> Quỹ chiến — Trả nợ danh dự (50.000đ)
    </p>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-if="qrPersonA"
        class="hud-frame flex flex-col items-center gap-2 rounded-lg border border-red-600/60 bg-gradient-to-b from-red-950/40 to-black/60 p-3"
        style="--hud-accent: #ef4444; box-shadow: inset 0 0 16px rgba(200,10,25,0.25)"
      >
        <div class="flex items-center gap-1.5">
          <Avatar class="size-5">
            <AvatarImage :src="avatarUrl(qrPersonA)" alt="" />
            <AvatarFallback class="text-[10px]">{{ qrPersonA.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
          </Avatar>
          <span class="text-xs font-medium text-red-50">{{ accountHolder(qrPersonA) }}</span>
        </div>
        <div class="relative">
          <div class="absolute -top-1.5 left-1/2 flex -translate-x-1/2 gap-3">
            <span class="h-2.5 w-1 rounded-b-full bg-red-600" />
            <span class="h-3.5 w-1 rounded-b-full bg-red-600" />
            <span class="h-2 w-1 rounded-b-full bg-red-600" />
          </div>
          <div class="rounded-md border-2 border-white bg-white p-1.5">
            <img
              v-if="qrDataUrls[qrPersonA.discordUserId]"
              :src="qrDataUrls[qrPersonA.discordUserId]"
              :alt="`Mã QR chuyển khoản cho ${qrPersonA.username}`"
              class="size-32"
            >
            <div v-else class="flex size-32 items-center justify-center">
              <QrCodeIcon class="size-6 animate-pulse text-black/30" />
            </div>
          </div>
        </div>
        <p class="text-center text-[11px] text-red-200/80">{{ bankShortName(qrPersonA.discordUserId) }} · {{ accountNumber(qrPersonA.discordUserId) }}</p>
      </div>
      <div v-else class="flex items-center justify-center rounded-lg border border-dashed border-red-800/40 bg-black/20 p-3 text-center text-[11px] text-red-300/40">
        Chưa ai trong Đội A liên kết ngân hàng
      </div>

      <div
        v-if="qrPersonB"
        class="hud-frame flex flex-col items-center gap-2 rounded-lg border border-orange-500/60 bg-gradient-to-b from-orange-950/40 to-black/60 p-3"
        style="--hud-accent: #f97316; box-shadow: inset 0 0 16px rgba(249,115,22,0.2)"
      >
        <div class="flex items-center gap-1.5">
          <Avatar class="size-5">
            <AvatarImage :src="avatarUrl(qrPersonB)" alt="" />
            <AvatarFallback class="text-[10px]">{{ qrPersonB.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
          </Avatar>
          <span class="text-xs font-medium text-orange-50">{{ accountHolder(qrPersonB) }}</span>
        </div>
        <div class="relative">
          <div class="absolute -top-1.5 left-1/2 flex -translate-x-1/2 gap-3">
            <span class="h-2 w-1 rounded-b-full bg-orange-600" />
            <span class="h-3.5 w-1 rounded-b-full bg-orange-600" />
            <span class="h-2.5 w-1 rounded-b-full bg-orange-600" />
          </div>
          <div class="rounded-md border-2 border-white bg-white p-1.5">
            <img
              v-if="qrDataUrls[qrPersonB.discordUserId]"
              :src="qrDataUrls[qrPersonB.discordUserId]"
              :alt="`Mã QR chuyển khoản cho ${qrPersonB.username}`"
              class="size-32"
            >
            <div v-else class="flex size-32 items-center justify-center">
              <QrCodeIcon class="size-6 animate-pulse text-black/30" />
            </div>
          </div>
        </div>
        <p class="text-center text-[11px] text-orange-200/80">{{ bankShortName(qrPersonB.discordUserId) }} · {{ accountNumber(qrPersonB.discordUserId) }}</p>
      </div>
      <div v-else class="flex items-center justify-center rounded-lg border border-dashed border-orange-800/40 bg-black/20 p-3 text-center text-[11px] text-orange-300/40">
        Chưa ai trong Đội B liên kết ngân hàng
      </div>
    </div>

    <Button v-if="allWithBank.length" variant="outline" size="sm" class="mt-3 border-yellow-600/50 text-yellow-300 hover:bg-yellow-950/30" @click="viewAllOpen = true">
      <QrCodeIcon data-icon="inline-start" />
      Xem QR từng chiến binh ({{ allWithBank.length }})
    </Button>

    <Dialog v-model:open="viewAllOpen">
      <DialogContent lang="vi" class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>QR chuyển khoản từng chiến binh</DialogTitle>
          <DialogDescription>
            Thủ lĩnh đưa từng mã cho đúng người để họ tự trả quỹ chiến — mỗi người 50.000đ.
          </DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="voter in allWithBank"
            :key="voter.discordUserId"
            class="hud-frame flex flex-col items-center gap-1.5 rounded-lg border border-red-700/40 bg-gradient-to-b from-[#1a0000] to-black/80 p-2.5"
            style="--hud-accent: #ef4444"
          >
            <div class="flex items-center gap-1.5">
              <Avatar class="size-5">
                <AvatarImage :src="avatarUrl(voter)" alt="" />
                <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
              </Avatar>
              <span class="truncate text-xs font-medium text-red-50">{{ accountHolder(voter) }}</span>
            </div>
            <div class="relative">
              <div class="absolute -top-1 left-1/2 flex -translate-x-1/2 gap-2">
                <span class="h-1.5 w-0.5 rounded-b-full bg-red-600" />
                <span class="h-2.5 w-0.5 rounded-b-full bg-red-600" />
                <span class="h-1.5 w-0.5 rounded-b-full bg-red-600" />
              </div>
              <div class="rounded-md border-2 border-white bg-white p-1">
                <img
                  v-if="qrDataUrls[voter.discordUserId]"
                  :src="qrDataUrls[voter.discordUserId]"
                  :alt="`Mã QR chuyển khoản cho ${voter.username}`"
                  class="size-28"
                >
                <div v-else class="flex size-28 items-center justify-center">
                  <QrCodeIcon class="size-5 animate-pulse text-black/30" />
                </div>
              </div>
            </div>
            <p class="text-center text-[10px] text-red-200/80">{{ bankShortName(voter.discordUserId) }} · {{ accountNumber(voter.discordUserId) }}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
