# Setup

Everything the app needs from you, plus what to do next.

## 1. Environment variables

Two files hold env vars:

- `.env` — non-secret-ish app config (`DATABASE_URL`, `ALLOWED_USER_IDS`, Clerk redirect paths).
  Already has placeholders; edit in place.
- `.env.local` — Clerk API keys, already populated for you with a **development** Clerk instance
  (`clerk env pull` was run during setup). Not committed to git.

| Variable                                                                                            | Where to get it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Required before                              |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                                                                                      | Railway → your MySQL service → **Connect** tab → copy the connection string that uses the **public** proxy host (e.g. `containers-us-west-x.railway.app`), not the private/internal one — Vercel can't reach Railway's private network. Format: `mysql://user:password@host:port/railway`                                                                                                                                                                                                                                                                                                                                                                               | Running any Prisma command or the app itself |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`                                             | Already in `.env.local` (development instance). For production, go to your Clerk app → **Configure** → create/select a **Production** instance → API keys, and add those as environment variables in your Vercel project (do not put production keys in this repo's files)                                                                                                                                                                                                                                                                                                                                                                                              | Deploying to production                      |
| `ALLOWED_USER_IDS`                                                                                  | 1. Run the app and sign in once at `/sign-in` using the account you want to be the owner (you'll land on a 404 immediately after — that's expected, see step 2). 2. Go to the [Clerk Dashboard](https://dashboard.clerk.com/) → **Users** → click your user → copy the **User ID** (starts with `user_`). 3. Paste it into `ALLOWED_USER_IDS` in `.env` (comma-separate if you ever add a second value). Restart the dev server.                                                                                                                                                                                                                                        | Reaching any page past sign-in               |
| `OPENROUTER_API_KEY`                                                                                | Secret — goes in `.env.local`, not `.env`. Sign up at [openrouter.ai](https://openrouter.ai/), then create a key at **Settings → Keys**. Used to generate scripts/thumbnails/ideas; the model itself is configured in `config/models.json`, not here.                                                                                                                                                                                                                                                                                                                                                                                                                   | Pressing "Generate" on any tab               |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` | Secrets — go in `.env.local`. In the Cloudflare dashboard: create an R2 bucket (**R2 Object Storage → Create bucket**) for `R2_BUCKET_NAME`; your `R2_ACCOUNT_ID` is shown on that same R2 overview page; create an API token under **Manage API Tokens → Create API Token** (permission: Object Read & Write, scoped to the bucket) for `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`. For `R2_PUBLIC_BASE_URL`, enable the bucket's public access under **Settings → Public Access** — either turn on the `r2.dev` dev URL (fine for testing, e.g. `https://pub-xxxx.r2.dev`) or connect a custom domain (recommended before real traffic, since r2.dev is rate-limited). | Pressing "Generate" on the Thumbnails tab    |

## 2. Clerk Dashboard: restrict sign-up

`/sign-up` exists so you (the owner) can create your account easily, but it should be locked down
at the source once you're done using it: in the Clerk Dashboard → your app → **Configure** →
**Restrictions**, set sign-up to restricted/invitation-only (or disable it) so no one else can
create a Clerk account for this application. Do this for both the development and production
instances.

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
   `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`,
   `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`,
   `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`.
3. Vercel will run `bun run build`, which runs `prisma generate` before `next build` — no extra
   build configuration needed.
4. Before the first production deploy with real users, run migrations against the production
   database: `bunx prisma migrate deploy` (from your machine, pointed at the production
   `DATABASE_URL`, or wire it into a deploy step).
5. **Custom domain (e.g. `www.socialmanager.live`)**: add it under the Vercel project's **Domains**
   tab first (Vercel gives you the DNS records to add at your registrar). Sign-in rendering blank
   on a real domain almost always means Clerk is still running on **development** keys
   (`pk_test_...`) — dev instances are only meant for `localhost`/preview URLs. Fix:
   1. Clerk Dashboard → top-left instance switcher → **Create production instance**.
   2. Clerk Dashboard → **Domains** → add `www.socialmanager.live`, then add the CNAME records it
      gives you at your DNS registrar (can take up to ~48h to propagate; the dashboard shows live
      verification status).
   3. Clerk Dashboard → **API keys** (with the **Production** instance selected) → copy the
      `pk_live_`/`sk_live_` pair into your Vercel project's env vars (Production scope) — never into
      this repo's `.env`/`.env.local`.
   4. Redeploy. Until DNS + the production instance are fully verified, keep using the dev keys on
      a Vercel-provided `*.vercel.app` URL rather than the custom domain.

## Next steps / what's intentionally not done yet

- **Generation calls OpenRouter** (`OPENROUTER_API_KEY`) using the model configured in
  `config/models.json` — edit `model` there to try a different OpenRouter model, no code changes
  needed. Each tab's "Generate" button sends the assembled prompt, waits for a response, and adds
  the result straight to that tab's list (there's no more manual "New Script"/"New Thumbnail" — the
  model creates the entry). Ideas still has a manual "New Idea" button alongside generation.
- **Ideas tab "Get Ideas" button is disabled** — it's the placeholder for the future automatic
  idea-generation call once a model is wired up.
- **Thumbnails generate a real image**, not just a prompt: the "thumbnails" model writes the title
  - image prompt, then the separate `thumbnailImage` model in `config/models.json` (an
    image-capable slug, e.g. a Nano Banana or GPT Image model) renders it, and the result is uploaded
    to Cloudflare R2 (`R2_*` env vars) and stored as the thumbnail's image URL. You can still
    overwrite it with your own URL via the "Image URL" field in the edit dialog.
- To tweak the wording of any tab's system prompt, edit `config/prompts.json` and restart the app —
  no code changes needed.
- Consider adding a Content-Security-Policy header once you've verified it against Clerk's hosted
  UI in your actual deployment — it was intentionally left out of `next.config.ts` for this build to
  avoid shipping an untested CSP that could silently break sign-in.
