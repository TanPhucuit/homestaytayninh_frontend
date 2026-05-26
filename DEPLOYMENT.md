# Frontend Deployment Guide

This repository is frontend-only and should be deployed to Vercel.

Recommended Vercel settings:

- Root Directory: repository root
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`

Required env:

- `NEXT_PUBLIC_API_URL`: deployed backend origin, without `/api`
- `GOOGLE_CLIENT_ID`: Google OAuth web client id
- `GOOGLE_CLIENT_SECRET`: Google OAuth web client secret

Example:

```bash
NEXT_PUBLIC_API_URL="https://homestaytayninh-backend.onrender.com"
GOOGLE_CLIENT_ID="<google-oauth-client-id>"
GOOGLE_CLIENT_SECRET="<google-oauth-client-secret>"
```

Allow this callback URL in Google Cloud OAuth:

```text
https://<your-vercel-domain>/auth/callback
```

The web app stores only the backend-issued `htn_session` HTTP-only cookie and forwards it as a bearer token to NestJS server-side API calls.

Backend lives in `https://github.com/TanPhucuit/homestaytayninh_backend.git` and should be deployed to Render or another Node host with Redis.
