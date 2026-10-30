# Ari Santos Portfolio

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
2. In **SQL Editor**, run [`supabase/migrations/20261030120000_create_contact_messages.sql`](./supabase/migrations/20261030120000_create_contact_messages.sql). It creates the `contact_messages` table, validates submitted values in PostgreSQL, enables RLS, and permits inserts only. Public roles are not granted read, update, or delete access.
3. Run the site with `npm run dev` and submit the Contact form to test the connection.

For Cloudflare Pages, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under the project's **Settings → Variables and Secrets** for every environment you deploy (Production and Preview, if used), then trigger a new deployment. Vite embeds these public values during the build.

## Notes

- Replace placeholder profile URLs and contact details before publishing.
- Contact submissions are saved to Supabase; success is shown only after the insert succeeds.
- The form has a honeypot enforced by both the client and database, plus client-side validation. PostgreSQL constraints independently enforce required values, email shape, and maximum lengths.
- Never put a Supabase service-role key or secret key in a `VITE_` variable or frontend deployment configuration.
