# Love Arcade Backend

## Local setup
1) `npm install`
2) Copy `.env.example` to `.env` and set `MONGODB_URI`.
3) Run dev server: `npm run dev`

## Scripts
- Seed data: `npm run seed`
- Clear leaderboard scores: `npm run clear:scores`

## Admin reset endpoint
`POST /admin/reset-scores` with header `Authorization: Bearer <ADMIN_TOKEN>`.
