<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ChangeLogEntry } from '#shared/types'
import { ROLES } from '#shared/types'
import { ArrowLeftIcon, PencilIcon } from '@lucide/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prefersReducedMotion, useGSAP } from '@/composables/useGSAP'
import { getTier } from '@/lib/tier'
import { cn } from '@/lib/utils'
import ChangeLogEntryRow from '@/components/changelog/ChangeLogEntryRow.vue'
import PlayerEditDialog from '@/components/players/PlayerEditDialog.vue'
import PlayerRadarChart from '@/components/players/PlayerRadarChart.vue'
import PlayerScoreChart from '@/components/players/PlayerScoreChart.vue'
import PlayerSkillChart from '@/components/players/PlayerSkillChart.vue'
import TagBadge from '@/components/players/TagBadge.vue'

const route = useRoute()
const playerId = computed(() => String(route.params.id))

const { players } = usePlayers()
const { tagById } = useTags()
const { fetchLog } = useChangeLog()
const isUnlocked = useIsCrudUnlocked()

const player = computed(() => players.value.find(p => p.id === playerId.value))
const tier = computed(() => player.value ? getTier(player.value.score) : null)

const roleLabel = computed(() => ROLES.find(role => role.value === player.value?.role)?.label ?? '')
const roleDescription = computed(() => ROLES.find(role => role.value === player.value?.role)?.description ?? '')
const initials = computed(() => (player.value?.name ?? '?').trim().slice(0, 2).toUpperCase())
const tagIds = computed(() => player.value ? Object.keys(player.value.tagLevels) : [])

const editDialogOpen = ref(false)
const logEntries = ref<ChangeLogEntry[]>([])
const pageEl = ref<HTMLElement | null>(null)

async function loadLog() {
  if (!player.value) return
  const result = await fetchLog({ playerId: player.value.id, limit: 20 })
  logEntries.value = result.entries
}

onMounted(loadLog)
watch(playerId, loadLog)

onMounted(() => {
  if (prefersReducedMotion() || !pageEl.value) return
  const { gsap } = useGSAP()
  gsap.context(() => {
    gsap.from('.detail-block', { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.4, ease: 'power2.out' })
  }, pageEl.value)
})

function tagPropsFor(tagId: string) {
  const tag = tagById(tagId)
  return {
    label: tag?.label ?? tagId,
    icon: tag?.icon ?? 'Tag',
    kind: tag?.kind ?? 'neutral' as const,
    level: player.value?.tagLevels[tagId] ?? 3
  }
}
</script>

<template>
  <div v-if="player" ref="pageEl" class="flex flex-col gap-4">
    <Button as-child variant="ghost" size="sm" class="w-fit">
      <NuxtLink to="/">
        <ArrowLeftIcon data-icon="inline-start" />
        Back to roster
      </NuxtLink>
    </Button>

    <Card v-if="tier" class="detail-block hud-frame carbon-fiber border-border/60 bg-card/70" :style="{ '--hud-accent': tier.colorVar }">
      <div class="scanlines-diagonal" />
      <div class="holo-sheen" />
      <div class="holo-grid pointer-events-none absolute inset-0 opacity-60" />
      <div class="spark-particles">
        <span /><span /><span />
      </div>
      <CardContent class="flex flex-wrap items-center gap-4 pt-6">
        <div class="avatar-halo shrink-0">
          <Avatar class="avatar-aura size-20 ring-2" :style="{ '--tw-ring-color': tier.colorVar }">
            <AvatarImage :src="player.hasPhoto ? `/api/players/${player.id}/photo` : '/default-avatar.png'" alt="" />
            <AvatarFallback class="text-lg">{{ initials }}</AvatarFallback>
          </Avatar>
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="name-underline w-fit font-heading text-2xl font-semibold tracking-wide">{{ player.name }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ roleDescription }}</p>
          <div class="tag-panel carbon-fiber mt-2 flex flex-wrap gap-1 bg-background/30 p-2">
            <TagBadge v-for="tagId in tagIds" :key="tagId" v-bind="tagPropsFor(tagId)" />
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <div class="flex items-center gap-2">
            <div class="neon-text font-heading text-3xl font-bold tabular-nums" :style="{ color: tier.colorVar }">{{ player.score }}</div>
            <div
              :class="cn('tier-pulse tier-badge-3d flex size-11 items-center justify-center font-heading text-2xl font-black', tier.badgeClass, tier.badgeGlowClass)"
              :title="tier.label"
            >
              {{ tier.key }}
            </div>
          </div>
          <span class="role-capsule text-xs text-muted-foreground uppercase">{{ roleLabel }}</span>
          <Button v-if="isUnlocked" variant="outline" size="sm" class="btn-neon" @click="editDialogOpen = true">
            <PencilIcon data-icon="inline-start" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card class="detail-block border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle class="font-mono text-xs tracking-widest uppercase">Score over time</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerScoreChart :entries="logEntries" :current-score="player.score" />
        </CardContent>
      </Card>

      <Card class="detail-block hud-frame border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle class="font-mono text-xs tracking-widest uppercase">Attributes</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <PlayerRadarChart :player="player" />
          <PlayerSkillChart :player="player" />
        </CardContent>
      </Card>
    </div>

    <Card class="detail-block border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle class="font-mono text-xs tracking-widest uppercase">Recent changes</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-2">
        <p v-if="!logEntries.length" class="text-sm text-muted-foreground">No changes logged yet.</p>
        <ChangeLogEntryRow v-for="entry in logEntries" :key="entry.id" :entry="entry" />
      </CardContent>
    </Card>

    <PlayerEditDialog v-model:open="editDialogOpen" :player="player" />
  </div>
  <p v-else class="text-sm text-muted-foreground">Player not found.</p>
</template>
