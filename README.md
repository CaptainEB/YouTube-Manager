# YouTube Manager

A single-user, publicly-hosted content-creation workspace for a YouTube channel: scripts,
thumbnails, video ideas, and a dashboard of videos you've actually assembled and published. Only
the channel owner can ever see any data — see [Security](#security) below.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Prisma 7 + MySQL (Railway) · Clerk ·
Zod · shadcn/ui + Tailwind v4 · Bun (runtime & package manager)

## Getting started

```bash
bun install
bun run db:migrate   # applies the Prisma schema to your database
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). See [SETUP.md](./SETUP.md) for every
environment variable you need and where to get it (Railway MySQL, Clerk keys, your allowed user
id), plus Vercel deployment steps.

## Commands

| Command                           | What it does                                              |
| --------------------------------- | --------------------------------------------------------- |
| `bun run dev`                     | Start the dev server                                      |
| `bun run build`                   | `prisma generate` then `next build`                       |
| `bun run lint` / `bun run format` | ESLint / Prettier                                         |
| `bun run db:push`                 | Push schema changes without a migration (quick iteration) |
| `bun run db:migrate`              | Create and apply a migration                              |
| `bun run db:studio`               | Browse the database                                       |

## How the app is organized

- **Scripts / Thumbnails / Ideas** — each is a "generation workspace": a collapsible **Rules**
  panel (your standing instructions for that tab, autosaved), a prompt box, a **Generate** button
  that assembles `system prompt + rules + (channel context) + your prompt` into a preview dialog
  you can copy, and a flat list of saved items below with create/edit/delete. No AI model is wired
  up yet — see [SETUP.md](./SETUP.md#next-steps--whats-intentionally-not-done-yet).
- **Dashboard** — a grid of videos you've actually made. Each one links back to the specific
  Script, Thumbnail, and Idea you used, plus the live video link, description, tags, and notes.
- **Settings** — theme, account management, and a read-only look at the current system prompts.

### Developer-tunable config (no code changes needed)

- `config/prompts.json` — the system prompt for each tab. Edit this and restart the app.
- `config/models.json` — placeholder for AI provider/model settings once one is connected.

### Adding a new generation tab (beyond Scripts/Thumbnails/Ideas)

1. Add a Prisma model for it (copy the shape of `Script`) and run `bun run db:migrate`.
2. Add a Zod schema in `src/schemas/`.
3. Add a server actions file in `src/server/actions/` (list/create/update/delete, each starting
   with `requireOwner()`).
4. Add an entry to `GENERATION_FEATURES` in `src/config/features.ts` and a matching key in
   `config/prompts.json`.
5. Add a route under `src/app/(app)/<tab>/` following the Scripts tab as the template.

## Security

Four layers, all required — see the "Security model" section in
[.github/copilot-instructions.md](./.github/copilot-instructions.md) for the full write-up:
Clerk authentication → an owner allowlist (`ALLOWED_USER_IDS`) → a `requireOwner()` check in every
page and Server Action → every database query scoped to the caller's own rows. There is no sign-up
page; this app is for the owner only.

## Design

`design/DESIGN.md` and `design/code.html` are the source-of-truth mockup/style guide, mapped onto
shadcn's theme tokens in `src/app/globals.css`. Both light and dark themes are supported
(`src/components/layout/theme-toggle.tsx`).
