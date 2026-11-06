# Backend review: what was checked, found and fixed

The whole backend (about 3,500 lines) was read file by file, then **tested with the project's own end-to-end script
(102 checks, all passing)** and with targeted probes written to hunt for bugs the tests did not cover.
The code was already in good shape: validation on every route, hashed OTPs, rotating refresh tokens, atomic
session updates, AI output normalisation and prompt-injection guards. The problems below are what was left.

## Bugs found by probing the running server

| # | Problem (reproduced) | Fix |
|---|---|---|
| 1 | **Stuck interview.** If an answer was saved but the session did not advance (crash / failure between the two writes), every later submit returned `409 already answered` forever. The user could never finish that interview. | A duplicate answer now *heals* the session (atomic `advanceIfAt`, so concurrent requests can't double-advance) and returns 409 once; the next submit works. |
| 2 | **Double click stored a wrong answer.** Two parallel submits both returned 200 and the second landed on question 2, with the answer meant for question 1. | `POST /answer` accepts `questionIndex`. A mismatch is `409` before anything is saved. The new frontend always sends it. |
| 3 | **Email silently rewritten.** `normalizeEmail()` strips `+tags` from Gmail, so `First.Last+tag@gmail.com` was registered as `first.last@gmail.com`; `a+1@` and `a+2@` collided. | Emails are only trimmed and lower-cased. |
| 4 | **Account state leaked without the password.** A deactivated account answered `403 Account is deactivated` to *any* password, so strangers could discover who is registered. Unknown emails also returned faster than wrong passwords (timing). | Password is checked first (a dummy bcrypt compare runs for unknown emails); state is only revealed after a correct password. |
| 5 | **`TRUST_PROXY=0` became `1`** (`Number("0") \|\| 1`), so trust-proxy could never be turned off. | `0` is respected. |
| 6 | **Cookie lifetime ignored config.** The access cookie was hard-coded to 15 min and refresh tokens to 15 days regardless of `ACCESS_TOKEN_EXPIRES_IN` / `REFRESH_TOKEN_EXPIRES_IN`. | One parser (`15m`, `2h`, `15d`…) feeds the JWT, the cookie and the database TTL. |
| 7 | **Stale performance report.** Reuse was decided by *count* only. Delete one interview and finish another → same count → an outdated report was served. | Compares the count **and** timestamps (`isOutdated`). The dashboard's `performanceReportOutdated` flag uses the same rule. |
| 8 | **Shared-IP lockouts.** Rate limits were per IP. Behind Render/Vercel many users share one apparent IP, so a few failed logins locked everyone out (HTTP 429). | Public auth limiters key by **email** (+ a generous per-IP ceiling); AI/upload limiters key by **user**, and `authMiddleware` now runs before them. |
| 9 | Production accepted weak JWT secrets. | In production the app refuses to start unless both secrets are ≥ 32 chars, different, and not `change-me…`. |
| 10 | Password rule allowed only `@$!%*?&` as "special". | Any non-alphanumeric character counts. |
| 11 | **Production logged OTP codes** when no email provider was configured (so the log held working login/reset codes). | In production the server now answers `503 Email delivery is not configured` and logs nothing secret. |
| 12 | **Every 5xx message was hidden in production**, including deliberate ones ("AI provider failed, try again"), so users only saw "Internal server error". | Only *unexpected* errors are masked; deliberate `ApiError`s keep their message. |
| 13 | `scripts/e2e.mjs` contained `... === 409 \|\| true` - an assertion that could never fail. | Fixed. |

## Added

- **OpenAPI 3 spec + Swagger UI** (`/api/docs`, `/api/docs.json`), validated in the test suite, plus a test that every endpoint is documented.
- `POST /auth/resend-otp` (60 s cooldown; reuses the stored password hash) and `DELETE /interview/:id`.
- `GET /` and a richer `GET /health` (reports whether cache/rate limits live in Redis or memory).
- Lighter dashboard / list queries (no longer load every question array just to count).
- ESLint, 10 unit tests, `npm run test:e2e` (starts its own server + throw-away database; **132 checks**, plus a rate-limit phase), Dockerfile, CI.

## Left as-is on purpose (read before you deploy)

- **AI calls run inside the HTTP request** (5-60 s with a real model). That is simple and reliable, and the frontend shows
  progress. Hosts with short request timeouts (Vercel *functions*, some proxies) may cut very slow calls; the answers are
  never lost - `GET /session/:id/report` regenerates a missing report.
- **Resumes on Cloudinary use a public (unguessable) URL.** Anyone who has the link can open it. For stricter privacy switch
  uploads to Cloudinary's `authenticated` delivery type and sign URLs on download (not changed here because it can't be
  tested without your Cloudinary account).
- Local-disk storage (no Cloudinary) is **wiped on every Render redeploy** - use Cloudinary in production.
- Refresh-token *reuse detection* (revoking every session if an old token is replayed) is not implemented: two browser tabs
  refreshing at once would trip it. Tokens are still single-use and rotate.
- An account locked after 5 wrong passwords answers `423` (needed so honest users know why they can't sign in).
