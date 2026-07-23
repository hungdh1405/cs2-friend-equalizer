import { computed } from 'vue'

/** Thrown by guarded CRUD calls when the user cancels the PIN dialog — callers should treat
 * this as a silent no-op, not an error to surface. */
export class CrudCancelledError extends Error {
  constructor() {
    super('Cancelled — PIN not entered.')
    this.name = 'CrudCancelledError'
  }
}

// Global (per-app-instance) CRUD-unlock state. Reads never touch this — only
// create/update/delete/upload/import/reset call requireCrudToken() before hitting the API.
const isDialogOpen = () => useState<boolean>('crud-gate-open', () => false)
const tokenExpiresAt = () => useState<number | null>('crud-token-expires-at', () => null)

let pendingResolve: ((granted: boolean) => void) | null = null

export function useCrudGateState() {
  return { isOpen: isDialogOpen(), expiresAt: tokenExpiresAt() }
}

export function hasValidCrudToken(): boolean {
  const expiresAt = tokenExpiresAt().value
  return typeof expiresAt === 'number' && expiresAt > Date.now()
}

/** Reactive "is editing currently unlocked" flag — used to hide CRUD buttons entirely until
 * unlocked (default view is read-only for everyone). Re-evaluates whenever the token itself
 * changes (login/logout); doesn't tick every second like UnlockIndicator's countdown, so a
 * button can very briefly still show right as the 15 minutes lapses — harmless, since every
 * actual mutating call re-checks `hasValidCrudToken()` fresh via `ensureCrudToken()` anyway. */
export function useIsCrudUnlocked() {
  const { expiresAt } = useCrudGateState()
  return computed(() => typeof expiresAt.value === 'number' && expiresAt.value > Date.now())
}

/** Syncs local token state with the server (call on load, or after any 401 from a CRUD call).
 * Must use `useRequestFetch()` on the server (same pattern as usePlayers/useTags' `refresh()`)
 * — plain `$fetch` during SSR does not forward the incoming request's session cookie, so on a
 * full page reload this would always see "no token" and bake a false "locked" state into the
 * page even when the browser's session cookie is still valid, with nothing to correct it
 * afterward since `callOnce` only runs this once per app instance. */
export async function refreshCrudTokenState() {
  const state = tokenExpiresAt()
  try {
    const requestFetch = import.meta.server ? useRequestFetch() : $fetch
    const result = await requestFetch<{ hasToken: boolean, expiresAt?: number }>('/api/auth/me')
    state.value = result.hasToken ? result.expiresAt ?? null : null
  } catch {
    state.value = null
  }
}

export async function unlockCrud(pin: string) {
  const state = tokenExpiresAt()
  const result = await $fetch<{ ok: true, expiresAt: number }>('/api/auth/login', {
    method: 'POST',
    body: { pin }
  })
  state.value = result.expiresAt
}

export async function lockCrud() {
  const state = tokenExpiresAt()
  await $fetch('/api/auth/logout', { method: 'POST' })
  state.value = null
}

/**
 * Ensures a live CRUD token before a mutating call. Resolves `true` immediately if one is
 * already valid; otherwise opens the PIN dialog and resolves once the user submits the
 * correct PIN (`true`) or cancels (`false`). Callers should bail out on `false`.
 */
export async function requireCrudToken(): Promise<boolean> {
  if (hasValidCrudToken()) return true

  isDialogOpen().value = true
  return new Promise<boolean>((resolve) => {
    pendingResolve = resolve
  })
}

/** Called by CrudPinDialog.vue on submit/cancel. */
export function resolveCrudGate(granted: boolean) {
  isDialogOpen().value = false
  pendingResolve?.(granted)
  pendingResolve = null
}

/** `await` this at the top of any mutating call — throws CrudCancelledError if the user cancels. */
export async function ensureCrudToken(): Promise<void> {
  if (!(await requireCrudToken())) throw new CrudCancelledError()
}
