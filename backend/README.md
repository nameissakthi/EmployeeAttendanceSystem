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
