const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'db.json')

const db = {
  data: { users: [], attendance: [] },
  async read() {
    try {
      const raw = await fs.promises.readFile(file, 'utf8')
      this.data = JSON.parse(raw)
    } catch (err) {
      // if file missing or invalid, initialize
      this.data = { users: [], attendance: [] }
      await this.write()
    }
  },
  async write() {
    await fs.promises.writeFile(file, JSON.stringify(this.data, null, 2), 'utf8')
  }
}

async function initDb() {
  // ensure file exists and load data
  await db.read()
}

module.exports = { db, initDb }
