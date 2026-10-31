# Frontend (test UI)

A deliberately simple React + Vite app that exercises every backend feature.

```bash
npm install
npm run dev        # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:5000` (see `vite.config.js`; change it with `BACKEND_URL=... npm run dev`). Because the browser sees a single origin, login cookies work without any CORS setup.

Deploying frontend and backend on different domains: set `VITE_API_URL` (see `.env.example`), add the frontend URL to the backend `CLIENT_URL`, and set the backend `COOKIE_SAMESITE=none` (HTTPS required).

Pages: Login, Signup, Verify OTP, Forgot/Reset password, Dashboard, Resume (upload / replace / delete / view / analysis), Interviews (create, list, start, continue), Interview session, Report, History (filters, sort, pagination), Performance (generate, refresh, PDF), Profile (username, password, deactivate, delete).
