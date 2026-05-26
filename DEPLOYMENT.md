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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable/anon key only

Example:

```bash
NEXT_PUBLIC_API_URL="https://homestaytayninh-backend.onrender.com"
```

The web app has fallback demo data, so Vercel previews still render even before API env is configured.

Backend lives in `https://github.com/TanPhucuit/homestaytayninh_backend.git` and should be deployed to Render.
