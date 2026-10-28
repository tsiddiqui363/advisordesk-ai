# AdvisorDesk AI

**An AI-powered financial-advisor workspace built with React, Node.js, Express, and SQLite.**

AdvisorDesk AI is a portfolio project exploring how a modern advisor workspace can bring client information, meeting preparation, and note-taking into one interface. The goal is to reduce repetitive administrative work and create a more organized workflow for financial advisors.

## Features

- **Client dashboard:** View a set of fictional clients and their associated workspace information.
- **Meeting preparation:** Generate a meeting brief through the application's API.
- **Persistent client notes:** Save meeting notes to a local SQLite database and retrieve them when revisiting a client.
- **REST API:** Use Express endpoints to retrieve and update client notes.
- **Input validation:** Validate client IDs and note content, including a 5,000-character limit.
- **Automated tests:** Test API responses, note persistence, client separation, and invalid input.

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express
- **Database:** SQLite with better-sqlite3
- **Testing:** Vitest and Supertest
- **Version control:** Git and GitHub

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/tsiddiqui363/advisordesk-ai.git
cd advisordesk-ai
```

Install dependencies:

```bash
npm install
```

Start the frontend and backend:

```bash
npm run dev:full
```

Open the local URL printed by Vite in your terminal.

The application creates its local SQLite database in the `data/` directory when the backend starts.

## Running Tests

Run the automated test suite:

```bash
npm run test
```

## Project Structure

```text
advisordesk-ai/
├── src/              # React frontend
├── server/           # Express API and tests
│   └── db/           # SQLite database setup
├── public/           # Static assets
├── data/             # Local database files (not committed)
├── package.json
└── vite.config.js
```

## Development Roadmap

- Integrate an AI model for context-aware meeting preparation.
- Improve client search and workspace interactions.
- Expand automated test coverage.
- Explore secure handling of sensitive client information.

## Disclaimer

This is a portfolio and learning project using fictional client data. It is not a production financial-advice platform and does not provide regulated financial advice.

## Author

Built as a hands-on project to develop practical skills in full-stack application development, REST API design, database persistence, and automated testing.
