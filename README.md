# Homestay Tay Ninh Frontend

Next.js frontend for Homestay Tay Ninh. Deploy this repository to Vercel.

Backend repository: `https://github.com/TanPhucuit/homestaytayninh_backend.git`

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Web: `http://localhost:3000`

Required local env:

- `NEXT_PUBLIC_API_URL`: backend origin, without `/api`
- `GOOGLE_CLIENT_ID`: Google OAuth web client id
- `GOOGLE_CLIENT_SECRET`: Google OAuth web client secret, server-side only in Next route handlers

## Deploy on Vercel

- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Callback URL to allow in Google Cloud OAuth client:

```text
https://<your-vercel-domain>/auth/callback
```

## Auth

The frontend uses custom Google OAuth plus backend Redis sessions. Login flow:

1. `/auth/login/google` redirects to Google OAuth.
2. `/auth/callback` exchanges the code for a Google `id_token`.
3. The frontend posts the `id_token` to backend `/api/auth/google-login`.
4. Backend verifies Google and returns an app session token stored in the `htn_session` HTTP-only cookie.
5. Server-side API calls forward `Authorization: Bearer <htn_session>` to NestJS.

## Screens

- `/`: customer landing/search
- `/homestays`: search results and filters
- `/homestays/[id]`: homestay detail
- `/checkout`, `/checkout/services`, `/checkout/confirm`: booking flow
- `/bookings`, `/bookings/[id]`: booking history and detail
- `/login`: Google OAuth entry screen
- `/owner`, `/owner/manage`, `/owner/proxy-booking`: owner and owner staff portal
- `/staff`, `/staff/moderation`: staff CMS/moderation portal
- `/admin`: admin dashboard

## Authenticated E2E

`tests/e2e-authenticated-rbac.spec.ts` checks real authenticated UI state and RBAC only when supplied with Playwright storage states containing real `htn_session` cookies from the Redis-backed test environment.

Set `E2E_AUTH_BASE_URL` to the test deployment and provide `E2E_ADMIN_STORAGE_STATE`, `E2E_STAFF_STORAGE_STATE`, `E2E_OWNER_STORAGE_STATE`, `E2E_OWNER_STAFF_STORAGE_STATE` and `E2E_CUSTOMER_STORAGE_STATE` paths.

```powershell
npm run test:e2e:auth
```
