# Football Platform — M1: Authentication

## What's new since M0

- Register / login / logout / silent-refresh, fully wired frontend-to-backend
- Passwords hashed with bcrypt (never stored in plain text)
- JWT access tokens (15 min) + refresh tokens (30 days, httpOnly cookie)
- A protected route (`GET /api/v1/users/me`) that demonstrates auth middleware
- Frontend pages: `/register`, `/login`, `/profile` (protected)

If this is your first time seeing an auth system, read the concepts recap
at the bottom of this file too -- it maps each concept to the exact file
that implements it.

## Setup (if you're starting fresh from this zip)

Same as M0, plus one new step for the schema change:

```bash
npm install
docker compose up -d
cp apps/api/.env.example apps/api/.env
npm run prisma:migrate     # will ask for a migration name, e.g. "add-username"
npm run dev:api             # terminal 1
npm run dev:web             # terminal 2
```

## If you already had M0 running

You only need to:

```bash
npm install                 # picks up bcryptjs, jsonwebtoken, cookie-parser
npm run prisma:migrate      # applies the new `username` field
```

Then restart both `dev:api` and `dev:web`.

## How to test this actually works

1. Go to **http://localhost:3000** — click "Create account"
2. Fill in an email, username, and password (8+ characters) — submit
3. You should land on `/profile` showing your username, email, and join date
4. **Refresh the page.** You should stay logged in — this proves the
   silent-refresh flow (access token → memory, refresh token → cookie)
   is working correctly. If you get bounced to `/login`, tell me what
   error shows in the browser console.
5. Click "Log out" — you should land on `/login`
6. Try going directly to **http://localhost:3000/profile** now — you
   should get bounced back to `/login`, since you're not authenticated
7. Log back in with the same email/password — should work

### Testing the API directly (optional, but good practice)

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# You'll get back { user: {...}, accessToken: "..." }
# Copy that accessToken and use it here:
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

## Concepts recap — mapped to files

| Concept | File |
|---|---|
| Password hashing | `apps/api/src/lib/password.js` |
| Signing/verifying JWTs | `apps/api/src/lib/tokens.js` |
| Revoking refresh tokens (logout) | `apps/api/src/lib/refreshTokenStore.js` |
| Register/login/refresh/logout endpoints | `apps/api/src/modules/auth/auth.routes.js` |
| Middleware that protects a route | `apps/api/src/middleware/requireAuth.js` |
| A route that USES that middleware | `apps/api/src/modules/users/users.routes.js` |
| Frontend: storing the access token safely | `apps/web/lib/api.js` |
| Frontend: silent refresh on page load | `apps/web/app/profile/page.js` |

## Next milestone

M2 — Football data foundation: connecting to a real football data
provider, caching it in Redis, and building the `/matches`, `/teams/:id`,
`/players/:id` endpoints. This is where the app starts showing real
football content instead of just an empty shell.

Before that: **run through the test steps above and tell me what
happens.** If anything breaks, paste the exact error — that's the fastest
way to fix it and for you to understand why it happened.
