// Public — anyone can see the current event and who's voted, no login required. Returns
// `null` (not 404) when there's no active event, matching the app's "empty roster returns
// []" convention rather than treating "no event yet" as an error.
export default defineEventHandler(async () => {
  return getCurrentEvent()
})
