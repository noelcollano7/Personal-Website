

A premium personal portfolio website for a customer service professional with a growing focus on AI automation and workflow optimization.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide Icons

## Getting Started

```bash
npm install
npm run dev
```

The site will be available in the browser at the local Vite port.

## Production Build

```bash
npm run build
```

This writes the production bundle to the `dist` folder.

## Cloudflare Pages Deployment

1. Push this project to GitHub.
2. In Cloudflare Pages, click "Create a project" and connect the repository.
3. Use the following settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Save and deploy.
5. Keep the `_redirects` file in the public folder so browser routes resolve correctly.

## Vercel Deployment

Import the repository into Vercel and use the Vite defaults (`npm run build`, output directory `dist`). Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in **Project Settings → Environment Variables** for Production (and Preview if used), then redeploy. Vite embeds these public values during the build. `vercel.json` rewrites browser routes such as `/contact` to the app entry point.

## AI Chat API (Vercel)

The server-side function at `api/chat.ts` exposes `POST /api/chat`, validates AI SDK UI messages, and streams an AI SDK UI-message response. The SPA fallback in `vercel.json` excludes `/api/*`, so API paths are not rewritten to the app shell. This function runs on Vercel; deploying the static site to Cloudflare Pages does not run it.

Configure these values in **Vercel Project Settings → Environment Variables** for each environment, then redeploy:

- `AI_GATEWAY_API_KEY` (required): a server-only key created in the Vercel AI Gateway dashboard. Never prefix it with `VITE_` or expose it to client code.
- `AI_MODEL` (optional): a server-only Gateway model ID. The default is `google/gemini-2.5-flash-lite`. Check current model availability and pricing in the [AI Gateway catalog](https://vercel.com/ai-gateway/models) before changing it. Model calls are billable and subject to provider/Gateway limits; do not assume free or unlimited usage.
- `CHATBOT_SYSTEM_PROMPT` (optional): additional verified portfolio context and instructions. The server always appends this to its grounding instructions, which prohibit inventing qualifications, projects, work history, or availability.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (required): server-only credentials for persistent chat rate limiting. Do not add a `VITE_` prefix.

### Configure persistent rate limiting

The function uses Upstash's sliding-window limiter to allow 10 requests per visitor per 10 minutes. It identifies visitors only from Vercel's `x-real-ip` request header, validates it as an IP address, and hashes it with SHA-256 before sending the identifier to Redis. It never trusts `x-forwarded-for` or another client-supplied IP header. Redis credentials are used only by the server function. Missing credentials, an unavailable Redis service, or a rate-limit timeout fail closed with HTTP 503; visitors over the limit receive HTTP 429 and a `Retry-After` header.

1. Create a Redis database in the [Upstash Console](https://console.upstash.com/redis). Choose a region near your Vercel function when possible.
2. Open that database's **REST API** section and copy its REST URL and REST token. Keep both values private.
3. For local development, add the values to `.env.local` (ignored by Git), or pull your Vercel Development environment variables with the Vercel CLI:

   ```dotenv
   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
   ```

4. In Vercel, open **Project Settings → Environment Variables** and add both names with the matching Upstash values for Development, Preview, and Production as needed. Do not expose them as `VITE_` variables.
5. Redeploy the Vercel project so the function receives the configured values.

Upstash has its own usage limits and pricing; check the current [Upstash Redis pricing](https://upstash.com/pricing/redis). Each rate-limit check uses shared Redis state, so this protection does not depend on a particular Vercel function instance. If Redis cannot verify a request, the chatbot rejects it rather than falling back to an in-memory limiter.

For local testing, create a development key in Vercel AI Gateway, link the project, pull its Vercel environment values, and start the Vercel development server:

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel dev
```

Alternatively, put `AI_GATEWAY_API_KEY` and optional `AI_MODEL`/`CHATBOT_SYSTEM_PROMPT` values in `.env.local`; never put server credentials in a `VITE_` variable. `.env.local` is ignored by Git. `npm run dev` starts Vite only; use `npx vercel dev` to run `/api/chat`.

To smoke-test the route while `vercel dev` is running, use the URL it prints (typically port 3000):

```bash
curl.exe -N -X POST http://localhost:3000/api/chat `
  -H "Content-Type: application/json" `
  -H "x-real-ip: 127.0.0.1" `
  --data-raw "{\"messages\":[{\"id\":\"1\",\"role\":\"user\",\"parts\":[{\"type\":\"text\",\"text\":\"Hello\"}]}]}"
```

The function caps requests at 32 KiB, 20 messages, 12,000 input characters, and 512 output tokens; it rejects empty/unsupported message parts, enforces the Redis-backed `429` limit before making any AI request, and returns a safe `503` if Gateway credentials, rate-limit credentials, or the Vercel client-IP header are missing. Provider failures after streaming begins are returned as a sanitized stream error; the HTTP status cannot be changed after response headers have been sent. Vercel cancellation support is enabled for this function, and client cancellation is passed to the SDK.

Deploy through the existing Vercel project/Git integration after setting the environment variables above. No Next.js conversion or new deployment configuration is required. A successful build or request-validation test does not confirm a live AI response; test with a configured Gateway key and verify the actual streamed response before claiming the chatbot is operational.

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Environment Variables

The contact form requires a Supabase project. Copy `.env.example` to `.env` and configure:

```bash
Copy-Item .env.example .env
```

Set `VITE_SUPABASE_URL` to your Supabase project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key. These are public client values; never use a service-role or secret key in this frontend.

## Supabase Contact Form Setup

1. In the Supabase Dashboard, open **Project Settings → API** and copy the project URL and publishable key into `.env`.
2. In **SQL Editor**, run [`supabase/migrations/20261030120000_create_contact_messages.sql`](./supabase/migrations/20261030120000_create_contact_messages.sql). It creates the `contact_messages` table, validates submitted values in PostgreSQL, and enables RLS. Public roles are not granted read, update, or delete access.
3. Configure and deploy the contact function as described below, then run the site with `npm run dev` and submit the Contact form to test it.

For Cloudflare Pages, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under the project's **Settings → Variables and Secrets** for every environment you deploy (Production and Preview, if used), then trigger a new deployment. Vite embeds these public values during the build.

## Server-side Contact Submissions

Contact submissions are validated and saved to the `contact_messages` table by a Supabase Edge Function. No email provider, Google OAuth setup, or additional function secrets are needed. View submissions in **Supabase Dashboard → Table Editor → contact_messages**.

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link this repository to your Supabase project:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. In the Supabase SQL Editor, run [`supabase/migrations/20261030133000_secure_contact_submissions.sql`](./supabase/migrations/20261030133000_secure_contact_submissions.sql). It restricts direct public inserts and creates the private rate-limit storage/function.
3. Set the allowed website origins as a function secret, comma-separated, without trailing slashes:

   ```bash
   supabase secrets set CONTACT_ALLOWED_ORIGINS=http://localhost:5173,https://your-site.example.com
   ```

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions automatically. Do not add a service-role key to `.env`, a `VITE_` variable, or Cloudflare Pages.
4. Deploy the function:

   ```bash
   supabase functions deploy send-contact-email
   ```

   `supabase/config.toml` disables JWT verification for this public form endpoint. The function independently validates the exact browser origin, validates all fields, and enforces a database-backed rate limit.

## Notes

- Replace placeholder profile URLs and contact details before publishing.
- Contact submissions are saved in Supabase; view them in **Table Editor → contact_messages**.
- The form has a honeypot, client-side validation, server-side validation, and an IP-based submission limit. PostgreSQL constraints independently enforce required values, email shape, and maximum lengths.
- Never put a Supabase service-role key or secret key in a `VITE_` variable or frontend deployment configuration.
