const { initDb, db } = require('../db')
const bcrypt = require('bcrypt')
const { nanoid } = require('nanoid')

async function seed() {
  await initDb()
  // clear
  db.data.users = []
  db.data.attendance = []

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
  const password = await bcrypt.hash('Password123', saltRounds)

  // Manager
  const manager = { id: nanoid(), name: 'Alice Manager', email: 'manager@example.com', password_hash: password, role: 'manager', employeeId: 'MGR001', department: 'HR', createdAt: new Date().toISOString() }
  db.data.users.push(manager)

  // Employees
  const departments = ['Engineering', 'Sales']
  const employees = []
  for (let i = 1; i <= 5; i++) {
    const emp = { id: nanoid(), name: `Employee ${i}`, email: `employee${i}@example.com`, password_hash: password, role: 'employee', employeeId: `EMP${i.toString().padStart(3,'0')}`, department: departments[i % departments.length], createdAt: new Date().toISOString() }
    employees.push(emp)
    db.data.users.push(emp)
  }

  // Create attendance for last 30 days with some randomness
  const today = new Date()
  for (let d = 0; d < 30; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const dateStr = date.toISOString().slice(0,10)
    for (const emp of employees) {
      // random: absent 10%, late 15%, half-day 5%
      const r = Math.random()
      if (r < 0.1) {
        db.data.attendance.push({ id: nanoid(), userId: emp.id, date: dateStr, checkInTime: null, checkOutTime: null, status: 'absent', totalHours: 0, createdAt: new Date().toISOString() })
        continue
      }
      let checkIn = new Date(date)
      // normal start 09:00
      const baseHour = 9
      if (r < 0.25) {
        // late
        checkIn.setHours(baseHour + 1, Math.floor(Math.random()*50), 0, 0)
      } else {
        checkIn.setHours(baseHour, Math.floor(Math.random()*30), 0, 0)
      }
      let checkOut = new Date(checkIn)
      checkOut.setHours(checkIn.getHours() + 8 + Math.floor(Math.random()*2))
      const totalHours = Math.round(((checkOut - checkIn)/(1000*60*60)) * 100) / 100
      const status = totalHours < 4 ? 'half-day' : (r < 0.25 ? 'late' : 'present')
      db.data.attendance.push({ id: nanoid(), userId: emp.id, date: dateStr, checkInTime: checkIn.toISOString(), checkOutTime: checkOut.toISOString(), status, totalHours, createdAt: new Date().toISOString() })
    }
  }

  await db.write()
  console.log('Seed complete. Users:', db.data.users.length, 'Attendance records:', db.data.attendance.length)
}

seed().catch(err => { console.error(err); process.exit(1) })
