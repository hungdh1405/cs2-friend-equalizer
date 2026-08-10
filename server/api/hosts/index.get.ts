// Public — the event page shows who the current Hosts are.
export default defineEventHandler(async () => {
  return getHosts()
})
