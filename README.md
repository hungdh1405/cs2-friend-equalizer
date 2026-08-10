# CS2 Friend Equalizer

A shared roster + team-balancer for a CS2 friend group, plus a Discord-native weekly event/vote system. Live at [csgo2.doxanh.dev](https://csgo2.doxanh.dev).

- **Roster** — player profiles (score, role, tags with skill levels, photo), public change log, tier badges (S/A/B/C/D).
- **Team builder** — select players, auto-balance into 2+ teams (client-only, `localStorage`-persisted).
- **Event/vote** — a Host schedules the week's session on the website; everyone votes via buttons on a Discord message (no login) — see `/event`. A bot reminds Hosts to schedule and nudges anyone who hasn't voted yet.

Editing anything (roster, events, Hosts) needs the shared PIN — reads are public. See [`DESIGN.md`](./DESIGN.md) for the full design rationale and a running decisions log of everything built and why.

## Stack

Nuxt 4 + Vue 3 + TypeScript, shadcn-vue, GSAP, on Nitro/Cloudflare Workers + KV. See `DESIGN.md` §11.

## Setup

```bash
pnpm install
cp .env.example .env   # fill in NUXT_APP_PIN, NUXT_SESSION_PASSWORD, and the Discord bot vars
```

## Development

```bash
make dev     # local dev server — KV falls back to a filesystem store, no Cloudflare account needed
make test    # Vitest suite for the team-balancing algorithms
```

## Deployment

```bash
make setup   # one-time: creates the Cloudflare KV namespace + pushes secrets from .env
make deploy  # build + deploy to Cloudflare Workers
```

Other useful targets: `make change-pin PIN=123456` (rotates the shared PIN), `make clear-changelog` (wipes the live change log). Run `make help` for the full list.
