# ProjE – Web App (Next.js)

Next.js front end for ProjE. Landing page, login/register, dashboard, tests, mock tests, sample papers, interview prep, blogs, notifications, and billing.

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy env example and set variables if needed:

   ```bash
   cp .env.example .env.local
   ```

   See `.env.example` for `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Leave them unset in dev to use defaults (Next on port 3001, `/api` proxied to backend).

3. Run the ProjE API (see `api/README.md`) on port 3000.

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   The app runs at [http://localhost:3001](http://localhost:3001). Requests to `/api/*` are rewritten to the backend.

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Base URL of this app (sitemap/robots). Defaults to Vercel URL or fallback. |
| `NEXT_PUBLIC_API_URL` | Backend API URL. Empty = use same-origin `/api` (proxy). |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID for Sign in with Google. |

## Tech

- Next.js (App Router), React, TypeScript, Tailwind CSS
- React Query, React Hook Form, Zustand
- API client with JWT and error handling

## Deploy

Build: `pnpm build`. Start: `pnpm start`. Set `NEXT_PUBLIC_API_URL` (and optionally `NEXT_PUBLIC_APP_URL`) for production.
