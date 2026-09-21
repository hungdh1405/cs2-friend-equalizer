<script setup lang="ts">
import type { Player } from '#shared/types'
import type { DraftTeam } from '@/lib/case-draft'
import { computed, nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import { ShieldCheckIcon, UsersIcon } from '@lucide/vue'
import PlayerCard from '@/components/players/PlayerCard.vue'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { cn } from '@/lib/utils'

const props = defineProps<{
  teams: DraftTeam[]
  reservePlayers: Player[]
  revealedPlayerIds: string[]
  fixedPlayerIds: string[]
  activePlayerId: string
  complete: boolean
}>()

const TEAM_ACCENTS = ['var(--team-a)', 'var(--team-b)', 'var(--team-c)', 'var(--team-d)']
const boardEl = useTemplateRef<HTMLElement>('board')
let context: gsap.Context | null = null

const revealedOrder = computed(() => new Map(
  props.revealedPlayerIds.map((id, index) => [id, index + 1])
))
const totalPlayers = computed(() => props.teams.reduce((total, team) => total + team.players.length, 0))
const boardTeams = computed(() => props.teams.map((team) => {
  const teamPlayers = new Map(team.players.map(player => [player.id, player]))
  const revealedPlayers = props.revealedPlayerIds
    .map(id => teamPlayers.get(id))
    .filter((player): player is Player => Boolean(player))

  return {
    ...team,
    revealedPlayers,
    hiddenCount: team.players.length - revealedPlayers.length
  }
}))

function accent(index: number) {
  return TEAM_ACCENTS[index % TEAM_ACCENTS.length]
}

function pickNumber(playerId: string) {
  return revealedOrder.value.get(playerId) ?? 0
}

function isFixed(playerId: string) {
  return props.fixedPlayerIds.includes(playerId)
}

watch(() => [...props.revealedPlayerIds], async (current, previous) => {
  const previousIds = new Set(previous)
  const addedId = current.find(id => !previousIds.has(id))
  if (!addedId || !boardEl.value || prefersReducedMotion()) return

  await nextTick()
  const playerCard = Array.from(boardEl.value.querySelectorAll<HTMLElement>('[data-draft-player]'))
    .find(element => element.dataset.draftPlayer === addedId)
  const teamCard = playerCard?.closest<HTMLElement>('[data-draft-team]')
  if (!playerCard || !teamCard) return

  context?.revert()
  const { gsap } = useGSAP()
  context = gsap.context(() => {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(playerCard, {
        autoAlpha: 0,
        y: -12,
        scale: 0.94
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        clearProps: 'transform,opacity,visibility'
      })
      .fromTo(teamCard, { scale: 0.995 }, {
        scale: 1,
        duration: 0.3,
        clearProps: 'transform'
      }, '<')
  }, boardEl.value)
}, { flush: 'post' })

onBeforeUnmount(() => context?.revert())
</script>

<template>
  <section ref="board" class="draft-board" aria-labelledby="team-assignments-title">
    <div class="draft-board-heading">
      <div>
        <h2 id="team-assignments-title" class="font-heading text-sm font-semibold tracking-wide">Team assignments</h2>
      </div>
      <span class="draft-total-count font-mono tabular-nums">
        {{ revealedPlayerIds.length }} of {{ totalPlayers }} selected
      </span>
    </div>

    <div class="draft-team-grid">
      <article
        v-for="team in boardTeams"
        :key="team.index"
        :data-draft-team="team.index"
        :class="cn('draft-team-card', team.revealedPlayers.some(player => player.id === activePlayerId) && 'has-latest-pick')"
        :style="{ '--team-accent': accent(team.index) }"
      >
        <header class="draft-team-header">
          <span class="team-shield" aria-hidden="true">
            <ShieldCheckIcon />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="truncate font-heading text-sm font-semibold tracking-wide">{{ team.name }}</h3>
            <p class="team-subtitle text-xs text-muted-foreground">
              {{ team.revealedPlayers.length }} of {{ team.players.length }} players
            </p>
          </div>
          <span class="team-count font-mono tabular-nums">
            {{ team.revealedPlayers.length }}/{{ team.players.length }}
          </span>
        </header>

        <div class="draft-team-content">
          <div
            v-for="player in team.revealedPlayers"
            :key="player.id"
            :data-draft-player="player.id"
            :class="cn('draft-player-entry', player.id === activePlayerId && 'is-latest')"
          >
            <span
              class="pick-number"
              :class="isFixed(player.id) && 'is-fixed'"
              :aria-label="isFixed(player.id) ? 'Fixed before selection' : `Selected in round ${pickNumber(player.id)}`"
            >
              {{ isFixed(player.id) ? 'Fixed' : pickNumber(player.id).toString().padStart(2, '0') }}
            </span>
            <PlayerCard
              :player="player"
              :interactive="false"
              :show-action="false"
              variant="compact"
              class="draft-player-card"
            />
          </div>

          <div v-if="!team.revealedPlayers.length" class="team-empty-state">
            <UsersIcon aria-hidden="true" />
            <span>Waiting for the first selection</span>
          </div>

          <div v-if="team.hiddenCount" class="open-spots">
            <span class="open-spots-line" aria-hidden="true" />
            <span>{{ team.hiddenCount }} {{ team.hiddenCount === 1 ? 'spot' : 'spots' }} open</span>
            <span class="open-spots-line" aria-hidden="true" />
          </div>
        </div>
      </article>
    </div>

    <section v-if="complete && reservePlayers.length" class="reserve-section" aria-labelledby="waiting-players-title">
      <div class="reserve-heading">
        <div>
          <h3 id="waiting-players-title" class="font-heading text-sm font-semibold tracking-wide">Waiting players</h3>
          <p class="text-xs text-muted-foreground">Outside the active lineup for this match.</p>
        </div>
        <span class="draft-total-count font-mono tabular-nums">{{ reservePlayers.length }}</span>
      </div>
      <div class="reserve-grid">
        <PlayerCard
          v-for="player in reservePlayers"
          :key="player.id"
          :player="player"
          :interactive="false"
          :show-action="false"
          variant="compact"
        />
      </div>
    </section>
  </section>
</template>

<style scoped>
.draft-board {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.draft-board-heading,
.reserve-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
  padding-inline: 0.125rem;
}

.draft-total-count,
.team-count {
  flex: 0 0 auto;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  background: color-mix(in oklch, var(--background) 68%, transparent);
  color: var(--muted-foreground);
  font-size: 0.66rem;
}

.draft-team-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.draft-team-card {
  --team-accent: var(--primary);
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--team-accent) 30%, var(--border));
  border-radius: calc(var(--radius-xl) + 0.15rem);
  background:
    radial-gradient(circle at 0 0, color-mix(in oklch, var(--team-accent) 9%, transparent), transparent 42%),
    color-mix(in oklch, var(--card) 88%, var(--background));
  box-shadow: inset 0 1px oklch(1 0 0 / 4%), 0 12px 30px oklch(0 0 0 / 18%);
  perspective: 700px;
  transition: border-color 220ms ease-out, box-shadow 220ms ease-out;
}

.draft-team-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  content: '';
  background: var(--team-accent);
  box-shadow: 0 0 14px color-mix(in oklch, var(--team-accent) 68%, transparent);
}

.draft-team-card.has-latest-pick {
  border-color: color-mix(in oklch, var(--team-accent) 58%, var(--border));
  box-shadow: inset 0 1px oklch(1 0 0 / 4%), 0 12px 34px color-mix(in oklch, var(--team-accent) 10%, oklch(0 0 0 / 20%));
}

.draft-team-header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
  border-bottom: 1px solid color-mix(in oklch, var(--team-accent) 18%, var(--border));
  padding: 0.75rem 0.8rem 0.7rem 0.95rem;
}

.team-shield {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in oklch, var(--team-accent) 48%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--team-accent) 10%, transparent);
  color: var(--team-accent);
}

.team-shield :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.team-count {
  border-color: color-mix(in oklch, var(--team-accent) 28%, var(--border));
  color: var(--team-accent);
}

.draft-team-content {
  display: flex;
  min-height: 5.25rem;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.8rem 0.8rem 0.85rem 0.95rem;
}

.draft-player-entry {
  position: relative;
  min-width: 0;
  padding-top: 0.22rem;
  will-change: transform, opacity;
}

.draft-player-entry :deep(.draft-player-card) {
  min-width: 0;
  border-radius: var(--radius-xl);
}

.draft-player-entry.is-latest :deep(.draft-player-card) {
  box-shadow: 0 0 0 1px color-mix(in oklch, var(--elite) 55%, transparent), 0 0 20px color-mix(in oklch, var(--elite) 14%, transparent);
}

.pick-number {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0.55rem;
  display: grid;
  min-width: 1.55rem;
  height: 1rem;
  place-items: center;
  border: 1px solid color-mix(in oklch, var(--team-accent) 45%, var(--border));
  border-radius: 999px;
  background: var(--card);
  color: var(--team-accent);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 3px 9px oklch(0 0 0 / 30%);
}

.pick-number.is-fixed {
  padding-inline: 0.4rem;
  color: var(--foreground);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.team-empty-state {
  display: flex;
  min-height: 3.6rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  background: color-mix(in oklch, var(--background) 45%, transparent);
  color: var(--muted-foreground);
  font-size: 0.72rem;
}

.team-empty-state :deep(svg) {
  width: 0.95rem;
  height: 0.95rem;
}

.open-spots {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--muted-foreground);
  font-size: 0.66rem;
  white-space: nowrap;
}

.open-spots-line {
  height: 1px;
  min-width: 0.5rem;
  flex: 1;
  background: color-mix(in oklch, var(--team-accent) 20%, var(--border));
}

.reserve-section {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  border-top: 1px solid var(--border);
  padding-top: 0.8rem;
}

.reserve-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.6rem;
}

@media (max-width: 639px) {
  .draft-board-heading,
  .reserve-heading {
    align-items: center;
  }

  .draft-board-heading p,
  .team-subtitle {
    display: none;
  }

  .draft-total-count {
    font-size: 0.6rem;
  }

  .draft-team-grid {
    gap: 0.42rem;
  }

  .draft-team-header {
    gap: 0.38rem;
    padding: 0.58rem 0.45rem 0.55rem 0.58rem;
  }

  .team-shield {
    width: 1.7rem;
    height: 1.7rem;
  }

  .team-count {
    padding-inline: 0.4rem;
    font-size: 0.58rem;
  }

  .draft-team-content {
    gap: 0.45rem;
    padding: 0.58rem 0.42rem 0.65rem 0.58rem;
  }

  .team-empty-state {
    min-height: 3.1rem;
    padding-inline: 0.4rem;
    text-align: center;
  }

  .pick-number {
    left: 0.35rem;
  }

  .open-spots {
    gap: 0.35rem;
    font-size: 0.58rem;
  }

  .reserve-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .draft-team-card {
    transition: none;
  }
}
</style>
