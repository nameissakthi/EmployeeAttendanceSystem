require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const prisma = require('./prisma')

const authRoutes = require('./routes/auth')
const attendanceRoutes = require('./routes/attendance')

const PORT = process.env.PORT || 4000

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api/auth', authRoutes)
app.use('/api/attendance', attendanceRoutes)

app.get('/', (req, res) => res.json({ ok: true, name: 'Employee Attendance API', version: '2.0' }))

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

async function start() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')
    
    app.listen(PORT, () => console.log(`✅ Server listening on http://localhost:${PORT}`))
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message)
    process.exit(1)
  }
}

start()

