# Employee Attendance Backend (scaffold)

This is a minimal Express backend scaffold for the Employee Attendance System. It uses `lowdb` (JSON file) as a lightweight demo database so you can run quickly without installing a separate DB.

Quick start

1. Install dependencies

```powershell
cd backend
npm install
```

2. Seed sample users and attendance

```powershell
npm run seed
```

3. Run in development

```powershell
npm run dev
```

API base: `http://localhost:4000/api`

Notes
- This scaffold is intended to be an MVP. For production, migrate to Postgres/Mongo and add secure storage for JWT/refresh tokens.

Deploying the backend (easy option — Render / Railway)
--------------------------------------------------

Recommendation: for a quick, low-friction deployment that doesn't require refactoring to serverless, deploy the backend as a standalone Node service on Render or Railway and keep the frontend on Vercel. This keeps Prisma + Postgres stable (no serverless connection limits) and avoids changing provider accounts or repository secrets.

Minimal steps to deploy to Render (or similar):

1. Push your repository to GitHub (if not already).
2. On Render: Create a new Web Service and connect your repository + branch.
	- Build Command: npm install && npm run build
	- Start Command: npm start
3. Add environment variables in the Render service settings (DO NOT commit these to git):
	- DATABASE_URL (Postgres URL)
	- JWT_SECRET
	- JWT_EXPIRES_IN (e.g. 1h)
	- BCRYPT_SALT_ROUNDS (e.g. 10)
	- NODE_ENV=production
4. On the Render dashboard, deploy the service. Wait for the build to finish.
5. Once deployed, run the seed script (one-off job or locally run against remote DB):

	# locally (from backend folder) - this will write into the configured DATABASE_URL
	npm run db:seed

6. Update your frontend's `VITE_API_BASE` (in Vercel project settings) to point to the backend URL.

Important safety notes (so nothing touches your personal accounts):
- I did not add any secrets to the repository. Keep your local `backend/.env` out of version control.
- Use the Render/Railway account that you want to host this project on — the repo files I changed are generic and won't modify cloud account settings.
- If you're logged in to any cloud provider with your personal account, double-check which account you're using when creating the service so you don't accidentally deploy into the wrong one.

If you want, I can:
- Prepare a small GitHub Actions workflow to build and automatically deploy a Docker image to a registry (optional).
- Add a `deploy.md` with step-by-step screenshots for Render or Railway.

If you'd like to deploy this now and want me to make the edits required for Vercel serverless instead, say so and I'll convert the express routes into `/api` serverless functions and add the Prisma singleton (this is more work and requires attention to DB pooling).

Deploying with Docker (recommended for backend)
----------------------------------------------

If you prefer to run the backend with Docker (locally, on a VPS, or any Docker host), a production-ready compose file is included at the repository root as `docker-compose.prod.yml`.

Quick start (from repository root):

1. Build and start services

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This will start:
- Postgres (on local port 5432)
- Backend (on local port 4000)
- Adminer (on local port 8080) — viewing the database UI at http://localhost:8080

2. Verify the backend is healthy

```bash
curl http://localhost:4000/api/health
```

3. Seed the database (from repo root)

```bash
# run the seed script inside the running backend container
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

4. Stopping and cleaning up

```bash
docker compose -f docker-compose.prod.yml down -v
```

Notes and safety
- The `docker-compose.prod.yml` uses a simple example Postgres username/password=db credentials (prisma/prisma). Replace those values for production.
- Do not commit secrets. Edit environment variables locally or provide them through your host provider or CI.
- If you already have a remote Postgres, you can skip the `db` service and pass your `DATABASE_URL` to the `backend` service instead.

If you want, I can:
- Replace `docker-compose.prod.yml` with a variant that uses an external `DATABASE_URL` via an `.env.prod` file so secrets are not stored in compose files.
- Create a small GitHub Actions workflow to build and push the backend image to a registry (Docker Hub / GHCR) and optionally deploy to a host.

Run using a remote database URL (do not change `.env.example`)
--------------------------------------------------------

If you want the backend container to use the DATABASE_URL that already exists in `backend/.env.example` (for example the remote Postgres URL already present there), use the provided `docker-compose.remote.yml` at the repository root. This will run only the backend container and load environment variables from `backend/.env.example`, leaving that file unchanged.

Important safety/warning
- The `backend/.env.example` in this project contains a full `DATABASE_URL`. Running the seed script will write to that database — only do this if you intend to modify the target DB.
- If you're worried about interfering with someone else's DB, do NOT run the seed step. Instead run the container and test read-only endpoints such as `/api/health` first.

How to run the backend using the URL in `backend/.env.example` (no changes to that file):

```bash
# from repo root
docker compose -f docker-compose.remote.yml up --build -d

# check health
curl http://localhost:4000/api/health
```

If you want to seed the (remote) database (only if you mean to):

```bash
# run the seed script inside the running container
docker compose -f docker-compose.remote.yml exec backend npm run db:seed
```

If you prefer instead to run a local Postgres instance (safe, local-only), use `docker-compose.prod.yml` which starts a local `db` service and the backend (see that file). The local Postgres uses example credentials and will not touch the remote DB.

If you'd like, I can:
- Create a `docker-compose.remote.env` that reads values from a `.env` file you control (so you can override credentials without editing tracked files).
- Add a quick script `scripts/run-remote-docker.sh` that hides the compose command and confirms before running the seed step.

