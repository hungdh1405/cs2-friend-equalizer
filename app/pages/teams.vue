<script setup lang="ts">
import type { DraftTeam } from '@/lib/case-draft'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { ROLES } from '#shared/types'
import { ClipboardIcon, Loader2Icon, ShuffleIcon, Wand2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { useSfx } from '@/composables/useSfx'
import { buildDraftTeams } from '@/lib/case-draft'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'
import CaseDraftDialog from '@/components/teams/CaseDraftDialog.vue'
import MetricsBar from '@/components/teams/MetricsBar.vue'
import TeamCountControl from '@/components/teams/TeamCountControl.vue'
import TeamPanel from '@/components/teams/TeamPanel.vue'
import ToleranceControl from '@/components/teams/ToleranceControl.vue'
import WaitingList from '@/components/teams/WaitingList.vue'

const { players } = usePlayers()
const builder = useTeamBuilder()
const balancer = useTeamBalancer()
const sfx = useSfx()

const TEAM_ACCENTS = ['var(--team-a)', 'var(--team-b)', 'var(--team-c)', 'var(--team-d)']

const sortedPlayers = computed(() => [...players.value].sort((a, b) => b.score - a.score))
const selectionGridEl = ref<HTMLElement | null>(null)
const activeAction = shallowRef<'optimize' | 'random' | null>(null)
const draftOpen = shallowRef(false)
const draftRunId = shallowRef(0)
const draftTeams = shallowRef<DraftTeam[]>([])
const pendingDraftAssignments = shallowRef<Record<string, number> | null>(null)
let selectionContext: gsap.Context | null = null
const moveTweens = new Set<gsap.core.Tween>()

function isSelected(id: string) {
  return builder.state.value.selectedIds.includes(id)
}

function roleLabel(role: string) {
  return ROLES.find(r => r.value === role)?.label ?? role
}

function toggleSelect(id: string) {
  sfx.playSelect()
  builder.toggleSelect(id)
}

onMounted(() => {
  if (prefersReducedMotion() || !selectionGridEl.value) return
  const { gsap } = useGSAP()
  selectionContext = gsap.context(() => {
    gsap.from('.select-row', { autoAlpha: 0, y: 10, stagger: 0.02, duration: 0.35, ease: 'power2.out' })
  }, selectionGridEl.value)
})

onBeforeUnmount(() => {
  selectionContext?.revert()
  moveTweens.forEach(tween => tween.kill())
  moveTweens.clear()
})

async function animatePlayerLanding(id: string) {
  if (prefersReducedMotion()) return
  await nextTick()
  const playerRow = document.getElementById(`player-row-${id}`)
  if (!playerRow) return

  const { gsap } = useGSAP()
  const tween = gsap.fromTo(playerRow, {
    scale: 1.06,
    filter: 'brightness(1.35)'
  }, {
    scale: 1,
    filter: 'brightness(1)',
    duration: 0.32,
    ease: 'power2.out',
    clearProps: 'transform,filter',
    onComplete: () => moveTweens.delete(tween)
  })
  moveTweens.add(tween)
}

function assign(id: string, teamIndex: number) {
  sfx.playAssign()
  builder.assign(id, teamIndex)
  void animatePlayerLanding(id)
}

function unassign(id: string) {
  sfx.playUnassign()
  builder.unassign(id)
  void animatePlayerLanding(id)
}

function validateGeneration(): boolean {
  if (balancer.validationError.value) {
    toast.error(balancer.validationError.value)
    return false
  }
  return true
}

async function optimize() {
  sfx.arm()
  if (!validateGeneration()) return
  activeAction.value = 'optimize'
  let target: Record<string, number> | null = null
  try {
    target = await balancer.computeOptimize()
  } catch {
    toast.error('Team optimization failed. Please try again.')
    return
  } finally {
    activeAction.value = null
  }

  if (!target) {
    toast.error(balancer.validationError.value ?? 'Could not find a valid split — check locked players.')
    return
  }

  builder.setAssignments(target)
  sfx.playSuccess()
  toast.success('Teams optimized.')
}

async function randomBalance() {
  sfx.arm()
  if (!validateGeneration()) return
  activeAction.value = 'random'
  let target: Record<string, number> | null = null
  try {
    target = await balancer.computeRandomBalance()
  } catch {
    toast.error('Random balance failed. Please try again.')
    return
  } finally {
    activeAction.value = null
  }

  if (!target) {
    toast.error(balancer.validationError.value ?? 'Could not find a valid split — check locked players.')
    return
  }

  const candidates = balancer.selectedPlayers.value.filter(player => target[player.id] !== undefined)
  if (!candidates.length) {
    toast.error('No active player is available for selection.')
    return
  }

  pendingDraftAssignments.value = target
  draftTeams.value = buildDraftTeams(
    candidates,
    target,
    builder.state.value.teamNames,
    builder.state.value.teamCount
  )
  draftRunId.value += 1
  draftOpen.value = true
}

function finishDraft() {
  if (!pendingDraftAssignments.value) return
  builder.setAssignments(pendingDraftAssignments.value)
  pendingDraftAssignments.value = null
  toast.success('Random balance applied.')
}

function cancelDraft() {
  pendingDraftAssignments.value = null
}

async function copyResult() {
  const lines = [
    '🎮 CS2 Team Split',
    ''
  ]
  balancer.teams.value.forEach((team, index) => {
    lines.push(`${builder.state.value.teamNames[index]} — ${balancer.teamScores.value[index]} points`)
    team.forEach((player, i) => lines.push(`${i + 1}. ${player.name} — ${player.score}`))
    lines.push('')
  })
  if (balancer.waitingPlayers.value.length) {
    lines.push(`Waiting (${balancer.waitingPlayers.value.length}):`)
    balancer.waitingPlayers.value.forEach((player, i) => lines.push(`${i + 1}. ${player.name} — ${player.score}`))
  }

  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    toast.success('Copied to clipboard.')
  } catch {
    toast.error('Could not copy — clipboard access denied.')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="font-heading text-xl font-semibold tracking-wide">Team builder</h1>

    <Card>
      <CardHeader>
        <CardTitle class="text-sm">1. Select players</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="builder.selectIds(players.map(p => p.id))">
            Select all
          </Button>
          <Button variant="outline" size="sm" @click="builder.clearSelection()">
            Clear
          </Button>
          <span class="text-xs text-muted-foreground">{{ builder.state.value.selectedIds.length }} selected</span>
        </div>
        <div ref="selectionGridEl" class="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
          <label
            v-for="player in sortedPlayers"
            :key="player.id"
            :class="cn(
              'select-row hud-frame-right carbon-fiber hover-lift flex cursor-pointer items-start gap-2 rounded-md border border-border bg-card/60 p-2 text-sm transition-colors hover:bg-accent/40',
              getTier(player.score).cardBorderClass
            )"
            :style="{ '--hud-accent': getTier(player.score).colorVar }"
          >
            <Checkbox class="mt-0.5 shrink-0" :model-value="isSelected(player.id)" @update:model-value="toggleSelect(player.id)" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="min-w-0 truncate font-medium">{{ player.name }}</span>
                <span
                  :class="cn('tier-badge-3d inline-flex shrink-0 items-center rounded px-1 py-0.5 text-[10px] font-bold', getTier(player.score).badgeClass, getTier(player.score).badgeGlowClass)"
                >
                  {{ getTier(player.score).key }}
                </span>
              </div>
              <div class="mt-0.5 flex items-center justify-between gap-1">
                <p class="role-capsule truncate text-[10px] text-muted-foreground uppercase">{{ roleLabel(player.role) }}</p>
                <span class="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{{ player.score }}</span>
              </div>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle class="text-sm">2. Build teams</CardTitle>
        <div class="flex flex-wrap items-center gap-3">
          <TeamCountControl
            :model-value="builder.state.value.teamCount"
            :error="balancer.validationError.value"
            @update:model-value="builder.setTeamCount"
          />
          <ToleranceControl
            :model-value="builder.state.value.tolerance"
            @update:model-value="builder.setTolerance"
          />
        </div>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <p class="text-xs text-muted-foreground">Drag players between teams. Locked players stay fixed during balance.</p>
        <div class="flex flex-wrap gap-2">
          <Button size="sm" :disabled="balancer.isComputing.value || draftOpen" @click="optimize">
            <Loader2Icon v-if="activeAction === 'optimize'" data-icon="inline-start" class="animate-spin" />
            <Wand2Icon v-else data-icon="inline-start" />
            Optimize
          </Button>
          <Button variant="outline" size="sm" :disabled="balancer.isComputing.value || draftOpen" @click="randomBalance">
            <Loader2Icon v-if="activeAction === 'random'" data-icon="inline-start" class="animate-spin" />
            <ShuffleIcon v-else data-icon="inline-start" />
            Random balance
          </Button>
          <Button variant="outline" size="sm" @click="builder.clearTeams()">
            Clear teams
          </Button>
          <Button variant="outline" size="sm" @click="copyResult">
            <ClipboardIcon data-icon="inline-start" />
            Copy
          </Button>
        </div>

        <MetricsBar
          :selected-count="balancer.selectedPlayers.value.length"
          :team-scores="balancer.teamScores.value"
          :tolerance="builder.state.value.tolerance"
        />

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            <TeamPanel
              v-for="(team, index) in balancer.teams.value"
              :key="index"
              :name="builder.state.value.teamNames[index]"
              :players="team"
              :score="balancer.teamScores.value[index]"
              :locked-ids="builder.state.value.lockedIds"
              :accent="TEAM_ACCENTS[index % TEAM_ACCENTS.length]"
              :slot-index="index"
              @update:name="(name) => builder.setTeamName(index, name)"
              @assign="assign"
              @toggle-lock="builder.toggleLock"
              @unassign="unassign"
            />
          </div>

          <div>
            <h3 class="mb-2 text-sm font-medium">Waiting / reserves</h3>
            <WaitingList
              :players="balancer.waitingPlayers.value"
              :team-names="builder.state.value.teamNames"
              @assign="assign"
              @unassign="unassign"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <CaseDraftDialog
      v-model:open="draftOpen"
      :players="balancer.selectedPlayers.value"
      :teams="draftTeams"
      :locked-ids="builder.state.value.lockedIds"
      :run-id="draftRunId"
      @complete="finishDraft"
      @cancel="cancelDraft"
    />
  </div>
</template>
