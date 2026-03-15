# Server

Express + Prisma backend for the CaSkill1 MVP browser game platform.

## Run

```bash
npm install
npm run prisma:generate
npx prisma migrate dev --name init_mvp
npm run prisma:seed
npm run dev
```

For Supabase-backed setup, prefer:

```bash
npx prisma db push
node dist/prisma/seed.js
npm run dev
```

## Notes

- PostgreSQL is the primary database for the MVP.
- Uploaded creator packages are stored locally in `uploads/` for the MVP preview flow.
- Future phases add the full Prisma schema, auth, creator uploads, admin review, sessions, scores, leaderboards, and anti-cheat checks.
- Anti-cheat will combine backend score/session validation with client-provided MediaPipe face and eye attention signals for look-away detection.

## Phase 2 Schema Notes

- `Game` represents the publishable catalog entity and can move through internal statuses before becoming public.
- `GameSubmission` tracks creator uploads and admin review state for each package.
- `Review` stores reviewer decisions separately so the audit trail stays intact.
- `Score`, `CheatFlag`, and `PlaySession` include room for MVP anti-cheat data, including session token snapshots and MediaPipe-derived visibility signals.

## Phase 3 Foundation

- Express app factory with `helmet`, `cors`, JSON parsing, `morgan`, and rate limiting.
- Central route registration under `/api`.
- JWT auth with public register/login and protected `/api/auth/me`.
- Role middleware for later creator/admin routes.
- Centralized validation and error handling.

### Working auth routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Registration rule

- Public registration allows `PLAYER` and `CREATOR`.
- `ADMIN` is seed/manual only for the MVP.

## Phase 5 Creator Flow

- `GET /api/creator/dashboard`
- `POST /api/creator/games/upload`
- `POST /api/creator/games/submit`
- `GET /api/creator/submissions`
- `GET /api/creator/submissions/:id`

### Upload behavior

- Requires authenticated `CREATOR` or `ADMIN`
- Accepts multipart `title`, `description`, `category`, `version`, `thumbnail`, and `zipFile`
- Validates `manifest.json`, `README.md`, `dist/` or `build/`, and `entryFile`
- Stores files under local `uploads/` and creates `Game` + `GameSubmission` records

## Phase 6-8 Platform APIs

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/submissions`
- `GET /api/admin/submissions/:id`
- `POST /api/admin/submissions/:id/approve`
- `POST /api/admin/submissions/:id/reject`
- `GET /api/admin/cheat-flags`

### Games

- `GET /api/games`
- `GET /api/games/:id`
- `GET /api/games/:id/play`

### Sessions

- `POST /api/sessions/start`
- `POST /api/sessions/end`

### Scores

- `POST /api/scores/submit`
- `GET /api/scores/leaderboards/:gameId`

## Anti-Cheat MVP

- Session token validation
- Max score validation
- Minimum duration validation
- Suspicious repeat submission detection
- Face visibility / look-away signal handling from the client
- Score status pipeline: `ACCEPTED`, `FLAGGED`, `REJECTED`

## Security Notes

- Uploaded creator packages are stored and referenced locally for MVP preview and publication workflow.
- TODO: move uploaded game preview execution into a stricter sandboxed isolation model before production use.
- TODO: configure self-hosted MediaPipe model assets or pinned model delivery instead of CDN-only defaults for stronger operational control.

## Verification Checklist

- `GET /api/health` should return `database: connected`
- login with seeded admin / creator / player accounts
- creator uploads a valid ZIP and sends it for review
- admin approves a submission and it appears in the public catalog
- player starts a session, plays a game, submits a score, and sees leaderboard results
- flagged submissions appear under admin cheat flags when anti-cheat rules trigger
