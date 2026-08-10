<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="font-heading text-xl font-semibold tracking-wide">Terms of Service</h1>
      <p class="text-sm text-muted-foreground">Last updated: 2026</p>
    </div>

    <div class="flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
      <p>
        CS2 Friend Equalizer ("the app") is an unofficial, fan-made tool for a private CS2 friend group to
        track player ratings, build balanced teams, and coordinate weekly play sessions. It is not affiliated
        with, endorsed by, or connected to Valve Corporation, Counter-Strike, or Discord Inc. in any way.
      </p>

      <h2 class="font-heading text-base font-semibold">What the Discord bot does</h2>
      <p>
        The app operates a Discord bot in one server. It posts a message with vote buttons when a Host
        schedules the week's event, reads button clicks to record votes, posts short notifications and
        reminders to that same channel, and occasionally mentions the server's designated Host(s) or the
        specific players still missing a vote. It does not read messages, join voice channels, or act outside
        that one channel.
      </p>

      <h2 class="font-heading text-base font-semibold">Roster and events</h2>
      <p>
        Anyone can view the player roster, the current event, and the change log without signing in. Editing
        the roster or creating/replacing an event requires a shared PIN known only to the group. A Host
        replacing the current event clears its existing votes — this is by design, not a bug.
      </p>

      <h2 class="font-heading text-base font-semibold">No warranty</h2>
      <p>
        This is a casual tool built for a friend group, provided as-is with no guarantee of uptime, accuracy,
        or availability. Team suggestions and vote tallies are for coordinating a friendly match, not anything
        more serious.
      </p>

      <h2 class="font-heading text-base font-semibold">Contact</h2>
      <p>
        Questions, or want your data removed? Message a Host in the Discord server, or reach out to whoever
        administers the app for your group.
      </p>
    </div>
  </div>
</template>
