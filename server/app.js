
import express from 'express'
import db from './db/database.js'

const app = express()

app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AdvisorDesk AI API',
  })
})

// Load saved meeting notes for one client.
app.get('/api/clients/:clientId/notes', (req, res) => {
  const clientId = Number(req.params.clientId)

  if (!Number.isSafeInteger(clientId) || clientId <= 0) {
    return res.status(400).json({
      error: 'A valid client ID is required.',
    })
  }

  const savedNotes = db
    .prepare('SELECT notes FROM client_notes WHERE client_id = ?')
    .get(clientId)

  return res.json({
    clientId,
    notes: savedNotes?.notes ?? '',
  })
})

// Save or update meeting notes for one client.
app.put('/api/clients/:clientId/notes', (req, res) => {
  const clientId = Number(req.params.clientId)
  const { notes } = req.body ?? {}

  if (!Number.isSafeInteger(clientId) || clientId <= 0) {
    return res.status(400).json({
      error: 'A valid client ID is required.',
    })
  }

  if (typeof notes !== 'string' || notes.length > 5000) {
    return res.status(400).json({
      error: 'Notes must be text no longer than 5000 characters.',
    })
  }

  db.prepare(`
    INSERT INTO client_notes (client_id, notes, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(client_id) DO UPDATE SET
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `).run(clientId, notes)

  return res.json({
    clientId,
    notes,
    saved: true,
  })
})

app.post('/api/meeting-brief', (req, res) => {
  const { clientName, notes } = req.body ?? {}

  // Validate the client name.
  if (
    typeof clientName !== 'string' ||
    clientName.trim().length === 0 ||
    clientName.length > 120
  ) {
    return res.status(400).json({
      error: 'A valid client name is required.',
    })
  }

  // Validate the advisor's notes.
  if (
    notes !== undefined &&
    (typeof notes !== 'string' || notes.length > 5000)
  ) {
    return res.status(400).json({
      error: 'Notes must be text no longer than 5000 characters.',
    })
  }

  // Trim extra whitespace once, then reuse the cleaned notes.
  const trimmedNotes = typeof notes === 'string' ? notes.trim() : ''

  return res.json({
    clientName: clientName.trim(),
    summary: trimmedNotes
      ? `Prepare for the meeting with ${clientName.trim()}, focusing on the advisor's notes: ${trimmedNotes}`
      : `Prepare for the meeting with ${clientName.trim()} using the advisor's notes and verified client records.`,
    discussionPoints: [
      'Review the client’s current financial goals.',
      'Discuss any changes in circumstances.',
      'Agree on next steps and follow-up actions.',
    ],
    questions: [
      'Have your financial goals or circumstances changed?',
      'Are there any upcoming expenses we should plan for?',
    ],
    followUps: [
      `Confirm next steps with ${clientName.trim()}.`,
      'Record agreed actions and outstanding questions.',
      'Set a follow-up date if further work is required.',
    ],
    notes: trimmedNotes,
    generatedBy: 'mock',
  })
})

export default app
