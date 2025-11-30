# API Documentation

This document details all available API endpoints for the Employee Attendance System.

## Base URL

- **Development:** `http://localhost:4000`
- **Production:** `https://api.yourdomain.com`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained via the `/api/auth/login` endpoint and typically expire after 1 hour.

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Creates a new user account (employee or manager).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "employee",
  "employeeId": "EMP001",
  "department": "Engineering"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "employeeId": "EMP001",
    "department": "Engineering"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` — Missing fields or user already exists

---

### Login User
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "employeeId": "EMP001",
    "department": "Engineering"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` — Invalid credentials
- `400` — Missing email or password

---

### Get Current User
**GET** `/api/auth/me`

Retrieves the authenticated user's profile.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "user": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "employeeId": "EMP001",
    "department": "Engineering"
  }
}
```

**Errors:**
- `401` — Unauthorized (missing or invalid token)

---

## Attendance Endpoints (Employee)

### Check In
**POST** `/api/attendance/checkin`

Marks the user as checked in for today. Creates a new attendance record if none exists.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
```

**Request Body:** (optional)
```json
{
  "location": "Office",
  "note": "On time"
}
```

**Response (200):**
```json
{
  "attendance": {
    "id": "att123",
    "userId": "abc123",
    "date": "2025-11-30",
    "checkInTime": "2025-11-30T09:15:00.000Z",
    "checkOutTime": null,
    "status": "present",
    "totalHours": null,
    "createdAt": "2025-11-30T09:15:00.000Z"
  }
}
```

**Errors:**
- `401` — Unauthorized

---

### Check Out
**POST** `/api/attendance/checkout`

Marks the user as checked out for today. Calculates total hours worked.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "attendance": {
    "id": "att123",
    "userId": "abc123",
    "date": "2025-11-30",
    "checkInTime": "2025-11-30T09:15:00.000Z",
    "checkOutTime": "2025-11-30T17:45:00.000Z",
    "status": "present",
    "totalHours": 8.5,
    "createdAt": "2025-11-30T09:15:00.000Z"
  }
}
```

**Errors:**
- `400` — No check-in found or already checked out
- `401` — Unauthorized

---

### Get Today's Attendance
**GET** `/api/attendance/today`

Retrieves the current user's attendance record for today.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "date": "2025-11-30",
  "attendance": {
    "id": "att123",
    "userId": "abc123",
    "date": "2025-11-30",
    "checkInTime": "2025-11-30T09:15:00.000Z",
    "checkOutTime": null,
    "status": "present",
    "totalHours": null
  }
}
```

Note: `attendance` will be `null` if no record exists for today.

---

### Get My Attendance History
**GET** `/api/attendance/my-history`

Retrieves the current user's attendance history, optionally filtered by date range.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
```

**Query Parameters (optional):**
- `start` — Start date (YYYY-MM-DD)
- `end` — End date (YYYY-MM-DD)

**Example:**
```
GET /api/attendance/my-history?start=2025-11-01&end=2025-11-30
```

**Response (200):**
```json
[
  {
    "id": "att123",
    "userId": "abc123",
    "date": "2025-11-30",
    "checkInTime": "2025-11-30T09:15:00.000Z",
    "checkOutTime": "2025-11-30T17:45:00.000Z",
    "status": "present",
    "totalHours": 8.5
  },
  {
    "id": "att124",
    "userId": "abc123",
    "date": "2025-11-29",
    "checkInTime": null,
    "checkOutTime": null,
    "status": "absent",
    "totalHours": 0
  }
]
```

---

### Get My Monthly Summary
**GET** `/api/attendance/my-summary`

Retrieves attendance summary for a specific month.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
```

**Query Parameters (optional):**
- `year` — Year (YYYY)
- `month` — Month (MM, 01-12)

**Example:**
```
GET /api/attendance/my-summary?year=2025&month=11
```

**Response (200):**
```json
{
  "present": 20,
  "absent": 2,
  "late": 3,
  "halfDay": 1,
  "totalHours": 168.5
}
```

---

## Attendance Endpoints (Manager - Role-Based)

All manager endpoints require the user's role to be `"manager"`.

### Get All Attendance
**GET** `/api/attendance/all`

Lists all employee attendance records with optional filters.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
Role: manager
```

**Query Parameters (optional):**
- `start` — Start date (YYYY-MM-DD)
- `end` — End date (YYYY-MM-DD)
- `employeeId` — Filter by employee ID
- `status` — Filter by status (present, absent, late, half-day)
- `department` — Filter by department

**Example:**
```
GET /api/attendance/all?start=2025-11-01&end=2025-11-30&department=Engineering
```

**Response (200):**
```json
[
  {
    "id": "att123",
    "userId": "emp001",
    "date": "2025-11-30",
    "checkInTime": "2025-11-30T09:15:00.000Z",
    "checkOutTime": "2025-11-30T17:45:00.000Z",
    "status": "present",
    "totalHours": 8.5
  }
]
```

**Errors:**
- `401` — Unauthorized
- `403` — Forbidden (not a manager)

---

### Get Employee Attendance
**GET** `/api/attendance/employee/:id`

Retrieves attendance history for a specific employee.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
Role: manager
```

**Path Parameters:**
- `id` — User ID or Employee ID (e.g., `EMP001` or `abc123`)

**Example:**
```
GET /api/attendance/employee/EMP001
```

**Response (200):**
```json
{
  "user": {
    "id": "abc123",
    "employeeId": "EMP001",
    "name": "John Doe",
    "department": "Engineering"
  },
  "attendance": [
    {
      "id": "att123",
      "userId": "abc123",
      "date": "2025-11-30",
      "checkInTime": "2025-11-30T09:15:00.000Z",
      "checkOutTime": "2025-11-30T17:45:00.000Z",
      "status": "present",
      "totalHours": 8.5
    }
  ]
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Forbidden (not a manager)
- `404` — Employee not found

---

### Get Team Summary
**GET** `/api/attendance/summary`

Retrieves summary statistics for the entire team.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
Role: manager
```

**Response (200):**
```json
{
  "totalEmployees": 5,
  "todayPresent": 4,
  "todayAbsent": 1,
  "lateArrivals": [
    {
      "employeeId": "EMP002",
      "name": "Jane Smith",
      "checkInTime": "2025-11-30T10:30:00.000Z"
    }
  ],
  "weeklyTrend": [
    { "date": "2025-11-24", "present": 4 },
    { "date": "2025-11-25", "present": 5 },
    { "date": "2025-11-26", "present": 3 },
    { "date": "2025-11-27", "present": 5 },
    { "date": "2025-11-28", "present": 4 },
    { "date": "2025-11-29", "present": 5 },
    { "date": "2025-11-30", "present": 4 }
  ]
}
```

**Errors:**
- `401` — Unauthorized
- `403` — Forbidden (not a manager)

---

### Get Employees List
**GET** `/api/attendance/employees-list`

Retrieves a list of all employees with their current status.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
Role: manager
```

**Response (200):**
```json
[
  {
    "id": "emp001",
    "employeeId": "EMP001",
    "name": "John Doe",
    "department": "Engineering",
    "todayStatus": "present",
    "todayCheckIn": "2025-11-30T09:15:00.000Z",
    "recentDate": "2025-11-30",
    "recentStatus": "present"
  },
  {
    "id": "emp002",
    "employeeId": "EMP002",
    "name": "Jane Smith",
    "department": "Sales",
    "todayStatus": "absent",
    "todayCheckIn": null,
    "recentDate": "2025-11-29",
    "recentStatus": "late"
  }
]
```

**Errors:**
- `401` — Unauthorized
- `403` — Forbidden (not a manager)

---

### Export Attendance as CSV
**GET** `/api/attendance/export`

Downloads attendance data as a CSV file.

**Headers Required:**
```
Authorization: Bearer <TOKEN>
Role: manager
```

**Query Parameters (optional):**
- `start` — Start date (YYYY-MM-DD)
- `end` — End date (YYYY-MM-DD)
- `employeeId` — Filter by employee ID
- `department` — Filter by department

**Example:**
```
GET /api/attendance/export?start=2025-11-01&end=2025-11-30&department=Engineering
```

**Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="attendance_2025-11-01_2025-11-30.csv"

date,employeeId,name,department,checkInTime,checkOutTime,status,totalHours
2025-11-30,EMP001,"John Doe",Engineering,2025-11-30T09:15:00.000Z,2025-11-30T17:45:00.000Z,present,8.5
2025-11-30,EMP002,"Jane Smith",Sales,,,absent,
```

**Errors:**
- `401` — Unauthorized
- `403` — Forbidden (not a manager)

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK — Request successful |
| 201 | Created — Resource created successfully |
| 400 | Bad Request — Invalid parameters or data |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions (e.g., not a manager) |
| 404 | Not Found — Resource doesn't exist |
| 500 | Internal Server Error — Server error |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, implement rate limiting to prevent abuse:
- Suggested: 100 requests per minute per IP
- Use `express-rate-limit` package

---

## CORS Configuration

The backend is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable. Adjust this for production deployments.

---

## Examples

### Complete Employee Workflow

1. **Register**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Secure123",
    "role": "employee",
    "employeeId": "EMP001",
    "department": "Engineering"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Secure123"}'
```

3. **Check In**
```bash
curl -X POST http://localhost:4000/api/attendance/checkin \
  -H "Authorization: Bearer <TOKEN>"
```

4. **Check Out**
```bash
curl -X POST http://localhost:4000/api/attendance/checkout \
  -H "Authorization: Bearer <TOKEN>"
```

5. **View History**
```bash
curl -X GET http://localhost:4000/api/attendance/my-history \
  -H "Authorization: Bearer <TOKEN>"
```

---

**Last Updated:** November 30, 2025
