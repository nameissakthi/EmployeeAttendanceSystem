# 🚀 Database Migration Guide (Phase 1: Complete)

## Overview
This guide walks you through setting up PostgreSQL and migrating from lowdb (JSON) to Prisma ORM.

---

## ✅ What Has Been Done (Phase 1)

### Backend Code Updates
- ✅ Created Prisma schema with User and Attendance models
- ✅ Refactored `backend/src/routes/auth.js` to use Prisma
- ✅ Refactored `backend/src/routes/attendance.js` to use Prisma
- ✅ Created `backend/src/prisma.js` - Prisma client wrapper
- ✅ Updated `backend/src/index.js` - Database connection testing
- ✅ Created `backend/src/seed/seed-prisma.js` - Data seeding script
- ✅ Updated `backend/package.json` - Version 2.0.0, Prisma scripts added

### Dependencies Installed
```bash
npm install @prisma/client prisma pg
```

---

## 📋 Prerequisites

### System Requirements
- **PostgreSQL 12 or higher** installed locally or accessible remotely
- **Node.js 16+** (already have)
- **npm or yarn** (already have)

### PostgreSQL Installation

#### **Option 1: Windows (Using PostgreSQL Installer)**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Note the password you set for `postgres` user
4. PostgreSQL runs on port 5432 by default

#### **Option 2: Windows (Using Docker)**
```powershell
# Install Docker Desktop first from https://www.docker.com/products/docker-desktop

# Run PostgreSQL in a container
docker run -d `
  --name attendance-db `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=attendance_system `
  -p 5432:5432 `
  postgres:15-alpine
```

#### **Option 3: macOS (Using Homebrew)**
```bash
brew install postgresql@15
brew services start postgresql@15
```

---

## 🔧 Setup Steps

### Step 1: Verify PostgreSQL is Running

#### Windows (Command Prompt or PowerShell):
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql-x64-15  # (version number may vary)

# Or connect to verify
psql -U postgres -c "SELECT version();"
```

#### Verify connection:
```powershell
cd backend
npm run db:studio  # This will open Prisma Studio in browser if DB is accessible
```

### Step 2: Update Database Connection String

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/attendance_system"
```

**Parameters:**
- `postgres` = username (default PostgreSQL user)
- `password` = password set during PostgreSQL installation
- `localhost` = server address (use your server IP if remote)
- `5432` = default PostgreSQL port
- `attendance_system` = database name (will be created)

### Step 3: Create Database

PostgreSQL should automatically create the database during migration, but you can create it manually:

```powershell
# Connect to PostgreSQL and create database
psql -U postgres -c "CREATE DATABASE attendance_system;"
```

### Step 4: Run Prisma Migrations

```powershell
cd backend
npm run db:migrate
```

**What this does:**
- Creates the `attendance_system` database
- Creates tables: `users`, `attendance`
- Creates indexes and constraints defined in schema.prisma
- Generates migration files in `backend/prisma/migrations/`

**Example output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "attendance_system" at "localhost:5432"

✔ Successfully created migrations folder

✔ Prisma Migrated the database
```

### Step 5: Seed Sample Data

```powershell
cd backend
npm run db:seed
```

**What this creates:**
- 1 Manager: `manager@example.com` / `Password123`
- 10 Employees: `employee1@example.com` through `employee10@example.com`
- 30 days of attendance records per employee (weekdays only)

**Example output:**
```
🌱 Starting seed...
✓ Cleared existing data
✓ Manager created: manager@example.com
✓ 10 employees created
✓ 200 attendance records created

📊 Seed Summary:
   - 1 Manager
   - 10 Employees
   - 200 Attendance Records

✅ Seed completed successfully!

🔐 Test Credentials:
   Manager: manager@example.com / Password123
   Employee: employee1@example.com / Password123
```

### Step 6: Start the Backend Server

```powershell
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:5000
✅ Database connected successfully
Prisma Client instantiated
```

### Step 7: Test the API

```powershell
# Test health endpoint
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"manager@example.com","password":"Password123"}'
```

---

## 🛠️ Useful Prisma Commands

### View Database in GUI (Prisma Studio)
```powershell
npm run db:studio
# Opens http://localhost:5555 in your browser
```

### Reset Database (⚠️ Deletes all data)
```powershell
npm run db:reset
```

### Generate Prisma Client
```powershell
npx prisma generate
```

### Create New Migration
```powershell
npx prisma migrate dev --name add_new_feature
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE "User" (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role         TEXT NOT NULL,        -- "employee" or "manager"
  employeeId   TEXT UNIQUE NOT NULL,
  department   TEXT NOT NULL,
  createdAt    TIMESTAMP DEFAULT NOW(),
  updatedAt    TIMESTAMP DEFAULT NOW()
);
```

### Attendance Table
```sql
CREATE TABLE "Attendance" (
  id          TEXT PRIMARY KEY,
  userId      TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  checkInTime TIMESTAMP,
  checkOutTime TIMESTAMP,
  status      TEXT,                  -- "present", "absent", "late", "half-day"
  totalHours  DECIMAL,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, date)
);
```

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:5432"
**Cause:** PostgreSQL not running
**Solution:**
```powershell
# Windows
Start-Service -Name postgresql-x64-15

# Or restart Docker container
docker restart attendance-db
```

### Error: "password authentication failed for user 'postgres'"
**Cause:** Wrong password in `.env`
**Solution:** Update `DATABASE_URL` in `.env` with correct password

### Error: "database 'attendance_system' does not exist"
**Cause:** Database not created yet
**Solution:** Run `npm run db:migrate`

### Error: "relation 'User' does not exist"
**Cause:** Tables not created
**Solution:** Run `npm run db:migrate` again

---

## ✨ Next Steps (Phase 2-4)

After successful database setup:

### Phase 2: Missing Pages
- Registration page with validation
- Profile page with edit functionality
- Calendar view with color-coded attendance

### Phase 3: State Management
- Add Redux Toolkit
- Global auth state
- Attendance data state

### Phase 4: Visualizations
- Weekly attendance charts
- Department-wise analytics
- Team calendar view

---

## 📝 Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- Composite unique constraint on (userId, date) prevents duplicate attendance records
- Check-in/out times are stored with timezone info
- Total hours calculated as decimal (e.g., 8.5 hours)

---

**Last Updated:** Phase 1 Complete ✅  
**Database Version:** Prisma 7.0.1 + PostgreSQL 15
