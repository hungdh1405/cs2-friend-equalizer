<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ROLES } from '#shared/types'
import { ClipboardIcon, Loader2Icon, ShuffleIcon, Wand2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { useSfx } from '@/composables/useSfx'
import { pickAssignMessage } from '@/lib/team-assign-messages'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'
import MetricsBar from '@/components/teams/MetricsBar.vue'
import TeamAssemblyBanner from '@/components/teams/TeamAssemblyBanner.vue'
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

const assemblyPhase = ref<'idle' | 'matchmaking' | 'announcing'>('idle')
const assemblyMessage = ref('')

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
  gsap.context(() => {
    gsap.from('.select-row', { autoAlpha: 0, y: 10, stagger: 0.02, duration: 0.35, ease: 'power2.out' })
  }, selectionGridEl.value)
})

/**
 * "Ghost clone" flight — a dynamic esports-style transition for moving a single player
 * between the waiting list and a team slot. Sequence: clone the source row at its exact
 * viewport position -> fly it to the destination with a fading trail -> only then mutate
 * the real data (avoiding any layout jump while the clone is still in flight) -> flash the
 * newly-landed real row with a scale-in glow. Used for every player move — both a single
 * manual assign/unassign and, in sequence, each player of a bulk optimize/random-balance.
 */
async function flyPlayerRow(id: string, destinationSelector: string, mutate: () => void) {
  const sourceEl = document.getElementById(`player-row-${id}`)
  const destContainer = document.querySelector<HTMLElement>(destinationSelector)

  if (prefersReducedMotion() || !sourceEl || !destContainer) {
    mutate()
    return
  }

  const player = balancer.selectedPlayers.value.find(p => p.id === id)
  const tierColor = player ? getTier(player.score).colorVar : 'var(--primary)'
  const sourceRect = sourceEl.getBoundingClientRect()
  const destRect = destContainer.getBoundingClientRect()
  const lastRow = destContainer.lastElementChild as HTMLElement | null
  const destX = destRect.left
  const destY = lastRow ? lastRow.getBoundingClientRect().bottom + 6 : destRect.top + 4

  const ghost = sourceEl.cloneNode(true) as HTMLElement
  ghost.removeAttribute('id')
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    margin: '0',
    zIndex: '100',
    pointerEvents: 'none',
    boxShadow: `0 0 22px ${tierColor}, 0 0 6px ${tierColor}`
  })
  document.body.appendChild(ghost)

  const { gsap } = useGSAP()

  // Faint glow trail: every ~45ms, drop a fading echo of the ghost's current position.
  // Echoes are tracked (not just left to self-remove via onComplete) so a slow/backgrounded
  // tab can't leave stray fixed-position nodes behind after the flight resolves.
  const echoes = new Set<HTMLElement>()
  const trailTimer = window.setInterval(() => {
    const rect = ghost.getBoundingClientRect()
    const echo = ghost.cloneNode(true) as HTMLElement
    Object.assign(echo.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      zIndex: '99',
      boxShadow: `0 0 10px ${tierColor}`
    })
    document.body.appendChild(echo)
    echoes.add(echo)
    gsap.to(echo, {
      autoAlpha: 0,
      scale: 0.85,
      duration: 0.32,
      ease: 'power1.out',
      onComplete: () => { echo.remove(); echoes.delete(echo) }
    })
  }, 45)

  await new Promise<void>((resolve) => {
    gsap.to(ghost, { left: destX, top: destY, scale: 0.94, duration: 0.55, ease: 'power2.out', onComplete: resolve })
  })

  window.clearInterval(trailTimer)
  ghost.remove()
  echoes.forEach(echo => echo.remove())
  echoes.clear()

  // Only now does the real data move — the flight already "sold" the transition, so this
  // is invisible/instant rather than a layout jump.
  mutate()
  await nextTick()

  const landedEl = document.getElementById(`player-row-${id}`)
  if (landedEl) {
    landedEl.style.setProperty('--hud-accent', tierColor)
    landedEl.classList.add('just-landed')
    gsap.fromTo(landedEl, { scale: 1.16 }, { scale: 1, duration: 0.4, ease: 'back.out(2.2)' })
    setTimeout(() => landedEl.classList.remove('just-landed'), 550)
  }
}

function assign(id: string, teamIndex: number) {
  sfx.playAssign()
  flyPlayerRow(id, `[data-team-slot="${teamIndex}"]`, () => builder.assign(id, teamIndex))
}

function unassign(id: string) {
  sfx.playUnassign()
  flyPlayerRow(id, '[data-team-slot="waiting"]', () => builder.unassign(id))
}

/**
 * Bulk optimize/random-balance: clear every NOT-locked player back to waiting first (so the
 * whole roster visibly restarts from the waiting list — explicit feedback that leftover
 * assignments from a previous run meant most players never appeared to move), compute the
 * target split in the worker (matchmaking banner shows here), then fly each mover one at a
 * time in its waiting-list order, updating the banner to that exact player's name right as
 * their flight starts — never a separate, out-of-sync ticker.
 */
async function generateTeams(compute: () => Promise<Record<string, number> | null>, successMessage: string) {
  if (balancer.validationError.value) {
    toast.error(balancer.validationError.value)
    return
  }

  builder.clearUnlockedAssignments()
  await nextTick()

  assemblyPhase.value = 'matchmaking'
  assemblyMessage.value = ''
  const target = await compute()

  if (!target) {
    assemblyPhase.value = 'idle'
    toast.error(balancer.validationError.value ?? 'Could not find a valid split — check locked players.')
    return
  }

  // Locked players' target assignment already matches their (untouched) current one, so
  // only players actually waiting for a new slot need a flight.
  const moverIds = balancer.waitingPlayers.value.map(p => p.id).filter(id => target[id] !== undefined)

  assemblyPhase.value = 'announcing'
  for (const id of moverIds) {
    const player = balancer.selectedPlayers.value.find(p => p.id === id)
    const teamIndex = target[id]
    if (!player || teamIndex === undefined) continue

    assemblyMessage.value = pickAssignMessage(player.name, builder.state.value.teamNames[teamIndex])
    sfx.playAssign()
    await flyPlayerRow(id, `[data-team-slot="${teamIndex}"]`, () => builder.setAssignment(id, teamIndex))
  }

  assemblyPhase.value = 'idle'
  sfx.playSuccess()
  toast.success(successMessage)
}

function optimize() {
  return generateTeams(() => balancer.computeOptimize(), 'Teams optimized.')
}

function randomBalance() {
  return generateTeams(() => balancer.computeRandomBalance(), 'Random balance applied.')
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
        <div class="flex flex-wrap gap-2">
          <Button size="sm" :disabled="balancer.isComputing.value" @click="optimize">
            <Loader2Icon v-if="balancer.isComputing.value" data-icon="inline-start" class="animate-spin" />
            <Wand2Icon v-else data-icon="inline-start" />
            Optimize
          </Button>
          <Button variant="outline" size="sm" :disabled="balancer.isComputing.value" @click="randomBalance">
            <Loader2Icon v-if="balancer.isComputing.value" data-icon="inline-start" class="animate-spin" />
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

        <TeamAssemblyBanner :phase="assemblyPhase" :message="assemblyMessage" />

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
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
