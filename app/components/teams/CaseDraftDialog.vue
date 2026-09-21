<script setup lang="ts">
import type { Player } from '#shared/types'
import type { CaseReelPhase } from './PlayerCaseReel.vue'
import type { DraftTeam, DraftVerdict } from '@/lib/case-draft'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { CircleCheckIcon, PlayIcon, ShieldIcon, ShuffleIcon, Volume2Icon, VolumeXIcon, XIcon } from '@lucide/vue'
import PlayerTierMark from '@/components/players/PlayerTierMark.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useSfx } from '@/composables/useSfx'
import { createDraftSequence, getDraftVerdict, getUnrevealedPlayers } from '@/lib/case-draft'
import { getTier } from '@/lib/tier'
import CaseTeamBoard from './CaseTeamBoard.vue'
import PlayerCaseReel from './PlayerCaseReel.vue'

const props = defineProps<{
  open: boolean
  players: Player[]
  teams: DraftTeam[]
  lockedIds: string[]
  runId: number
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  complete: []
  cancel: []
}>()

const sfx = useSfx()
const TEAM_ACCENTS = ['var(--team-a)', 'var(--team-b)', 'var(--team-c)', 'var(--team-d)']
const selectionStatus = shallowRef('Preparing player selection')
const soundEnabled = shallowRef(true)
const draftOrder = shallowRef<Player[]>([])
const reelPlayers = shallowRef<Player[]>([])
const revealedPlayerIds = shallowRef<string[]>([])
const fixedPlayerIds = shallowRef<string[]>([])
const currentRound = shallowRef(0)
const reelRunId = shallowRef(0)
const roundRevealed = shallowRef(false)
const roundSettled = shallowRef(false)
const draftStarted = shallowRef(false)
const completed = shallowRef(false)
const currentRoundAutoConfirmed = shallowRef(false)
const verdict = shallowRef<DraftVerdict | null>(null)
let lastTickAt = 0
let celebrationTimer: ReturnType<typeof setTimeout> | null = null
let autoConfirmTimer: ReturnType<typeof setTimeout> | null = null

const activePlayerIds = computed(() => props.teams.flatMap(team => team.players.map(player => player.id)))
const activePlayers = computed(() => {
  const activeIds = new Set(activePlayerIds.value)
  return props.players.filter(player => activeIds.has(player.id))
})
const totalActivePlayers = computed(() => activePlayerIds.value.length)
const currentWinner = computed(() => draftOrder.value[currentRound.value] ?? null)
const winnerTeam = computed(() => props.teams.find(team => team.players.some(player => player.id === currentWinner.value?.id)) ?? null)
const winnerTeamAccent = computed(() => winnerTeam.value
  ? TEAM_ACCENTS[winnerTeam.value.index % TEAM_ACCENTS.length] ?? 'var(--primary)'
  : 'var(--primary)')
const nextWinner = computed(() => draftOrder.value[currentRound.value + 1] ?? null)
const nextWinnerTeam = computed(() => props.teams.find(team => team.players.some(player => player.id === nextWinner.value?.id)) ?? null)
const roundsAfterCurrent = computed(() => Math.max(0, draftOrder.value.length - currentRound.value - 1))
const winnerTier = computed(() => currentWinner.value ? getTier(currentWinner.value.score) : null)
const draftComplete = computed(() => totalActivePlayers.value > 0 && revealedPlayerIds.value.length >= totalActivePlayers.value)
const currentPickNumber = computed(() => Math.min(
  revealedPlayerIds.value.length + (roundRevealed.value ? 0 : 1),
  totalActivePlayers.value
))
const progressPercent = computed(() => totalActivePlayers.value
  ? Math.round((revealedPlayerIds.value.length / totalActivePlayers.value) * 100)
  : 0)
const reservePlayers = computed(() => {
  const assignedIds = new Set(activePlayerIds.value)
  return props.players.filter(player => !assignedIds.has(player.id))
})

function stopSound() {
  sfx.stopCaseTension()
  if (celebrationTimer) clearTimeout(celebrationTimer)
  if (autoConfirmTimer) clearTimeout(autoConfirmTimer)
  celebrationTimer = null
  autoConfirmTimer = null
}

function updateVerdict() {
  verdict.value = currentWinner.value && winnerTeam.value
    ? getDraftVerdict(currentWinner.value, winnerTeam.value)
    : null
}

function selectingMessage() {
  return winnerTeam.value
    ? `Selecting for ${winnerTeam.value.name}`
    : `Selecting player ${currentPickNumber.value}`
}

function resetRun() {
  stopSound()
  const sequence = createDraftSequence(
    props.teams,
    props.lockedIds
  )

  draftOrder.value = sequence.rounds
  revealedPlayerIds.value = sequence.preselectedPlayerIds
  fixedPlayerIds.value = sequence.preselectedPlayerIds
  reelPlayers.value = getUnrevealedPlayers(activePlayers.value, sequence.preselectedPlayerIds)
  currentRound.value = 0
  reelRunId.value = props.runId * 100
  roundRevealed.value = false
  roundSettled.value = false
  draftStarted.value = false
  completed.value = false
  currentRoundAutoConfirmed.value = false
  lastTickAt = 0
  updateVerdict()

  if (!sequence.rounds.length) {
    selectionStatus.value = 'All team positions are confirmed'
    completed.value = true
    void nextTick(() => emit('complete'))
    return
  }

  if (sequence.rounds.length === 1) {
    draftStarted.value = true
    roundSettled.value = true
    currentRoundAutoConfirmed.value = true
    handleReveal(true)
    return
  }

  selectionStatus.value = winnerTeam.value
    ? `${winnerTeam.value.name} picks next`
    : 'Teams ready'
}

function handleOpenChange(open: boolean) {
  if (!open) {
    stopSound()
    if (!completed.value) emit('cancel')
  }
  emit('update:open', open)
}

function handlePhase(nextPhase: CaseReelPhase) {
  if (nextPhase === 'finalizing' && soundEnabled.value) sfx.startCaseTension()
}

function handleTick(payload: { index: number, speed: number }) {
  if (!soundEnabled.value) return
  const now = performance.now()
  const minimumGap = payload.speed > 0.8 ? 36 : payload.speed > 0.4 ? 62 : 105
  if (now - lastTickAt < minimumGap) return
  lastTickAt = now
  sfx.playCaseTick(payload.speed)
}

function handleReveal(automatic = false) {
  const winner = currentWinner.value
  if (!winner || roundRevealed.value) return

  revealedPlayerIds.value = [...revealedPlayerIds.value, winner.id]
  roundRevealed.value = true
  const teamName = winnerTeam.value?.name ?? 'their team'
  const isFinalPick = revealedPlayerIds.value.length >= totalActivePlayers.value

  selectionStatus.value = automatic
    ? `${winner.name} confirmed for ${teamName}`
    : `${winner.name} joins ${teamName}`
  if (isFinalPick) {
    completed.value = true
    emit('complete')
  }

  sfx.stopCaseTension()
  if (!soundEnabled.value) return
  sfx.playCaseImpact()
  if (isFinalPick) celebrationTimer = setTimeout(() => sfx.playCaseCelebration(), 260)
}

function handleSequenceComplete() {
  roundSettled.value = true
  if (roundsAfterCurrent.value !== 1 || completed.value) return

  autoConfirmTimer = setTimeout(() => {
    autoConfirmTimer = null
    currentRound.value += 1
    roundRevealed.value = false
    currentRoundAutoConfirmed.value = true
    updateVerdict()
    handleReveal(true)
  }, 650)
}

function startFirstRound() {
  if (!currentWinner.value || draftStarted.value) return
  sfx.arm()
  draftStarted.value = true
  selectionStatus.value = selectingMessage()
}

function startNextRound() {
  if (!roundRevealed.value || !roundSettled.value || draftComplete.value || roundsAfterCurrent.value <= 1) return
  sfx.arm()
  stopSound()
  currentRound.value += 1
  roundRevealed.value = false
  roundSettled.value = false
  currentRoundAutoConfirmed.value = false
  reelPlayers.value = getUnrevealedPlayers(activePlayers.value, revealedPlayerIds.value)
  lastTickAt = 0
  updateVerdict()
  selectionStatus.value = selectingMessage()
  reelRunId.value += 1
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  if (!soundEnabled.value) sfx.stopCaseTension()
}

watch(() => props.open, (open) => {
  if (open) resetRun()
}, { immediate: true })

watch(() => props.runId, () => {
  if (props.open) resetRun()
})

onBeforeUnmount(stopSound)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      :animate-zoom="false"
      :show-close-button="false"
      class="case-draft-dialog max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-[min(68rem,calc(100%-2rem))]"
      @escape-key-down.prevent
      @interact-outside.prevent
      @pointer-down-outside.prevent
    >
      <DialogHeader class="draft-dialog-header flex-row items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="draft-title-icon" aria-hidden="true"><ShuffleIcon /></span>
            <DialogTitle class="font-heading text-lg tracking-wide sm:text-xl">Random Team Selection</DialogTitle>
          </div>
          <DialogDescription class="sr-only">
            Randomly select the next player for each team.
          </DialogDescription>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <Button class="size-11 sm:size-9" variant="ghost" size="icon-lg" :aria-label="soundEnabled ? 'Mute selection sounds' : 'Enable selection sounds'" @click="toggleSound">
            <Volume2Icon v-if="soundEnabled" />
            <VolumeXIcon v-else />
          </Button>
          <DialogClose as-child>
            <Button class="size-11 sm:size-9" variant="ghost" size="icon-lg" aria-label="Close random team selection">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
      </DialogHeader>

      <div class="draft-progress" role="status" aria-live="polite">
        <div class="draft-progress-copy">
          <span class="draft-status-dot" :class="roundRevealed && 'is-confirmed'" aria-hidden="true" />
          <strong>{{ selectionStatus }}</strong>
          <span class="draft-progress-count font-mono tabular-nums">
            {{ revealedPlayerIds.length }} of {{ totalActivePlayers }} picked
          </span>
        </div>
        <div
          class="draft-progress-track"
          role="progressbar"
          aria-label="Team selection progress"
          :aria-valuemin="0"
          :aria-valuemax="totalActivePlayers"
          :aria-valuenow="revealedPlayerIds.length"
        >
          <span :style="{ width: `${progressPercent}%` }" />
        </div>
      </div>

      <PlayerCaseReel
        v-if="draftStarted && currentWinner && !currentRoundAutoConfirmed"
        :players="reelPlayers"
        :winner="currentWinner"
        :run-id="reelRunId"
        :pick-number="currentPickNumber"
        :total-picks="totalActivePlayers"
        :team-name="winnerTeam?.name ?? 'Team'"
        :team-accent="winnerTeamAccent"
        @phase="handlePhase"
        @tick="handleTick"
        @reveal="handleReveal"
        @complete="handleSequenceComplete"
      />

      <section
        v-else-if="!roundRevealed"
        class="draft-ready"
        :style="{ '--ready-accent': winnerTeamAccent }"
        aria-labelledby="draft-ready-title"
      >
        <span class="draft-ready-icon" aria-hidden="true"><ShieldIcon /></span>
        <div class="min-w-0 flex-1">
          <span class="draft-ready-label">{{ currentWinner ? 'Up next' : 'Complete' }}</span>
          <h2 id="draft-ready-title" class="font-heading text-base font-semibold tracking-wide">
            {{ currentWinner ? winnerTeam?.name : 'Teams ready' }}
          </h2>
          <p v-if="currentWinner && revealedPlayerIds.length">
            {{ revealedPlayerIds.length }} fixed {{ revealedPlayerIds.length === 1 ? 'player' : 'players' }} already set.
          </p>
          <p v-else-if="!currentWinner">All selected players are fixed.</p>
        </div>
        <Button
          v-if="currentWinner"
          class="draft-start-action min-h-11 shrink-0 px-5 sm:min-h-9"
          @click="startFirstRound"
        >
          <PlayIcon data-icon="inline-start" />
          Start {{ winnerTeam?.name }} spin
        </Button>
        <DialogClose v-else as-child>
          <Button class="draft-start-action min-h-11 shrink-0 px-5 sm:min-h-9">Finish selection</Button>
        </DialogClose>
      </section>

      <section
        v-if="roundRevealed && verdict && winnerTeam && winnerTier"
        class="selection-result"
        :style="{ '--result-accent': winnerTier.colorVar }"
        aria-live="polite"
      >
        <span class="selection-result-icon" aria-hidden="true"><CircleCheckIcon /></span>
        <div class="min-w-0 flex-1">
          <div class="selection-result-title">
            <strong>{{ currentWinner?.name }} joins {{ winnerTeam.name }}</strong>
            <PlayerTierMark
              v-if="currentWinner"
              :score="currentWinner.score"
              size="compact"
              class="selection-tier-mark"
            />
          </div>
          <p>{{ verdict.message }}</p>
        </div>

        <Button
          v-if="!draftComplete && roundsAfterCurrent > 1"
          class="selection-action min-h-11 shrink-0 px-5 sm:min-h-9"
          :disabled="!roundSettled"
          @click="startNextRound"
        >
          <PlayIcon data-icon="inline-start" />
          Spin for {{ nextWinnerTeam?.name ?? 'next team' }}
        </Button>
        <DialogClose v-else-if="draftComplete" as-child>
          <Button class="selection-action min-h-11 shrink-0 px-5 sm:min-h-9">Finish selection</Button>
        </DialogClose>
      </section>

      <CaseTeamBoard
        :teams="teams"
        :reserve-players="reservePlayers"
        :revealed-player-ids="revealedPlayerIds"
        :fixed-player-ids="fixedPlayerIds"
        :active-player-id="roundRevealed ? currentWinner?.id ?? '' : ''"
        :complete="draftComplete"
      />
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.case-draft-dialog {
  border-color: color-mix(in oklch, var(--tier-a) 24%, var(--border));
  border-radius: calc(var(--radius-xl) + 0.35rem);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--tier-a) 5%, transparent), transparent 30%),
    var(--popover);
  box-shadow: 0 28px 90px oklch(0 0 0 / 62%), 0 0 42px color-mix(in oklch, var(--tier-a) 7%, transparent);
}

.draft-title-icon {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 1px solid color-mix(in oklch, var(--tier-a) 45%, var(--border));
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--tier-a) 8%, transparent);
  color: var(--tier-a);
}

.draft-title-icon :deep(svg) {
  width: 0.95rem;
  height: 0.95rem;
}

.draft-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid color-mix(in oklch, var(--primary) 18%, var(--border));
  border-radius: var(--radius-xl);
  padding: 0.65rem 0.75rem;
  background: color-mix(in oklch, var(--background) 64%, transparent);
}

.draft-progress-copy {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.74rem;
}

.draft-progress-copy strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draft-status-dot {
  width: 0.48rem;
  height: 0.48rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 0 9px color-mix(in oklch, var(--primary) 72%, transparent);
}

.draft-status-dot.is-confirmed {
  background: var(--tier-s);
  box-shadow: 0 0 9px color-mix(in oklch, var(--tier-s) 70%, transparent);
}

.draft-progress-count {
  margin-left: auto;
  flex: 0 0 auto;
  color: var(--muted-foreground);
  font-size: 0.66rem;
}

.draft-progress-track {
  height: 0.28rem;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in oklch, var(--muted) 70%, transparent);
}

.draft-progress-track > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), var(--tier-a));
  box-shadow: 0 0 10px color-mix(in oklch, var(--primary) 48%, transparent);
  transition: width 320ms ease-out;
}

.draft-ready {
  --ready-accent: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 9.5rem;
  border: 1px solid color-mix(in oklch, var(--ready-accent) 38%, var(--border));
  border-radius: calc(var(--radius-xl) + 0.15rem);
  padding: clamp(1rem, 3vw, 1.5rem);
  background:
    radial-gradient(circle at 15% 50%, color-mix(in oklch, var(--ready-accent) 12%, transparent), transparent 38%),
    color-mix(in oklch, var(--card) 84%, var(--background));
  box-shadow: inset 0 1px oklch(1 0 0 / 4%);
}

.draft-ready-icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in oklch, var(--ready-accent) 52%, var(--border));
  border-radius: var(--radius-xl);
  background: color-mix(in oklch, var(--ready-accent) 11%, transparent);
  color: var(--ready-accent);
  box-shadow: 0 0 22px color-mix(in oklch, var(--ready-accent) 12%, transparent);
}

.draft-ready-icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

.draft-ready-label {
  color: var(--ready-accent);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.draft-ready p {
  margin-top: 0.25rem;
  color: var(--muted-foreground);
  font-size: 0.74rem;
  line-height: 1.5;
}

.selection-result {
  --result-accent: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid color-mix(in oklch, var(--result-accent) 42%, var(--border));
  border-radius: var(--radius-xl);
  padding: 0.75rem;
  background:
    linear-gradient(100deg, color-mix(in oklch, var(--result-accent) 9%, transparent), transparent 44%),
    color-mix(in oklch, var(--card) 82%, transparent);
  box-shadow: inset 0 1px oklch(1 0 0 / 4%);
}

.selection-result-icon {
  display: grid;
  width: 2.15rem;
  height: 2.15rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in oklch, var(--result-accent) 14%, transparent);
  color: var(--result-accent);
}

.selection-result-icon :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.selection-result-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.6rem;
}

.selection-result-title strong {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  letter-spacing: 0.02em;
}

.selection-tier-mark {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.8rem;
}

.selection-result p {
  margin-top: 0.16rem;
  color: var(--muted-foreground);
  font-size: 0.72rem;
  line-height: 1.45;
}

@media (max-width: 639px) {
  .case-draft-dialog {
    max-width: calc(100% - 0.75rem);
    border-radius: var(--radius-xl);
  }

  .draft-progress-count {
    font-size: 0.58rem;
  }

  .selection-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .draft-ready {
    align-items: flex-start;
    flex-wrap: wrap;
    min-height: 0;
  }

  .draft-ready-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .draft-start-action {
    width: 100%;
  }

  .selection-result-icon {
    width: 1.9rem;
    height: 1.9rem;
  }

  .selection-action {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .draft-progress-track > span {
    transition: none;
  }
}
</style>
