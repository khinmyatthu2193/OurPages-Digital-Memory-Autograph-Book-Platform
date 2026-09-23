# OurPages

### A digital memory & autograph book for the moments worth keeping

**OurPages** is a digital version of the traditional autograph book — designed for friends, classmates, and communities to collect personal messages and memories in one meaningful place.

Create your personal page, share your unique link, and let your friends leave memories **without creating an account**. Your memories stay private to you, while you decide how to organize and manage them.

> **Create a page. Share a memory. Keep it forever.**

---

## ✨ How It Works ?

The idea is simple:

```text
Create an account
       ↓
Get your personal page
       ↓
Share your link
       ↓
Friends leave memories
       ↓
You collect & organize them
```

For example:

```text
ourpages.app/u/khin
```

Anyone with the link can leave a memory without signing up.

The page owner can then privately manage the memories they receive.

---

## 🎯 Why OurPages?

Traditional autograph books are often filled with handwritten messages at the end of school, university, or an important chapter of life.

OurPages brings that experience to the web while keeping the personal feeling of an autograph book.

It is designed for moments such as:

- 🎓 Graduation & farewell
- 🏫 School or university memories
- 👯 Classmate messages
- 🎂 Birthday memories
- 💐 Special occasions
- ❤️ Personal milestones

The goal is not to become another social network.

**It is a small, personal space for memories between people who matter to each other.**

---

## 🌱 Planned Core Features

### 👤 Personal Memory Book

Every registered user gets a unique personal page such as:

```text
/u/khin
```

The owner can customize their profile and control whether their memory book is open or closed.

### 💌 Guest Memory Submission

Friends can leave a message without creating an account.

They can provide:

- Name or nickname
- Personal message
- Anonymous option
- Optional memory prompt

### 🔐 Private Owner Management

Only the owner can manage the memories they receive.

Owners can:

- ⭐ Favorite memories
- 📌 Pin important memories
- 🙈 Hide memories
- 🗑️ Delete memories
- 🔒 Control whether new memories can be submitted

### 💭 Memory Prompts

Optional prompts can help visitors write more meaningful messages.

For example:

> "What's one memory of us that you'll never forget?"

### 📷 Photo Attachments

Visitors can attach one optional JPG, PNG, or WebP photo (up to 5 MB) to a
message. Photos are kept in a private Supabase Storage bucket and delivered
only through short-lived signed links for memories the viewer may see.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express
- REST API

### Backend Infrastructure

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- `supabase-js`

### Development

- npm Workspaces
- ESLint
- Prettier
- Vitest
- Supabase CLI

---

## 🏗️ Project Structure

```text
OurPages/
├── client/          # React + Vite frontend
├── server/          # Express API and application logic
├── supabase/        # Database migrations and development seed
├── docs/            # Product and engineering documentation
└── tests/           # Cross-workspace / integration tests
```

Unit tests are maintained alongside each workspace's source code.

For the overall system architecture, see:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/PRD.md`](docs/PRD.md)
- [`docs/DATABASE.md`](docs/DATABASE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js `20.19+`
- npm `10+`
- A Supabase project

For local Supabase development, you will also need the Supabase CLI and Docker.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd OurPages
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment files and add your local configuration.

Client:

```text
client/.env.local
```

Server:

```text
server/.env
```

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for the complete setup process.

> **Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit credentials to Git.

### 4. Start Supabase locally

If you are using local Supabase:

```bash
npx supabase db reset
```

> ⚠️ This resets the local Supabase database.

### 5. Start the application

```bash
npm run dev
```

The development servers will be available at:

```text
Client → http://localhost:5173
API    → http://localhost:3000
Health → http://localhost:3000/api/health
```

---

## 📋 Available Commands

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start the client and API      |
| `npm run build`        | Build production applications |
| `npm run lint`         | Run workspace linters         |
| `npm test`             | Run all tests                 |
| `npm run format:check` | Check code formatting         |

---

## 🔐 Security

Security is an important part of the project because guest users can submit memories without authentication.

OurPages is designed around the following principles:

- Supabase Auth handles account authentication.
- Row Level Security (RLS) protects user-owned data.
- Guest submissions are validated on the server.
- Owner-controlled fields cannot be modified by guests.
- Rate limiting and basic anti-spam protection are applied to public submission endpoints.
- Sensitive Supabase credentials remain server-side.
- `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client-side code.

---

## 🗺️ Roadmap

OurPages is being developed incrementally rather than building the entire product at once.

### Phase 1 — Project Foundation

- Repository structure
- React + Vite setup
- Express API
- Development tooling
- Initial documentation

### Phase 2 — Backend & Authentication

- Supabase PostgreSQL
- Database schema
- Row Level Security
- User registration & sign-in
- Session management
- Guest-submission API foundation

### Phase 3 — Public Memory Book

- Personal `/u/:username` pages
- Public profile
- Guest memory submission
- Memory prompts
- Open / closed / private book states
- Public-page responsive UI

### Phase 4 — Owner Dashboard

- Received memory list
- Favorite / pin / hide / delete
- Search and filtering
- Profile management
- Memory-book settings
- Shareable personal link

### Phase 5 — Product Polish & Memory Experience

- Warm, consistent public book, dashboard, and authentication styling
- Expandable long memories with prompt context
- Clear success, empty, closed, loading, and error states
- Copy and native share feedback
- Accessible dialogs, forms, focus states, and reduced-motion support
- Safe public-page metadata and lightweight OurPages branding

### Phase 6 — Graduation & Farewell Mode + Sharing

- Optional graduation/farewell presentation without changing standard books
- Custom occasion title, class/group, year, and farewell message
- Graduation prompt set and occasion-aware submission copy
- Adaptive native sharing, copy-link fallback, and downloadable QR codes
- Safe farewell share metadata and print-friendly public books

### Phase 7 — Photo Memories

- One optional photo per guest memory, with preview and mobile file selection
- Client and server validation for JPG, PNG, and WebP files up to 5 MB
- Private Supabase Storage objects with short-lived signed access
- Accessible photo viewer, lazy thumbnails, and deletion cleanup

### Future

- 📄 PDF memory-book export
- 🎙️ Voice memories
- 💌 More personalization options

---

## 🧭 Current Status

**Development Status: Phase 7 complete in code**

Implemented:

- ✅ Supabase database schema and Row Level Security
- ✅ Registration, sign-in, and protected sessions
- ✅ Public memory-book pages and guest submissions
- ✅ Memory prompts and open, closed, or private book states
- ✅ Owner dashboard with statistics and recent memories
- ✅ Search, filtering, favorite, pin, hide, and delete controls
- ✅ Profile settings and shareable personal links

Phase 7 adds one optional photo to the existing message-first memory flow. The
bucket remains private, hidden-memory photos are omitted from public responses,
and standard text-only memories continue to work. Apply all Supabase migrations
before running the live app.

---

## 💡 Project Vision

OurPages is built around a simple idea:

> **Some messages are too meaningful to disappear in a chat.**

Whether it is a graduation farewell, a final university semester, or simply a special moment shared with friends, OurPages aims to turn those messages into something people can return to years later.

**Create your page.
Share your memories.
Keep your pages.**

---

## 📄 License

This project is currently under development.

See [`LICENSE`](LICENSE) for licensing information.
