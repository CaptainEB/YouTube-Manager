# Copilot instructions — YouTube Manager

Single-user, publicly-hosted content-creation tool for a YouTube channel (scripts, thumbnails,
ideas, and a dashboard of assembled/published videos). Only the channel owner can ever see data —
this is not a multi-tenant app.

## Stack & versions (as of initial build, 2026-08-24)

- **Runtime/package manager: Bun** (`bun@1.3.3`). Use `bun add`, `bun run <script>`, `bunx <tool>`.
  Never suggest `npm`/`yarn`/`pnpm` commands.
- **Next.js 16** (App Router, Turbopack by default) + **React 19.2** + **TypeScript**.
- **Prisma 7** ORM + **MySQL** (Railway) via the `@prisma/adapter-mariadb` driver adapter.
- **Clerk** (`@clerk/nextjs` v7) for auth. **Zod v4** for validation. **shadcn/ui** (style
  `radix-vega`) + **Tailwind v4** for UI. **lucide-react** for icons. **next-themes** for light/dark.
- No `react-hook-form`. Forms use shadcn's `Field`/`FieldGroup` primitives + local React state +
  Server Actions called directly from client components (not `useActionState`/FormData parsing).

## Critical version-specific gotchas — read before touching these areas

- **Next.js 16 renamed `middleware.ts` to `proxy.ts`.** The file is `src/proxy.ts`. Do not create
  `middleware.ts`. Full details in `node_modules/next/dist/docs/` if something seems off — this
  version genuinely differs from older Next.js you may have trained on (async `params`/
  `searchParams` are mandatory everywhere, no sync fallback).
- **Clerk protection model changed**: routes are public by default; `createRouteMatcher()` is
  deprecated for protection. We do NOT use middleware/proxy for auth gating. All protection happens
  via `requireOwner()` (see Security below). Don't add route-matcher-based protection to
  `src/proxy.ts` — it would contradict the current recommended pattern and give a false sense of
  security.
- **Prisma 7 is a major departure from v5/v6**: generator uses `provider = "prisma-client"` with a
  required custom `output` (`src/generated/prisma`, gitignored, regenerated via `postinstall` and
  the `build` script — never hand-edit it). Client is imported from `@/generated/prisma/client`,
  not `@prisma/client`. A driver adapter is mandatory — we use `PrismaMariaDb` from
  `@prisma/adapter-mariadb` (self-hosted/Railway MySQL uses the plain `mysql://` connection
  string format, real foreign keys, default `relationMode`). Config lives in `prisma.config.ts`
  (not just `schema.prisma`). Run `prisma generate` explicitly after schema changes — `migrate dev`
  / `db push` no longer auto-generate.
- **Bun blocks postinstall scripts by default.** New native/postinstall deps must be added to
  `trustedDependencies` in `package.json` (or run `bun pm trust <pkg>`) or they'll silently no-op.

## Security model (do not weaken any layer)

Four layers, all required — do not treat any single one as sufficient on its own:

1. `src/proxy.ts` — plain `clerkMiddleware()`, just wires up Clerk's auth context. Not a gate.
2. `src/lib/auth.ts` → `requireOwner()` — checks `await auth()` for a session, then checks the
   caller's Clerk user id against the `ALLOWED_USER_IDS` env allowlist. No session → redirect to
   `/sign-in`. Session but not the owner → `notFound()` (looks identical to a route that doesn't
   exist — never reveal that the app exists to non-owners).
3. **Every** page/layout under `src/app/(app)/` and **every** exported function in
   `src/server/actions/*.ts` must call `await requireOwner()` as its first line, even though the
   `(app)` layout already calls it — Server Actions are independently reachable POST endpoints and
   must not rely on a layout guard alone.
4. Every Prisma query is scoped `where: { id, userId }` (never `{ id }` alone). Foreign-key links
   between entities (e.g. linking a Script to a Video) must be re-verified server-side to belong to
   the same `userId` — never trust an id sent from the client just because a Select only offered
   the user's own options (see `assertLinksBelongToUser` in `src/server/actions/videos.ts` for the
   pattern).

There is intentionally no `/sign-up` route. `/` redirects signed-in users to `/dashboard` and
signed-out users to `/sign-in`. Do not add a sign-up page or a `signUpUrl` prop.

All server action inputs are parsed with `.safeParse()` against a Zod schema in `src/schemas/`
before touching the database; return `{ ok: false, error }` (see `src/lib/action-result.ts`) rather
than throwing raw errors to the client. URLs (`imageUrl`, `videoUrl`) are constrained to `https://`
only via `optionalHttpsUrl` in `src/schemas/common.ts`.

## Design language

Source of truth: `design/DESIGN.md` (light theme prose + Material tokens) and `design/code.html`
(a literal dark-theme mockup of the Scripts page). Both are mapped onto shadcn's CSS variables in
`src/app/globals.css` (`:root` = light, `.dark` = dark) — always style through those semantic
tokens (`bg-card`, `text-muted-foreground`, `bg-sidebar`, etc.), never hardcode hex colors in
components.

- Brand red `#ff0000` is `--primary` in both themes — reserved for primary actions (Generate, New
  X, Save, active nav item), not decoration.
- **Do not overuse the `Card` component.** Lists (Scripts/Thumbnails/Ideas items) use flat rows
  with `divide-y` dividers and a hover background (`src/components/items/item-list.tsx` +
  `item-row.tsx`) — no per-row Card. `Card` is reserved for the Dashboard's video grid tiles, which
  are genuinely card-like (thumbnail-led visual tiles), and any other genuinely
  tile/gallery-style content.
- Always check for an existing shadcn component (`src/components/ui/`) before writing a UI
  primitive by hand. Add new ones with `bunx shadcn@latest add <name>` (registry name may need the
  `@shadcn/` prefix, e.g. `@shadcn/form`).
- Inter font (`next/font/google`), 0.625rem `--radius` (already tuned so shadcn's `rounded-md`
  equals the design's 0.5rem standard-control radius — don't change it). For large containers that
  want the bigger 16–24px radii from the design system, apply `rounded-2xl`/`rounded-3xl` directly
  rather than redefining the global radius scale.
- User-supplied images (thumbnail/video preview URLs) are rendered with plain `<img>`, not
  `next/image` — this avoids having to allowlist arbitrary external hosts and avoids server-side
  fetching of attacker-influenceable URLs.

## Project structure & conventions

- `src/app/(app)/<route>/page.tsx` — thin Server Component: `requireOwner()` (via the group
  layout), fetch data through `src/server/actions/*`, pass it to a `_components/*-client.tsx`
  Client Component that owns dialogs/state.
- `src/app/(app)/<route>/_components/` — page-private components (the `_` prefix keeps them
  non-routable). Not imported from other routes.
- `src/components/` — shared, globally importable via `@/components/...`: `ui/` (shadcn, don't
  hand-edit unless customizing), `layout/` (shell chrome: nav, theme toggle, page header),
  `workspace/` (the Rules+prompt+preview generation pattern shared by Scripts/Thumbnails/Ideas),
  `items/` (the flat list-row pattern shared by the same three).
- `src/server/actions/<entity>.ts` — one file per entity, `"use server"` at the top, every export
  starts with `requireOwner()`.
- `src/schemas/<entity>.ts` — Zod schemas shared by client forms (for types) and server actions
  (for `.safeParse()`).
- `src/lib/` — pure server-safe helpers (`prisma.ts`, `auth.ts`, `config.ts`, `prompt.ts`,
  `channel-context.ts`, `action-result.ts`).
- `config/` (repo root, **not** under `src/`) — the developer-tuning surface the user explicitly
  asked for: `prompts.json` (per-tab system prompts) and `models.json` (the OpenRouter model slug +
  temperature + max output tokens used for generation, with an optional per-feature override —
  edit `model` there to try a different OpenRouter model, no code changes needed). Loaded and
  Zod-validated in `src/lib/config.ts` (fails fast at startup on a malformed/missing key) via the
  `@config/*` path alias.
- `src/config/features.ts` (note: different from repo-root `config/`) — the code-level feature
  registry driving the sidebar nav and each generation tab's label/route/entity nouns. Adding a
  fourth generation tab (beyond scripts/thumbnails/ideas) means: add an entry here, add a matching
  key to `config/prompts.json`, add a Prisma model + schema + server action file + `_components/`
  following the Scripts tab as the template, add a route under `src/app/(app)/`.
- No barrel files (`index.ts` re-exports) — import directly from the specific file.

## The generation workspace pattern (Scripts/Thumbnails/Ideas)

Each of these tabs is: a collapsible **Rules** panel (per-user, per-feature, debounced autosave via
`saveRule` in `src/server/actions/rules.ts`, stored in the `Rule` model keyed on
`(userId, feature)`) → a **prompt** textarea → **Generate** button. Pressing Generate calls that
tab's `generate<Entity>` Server Action (`src/server/actions/{scripts,thumbnails,ideas}.ts`), which
re-derives the system prompt (`getSystemPrompt`) and, for Ideas, channel context server-side (never
trusts these from the client), assembles them with `src/lib/prompt.ts`'s `assembleFinalPrompt` +
`toChatMessages`, and calls OpenRouter via `src/lib/openrouter.ts`'s `generateJsonCompletion` using
the model from `getModelConfig()`. The model is forced into `{ title, <body field> }` JSON via
`response_format: json_schema`, then re-validated through that entity's existing Zod input schema
before being persisted — never trust AI output any more than client input. The button shows a
loading state (`useTransition`) while waiting; there's no separate preview step anymore. Don't
change `assembleFinalPrompt`'s shape unless the input parameters genuinely change.

Scripts and Thumbnails no longer have a manual "New" button — generation is the only way to create
an entry, though existing entries can still be edited (`ScriptFormDialog`/`ThumbnailFormDialog` are
edit-only). Ideas keeps a manual "New Idea" button alongside generation. The Ideas tab additionally
injects a "channel context" block (`src/lib/channel-context.ts`, compiled from the user's own
published `Video` rows) and has a disabled "Get Ideas" button as the placeholder for the future
automatic-idea-generation call (distinct from the per-prompt Generate button).

## Commands

- `bun run dev` / `bun run build` (runs `prisma generate` first) / `bun run start`
- `bun run lint` / `bun run format`
- `bun run db:push` (dev-branch style schema sync) / `bun run db:migrate` (creates a migration) /
  `bun run db:studio`
- `bunx clerk@latest doctor` to sanity-check the Clerk setup after touching auth.
