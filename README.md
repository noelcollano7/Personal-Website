

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
