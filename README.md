# Employee Attendance System

A full-stack web application for tracking employee attendance with role-based access (Employee & Manager).

## Features

### Employee Features
- ✅ Register/Login with JWT authentication
- ✅ Mark daily attendance (Check In / Check Out)
- ✅ View attendance history (last 30 days)
- ✅ View monthly summary (present/absent/late counts)
- ✅ Dashboard with today's status and recent 7-day history

### Manager Features
- ✅ Login with manager role
- ✅ View all employees attendance (with filters)
- ✅ View team summary (total employees, present/absent/late today)
- ✅ Employee-specific attendance history
- ✅ Export attendance reports as CSV
- ✅ Department filter and pagination

## Tech Stack

- **Frontend:** React 18 + Vite + React Router + Axios
- **Backend:** Node.js + Express + lowdb (JSON-based DB for MVP)
- **Authentication:** JWT + bcrypt
- **Containerization:** Docker + Docker Compose

## Quick Start (Local Development)

### Option 1: NPM (Recommended for development)

**Backend:**
```powershell
cd backend
npm install
npm run seed        # Populate sample data
npm run dev         # Start dev server on port 4000
```

**Frontend (in another terminal):**
```powershell
cd frontend
npm install
npm run dev         # Start dev server on port 5173
```

Visit `http://localhost:5173` to access the app.

### Option 2: Docker Compose (All-in-one)

```powershell
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Adminer (DB browser): `http://localhost:8080`

## Seeded Test Accounts

After running seed script, use these credentials:

**Manager:**
- Email: `manager@example.com`
- Password: `Password123`

**Employees (5 accounts):**
- `employee1@example.com` / `Password123`
- `employee2@example.com` / `Password123`
- `employee3@example.com` / `Password123`
- `employee4@example.com` / `Password123`
- `employee5@example.com` / `Password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login (returns JWT token)
- `GET /api/auth/me` — Get current user (requires auth)

### Attendance (Employee)
- `POST /api/attendance/checkin` — Check in for today
- `POST /api/attendance/checkout` — Check out for today
- `GET /api/attendance/today` — Get today's attendance
- `GET /api/attendance/my-history` — Get user's attendance history
- `GET /api/attendance/my-summary` — Get monthly summary

### Attendance (Manager - role-based)
- `GET /api/attendance/all` — List all attendance (with filters)
- `GET /api/attendance/employee/:id` — Get specific employee attendance
- `GET /api/attendance/summary` — Get team summary stats
- `GET /api/attendance/employees-list` — Get list of all employees with status
- `GET /api/attendance/export` — Export attendance as CSV

## Project Structure

```
EmployeeAttendanceSystem/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Express server
│   │   ├── db.js                       # lowdb wrapper
│   │   ├── middleware/
│   │   │   └── auth.js                 # JWT & role middleware
│   │   ├── routes/
│   │   │   ├── auth.js                 # Auth routes
│   │   │   └── attendance.js           # Attendance routes
│   │   └── seed/
│   │       └── seed.js                 # Sample data generator
│   ├── Dockerfile                      # Backend container
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── main.jsx                    # App entry & routes
│   │   ├── styles.css                  # Global styles
│   │   └── pages/
│   │       ├── Login.jsx               # Login form
│   │       ├── Dashboard.jsx           # Employee dashboard
│   │       └── Manager.jsx             # Manager dashboard
│   ├── Dockerfile                      # Frontend container
│   ├── index.html
│   ├── package.json
│   └── README.md
├── docker-compose.yml                  # Multi-container setup
├── .env.example                        # Environment template
└── README.md                           # This file
```

## Environment Variables

Create a `.env` file in each folder (backend/frontend) based on `.env.example`:

### Backend (.env)
```
PORT=4000
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

### Frontend (.env)
```
VITE_API_BASE=http://localhost:4000
```

## Database Schema

### Users Table
- `id` — Unique identifier (nanoid)
- `name` — Full name
- `email` — Email address (unique)
- `password_hash` — Bcrypt hashed password
- `role` — "employee" or "manager"
- `employeeId` — Unique employee ID (e.g., EMP001)
- `department` — Department name
- `createdAt` — Registration timestamp

### Attendance Table
- `id` — Unique record ID
- `userId` — Reference to user
- `date` — Attendance date (YYYY-MM-DD)
- `checkInTime` — Check-in timestamp (ISO 8601)
- `checkOutTime` — Check-out timestamp (ISO 8601)
- `status` — "present", "absent", "late", or "half-day"
- `totalHours` — Total hours worked
- `createdAt` — Record creation timestamp

## Testing Workflows

### Employee Workflow
1. Login at `/login` with employee credentials
2. See today's status on `/dashboard`
3. Click "Check In" button
4. Click "Check Out" button after some time
5. View recent attendance in the table

### Manager Workflow
1. Login at `/login` with manager credentials
2. Navigate to `/manager`
3. View Team Summary (total employees, present/absent/late)
4. Scroll down to see Team Attendance table (paginated, with department filter)
5. Use CSV export section to download attendance data

## Sample Curl Commands

### Login as Manager
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"Password123"}'
```

### Get Team Summary (with token)
```bash
curl -X GET http://localhost:4000/api/attendance/summary \
  -H "Authorization: Bearer <TOKEN>"
```

### Export CSV
```bash
curl -X GET "http://localhost:4000/api/attendance/export?start=2025-10-01&end=2025-11-30" \
  -H "Authorization: Bearer <TOKEN>" \
  -o attendance_report.csv
```

## Notes & Future Enhancements

- Current backend uses `lowdb` (JSON file) for MVP simplicity. For production, migrate to PostgreSQL with Prisma or MongoDB.
- Token stored in localStorage; for security, implement httpOnly cookies or OAuth.
- Add email notifications for late arrivals or absences.
- Implement calendar view with color-coded attendance status.
- Add weekly/monthly chart visualizations for manager dashboard.
- Add role-based access control (RBAC) for additional manager permissions.
- Implement backup and audit logging.



## License

MIT

---

**Last Updated:** November 30, 2025
