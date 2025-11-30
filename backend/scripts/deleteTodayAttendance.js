const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'employee1@example.com'
  const today = new Date()
  // Use ISO date string (YYYY-MM-DD) to match Attendance.date format
  const dateStr = today.toISOString().slice(0, 10)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found:', email)
    process.exit(2)
  }

  const res = await prisma.attendance.deleteMany({ where: { userId: user.id, date: dateStr } })
  console.log(`Deleted ${res.count} attendance record(s) for ${email} on ${dateStr}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
