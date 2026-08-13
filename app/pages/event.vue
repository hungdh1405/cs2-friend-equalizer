<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarIcon, CrownIcon, LoaderCircleIcon, PlusIcon, UsersIcon, UserXIcon, XCircleIcon, XIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import TeamLineupBuilder from '@/components/event/TeamLineupBuilder.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CrudCancelledError } from '@/composables/useCrudGate'
import { cn } from '@/lib/utils'
import type { Host } from '#shared/types'
import { hasEventEnded } from '#shared/utils/event-status'
import { isProtectedHost } from '#shared/utils/hosts'
import { formatVietnamDateTime, utcIsoToVietnamLocalInput } from '#shared/utils/week'

const { currentEvent, hosts, createEvent, updateEvent, cancelEvent, addHost, removeHost, refresh } = useEvent()
const { players } = usePlayers()
const isUnlocked = useIsCrudUnlocked()

await refresh()

// Hosts are picked from players already linked to a Discord account (Edit player -> Discord
// ID), not typed in as a raw snowflake — far less error-prone once that link exists for
// everyone, and lets the Hosts list show a real name instead of a bare ID.
const availableHostPlayers = computed(() => players.value.filter(
  player => player.discordUserId && !hosts.value.some(host => host.discordUserId === player.discordUserId)
))

const TARGET_VOTES = 10

const formattedStartsAt = computed(() => currentEvent.value ? formatVietnamDateTime(currentEvent.value.startsAt) : '')

const voteCount = computed(() => currentEvent.value?.voters.length ?? 0)

// Checked once per page load/refresh, same as the rest of this page — there's no live
// polling ticker here, so a page left open across the 2-hour mark won't flip this on its
// own until reloaded, matching how the rest of the page already behaves.
const hasEnded = computed(() => currentEvent.value ? hasEventEnded(currentEvent.value.startsAt) : false)

const startsAtRef = computed(() => currentEvent.value?.startsAt ?? null)
const { countdown, hasStarted: countdownStarted } = useCountdown(startsAtRef)

function avatarUrl(voter: { discordUserId: string, avatar: string | null }) {
  return voter.avatar ? `https://cdn.discordapp.com/avatars/${voter.discordUserId}/${voter.avatar}.png` : undefined
}

// --- Create / edit / replace event ---
// One dialog serves three flows: "create" (no event yet), "replace" (a brand-new event,
// discarding existing votes — same dialog, entered via a confirm step since it's
// destructive), and "edit" (correcting the date/time or description of the *current* event
// in place — pre-filled with its existing values, keeps all votes, edits the live Discord
// message instead of posting a new one).
const createDialogOpen = ref(false)
const confirmReplaceOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const startsAtInput = ref('')
const description = ref('')
const creating = ref(false)

function openCreateFlow() {
  dialogMode.value = 'create'
  startsAtInput.value = ''
  description.value = ''
  if (currentEvent.value && currentEvent.value.voters.length > 0) {
    confirmReplaceOpen.value = true
  } else {
    createDialogOpen.value = true
  }
}

function openEditFlow() {
  if (!currentEvent.value) return
  dialogMode.value = 'edit'
  startsAtInput.value = utcIsoToVietnamLocalInput(currentEvent.value.startsAt)
  description.value = currentEvent.value.description ?? ''
  createDialogOpen.value = true
}

function confirmReplace() {
  confirmReplaceOpen.value = false
  createDialogOpen.value = true
}

async function submitEventForm() {
  if (!startsAtInput.value || creating.value) return
  creating.value = true
  try {
    if (dialogMode.value === 'edit') {
      await updateEvent({ startsAt: startsAtInput.value, description: description.value.trim() || undefined })
      toast.success('Đã cập nhật sự kiện — vote hiện tại được giữ nguyên.')
    } else {
      await createEvent({ startsAt: startsAtInput.value, description: description.value.trim() || undefined })
      toast.success('Đã tạo sự kiện mới và đăng lên Discord.')
    }
    createDialogOpen.value = false
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) {
      toast.error(dialogMode.value === 'edit' ? 'Có lỗi khi cập nhật sự kiện.' : 'Có lỗi khi tạo sự kiện.')
    }
  } finally {
    creating.value = false
  }
}

// --- Cancel event ---
const confirmCancelOpen = ref(false)
const canceling = ref(false)

async function handleCancelEvent() {
  if (canceling.value) return
  canceling.value = true
  try {
    await cancelEvent()
    confirmCancelOpen.value = false
    toast.success('Đã hủy sự kiện.')
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) toast.error('Có lỗi khi hủy sự kiện.')
  } finally {
    canceling.value = false
  }
}

// --- Hosts management ---
const selectedHostPlayerId = ref('')
const addingHost = ref(false)

async function submitAddHost() {
  const discordUserId = selectedHostPlayerId.value
  if (!discordUserId || addingHost.value) return
  const player = availableHostPlayers.value.find(p => p.discordUserId === discordUserId)
  addingHost.value = true
  try {
    await addHost({ discordUserId, username: player?.name })
    selectedHostPlayerId.value = ''
    toast.success('Đã thêm Host.')
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) toast.error('Không thể thêm Host.')
  } finally {
    addingHost.value = false
  }
}

// Not a ref, same reasoning as the roster page's deleteTarget: AlertDialogAction's click and
// the dialog's own close (which would otherwise null this out via @update:open) fire in the
// same synchronous event.
let hostRemoveTarget: Host | null = null
const hostToRemove = ref<Host | null>(null)
const removingHost = ref(false)

function confirmRemoveHost(host: Host) {
  hostRemoveTarget = host
  hostToRemove.value = host
}

async function performRemoveHost() {
  if (!hostRemoveTarget || removingHost.value) return
  removingHost.value = true
  try {
    await removeHost(hostRemoveTarget.discordUserId)
    hostToRemove.value = null
    toast.success('Đã xoá Host.')
  } catch (error) {
    if (!(error instanceof CrudCancelledError)) toast.error('Không thể xoá Host.')
  } finally {
    removingHost.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" lang="vi">
    <div>
      <h1 class="font-heading text-xl font-semibold tracking-wide">Event</h1>
      <p class="text-sm text-muted-foreground">
        Sự kiện tuần này — mọi người vote trực tiếp trong Discord, trang này chỉ hiển thị trạng thái.
      </p>
    </div>

    <Empty v-if="!currentEvent">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarIcon />
        </EmptyMedia>
        <EmptyTitle>Chưa có sự kiện nào</EmptyTitle>
        <EmptyDescription>Host chưa tạo sự kiện cho tuần này.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent v-if="isUnlocked">
        <Button size="sm" @click="openCreateFlow">
          <PlusIcon data-icon="inline-start" />
          Tạo sự kiện
        </Button>
      </EmptyContent>
    </Empty>

    <div v-else :class="cn('hud-frame rounded-xl border p-4', (currentEvent.canceledAt || hasEnded) ? 'border-border/40 bg-card/50 opacity-80' : 'border-border/60 bg-card/80')">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p v-if="currentEvent.canceledAt" class="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <XCircleIcon class="size-3.5" />
            Đã bị hủy
          </p>
          <p v-else-if="hasEnded" class="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            🏁 Đã kết thúc
          </p>
          <p :class="cn('font-heading text-lg font-bold', (currentEvent.canceledAt || hasEnded) ? 'text-muted-foreground' : 'neon-text text-primary')">
            {{ formattedStartsAt }}
          </p>
          <p v-if="!currentEvent.canceledAt && !hasEnded && !countdownStarted" class="mt-0.5 font-mono text-sm text-primary/80">
            ⏳ Còn {{ countdown.days }} ngày {{ countdown.hours }} giờ {{ countdown.minutes }} phút {{ countdown.seconds }} giây
          </p>
          <p v-if="currentEvent.description" class="mt-1 text-sm text-muted-foreground">{{ currentEvent.description }}</p>
        </div>
        <div v-if="isUnlocked" class="flex shrink-0 gap-2">
          <template v-if="!currentEvent.canceledAt && !hasEnded">
            <Button variant="outline" size="sm" @click="openEditFlow">
              Sửa
            </Button>
            <Button variant="outline" size="sm" class="text-destructive hover:text-destructive" @click="confirmCancelOpen = true">
              Hủy sự kiện
            </Button>
          </template>
          <Button variant="outline" size="sm" @click="openCreateFlow">
            Tạo sự kiện mới
          </Button>
        </div>
      </div>

      <template v-if="!currentEvent.canceledAt && !hasEnded">
        <div class="mt-4 flex items-center gap-2 text-sm">
          <UsersIcon class="size-4 text-muted-foreground" />
          <span class="font-heading font-semibold">{{ voteCount }} / {{ TARGET_VOTES }}</span>
          <span class="text-muted-foreground">đã tham gia</span>
        </div>

        <div v-if="currentEvent.voters.length" class="mt-3 flex flex-wrap gap-3">
          <div v-for="voter in currentEvent.voters" :key="voter.discordUserId" class="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-2 py-1.5">
            <Avatar class="size-7">
              <AvatarImage :src="avatarUrl(voter)" alt="" />
              <AvatarFallback>{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <span class="text-sm">{{ voter.username }}</span>
          </div>
        </div>
        <p v-else class="mt-3 text-sm text-muted-foreground">Chưa có ai tham gia — vote trực tiếp trong Discord nhé.</p>

        <div v-if="currentEvent.declinedVoters.length" class="mt-4">
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserXIcon class="size-3.5" />
            <span>Không tham gia ({{ currentEvent.declinedVoters.length }})</span>
          </div>
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            <div v-for="voter in currentEvent.declinedVoters" :key="voter.discordUserId" class="flex items-center gap-1.5 rounded-md border border-border/40 bg-background/25 px-1.5 py-1 opacity-75">
              <Avatar class="size-5">
                <AvatarImage :src="avatarUrl(voter)" alt="" />
                <AvatarFallback class="text-[10px]">{{ voter.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
              </Avatar>
              <span class="text-xs text-muted-foreground">{{ voter.username }}</span>
            </div>
          </div>
        </div>
      </template>
      <p v-else class="mt-3 text-sm text-muted-foreground">
        Sự kiện này đã bị hủy — không cần vote nữa. {{ voteCount > 0 ? `(${voteCount} người đã vote trước khi hủy)` : '' }}
      </p>
    </div>

    <TeamLineupBuilder v-if="currentEvent && !currentEvent.canceledAt && !hasEnded" />

    <div v-if="isUnlocked" class="rounded-xl border border-border/60 bg-card/60 p-4">
      <div class="flex items-center gap-2">
        <CrownIcon class="size-4 text-muted-foreground" />
        <h2 class="font-heading text-sm font-semibold tracking-wide uppercase">Hosts</h2>
      </div>
      <p class="mt-1 text-xs text-muted-foreground">
        Hosts được bot nhắc hàng ngày để tạo sự kiện mới nếu tuần này chưa có.
      </p>

      <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div v-for="host in hosts" :key="host.discordUserId" class="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
          <span class="text-sm">{{ host.username || host.discordUserId }}</span>
          <Button v-if="!isProtectedHost(host.discordUserId)" variant="ghost" size="icon-sm" @click="confirmRemoveHost(host)">
            <XIcon class="size-4" />
          </Button>
          <CrownIcon v-else class="size-4 shrink-0 text-primary" aria-label="Host cố định" />
        </div>
        <p v-if="!hosts.length" class="text-sm text-muted-foreground">Chưa có Host nào được thêm.</p>
      </div>

      <form class="mt-3 flex gap-2" @submit.prevent="submitAddHost">
        <Select v-model="selectedHostPlayerId" :disabled="addingHost">
          <SelectTrigger class="w-full max-w-xs">
            <SelectValue placeholder="Chọn người chơi…" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="player in availableHostPlayers" :key="player.discordUserId" :value="player.discordUserId!">
                {{ player.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline" size="sm" :disabled="!selectedHostPlayerId || addingHost">
          <LoaderCircleIcon v-if="addingHost" data-icon="inline-start" class="motion-safe:animate-spin" />
          <PlusIcon v-else data-icon="inline-start" />
          Thêm Host
        </Button>
      </form>
      <p v-if="!availableHostPlayers.length" class="mt-2 text-xs text-muted-foreground">
        Chưa có player nào có Discord ID để chọn — cập nhật Discord ID cho player trong trang Roster trước.
      </p>
    </div>

    <Dialog v-model:open="createDialogOpen">
      <DialogContent lang="vi" class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ dialogMode === 'edit' ? 'Sửa sự kiện tuần này' : 'Tạo sự kiện tuần này' }}</DialogTitle>
          <DialogDescription>
            Ngày giờ theo giờ Việt Nam (Asia/Ho_Chi_Minh).
            {{ dialogMode === 'edit' ? 'Vote hiện tại được giữ nguyên — chỉ cập nhật thông báo trên Discord.' : 'Sau khi tạo, bot sẽ đăng thông báo kèm nút vote lên Discord.' }}
          </DialogDescription>
        </DialogHeader>
        <form class="flex flex-col gap-4" @submit.prevent="submitEventForm">
          <FieldGroup>
            <Field>
              <FieldLabel for="event-starts-at">Ngày giờ</FieldLabel>
              <Input id="event-starts-at" v-model="startsAtInput" type="datetime-local" required />
            </Field>
            <Field>
              <FieldLabel for="event-description">Mô tả (tuỳ chọn)</FieldLabel>
              <Textarea id="event-description" v-model="description" maxlength="280" rows="3" placeholder="Ví dụ: hẹn ở quán net cũ" />
              <FieldDescription>Hiển thị kèm sự kiện trên Discord và website.</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" @click="createDialogOpen = false">Huỷ</Button>
            <Button type="submit" :disabled="!startsAtInput || creating">{{ dialogMode === 'edit' ? 'Lưu thay đổi' : 'Tạo sự kiện' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="confirmReplaceOpen">
      <AlertDialogContent lang="vi">
        <AlertDialogHeader>
          <AlertDialogTitle>Thay thế sự kiện hiện tại?</AlertDialogTitle>
          <AlertDialogDescription>
            Sự kiện hiện tại đã có {{ voteCount }} người vote. Tạo sự kiện mới sẽ xoá danh sách vote này và đánh dấu tin nhắn cũ trên Discord là không còn hiệu lực. Nếu chỉ muốn sửa ngày giờ hoặc mô tả, dùng nút "Sửa" để giữ lại vote nhé.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction @click="confirmReplace">Tiếp tục</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog :open="Boolean(hostToRemove)" @update:open="(value) => { if (!value) hostToRemove = null }">
      <AlertDialogContent lang="vi">
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá Host "{{ hostToRemove?.username || hostToRemove?.discordUserId }}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Host này sẽ không còn được bot nhắc tạo sự kiện hàng ngày nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Không xoá</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" :disabled="removingHost" @click="performRemoveHost">
            Xoá Host
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="confirmCancelOpen">
      <AlertDialogContent lang="vi">
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy sự kiện tuần này?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ voteCount > 0 ? `Đã có ${voteCount} người vote — họ sẽ được giữ lại trong lịch sử nhưng sự kiện sẽ không còn nhận vote nữa.` : 'Sự kiện sẽ được đánh dấu là đã hủy và bot sẽ gỡ nút vote trên Discord.' }}
            Host sẽ không bị nhắc tạo sự kiện mới cho tuần này nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Không hủy</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" :disabled="canceling" @click="handleCancelEvent">
            Hủy sự kiện
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
