import * as LucideIcons from '@lucide/vue'
import type { Component } from 'vue'

const icons = LucideIcons as unknown as Record<string, Component>

/** Resolves a Lucide icon by name (with or without the "Icon" suffix), falling back to a generic tag icon. */
export function resolveIcon(name: string): Component {
  return icons[name] ?? icons[`${name}Icon`] ?? icons.Tag ?? icons.TagIcon
}

/** Every Lucide icon (bare PascalCase name, e.g. "Crosshair" — matches how tags already store
 * `icon` in KV, and what `resolveIcon`'s first lookup checks). `@lucide/vue` re-exports each
 * icon 3x under different naming conventions (`Foo`, `FooIcon`, `LucideFoo`) plus a handful of
 * non-icon utility exports (`createLucideIcon`, `LUCIDE_CONTEXT`, etc.) — filtering to
 * PascalCase-alphanumeric names that don't start with "Lucide" keeps exactly one canonical
 * entry per icon (~2000) for the tag icon picker (TagIconPicker.vue, used by both
 * TagCreateInline and the /tags page's inline icon editor). */
export const ALL_TAG_ICONS = Object.keys(icons)
  .filter(name => /^[A-Z][a-zA-Z0-9]*$/.test(name) && !name.startsWith('Lucide') && !name.endsWith('Icon'))
  .sort()
