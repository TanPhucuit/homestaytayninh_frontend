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
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/publishable key

## Screens

- `/`: customer landing/search
- `/homestays`: search results and filters
- `/homestays/[id]`: homestay detail
- `/checkout`: customer checkout, add-on services, ApiPay state panels
- `/bookings`: customer booking history/order summary
- `/bookings/[id]`: booking detail, payment summary, in-stay service ordering
- `/login`: Supabase Auth role routing mock
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

The API client appends `/api/...` internally and falls back to demo data when the env is missing or the backend is offline.
