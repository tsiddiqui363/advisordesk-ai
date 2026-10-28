import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('GET /api/health', () => {
  it('returns a healthy API status', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'AdvisorDesk AI API',
    })
  })
})

describe('POST /api/meeting-brief', () => {
  it('generates a meeting brief for a valid client', async () => {
    const response = await request(app)
      .post('/api/meeting-brief')
      .send({
        clientName: 'Olivia Bennett',
        notes: 'Review retirement timing',
      })

    expect(response.status).toBe(200)
    expect(response.body.clientName).toBe('Olivia Bennett')
    expect(response.body.notes).toBe('Review retirement timing')
    expect(response.body.discussionPoints).toHaveLength(3)
    expect(response.body.questions).toHaveLength(2)
    expect(response.body.followUps).toHaveLength(3)
    expect(response.body.generatedBy).toBe('mock')
  })

  it('includes the advisor notes in the summary', async () => {
    const notes =
      'Wants to retire at 60 and is concerned about rising expenses.'

    const response = await request(app)
      .post('/api/meeting-brief')
      .send({
        clientName: 'Olivia Bennett',
        notes,
      })

    expect(response.status).toBe(200)
    expect(response.body.summary).toBe(
      `Prepare for the meeting with Olivia Bennett, focusing on the advisor's notes: ${notes}`,
    )
  })

  it('rejects a missing client name', async () => {
    const response = await request(app)
      .post('/api/meeting-brief')
      .send({ notes: 'Review retirement timing' })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('A valid client name is required.')
  })

  it('rejects notes longer than 5000 characters', async () => {
    const response = await request(app)
      .post('/api/meeting-brief')
      .send({
        clientName: 'Olivia Bennett',
        notes: 'a'.repeat(5001),
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe(
      'Notes must be text no longer than 5000 characters.',
    )
  })

  it('rejects a blank client name', async () => {
    const response = await request(app)
      .post('/api/meeting-brief')
      .send({ clientName: '   ' })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('A valid client name is required.')
  })

  it('rejects a client name longer than 120 characters', async () => {
    const response = await request(app)
      .post('/api/meeting-brief')
      .send({ clientName: 'a'.repeat(121) })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('A valid client name is required.')
  })

  it('generates a brief when notes are omitted', async () => {
    const response = await request(app)
      .post('/api/meeting-brief')
      .send({ clientName: 'Olivia Bennett' })

    expect(response.status).toBe(200)
    expect(response.body.notes).toBe('')
    expect(response.body.generatedBy).toBe('mock')
  })
})


describe('Client meeting notes', () => {
  it('returns empty notes for a client with no saved notes', async () => {
    const clientId = 9001

    const response = await request(app).get(
      `/api/clients/${clientId}/notes`,
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      clientId,
      notes: '',
    })
  })

  it('saves notes and returns them when requested again', async () => {
    const clientId = 9002
    const notes = 'Discuss retirement timing and monthly expenses.'

    const saveResponse = await request(app)
      .put(`/api/clients/${clientId}/notes`)
      .send({ notes })

    expect(saveResponse.status).toBe(200)
    expect(saveResponse.body).toEqual({
      clientId,
      notes,
      saved: true,
    })

    const getResponse = await request(app).get(
      `/api/clients/${clientId}/notes`,
    )

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.notes).toBe(notes)
  })

  it('keeps notes for different clients separate', async () => {
    await request(app)
      .put('/api/clients/9003/notes')
      .send({ notes: 'Olivia notes' })

    await request(app)
      .put('/api/clients/9004/notes')
      .send({ notes: 'James notes' })

    const oliviaResponse = await request(app).get(
      '/api/clients/9003/notes',
    )
    const jamesResponse = await request(app).get(
      '/api/clients/9004/notes',
    )

    expect(oliviaResponse.body.notes).toBe('Olivia notes')
    expect(jamesResponse.body.notes).toBe('James notes')
  })

  it('rejects notes longer than 5000 characters', async () => {
    const response = await request(app)
      .put('/api/clients/9005/notes')
      .send({ notes: 'a'.repeat(5001) })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe(
      'Notes must be text no longer than 5000 characters.',
    )
  })
})
