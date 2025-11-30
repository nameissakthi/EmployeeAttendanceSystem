const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.attendance.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('✓ Cleared existing data')

  const saltRounds = 10
  const passwordHash = await bcrypt.hash('Password123', saltRounds)

  // Create manager
  const manager = await prisma.user.create({
    data: {
      name: 'Alice Manager',
      email: 'manager@example.com',
      passwordHash,
      role: 'manager',
      employeeId: 'MGR001',
      department: 'HR'
    }
  })
  console.log(`✓ Manager created: ${manager.email}`)

  // Create employees
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations']
  const employees = []

  for (let i = 1; i <= 10; i++) {
    const employee = await prisma.user.create({
      data: {
        name: `Employee ${i}`,
        email: `employee${i}@example.com`,
        passwordHash,
        role: 'employee',
        employeeId: `EMP${i.toString().padStart(3, '0')}`,
        department: departments[i % departments.length]
      }
    })
    employees.push(employee)
  }
  console.log(`✓ ${employees.length} employees created`)

  // Create attendance records for the last 30 days
  const today = new Date()
  let attendanceCount = 0

  for (let d = 0; d < 30; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    for (const emp of employees) {
      const r = Math.random()

      // 10% absent, 15% late, 5% half-day, 70% present
      let status = 'present'
      let checkInTime = null
      let checkOutTime = null
      let totalHours = null

      if (r < 0.10) {
        // Absent
        status = 'absent'
      } else {
        // Check in time (8:30 - 9:30)
        checkInTime = new Date(date)
        const baseHour = 8
        if (r < 0.25) {
          // Late arrival
          checkInTime.setHours(baseHour + 1, Math.floor(Math.random() * 60), 0, 0)
          status = 'late'
        } else {
          checkInTime.setHours(baseHour, Math.floor(Math.random() * 60), 0, 0)
        }

        // Check out time (5:00 - 5:30 PM = 17:00-17:30)
        checkOutTime = new Date(checkInTime)
        const hours = 8 + Math.random() * 1.5 // 8-9.5 hours
        checkOutTime.setHours(checkOutTime.getHours() + Math.floor(hours))

        totalHours = Math.round(hours * 100) / 100

        if (totalHours < 4) {
          status = 'half-day'
        }
      }

      await prisma.attendance.create({
        data: {
          userId: emp.id,
          date: date.toISOString().split('T')[0],
          checkInTime,
          checkOutTime,
          status,
          totalHours
        }
      })

      attendanceCount++
    }
  }

  console.log(`✓ ${attendanceCount} attendance records created`)
  console.log('\n📊 Seed Summary:')
  console.log(`   - 1 Manager`)
  console.log(`   - ${employees.length} Employees`)
  console.log(`   - ${attendanceCount} Attendance Records`)
  console.log('\n✅ Seed completed successfully!')
  console.log('\n🔐 Test Credentials:')
  console.log(`   Manager: manager@example.com / Password123`)
  console.log(`   Employee: employee1@example.com / Password123`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
