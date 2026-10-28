import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFile)

// Store the database in the project's data folder.
const dataDirectory = path.resolve(currentDirectory, '../../data')

fs.mkdirSync(dataDirectory, { recursive: true })

const databasePath = path.join(dataDirectory, 'advisordesk.db')

const db = new Database(databasePath)

// Enable safer database behavior.
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create a table for each client's saved meeting notes.
db.exec(`
  CREATE TABLE IF NOT EXISTS client_notes (
    client_id INTEGER PRIMARY KEY,
    notes TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)

export default db
