# Setup Instructions

This guide covers different ways to run the Employee Attendance System.

## Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (optional, for containerized setup)
- Git (for version control)

## Setup Option 1: Local Development (Recommended)

### 1. Clone or extract the repository
```bash
cd EmployeeAttendanceSystem
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env     # Create .env file (adjust values if needed)
npm run seed             # Seed sample data (manager, 5 employees, attendance logs)
npm run dev              # Start backend on http://localhost:4000
```

The backend server will restart automatically on file changes (thanks to nodemon).

### 3. Setup Frontend (in a new terminal)

```bash
cd frontend
npm install
cp .env.example .env     # Create .env file
npm run dev              # Start Vite dev server on http://localhost:5173
```

### 4. Access the Application

Open your browser and navigate to: **http://localhost:5173**

You should see the login page. Use the seeded credentials to log in:
- **Manager:** `manager@example.com` / `Password123`
- **Employee:** `employee1@example.com` / `Password123`

---

## Setup Option 2: Docker Compose (All-in-One)

### 1. Verify Docker is installed
```bash
docker --version
docker-compose --version
```

### 2. Create environment files (optional, docker-compose has defaults)
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Build and run
```bash
docker-compose up --build
```

This will:
- Build the backend image
- Build the frontend image
- Start backend on http://localhost:4000
- Start frontend on http://localhost:3000
- Start Adminer (DB browser) on http://localhost:8080

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Adminer (DB browser):** http://localhost:8080

Use the same credentials as above to log in.

### 5. Stop and clean up
```bash
docker-compose down     # Stop containers
docker-compose down -v  # Stop and remove volumes (removes db.json)
```

---

## Seeded Test Data

### Accounts Created by Seed Script

**Manager Account:**
- Email: `manager@example.com`
- Password: `Password123`
- Employee ID: `MGR001`
- Department: HR

**Employee Accounts:**
| Email | Password | Employee ID | Department |
|-------|----------|-------------|------------|
| employee1@example.com | Password123 | EMP001 | Engineering |
| employee2@example.com | Password123 | EMP002 | Sales |
| employee3@example.com | Password123 | EMP003 | Engineering |
| employee4@example.com | Password123 | EMP004 | Sales |
| employee5@example.com | Password123 | EMP005 | Engineering |

### Sample Attendance Data

The seed script generates 30 days of attendance logs for each employee with:
- Random check-in times (mostly 9:00 AM, some 10:00+ for "late" status)
- Random check-out times (8-10 hours later)
- Status distribution: 75% present, 10% absent, 15% late
- Some entries marked as "half-day" if total hours < 4

---

## Troubleshooting

### Backend won't start
- Check if port 4000 is already in use: `netstat -a | grep 4000`
- Make sure all dependencies are installed: `npm install`
- Verify .env file exists and has valid values

### Frontend won't connect to backend
- Check VITE_API_BASE in frontend/.env is pointing to correct backend URL
- Ensure backend is running on port 4000
- Check browser console for CORS errors

### Docker Compose fails
- Ensure Docker daemon is running
- Check Docker version: `docker --version`
- Try rebuilding: `docker-compose down && docker-compose up --build`
- Review Docker logs: `docker-compose logs`

### Database (db.json) is corrupted
- Delete `backend/db.json` and re-run seed: `npm run seed`
- Or use Docker: `docker-compose down -v` to reset volumes

---

## Development Workflow

### Adding New Features

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes in backend and/or frontend
3. Test locally: `npm run dev` (both services)
4. Commit: `git commit -am "Add feature description"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

### Backend Development
- Routes are in `backend/src/routes/`
- Middleware in `backend/src/middleware/`
- Database operations in `backend/src/db.js`
- Add new routes to `backend/src/index.js`

### Frontend Development
- Pages are in `frontend/src/pages/`
- Main routing in `frontend/src/main.jsx`
- API client setup in each page component
- Styles in `frontend/src/styles.css`

---

## Production Deployment

### Backend (Node.js + Express)

**Option A: Heroku**
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Deploy
git push heroku main
```

**Option B: Railway / Render**
- Connect your GitHub repo
- Set environment variables in dashboard
- Auto-deploy on push

### Frontend (React + Vite)

**Option A: Vercel**
```bash
npm install -g vercel
vercel
```

**Option B: Netlify**
- Connect GitHub repo
- Set build command: `npm run build`
- Set publish directory: `dist`

---

## Environment Variables Reference

### Backend (.env)
```
PORT=4000                           # Server port
JWT_SECRET=your_secret_key          # JWT signing key (use strong random string)
JWT_EXPIRES_IN=1h                   # Token expiry time
BCRYPT_SALT_ROUNDS=10               # Password hashing rounds
NODE_ENV=development                # Node environment
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
```

### Frontend (.env)
```
VITE_API_BASE=http://localhost:4000 # Backend API URL
```

---

## Next Steps

- [ ] Customize the styling (edit `frontend/src/styles.css`)
- [ ] Add more attendance statuses (e.g., "WFH" for work-from-home)
- [ ] Implement calendar view with date-specific filters
- [ ] Add email notifications for late arrivals
- [ ] Migrate from lowdb to PostgreSQL for production
- [ ] Add unit and integration tests
- [ ] Setup CI/CD pipeline (GitHub Actions)

---

## Support

For issues or questions:
1. Check the main [README.md](./README.md)
2. Review API documentation in README
3. Check logs: `npm run dev` shows all console output
4. Review code in `backend/src/routes/` for endpoint implementations

---

**Last Updated:** November 30, 2025
