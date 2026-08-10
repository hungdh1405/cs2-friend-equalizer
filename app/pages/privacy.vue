<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="font-heading text-xl font-semibold tracking-wide">Privacy Policy</h1>
      <p class="text-sm text-muted-foreground">Last updated: 2026</p>
    </div>

    <div class="flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
      <p>
        This app does not use Discord login (OAuth) — there is no "sign in with Discord" anywhere on the
        website. All voting happens directly inside Discord, using the buttons on the bot's event message.
      </p>

      <h2 class="font-heading text-base font-semibold">What's collected when you vote</h2>
      <p>
        When you tap a vote button in Discord, Discord itself tells the app your Discord user ID, username,
        and avatar as part of that click — the app never asks you to log in or grant any permission beyond
        what Discord already shares for any button interaction. This is stored against the current event
        (who voted, and when) and shown on the public <NuxtLink to="/event" class="underline">event page</NuxtLink>
        and in the site's <NuxtLink to="/changelog" class="underline">change log</NuxtLink> — both visible to
        anyone, with no login required.
      </p>

      <h2 class="font-heading text-base font-semibold">Linking a roster profile to Discord</h2>
      <p>
        A Host can optionally link a roster player's profile to a real Discord user ID, so the bot's vote
        messages and weekly team suggestions can reference that player's in-game rating. This is entered
        manually by a Host, never inferred automatically.
      </p>

      <h2 class="font-heading text-base font-semibold">IP addresses</h2>
      <p>
        Roster edits (adding/editing/removing a player) are stamped with the editor's IP address in the change
        log, same as before this feature existed. Vote actions are not — a Discord-verified vote click already
        carries a much stronger identity signal than the anonymous shared-PIN roster edits, so there's no
        additional reason to log an IP for those.
      </p>

      <h2 class="font-heading text-base font-semibold">Retention</h2>
      <p>
        Vote-related change log entries (votes cast/removed, events created) are automatically deleted after
        about one month. Other change log entries (roster edits) are kept up to the log's usual size limit,
        unrelated to this feature.
      </p>

      <h2 class="font-heading text-base font-semibold">Cookies</h2>
      <p>
        The only cookie this site sets is a session cookie remembering whether you've unlocked editing with
        the shared PIN. It carries no personal or Discord-related information.
      </p>

      <h2 class="font-heading text-base font-semibold">No third-party sharing</h2>
      <p>
        Data collected here is not sold or shared with anyone outside this app and the Discord server it's
        connected to. It's used only to run the roster, events, and vote-tracking features described above.
      </p>

      <h2 class="font-heading text-base font-semibold">Removal requests</h2>
      <p>
        Want your Discord ID unlinked from a roster profile, or a vote record removed? Message a Host in the
        Discord server.
      </p>
    </div>
  </div>
</template>
