# Frontend Deployment Guide

The frontend is a Next.js server (server components, route handlers, Google OAuth callback), so it runs as a **Render Web Service** next to the backend. `render.yaml` in this repository is the Blueprint.

## Create the service

1. Render Dashboard → **New → Blueprint** → select `TanPhucuit/homestaytayninh_frontend`.
2. Render reads `render.yaml` and creates `homestaytayninh-frontend`. Fill the secret variables it asks for:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Wait for the first deploy, then open `https://homestaytayninh-frontend.onrender.com/healthz`.

Build: `npm ci && npm run build` · Start: `npm run start` (Next.js listens on Render's `PORT`) · Health check: `/healthz`.

## Environment

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://homestaytayninh-backend.onrender.com` (backend origin, without `/api`; inlined at build time, redeploy after changing) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth web client |
| `GOOGLE_REDIRECT_URI` | `https://tayninhhomestay.id.vn/auth/callback` |

## Custom domain

Service → **Settings → Custom Domains**: add `tayninhhomestay.id.vn` and `www.tayninhhomestay.id.vn`, then create the DNS records Render shows (A record for the apex, CNAME `www` → `homestaytayninh-frontend.onrender.com`).

Allow these callback URLs in the Google Cloud OAuth client:

```text
https://tayninhhomestay.id.vn/auth/callback
https://homestaytayninh-frontend.onrender.com/auth/callback
```

The web app stores only the backend-issued `htn_session` HTTP-only cookie and forwards it as a bearer token to NestJS server-side API calls.

Backend lives in `https://github.com/TanPhucuit/homestaytayninh_backend.git`.
