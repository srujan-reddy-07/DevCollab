# DevCollab

A simple browser‑based collaboration dashboard made for hackathons and team coordination. It combines a kanban board, a shared notebook/wiki, and a quick code review simulator in one single frontend app so teams don’t have to jump between Trello, Notion, and Discord.

We designed it to run completely in the browser without needing a complex backend setup to make it easy for evaluators to test.

## Key Features

- **Quick Demo Login** – Added a “Demo Mode” panel with pre‑configured developer logins. Judges can click any profile to log in instantly without making a new account.
- **Tab Syncing via Browser** – Uses the native BroadcastChannel API to sync state between different open tabs. Changes in one tab instantly appear in others.
- **Task Board** – Simple drag‑and‑drop task tracker with priority tags (P0/P1/P2), deadlines, and comment inputs.
- **Wiki/Docs** – Built with the TipTap editor kit for rich text formatting. Includes a basic version snapshot history for undo/redo.
- **AI Tools Simulator**
  - *Code Review*: Paste a snippet (Python, JS, etc.) to get a quick regex‑based scan for security flaws and a basic quality score.
  - *Standup Summary*: Grabs local app logs and formats them into a short summary text.
  - *Mock Payments*: A dummy upgrade page that mimics a Stripe checkout screen to show how premium workspace plans would look.
- **Supabase Setup** – Defaults to local storage, but `src/lib/supabase.js` can be configured with a `.env` file to link a real cloud database (see `supabase_integration_guide.md`).

## Tech Stack

- **React 18** + **Vite**
- **Zustand** (handles local state + saves to `localStorage`)
- **Vanilla CSS** (CSS variables and custom classes)
- **TipTap** (rich‑text editor)
- **Lucide React** (UI icons)