# Love Arcade

Next.js (App Router) + Tailwind + Framer Motion frontend (Vercel)
Express + TypeScript + MongoDB backend (Render)
Public, fără login. Identificare anonimă cu `visitorId` în `localStorage` + header `X-Visitor-Id`.

## Structură
- package.json (root, workspaces)
- frontend/ (Next.js)
- backend/ (Express + Mongoose + Zod)

## Quick start (local)
1) `npm install`
2) Copiază `backend/.env.example` în `backend/.env` ?i setează `MONGODB_URI` (Atlas).
3) Copiază `frontend/.env.example` în `frontend/.env.local` (lasă URL-ul backendului).
4) `npm run dev` (backend 3001, frontend 3000).
5) Seed: `npm --prefix backend run seed` după ce Mongo este setat.

## Backend
- Dev: `npm --prefix backend run dev`
- Build/Start: `npm --prefix backend run build && npm --prefix backend run start`
- Env:
  - `PORT=3001`
  - `MONGODB_URI=mongodb+srv://...`
  - `CORS_ORIGINS=http://localhost:3000,https://<vercel-domain>`
  - `RATE_LIMIT_PER_MIN=60`
- Rute:
  - `GET /health`
  - Scores: `POST /scores {game,score,meta?}`; `GET /leaderboard?game=...&limit=20`; `GET /my-best?game=...`
  - Messages: `GET /messages/generate?category=...&name=...`; `GET /messages/random?...`
  - Favorites: `POST /favorites {text,category}`; `GET /favorites`; `DELETE /favorites/:id`
- Rate limit: 60 req/min pentru /scores ?i /messages.

## Frontend
- Dev: `npm --prefix frontend run dev`
- Env: `NEXT_PUBLIC_API_URL=http://localhost:3001` (sau URL-ul Render)
- Pagini: `/`, `/arcade`, `/games/flappy`, `/games/tetris`, `/games/2048`, `/messages`, `/leaderboard`, `/profile`
- API wrapper `src/lib/api.ts` ata?ează automat `X-Visitor-Id`.
- Jocuri: controale swipe + tastatură, toasts pentru milestone-uri.

## Deploy
### Backend (Render)
- Web Service
- Build: `npm install && npm run build`
- Start: `npm run start`
- Env: `PORT=10000` (Render), `MONGODB_URI`, `CORS_ORIGINS=https://<vercel-domain>`
- Seed one-time: `npm run seed`

### Frontend (Vercel)
- Framework: Next.js
- Env: `NEXT_PUBLIC_API_URL=https://<render-service-url>`
- Build command: `npm run build`

### CORS
Include atât local cât ?i domeniul Vercel în `CORS_ORIGINS`.

## Note
- Template-urile de mesaje sunt în română, cu `{NAME}` înlocuit cu numele trimis (default Alexandra).
- Profilul folose?te timezone Europe/Bucharest ?i data fixă 19 iunie 2025.
- Aplica?ia este publică, fără autentificare; `visitorId` stă doar pe device.

