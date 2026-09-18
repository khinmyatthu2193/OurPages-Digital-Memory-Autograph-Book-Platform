# OurPages

### A digital memory & autograph book for the moments worth keeping.

**OurPages** is a digital version of the traditional autograph book — designed for friends, classmates, and communities to collect personal messages and memories in one meaningful place.

Create your personal page, share your unique link, and let your friends leave memories **without creating an account**. Your memories stay private to you, while you decide how to organize and manage them.

> **Create a page. Share a memory. Keep it forever.**

---

## ✨ How It Works

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

* 🎓 Graduation & farewell
* 🏫 School or university memories
* 👯 Classmate messages
* 🎂 Birthday memories
* 💐 Special occasions
* ❤️ Personal milestones

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

* Name or nickname
* Personal message
* Anonymous option
* Optional memory prompt

### 🔐 Private Owner Management

Only the owner can manage the memories they receive.

Owners can:

* ⭐ Favorite memories
* 📌 Pin important memories
* 🙈 Hide memories
* 🗑️ Delete memories
* 🔒 Control whether new memories can be submitted

### 💭 Memory Prompts

Optional prompts can help visitors write more meaningful messages.

For example:

> "What's one memory of us that you'll never forget?"

### 📷 Photo Attachments

Photo attachments are planned as part of the extended memory-book experience.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS

### Backend

* Node.js
* Express
* REST API

### Backend Infrastructure

* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* `supabase-js`

### Development

* npm Workspaces
* ESLint
* Prettier
* Vitest
* Supabase CLI

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

* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
* [`docs/PRD.md`](docs/PRD.md)
* [`docs/DATABASE.md`](docs/DATABASE.md)
* [`docs/API.md`](docs/API.md)
* [`docs/SECURITY.md`](docs/SECURITY.md)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js `20.19+`
* npm `10+`
* A Supabase project

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

* Supabase Auth handles account authentication.
* Row Level Security (RLS) protects user-owned data.
* Guest submissions are validated on the server.
* Owner-controlled fields cannot be modified by guests.
* Rate limiting and basic anti-spam protection are applied to public submission endpoints.
* Sensitive Supabase credentials remain server-side.
* `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client-side code.

---

## 🗺️ Roadmap

OurPages is being developed incrementally rather than building the entire product at once.

### Phase 1 — Project Foundation

* Repository structure
* React + Vite setup
* Express API
* Development tooling
* Initial documentation

### Phase 2 — Backend & Authentication

* Supabase PostgreSQL
* Database schema
* Row Level Security
* User registration & sign-in
* Session management
* Guest-submission API foundation

### Phase 3 — Public Memory Book

* Personal `/u/:username` pages
* Public profile
* Guest memory submission
* Memory prompts
* Open / closed / private book states
* Public-page responsive UI

### Phase 4 — Owner Dashboard

* Received memory list
* Favorite / pin / hide / delete
* Search and filtering
* Profile management
* Memory-book settings
* Shareable personal link

### Future

* 📷 Photo memories
* 🎓 Graduation / farewell mode
* 🔗 QR codes
* 📄 PDF memory-book export
* 🎙️ Voice memories
* 💌 More personalization options

---

## 🧭 Current Status

**Development Status: Early MVP**

The project currently has the foundational backend and authentication infrastructure in place.

Implemented:

* ✅ Supabase database schema
* ✅ Row Level Security
* ✅ Authentication forms
* ✅ Authentication session state
* ✅ Protected dashboard foundation
* ✅ Guest-submission API foundation
* ✅ Input validation and security foundations

Still being developed:

* 🚧 Final public memory-book experience
* 🚧 Owner dashboard
* 🚧 Memory management interface
* 🚧 Personalization and extended memory features

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
