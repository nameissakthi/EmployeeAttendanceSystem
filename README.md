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
![Login screen](frontend/public/screenshots/login.png)

<img width="1888" height="903" alt="Screenshot 2025-11-30 092835" src="https://github.com/user-attachments/assets/81e919ab-cd0f-4821-a8e2-24887a5cc30e" />

<img width="1919" height="909" alt="Screenshot 2025-11-30 092751" src="https://github.com/user-attachments/assets/96bae669-26a9-4fee-8346-f7e39530fc11" />

![Employee dashboard](frontend/public/screenshots/dashboard.png)

<img width="1542" height="849" alt="Screenshot 2025-11-30 083532" src="https://github.com/user-attachments/assets/6d39359a-2b4c-46c2-95ca-0ef3e005f250" />

<img width="1891" height="895" alt="Screenshot 2025-11-30 092958" src="https://github.com/user-attachments/assets/ba3e2650-dfc5-4745-bac7-f86fe6e4f56a" />

![Manager report export](frontend/public/screenshots/manager-report.png)

<img width="1914" height="904" alt="Screenshot 2025-11-30 093027" src="https://github.com/user-attachments/assets/6be1c9a2-d847-4c23-938e-d7c2095ad3e3" />

<img width="1889" height="899" alt="Screenshot 2025-11-30 093041" src="https://github.com/user-attachments/assets/59b27ae2-bdd5-4878-b5ea-54a2397145a1" />

<img width="1901" height="900" alt="Screenshot 2025-11-30 093057" src="https://github.com/user-attachments/assets/03d564ac-03b8-4f18-9cef-6986cd459595" />









## Contact details 

- Name: Vinushree A
- College: Hindusthan Institute of Technology
- Contact: 7092371702/vinuv2737@gmail.com





