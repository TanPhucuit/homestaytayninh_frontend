# Homestay Tay Ninh Frontend

Next.js frontend for Homestay Tay Ninh. Deploy this repository to Vercel.

Backend repository: `https://github.com/TanPhucuit/homestaytayninh_backend.git`

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Web: `http://localhost:3000`
API env: `NEXT_PUBLIC_API_URL`

## Deploy on Vercel

- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Env:
  - `NEXT_PUBLIC_API_URL`: Render backend URL
  - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key

Enable the Google provider in Supabase Auth and add the Vercel callback URL to the redirect allow list:

```text
https://<your-vercel-domain>/auth/callback
```

## Screens

- `/`: customer landing/search
- `/homestays`: search results and filters
- `/homestays/[id]`: homestay detail
- `/checkout`: customer checkout, add-on services, ApiPay state panels
- `/bookings`: customer booking history/order summary
- `/bookings/[id]`: booking detail, payment summary, in-stay service ordering
- `/login`: Supabase Google OAuth entry screen
- `/owner`: owner and owner staff portal
- `/owner/manage`: homestay, room, service, image and price management
- `/staff`: CMS/user moderation portal
- `/admin`: admin dashboard

## Frontend to Backend Contract

Set `NEXT_PUBLIC_API_URL` to the Render backend origin, without `/api`.

Example:

```bash
NEXT_PUBLIC_API_URL="https://homestaytayninh-backend.onrender.com"
```

The API client appends `/api/...` internally and forwards the Supabase bearer session to protected NestJS endpoints. Protected workflows use the persisted Supabase profile role returned by the backend; the frontend has no impersonation or mock-data mode.

## Authenticated E2E

`tests/e2e-authenticated-rbac.spec.ts` checks real authenticated UI state and RBAC only when supplied with browser storage states captured after successful Supabase logins in an isolated test environment. It never fabricates session cookies or intercepts API responses.

Set `E2E_AUTH_BASE_URL` to the test deployment and provide `E2E_ADMIN_STORAGE_STATE`, `E2E_STAFF_STORAGE_STATE`, `E2E_OWNER_STORAGE_STATE`, `E2E_OWNER_STAFF_STORAGE_STATE` and `E2E_CUSTOMER_STORAGE_STATE` paths. Each storage-state file must come from signing in as the corresponding real Supabase Auth test account against that deployment.

```powershell
npm run test:e2e:auth
```
