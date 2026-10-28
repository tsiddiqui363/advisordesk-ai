import { useEffect, useState } from 'react'
import './App.css'

const clients = [
  {
    id: 1,
    name: 'Olivia Bennett',
    initials: 'OB',
    type: 'Retirement planning',
    status: 'Review due',
    color: '#dce9df',
    balance: '$842,500',
    email: 'olivia@example.com',
    next: 'Oct 29, 2026',
  },
  {
    id: 2,
    name: 'James Mitchell',
    initials: 'JM',
    type: 'Wealth management',
    status: 'On track',
    color: '#e9e0d4',
    balance: '$1,240,000',
    email: 'james@example.com',
    next: 'Oct 30, 2026',
  },
  {
    id: 3,
    name: 'Sophia Chen',
    initials: 'SC',
    type: 'Investment planning',
    status: 'Follow-up',
    color: '#e5def0',
    balance: '$635,800',
    email: 'sophia@example.com',
    next: 'Nov 02, 2026',
  },
  {
    id: 4,
    name: 'Ethan Brooks',
    initials: 'EB',
    type: 'Financial planning',
    status: 'On track',
    color: '#dce6ef',
    balance: '$492,300',
    email: 'ethan@example.com',
    next: 'Nov 05, 2026',
  },
]

const tasks = [
  {
    title: 'Send retirement plan summary',
    client: 'Olivia Bennett',
    due: 'Today',
    priority: 'High',
  },
  {
    title: 'Review investment allocation',
    client: 'James Mitchell',
    due: 'Tomorrow',
    priority: 'Medium',
  },
  {
    title: 'Share meeting follow-up',
    client: 'Sophia Chen',
    due: 'Oct 30',
    priority: 'Medium',
  },
]

function App() {
  const [active, setActive] = useState('Overview')
  const [selectedClient, setSelectedClient] = useState(clients[0])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [completed, setCompleted] = useState([])
  const [showProfile, setShowProfile] = useState(false)

  const [meetingBrief, setMeetingBrief] = useState(null)
  const [briefCopied, setBriefCopied] = useState(false)

  // Keep a separate set of notes for each client.
  const [notesByClient, setNotesByClient] = useState({})
  const meetingNotes = notesByClient[selectedClient.id] || ''


  const [notesLoading, setNotesLoading] = useState(false)
  const [notesSaveStatus, setNotesSaveStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadClientNotes() {
      setNotesLoading(true)
      setNotesSaveStatus('')

      try {
        const response = await fetch(
          `/api/clients/${selectedClient.id}/notes`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Could not load notes.')
        }

        if (!cancelled) {
          setNotesByClient((previous) => ({
            ...previous,
            [selectedClient.id]: data.notes,
          }))
        }
      } catch (error) {
        if (!cancelled) {
          setNotesSaveStatus('Could not load saved notes.')
          console.error('Could not load client notes:', error)
        }
      } finally {
        if (!cancelled) {
          setNotesLoading(false)
        }
      }
    }

    loadClientNotes()

    return () => {
      cancelled = true
    }
  }, [selectedClient.id])


  const [briefLoading, setBriefLoading] = useState(false)

  function selectClient(client) {
    setSelectedClient(client)
    setMeetingBrief(null)
    setBriefCopied(false)
  }

  async function generateMeetingBrief() {
    setBriefLoading(true)

    try {
      const response = await fetch('/api/meeting-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: selectedClient.name,
          notes: meetingNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not generate the meeting brief.',
        )
      }

      setMeetingBrief({
        client: selectedClient.name,
        clientType: selectedClient.type,
        clientStatus: selectedClient.status,
        portfolioValue: selectedClient.balance,
        meetingDate: selectedClient.next,
        notes: data.notes || '',
        summary: data.summary || '',
        discussionPoints: data.discussionPoints || [],
        questions: data.questions || [],
        followUps: data.followUps || [],
        generatedBy: data.generatedBy || 'mock',
      })

      setBriefCopied(false)
    } catch (error) {
      console.error('Meeting brief request failed:', error)
      window.alert(
        'Could not generate the meeting brief. Please check that the backend is running and try again.',
      )
    } finally {
      setBriefLoading(false)
    }
  }

  async function copyMeetingBrief() {
    if (!meetingBrief) return

    const text = [
      `Meeting brief: ${meetingBrief.client}`,
      `Meeting date: ${meetingBrief.meetingDate}`,
      `Planning type: ${meetingBrief.clientType}`,
      `Client status: ${meetingBrief.clientStatus}`,
      `Recorded portfolio value: ${meetingBrief.portfolioValue}`,
      ...(meetingBrief.notes
        ? ['', 'ADVISOR NOTES', meetingBrief.notes]
        : []),
      ...(meetingBrief.summary
        ? ['', 'SUMMARY', meetingBrief.summary]
        : []),
      '',
      'DISCUSSION POINTS',
      ...meetingBrief.discussionPoints.map((item) => `- ${item}`),
      '',
      'QUESTIONS TO ASK',
      ...meetingBrief.questions.map((item) => `- ${item}`),
      '',
      'SUGGESTED FOLLOW-UPS',
      ...meetingBrief.followUps.map((item) => `- ${item}`),
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setBriefCopied(true)
    } catch (error) {
      console.error('Could not copy meeting brief:', error)
      window.alert(
        'Could not copy the brief. Please try again.',
      )
    }
  }

  function askAssistant(e) {
    e.preventDefault()

    if (!question.trim()) return

    setAnswer(
      `I found relevant information in the demo workspace for your question: "${question.trim()}". Olivia Bennett has a retirement plan summary due today, and her next meeting is scheduled for October 29, 2026. This is a sample response using the prototype's fictional records; live AI retrieval and source citations have not been connected.`,
    )

    setQuestion('')
  }

  const remaining = tasks.filter(
    (task) => !completed.includes(task.title),
  ).length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>AdvisorDesk</strong>
            <span>INTELLIGENT WORKSPACE</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="nav-list">
          {[
            { name: 'Overview', icon: '◫' },
            { name: 'Clients', icon: '♙' },
            { name: 'Meetings', icon: '▦' },
            { name: 'Tasks', icon: '☑' },
          ].map((item) => (
            <button
              key={item.name}
              className={`nav-item ${active === item.name ? 'active' : ''}`}
              onClick={() => setActive(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === 'Tasks' && remaining > 0 && (
                <span className="nav-count">{remaining}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">YOUR WORKSPACE</div>
          <div className="workspace-card">
            <div className="workspace-mark">AD</div>
            <div>
              <strong>Advisor Workspace</strong>
              <span>Portfolio demo</span>
            </div>
          </div>

          <button
            className="profile-button"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">SA</div>
            <div className="profile-copy">
              <strong>Sample Advisor</strong>
              <span>Financial advisor</span>
            </div>
            <span>⌄</span>
          </button>

          {showProfile && (
            <div className="profile-popover">
              <strong>Demo profile</strong>
              <p>This is a fictional advisor workspace.</p>
              <button onClick={() => setShowProfile(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">{active}</span>
          </div>

          <div className="topbar-right">
            <span className="demo-indicator">
              <span className="demo-dot" />
              Demo environment
            </span>
            <div className="topbar-avatar">SA</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">TUESDAY, OCTOBER 27, 2026</p>
              <h1>
                {active === 'Overview'
                  ? 'Good morning'
                  : active}
              </h1>
              <p className="welcome-description">
                {active === 'Overview'
                  ? 'Here’s what’s happening across your advisory practice.'
                  : `Manage your ${active.toLowerCase()} in one place.`}
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() => setActive('Meetings')}
            >
              <span className="button-icon" aria-hidden="true">▦</span>
              View meetings
              <span className="button-arrow" aria-hidden="true">→</span>
            </button>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span>Total clients</span>
                <span className="stat-icon">♙</span>
              </div>
              <strong className="stat-value">24</strong>
              <span className="stat-footnote">
                Across your advisory practice
              </span>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Assets under management</span>
                <span className="stat-icon">↗</span>
              </div>
              <strong className="stat-value">$8.4M</strong>
              <span className="stat-footnote">
                Illustrative portfolio total
              </span>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Upcoming meetings</span>
                <span className="stat-icon">▦</span>
              </div>
              <strong className="stat-value">6</strong>
              <span className="stat-footnote">
                Scheduled this week
              </span>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Outstanding tasks</span>
                <span className="stat-icon">☑</span>
              </div>
              <strong className="stat-value">{remaining}</strong>
              <span className="stat-footnote">
                Tasks in this demo
              </span>
            </article>
          </section>

          <section className="assistant-card">
            <div className="assistant-heading">
              <div className="assistant-mark">✳</div>
              <div>
                <h2>Ask your advisor assistant</h2>
                <p>
                  Explore the fictional workspace with a sample
                  assistant response.
                </p>
              </div>
              <span className="demo-badge">DEMO</span>
            </div>

            <form className="assistant-form" onSubmit={askAssistant}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about clients, meetings, or follow-ups..."
                aria-label="Ask the advisor assistant"
              />
              <button
                className="assistant-submit"
                type="submit"
                disabled={!question.trim()}
              >
                <span className="assistant-submit-label">Ask assistant</span>
                <span className="assistant-submit-icon" aria-hidden="true">➜</span>
              </button>
            </form>

            {answer && (
              <div className="assistant-answer">
                <strong>Sample response</strong>
                <p>{answer}</p>
              </div>
            )}

            <div className="suggestion-list">
              {[
                'What should I prepare for today?',
                'Which clients need follow-up?',
                'Summarize upcoming meetings',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="suggestion-chip"
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion} <span>↗</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel meeting-brief-panel">
            <div className="panel-heading">
              <div>
                <h2>Meeting brief</h2>
                <p>
                  Prepare a focused agenda for your selected client.
                </p>
              </div>
              <span className="demo-badge">MOCK API</span>
            </div>

            <div className="brief-controls">
              <div className="brief-client-select">
                <label htmlFor="brief-client">Select client</label>
                <select
                  id="brief-client"
                  value={selectedClient.id}
                  onChange={(e) => {
                    const client = clients.find(
                      (item) => item.id === Number(e.target.value),
                    )
                    if (client) selectClient(client)
                  }}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="brief-client-select">
                <label htmlFor="meeting-notes">
                  Meeting notes or context (optional)
                </label>

                {notesLoading && <p role="status">Loading saved notes...</p>}
                {notesSaveStatus && (
                  <p role="status">{notesSaveStatus}</p>
                )}

                <textarea
                  id="meeting-notes"
                  value={meetingNotes}
                  disabled={notesLoading}
                  onChange={(e) =>
                    setNotesByClient((previous) => ({
                      ...previous,
                      [selectedClient.id]: e.target.value,
                    }))
                  }
                  onBlur={async (e) => {
                    const clientId = selectedClient.id
                    const notes = e.target.value
                    setNotesSaveStatus('Saving notes...')

                    try {
                      const response = await fetch(
                        `/api/clients/${clientId}/notes`,
                        {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ notes }),
                        },
                      )
                      const data = await response.json()

                      if (!response.ok) {
                        throw new Error(data.error || 'Could not save notes.')
                      }

                      setNotesSaveStatus('Notes saved.')
                    } catch (error) {
                      console.error('Could not save client notes:', error)
                      setNotesSaveStatus('Could not save notes. Please try again.')
                    }
                  }}
                  placeholder="Add the client's stated priorities or topics to discuss..."
                  rows={4}
                />
              </div>

              <button
                className="primary-button"
                onClick={generateMeetingBrief}
                disabled={briefLoading}
              >
                {briefLoading ? (
                  <>
                    <span className="button-icon" aria-hidden="true">◌</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="button-icon" aria-hidden="true">✦</span>
                    Generate meeting brief
                    <span className="button-arrow" aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>

            {meetingBrief && (
              <div className="brief-results">
                <div className="brief-result-heading">
                  <div>
                    <h3>{meetingBrief.client}</h3>
                    <p>
                      Scheduled meeting: {meetingBrief.meetingDate}
                    </p>
                    <p>
                      {meetingBrief.clientType} · {meetingBrief.clientStatus}
                    </p>
                    <p>
                      Recorded portfolio value: {meetingBrief.portfolioValue}
                    </p>
                    {meetingBrief.notes && (
                      <p>
                        <strong>Advisor notes:</strong>{' '}
                        {meetingBrief.notes}
                      </p>
                    )}
                  </div>
                  <span className="status-pill status-ok">
                    Prepared
                  </span>
                </div>

                {meetingBrief.summary && (
                  <>
                    <h4>Meeting summary</h4>
                    <p>{meetingBrief.summary}</p>
                  </>
                )}

                <p className="brief-disclaimer">
                  Mock-generated preparation prompts based on fictional
                  workspace records. Verify all details before a real
                  meeting. No live AI model is connected yet.
                </p>

                <h4>Discussion points</h4>
                <ul>
                  {meetingBrief.discussionPoints.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>

                <h4>Questions to ask</h4>
                <ul>
                  {meetingBrief.questions.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>

                <h4>Suggested follow-ups</h4>
                <ul>
                  {meetingBrief.followUps.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>

                <button
                  className="secondary-button"
                  onClick={copyMeetingBrief}
                >
                  {briefCopied ? (
                    <>
                      <span className="button-icon" aria-hidden="true">✓</span>
                      Copied to clipboard
                    </>
                  ) : (
                    <>
                      <span className="button-icon" aria-hidden="true">▢</span>
                      Copy meeting brief
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          <div className="lower-grid">
            <section className="panel client-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {active === 'Tasks'
                      ? 'Your tasks'
                      : active === 'Meetings'
                        ? 'Upcoming meetings'
                        : active === 'Clients'
                          ? 'All clients'
                          : 'Client overview'}
                  </h2>
                  <p>
                    {active === 'Tasks'
                      ? 'Keep track of important follow-ups.'
                      : 'A quick look at your client relationships.'}
                  </p>
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    setActive(active === 'Clients' ? 'Overview' : 'Clients')
                  }
                >
                  {active === 'Clients' ? 'Back to overview' : 'View all'}{' '}
                  <span>→</span>
                </button>
              </div>

              {active === 'Tasks' ? (
                <div className="task-list">
                  {tasks.map((task) => (
                    <label
                      className={`task-row ${
                        completed.includes(task.title)
                          ? 'task-completed'
                          : ''
                      }`}
                      key={task.title}
                    >
                      <input
                        type="checkbox"
                        checked={completed.includes(task.title)}
                        onChange={() =>
                          setCompleted((old) =>
                            old.includes(task.title)
                              ? old.filter((item) => item !== task.title)
                              : [...old, task.title],
                          )
                        }
                      />
                      <div className="task-copy">
                        <strong>{task.title}</strong>
                        <span>{task.client}</span>
                      </div>
                      <span className="task-due">{task.due}</span>
                    </label>
                  ))}
                </div>
              ) : active === 'Meetings' ? (
                <div className="meeting-list">
                  {clients.slice(0, 3).map((client, index) => (
                    <button
                      className="meeting-row"
                      key={client.id}
                      onClick={() => {
                        selectClient(client)
                        setActive('Clients')
                      }}
                    >
                      <div className="date-tile">
                        <span>{['29', '30', '02'][index]}</span>
                        <small>{['OCT', 'OCT', 'NOV'][index]}</small>
                      </div>
                      <div className="task-copy">
                        <strong>{client.name}</strong>
                        <span>{client.type}</span>
                      </div>
                      <span className="meeting-time">
                        {['10:00 AM', '1:30 PM', '11:00 AM'][index]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="client-list">
                  {(active === 'Clients' ? clients : clients.slice(0, 3)).map(
                    (client) => (
                      <button
                        className="client-row"
                        key={client.id}
                        onClick={() => selectClient(client)}
                      >
                        <div
                          className="client-avatar"
                          style={{ backgroundColor: client.color }}
                        >
                          {client.initials}
                        </div>

                        <div className="client-copy">
                          <strong>{client.name}</strong>
                          <span>{client.type}</span>
                        </div>

                        <div className="client-balance">
                          <strong>{client.balance}</strong>
                          <span>Portfolio value</span>
                        </div>

                        <span
                          className={`status-pill ${
                            client.status === 'On track'
                              ? 'status-ok'
                              : 'status-attention'
                          }`}
                        >
                          {client.status}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="panel task-panel">
              <div className="panel-heading">
                <div>
                  <h2>Priority tasks</h2>
                  <p>Stay on top of your next actions.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive('Tasks')}
                >
                  View all <span>→</span>
                </button>
              </div>

              <div className="task-list">
                {tasks.slice(0, 3).map((task) => (
                  <label
                    className={`task-row ${
                      completed.includes(task.title)
                        ? 'task-completed'
                        : ''
                    }`}
                    key={task.title}
                  >
                    <input
                      type="checkbox"
                      checked={completed.includes(task.title)}
                      onChange={() =>
                        setCompleted((old) =>
                          old.includes(task.title)
                            ? old.filter((item) => item !== task.title)
                            : [...old, task.title],
                        )
                      }
                    />
                    <div className="task-copy">
                      <strong>{task.title}</strong>
                      <span>{task.client}</span>
                    </div>
                    <span className="task-due">{task.due}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <footer className="app-footer">
            <span>AdvisorDesk AI · Portfolio project</span>
            <span>
              Fictional client records · Mock API · No live AI integration
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
