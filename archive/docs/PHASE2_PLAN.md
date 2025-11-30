# Phase 2 – Frontend Delivery Plan

This document breaks Phase 2 into bite-sized steps so we can build one feature at a time while keeping the backend (already migrated to Prisma/SQLite) as the data source. Follow the sequence; after each step, verify the UI works end-to-end before moving on.

## Step 0 – Prerequisites (already met)
- Backend `npm run dev` (port 4000) and frontend `npm run dev` (Vite, port 5173) run successfully.
- `.env` in `frontend/` has `VITE_API_BASE=http://localhost:4000`.
- Seeded credentials exist (`manager@example.com` / `Password123`, etc.).

## Step 1 – Frontend Foundations
1. **Central API client** (`frontend/src/lib/api.ts`)
   - Axios instance with `baseURL = import.meta.env.VITE_API_BASE`.
   - Attach JWT from `localStorage` on every request; handle 401 → logout.
2. **Auth context + route guards** (`frontend/src/context/AuthContext.tsx` + hooks)
   - Store current user object + token, expose `login`, `logout`, `refreshProfile` helpers.
   - Protect private routes via wrapper (e.g., `<RequireAuth>` component).
3. **Reusable UI atoms** (button, input, card, alert) for consistent look.

## Step 2 – Login Page
1. Route `/login` with form (email, password).
2. Client-side validation, submit to `POST /api/auth/login`.
3. On success, store token + user in context, redirect to `/dashboard`.
4. Show API errors inline, loading state, "Remember me" optional.

## Step 3 – Registration Page
1. Route `/register` supporting both manager and employee creation.
2. Fields: name, department, employeeId, email, password, confirm password, role toggle.
3. Submit to `POST /api/auth/register`.
4. Display success message + CTA to login; handle duplicate errors (email/employee ID).

## Step 4 – Dashboard (Profile + Attendance Overview)
1. Protected route `/dashboard` that fetches:
   - `GET /api/users/profile` for user info.
   - `GET /api/attendance?range=30d` for recent entries.
2. Layout sections:
   - **Profile card:** name, department, employeeId, role, last login (if available).
   - **Today’s status:** show check-in / check-out buttons depending on current state.
   - **Recent attendance list:** table with date, status, total hours.
3. Hook up actions:
   - `POST /api/attendance/check-in`
   - `POST /api/attendance/check-out`
   - optimistic UI updates + toast notifications.

## Step 5 – Attendance Calendar View
1. Calendar component (e.g., `react-day-picker` or custom) showing monthly view.
2. Color-code days by status (present, absent, late, half-day).
3. Clicking a day reveals detail drawer with check-in/out times and actions.

## Step 6 – Manager Enhancements (Optional Extension)
1. Manager dashboard tab to list employees, filter by department, view summary stats.
2. Ability to mark attendance manually (future phase).

## Working Agreement
- After each step, commit with message `feat(frontend): <step description>`.
- Run `npm run lint` (if configured) and `npm run test` (placeholder) before moving on.
- Keep documentation updated: add instructions to `DOCUMENTATION_INDEX.md` after each completed step.

This plan keeps the work sequential and testable. Let me know which step to start with and I’ll implement it. 🚀
