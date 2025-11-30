const { PrismaClient } = require('@prisma/client')

// Use a global variable so that the PrismaClient is not re-created
// across hot-reloads in development or multiple lambda invocations in serverless.
let prisma
if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
}

prisma = global.prisma

module.exports = prisma
