# Setup

Everything the app needs from you, plus what to do next.

## 1. Environment variables

Two files hold env vars:

- `.env` — non-secret-ish app config (`DATABASE_URL`, `ALLOWED_USER_IDS`, Clerk redirect paths).
  Already has placeholders; edit in place.
- `.env.local` — Clerk API keys, already populated for you with a **development** Clerk instance
  (`clerk env pull` was run during setup). Not committed to git.

| Variable                                                | Where to get it                                                                                                                                                                                                                                                                                                                                                                                                                  | Required before                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                                          | Railway → your MySQL service → **Connect** tab → copy the connection string that uses the **public** proxy host (e.g. `containers-us-west-x.railway.app`), not the private/internal one — Vercel can't reach Railway's private network. Format: `mysql://user:password@host:port/railway`                                                                                                                                        | Running any Prisma command or the app itself |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Already in `.env.local` (development instance). For production, go to your Clerk app → **Configure** → create/select a **Production** instance → API keys, and add those as environment variables in your Vercel project (do not put production keys in this repo's files)                                                                                                                                                       | Deploying to production                      |
| `ALLOWED_USER_IDS`                                      | 1. Run the app and sign in once at `/sign-in` using the account you want to be the owner (you'll land on a 404 immediately after — that's expected, see step 2). 2. Go to the [Clerk Dashboard](https://dashboard.clerk.com/) → **Users** → click your user → copy the **User ID** (starts with `user_`). 3. Paste it into `ALLOWED_USER_IDS` in `.env` (comma-separate if you ever add a second value). Restart the dev server. | Reaching any page past sign-in               |

## 2. Clerk Dashboard: disable sign-up

This app has no `/sign-up` route, but also lock it down at the source: in the Clerk Dashboard →
your app → **Configure** → **Restrictions**, set sign-up to restricted/invitation-only (or disable
it) so no one can create a Clerk account for this application at all. Do this for both the
development and production instances.

## 3. Railway MySQL

1. Create a MySQL database on [Railway](https://railway.app/).
2. Copy its public connection string into `DATABASE_URL` in `.env`.
3. Run `bun run db:migrate` locally to create the schema (this generates a migration under
   `prisma/migrations` — commit that folder to git).
4. `bunx prisma studio` to browse the database if you want to sanity-check it.

## 4. Vercel deployment

1. Import the repo into Vercel.
2. Set these environment variables in the Vercel project (Production, and Preview if you want
   preview deployments to work): `DATABASE_URL`, `ALLOWED_USER_IDS`,
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (production Clerk instance keys — see
   table above), `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`,
   `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`.
3. Vercel will run `bun run build`, which runs `prisma generate` before `next build` — no extra
   build configuration needed.
4. Before the first production deploy with real users, run migrations against the production
   database: `bunx prisma migrate deploy` (from your machine, pointed at the production
   `DATABASE_URL`, or wire it into a deploy step).
5. In the Clerk Dashboard, add your Vercel production domain under **Domains** for the production
   instance.

## Next steps / what's intentionally not done yet

- **No AI model is connected.** Each tab's "Generate" button only assembles and previews the final
  prompt (with copy-to-clipboard) — nothing is sent anywhere yet. When you're ready: add your
  provider's API key as an env var, fill in `config/models.json`, and add a server action that
  calls the provider using the assembled prompt from `src/lib/prompt.ts`.
- **Ideas tab "Get Ideas" button is disabled** — it's the placeholder for the future automatic
  idea-generation call once a model is wired up.
- **Thumbnails only store a text prompt + an optional manual image URL** — no image generation or
  file upload/storage yet.
- To tweak the wording of any tab's system prompt, edit `config/prompts.json` and restart the app —
  no code changes needed.
- Consider adding a Content-Security-Policy header once you've verified it against Clerk's hosted
  UI in your actual deployment — it was intentionally left out of `next.config.ts` for this build to
  avoid shipping an untested CSP that could silently break sign-in.
