<script setup lang="ts">
import { computed, ref } from 'vue'
import { SearchIcon } from '@lucide/vue'
import { ListboxFilter } from 'reka-ui'
import { ALL_TAG_ICONS } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const open = ref(false)
const query = ref('')

// ~2000 Lucide icons is too many to mount as CommandItems all at once (shadcn's Command
// filters by v-if'ing items out, which still means mounting every one first — a ~1.3s stall
// on open). Filtering and capping the v-for source ourselves means only the visible slice
// ever mounts. Uses reka-ui's ListboxFilter directly (bound to our own `query`, not Command's
// shared filterState.search) rather than the CommandInput wrapper, so arrow-key navigation
// and Enter-to-select — which live inside ListboxFilter itself, independent of its v-model —
// keep working exactly as before.
const MAX_RESULTS = 300
const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return needle ? ALL_TAG_ICONS.filter(name => name.toLowerCase().includes(needle)) : ALL_TAG_ICONS
})
const filteredIcons = computed(() => matches.value.slice(0, MAX_RESULTS))

function select(icon: string) {
  emit('update:modelValue', icon)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button type="button" variant="outline" size="sm" class="justify-start gap-2">
        <DynamicIcon :name="props.modelValue" />
        {{ props.modelValue }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-0" align="start">
      <Command>
        <div data-slot="command-input-wrapper" class="p-1 pb-0">
          <InputGroup class="bg-input/30 border-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!">
            <ListboxFilter
              v-model="query"
              data-slot="command-input"
              auto-focus
              placeholder="Search icons…"
              class="w-full flex-1 rounded-none border-0 bg-transparent text-sm shadow-none outline-hidden ring-0 focus-visible:ring-0"
            />
            <InputGroupAddon>
              <SearchIcon class="size-4 shrink-0 opacity-50" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <CommandList>
          <p v-if="!filteredIcons.length" class="py-6 text-center text-sm text-muted-foreground">
            No icon found.
          </p>
          <CommandGroup>
            <CommandItem
              v-for="icon in filteredIcons"
              :key="icon"
              :value="icon"
              @select="select(icon)"
            >
              <DynamicIcon :name="icon" />
              {{ icon }}
            </CommandItem>
          </CommandGroup>
          <p v-if="matches.length > filteredIcons.length" class="px-2 py-1.5 text-xs text-muted-foreground">
            Showing {{ filteredIcons.length }} of {{ matches.length }} — keep typing to narrow.
          </p>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
