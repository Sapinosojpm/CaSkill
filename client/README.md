# Client

React + Vite frontend for the CaSkill1 MVP browser game platform.

## Run

```bash
npm install
npm run dev
```

## Notes

- Uses the neon arcade palette:
  - primary `#e8ff47`
  - background `#0a0a08`
  - surface `#111110`
  - foreground `#f0efe8`
  - muted `#5a5a52`
  - border `#222220`
  - success `#a8e063`
  - warning `#ff9f43`
  - error `#ff4d4d`
- Includes `@mediapipe/tasks-vision` as the planned client-side vision layer for face and eye tracking anti-cheat.
- Future phases add routing, auth context, role-aware navigation, catalog pages, creator pages, admin pages, and the three sample games.

## Phase 4 Foundation

- React Router app shell with public, protected, creator, and admin routes
- Auth context backed by JWT token storage and `/api/auth/me`
- Role-aware navigation and guarded route helpers
- Page scaffolding for:
  - landing, catalog, game detail, play, leaderboard, profile
  - creator dashboard, upload, submissions, submission detail
  - admin dashboard, review list, review detail, cheat flags

## Phase 5 Creator UI

- Creator dashboard now loads live stats from `/api/creator/dashboard`
- Upload page sends multipart ZIP + thumbnail payloads to `/api/creator/games/upload`
- Submission list and detail pages load from creator endpoints
- Uploaded submissions can be sent into review with `/api/creator/games/submit`

## Phase 6-8 Frontend

- Admin dashboards and review pages now call live moderation endpoints
- Public catalog, game detail, play, and leaderboard pages now call live backend APIs
- Three built-in browser games are integrated into the play flow:
  - Memory Match
  - Quiz Game
  - Reaction Clicker
- Play flow now starts a protected session, runs a browser game, monitors attention signals, and submits scores

## MediaPipe Note

- The attention monitor dynamically loads MediaPipe Tasks Vision in the browser for face visibility and look-away heuristics.
- TODO: pin and self-host the model and wasm assets for a more production-ready deployment path.
