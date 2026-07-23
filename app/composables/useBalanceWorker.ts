import { useWebWorker } from '@vueuse/core'
import type { BalanceWorkerRequest, BalanceWorkerResponse } from '../workers/balance.worker'

let handle: ReturnType<typeof useWebWorker<BalanceWorkerResponse>> | null = null
let nextId = 0
const pending = new Map<number, (response: BalanceWorkerResponse) => void>()

function getHandle() {
  if (handle) return handle

  const worker = new Worker(new URL('../workers/balance.worker.ts', import.meta.url), { type: 'module' })
  handle = useWebWorker<BalanceWorkerResponse>(worker)
  watch(handle.data, (response) => {
    if (!response) return
    const resolve = pending.get(response.id)
    if (!resolve) return
    pending.delete(response.id)
    resolve(response)
  })
  return handle
}

/** Runs the (potentially slow, exhaustive-search) team-balancing algorithm in a Web Worker
 * so the main thread — and any loading indicator — stays responsive. See balance.worker.ts. */
export function runBalanceInWorker(request: Omit<BalanceWorkerRequest, 'id'>): Promise<BalanceWorkerResponse> {
  if (import.meta.server) return Promise.reject(new Error('Worker unavailable during SSR'))

  const { post } = getHandle()
  const id = ++nextId
  return new Promise((resolve) => {
    pending.set(id, resolve)
    post({ ...request, id })
  })
}
