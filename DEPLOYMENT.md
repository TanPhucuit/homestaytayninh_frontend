# Frontend Deployment Guide

This repository is frontend-only and should be deployed to Vercel.

Recommended Vercel project settings:

- Root Directory: repository root
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`

Required env:

- `NEXT_PUBLIC_API_URL`: deployed Render backend origin, without `/api`
- `NEXT_PUBLIC_SUPABASE_URL`: `https://qvzzykkpekmydtbijhqr.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key only
- `NEXT_PUBLIC_AUTH_MODE`: `supabase`
- `NEXT_PUBLIC_ENABLE_MOCK_DATA`: `false`

Example:

```bash
NEXT_PUBLIC_API_URL="https://homestaytayninh-backend.onrender.com"
NEXT_PUBLIC_AUTH_MODE="supabase"
NEXT_PUBLIC_ENABLE_MOCK_DATA="false"
```

Enable Google Auth in Supabase and allow the deployed OAuth callback:

```text
https://<your-vercel-domain>/auth/callback
```

The web app forwards Supabase sessions as bearer tokens to NestJS. Mock API data is opt-in only for isolated UI development.

Backend lives in `https://github.com/TanPhucuit/homestaytayninh_backend.git` and should be deployed to Render.
