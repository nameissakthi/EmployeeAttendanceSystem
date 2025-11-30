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
- **Containerization:** Docker 

## Quick Start (Local Development)

### Option 1: NPM (Recommended for development)
# Employee Attendance System

This README contains only the sections requested: Setup instructions, How to run, Environment variables, and Screenshots.

## Setup instructions

1. Clone the repository and install dependencies:

```powershell
git clone <REPO_URL>
cd EmployeeAttendanceSystem

# Backend
cd backend
npm install

# Frontend
cd ..\frontend
npm install
```

2. Prepare environment files:

- Copy `backend/.env.example` → `backend/.env` and set required values.
- Copy `frontend/.env.example` → `frontend/.env` and set `VITE_API_BASE`.

3. (Optional) Seed sample data (if seed script exists):

```powershell
cd backend
npm run db:seed
```

## How to run

Start backend (development):

```powershell
cd backend
npm run dev
```

Start frontend (development) in a separate terminal:

```powershell
cd frontend
npm run dev



## Screenshots

Add screenshots to the `frontend/public/screenshots/` folder and reference them here. Example markdown placeholders:


![Login screen](frontend/public/screenshots/login.png)

![Employee dashboard](frontend/public/screenshots/dashboard.png)
![Manager report export](frontend/public/screenshots/manager-report.png)

Replace these with actual images before submitting. If you prefer, include a `screenshots/` directory at repo root and update the paths accordingly.







## Contact details 

- Name: Vinushree A
- College: Hindusthan Institute of Technology
- Contact: 7092371702/vinuv2737@gmail.com





