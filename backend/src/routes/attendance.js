const express = require('express')
const router = express.Router()
const prisma = require('../prisma')
const { authMiddleware, requireRole } = require('../middleware/auth')

// Helper to get current date as YYYY-MM-DD
function getToday() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// Helper to get date range for current month
function getCurrentMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

// POST /api/attendance/checkin
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const today = getToday()

    // Check if already checked in today
    let attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    })

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ error: 'Already checked in today' })
    }

    // allow optional manual time in request body
    let now
    if (req.body && req.body.time) {
      const t = req.body.time
      // accept ISO or HH:MM
      if (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)) {
        // combine with today's date
        now = new Date(`${today}T${t}:00`)
      } else {
        now = new Date(t)
      }
      if (isNaN(now.getTime())) now = new Date()
    } else {
      now = new Date()
    }

    if (!attendance) {
      // Create new attendance record
      attendance = await prisma.attendance.create({
        data: {
          userId,
          date: today,
          checkInTime: now,
          status: 'present'
        }
      })
    } else {
      // Update check-in time
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkInTime: now }
      })
    }

    res.json({ attendance, message: 'Check-in successful' })
  } catch (err) {
    console.error('Checkin error:', err)
    res.status(500).json({ error: 'Check-in failed' })
  }
})

// POST /api/attendance/checkout
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const today = getToday()

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    })

    if (!attendance) {
      return res.status(400).json({ error: 'No check-in found for today' })
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ error: 'Already checked out today' })
    }

    // allow optional manual time in request body for checkout
    let now
    if (req.body && req.body.time) {
      const t = req.body.time
      if (typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)) {
        now = new Date(`${today}T${t}:00`)
      } else {
        now = new Date(t)
      }
      if (isNaN(now.getTime())) now = new Date()
    } else {
      now = new Date()
    }

    const checkInTime = new Date(attendance.checkInTime)
    const diffMs = now - checkInTime
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100

    // Determine status based on hours
    let status = 'present'
    if (hours < 4) status = 'half-day'

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        totalHours: hours,
        status
      }
    })

    res.json({ attendance: updated, message: 'Check-out successful' })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ error: 'Check-out failed' })
  }
})

// GET /api/attendance/today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const today = getToday()

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    })

    res.json({ date: today, attendance: attendance || null })
  } catch (err) {
    console.error('Get today error:', err)
    res.status(500).json({ error: 'Failed to fetch today\'s attendance' })
  }
})

// GET /api/attendance/my-history
router.get('/my-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { start, end, limit = 30 } = req.query

    const where = { userId }

    if (start || end) {
      where.date = {}
      if (start) where.date.gte = start
      if (end) where.date.lte = end
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit) || 30
    })

    res.json(attendance)
  } catch (err) {
    console.error('My history error:', err)
    res.status(500).json({ error: 'Failed to fetch attendance history' })
  }
})

// GET /api/attendance/my-summary
router.get('/my-summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { year, month } = req.query

    let startDateStr, endDateStr

    if (year && month) {
      const s = new Date(parseInt(year), parseInt(month) - 1, 1)
      const e = new Date(parseInt(year), parseInt(month), 0)
      startDateStr = s.toISOString().split('T')[0]
      endDateStr = e.toISOString().split('T')[0]
    } else {
      const range = getCurrentMonthRange()
      startDateStr = range.start
      endDateStr = range.end
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDateStr,
          lte: endDateStr
        }
      }
    })

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0
    }

    attendance.forEach(record => {
      if (record.status === 'present') summary.present++
      if (record.status === 'absent') summary.absent++
      if (record.status === 'late') summary.late++
      if (record.status === 'half-day') summary.halfDay++
      if (record.totalHours) summary.totalHours += record.totalHours
    })

    res.json(summary)
  } catch (err) {
    console.error('My summary error:', err)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// Manager: GET /api/attendance/all
router.get('/all', authMiddleware, requireRole('manager'), async (req, res) => {
  try {
    const { start, end, employeeId, status, department, page = 1, limit = 50 } = req.query

    const where = {}

    if (start || end) {
      where.date = {}
      if (start) where.date.gte = start
      if (end) where.date.lte = end
    }

    if (status) where.status = status

    if (employeeId) {
      const user = await prisma.user.findUnique({
        where: { employeeId }
      })
      if (user) where.userId = user.id
      else return res.json([])
    }

    if (department) {
      const users = await prisma.user.findMany({
        where: { department },
        select: { id: true }
      })
      where.userId = { in: users.map(u => u.id) }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const attendance = await prisma.attendance.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit)
    })

    const total = await prisma.attendance.count({ where })

    res.json({
      data: attendance,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    })
  } catch (err) {
    console.error('Get all attendance error:', err)
    res.status(500).json({ error: 'Failed to fetch attendance records' })
  }
})

// Manager: GET /api/attendance/employee/:id
router.get('/employee/:employeeId', authMiddleware, requireRole('manager'), async (req, res) => {
  try {
    const { employeeId } = req.params
    const { start, end, limit = 30 } = req.query

    const user = await prisma.user.findUnique({
      where: { employeeId }
    })

    if (!user) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    const where = { userId: user.id }

    if (start || end) {
      where.date = {}
      if (start) where.date.gte = start
      if (end) where.date.lte = end
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit)
    })

    res.json({
      employee: { id: user.id, name: user.name, employeeId: user.employeeId, department: user.department },
      attendance
    })
  } catch (err) {
    console.error('Get employee attendance error:', err)
    res.status(500).json({ error: 'Failed to fetch employee attendance' })
  }
})

// Manager: GET /api/attendance/summary
router.get('/summary', authMiddleware, requireRole('manager'), async (req, res) => {
  try {
    const today = getToday()

    // Get today's attendance for all employees
    const todayRecords = await prisma.attendance.findMany({
      where: {
        date: today
      },
      include: { user: true }
    })

    // Get all users
    const allUsers = await prisma.user.findMany({
      where: { role: 'employee' }
    })

    const summary = {
      totalEmployees: allUsers.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      absentToday: [],
      // UI-friendly keys expected by frontend
      todayPresent: 0,
      todayAbsent: 0,
      lateArrivals: []
    }

    const presentUserIds = new Set()

    todayRecords.forEach(record => {
      presentUserIds.add(record.userId)
      if (record.status === 'present') summary.present++
      if (record.status === 'late') summary.late++
      if (record.status === 'half-day') summary.halfDay++
    })

    // Find absent employees
    allUsers.forEach(user => {
      if (!presentUserIds.has(user.id)) {
        summary.absent++
        summary.absentToday.push({
          id: user.id,
          name: user.name,
          employeeId: user.employeeId,
          department: user.department
        })
      }
    })

    // populate UI-friendly keys
    summary.todayPresent = summary.present
    summary.todayAbsent = summary.absent
    // lateArrivals: include basic info for late records
    summary.lateArrivals = todayRecords.filter(r => r.status === 'late').map(r => ({
      id: r.userId,
      employeeId: r.user.employeeId,
      name: r.user.name,
      checkInTime: r.checkInTime
    }))

    res.json(summary)
  } catch (err) {
    console.error('Get summary error:', err)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// Manager: GET /api/attendance/today-status
router.get('/today-status', authMiddleware, requireRole('manager'), async (req, res) => {
  try {
    const today = getToday()

    const records = await prisma.attendance.findMany({
      where: {
        date: new Date(today)
      },
      include: { user: { select: { name: true, employeeId: true, department: true } } },
      orderBy: { checkInTime: 'asc' }
    })

    res.json({
      date: today,
      records
    })
  } catch (err) {
    console.error('Get today status error:', err)
    res.status(500).json({ error: 'Failed to fetch today\'s status' })
  }
})

// Manager: GET /api/attendance/export (CSV)
router.get('/export', authMiddleware, requireRole('manager'), async (req, res) => {
  try {
    const { start, end, department } = req.query

    const where = {}

    if (start || end) {
      where.date = {}
      if (start) where.date.gte = new Date(start)
      if (end) where.date.lte = new Date(end)
    }

    const records = await prisma.attendance.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'desc' }
    })

    // Filter by department if provided
    let filtered = records
    if (department) {
      filtered = records.filter(r => r.user.department === department)
    }

    // Generate CSV
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Check-In', 'Check-Out', 'Total Hours']
    const rows = filtered.map(r => [
      r.date,
      r.user.employeeId,
      r.user.name,
      r.user.department,
      r.status,
      r.checkInTime ? new Date(r.checkInTime).toLocaleString() : '-',
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : '-',
      r.totalHours ? r.totalHours.toFixed(2) : '-'
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csv)
  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: 'Failed to export attendance' })
  }
})

// Manager: GET /api/attendance/employees-list
router.get('/employees-list', authMiddleware, requireRole('manager'), async (req, res) => {
  try {
    const today = getToday()

    const employees = await prisma.user.findMany({
      where: { role: 'employee' },
      orderBy: { name: 'asc' }
    })

    // Get today's records
    const todayRecords = await prisma.attendance.findMany({
      where: {
        date: today
      },
      include: { user: true }
    })

    const todayMap = new Map(todayRecords.map(r => [r.userId, r]))

    // For recent status, gather recent records (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: sevenDaysAgo.toISOString().split('T')[0]
        },
        userId: { in: employees.map(e => e.id) }
      },
      orderBy: { date: 'desc' }
    })

    // Map latest recent record per user
    const recentMap = new Map()
    recentRecords.forEach(r => {
      if (!recentMap.has(r.userId)) recentMap.set(r.userId, r)
    })

    const employeesList = employees.map(emp => {
      const todayRecord = todayMap.get(emp.id)
      const recent = recentMap.get(emp.id)
      return {
        id: emp.id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        todayStatus: todayRecord?.status || 'not-checked-in',
        // UI expects `todayCheckIn`
        todayCheckIn: todayRecord?.checkInTime || null,
        // Provide recent status/date for the UI
        recentStatus: recent?.status || 'no-record',
        recentDate: recent ? recent.date : null
      }
    })

    res.json(employeesList)
  } catch (err) {
    console.error('Employees list error:', err)
    res.status(500).json({ error: 'Failed to fetch employees list' })
  }
})

module.exports = router
