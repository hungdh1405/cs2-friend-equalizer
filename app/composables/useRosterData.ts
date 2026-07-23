export async function ensureRosterLoaded() {
  const { refresh: refreshPlayers } = usePlayers()
  const { refresh: refreshTags } = useTags()
  await callOnce('roster-data', () => Promise.all([refreshPlayers(), refreshTags()]))
}
