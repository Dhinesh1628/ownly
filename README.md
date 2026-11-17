# Ownly — AI-Powered Email Ownership & Executive Triage

A production-grade, human-designed full-stack MERN application that solves the core problem in executive operations: **when a client reads an email, nobody knows who should reply**.

Ownly uses AI (Anthropic Claude with deterministic rule-based fallback) to classify incoming conversations into three distinct buckets:
- **Assistant to Reply**: Scheduling, calendar shifts, invoices, logistics, vendor follow-ups.
- **Client to Reply**: High-stakes approvals, contracts, investor decisions, personal relationships.
- **No Reply Needed**: Newsletters, receipts, automated notifications, resolved threads.

It connects two synchronized experiences on a single unified MongoDB backend:
1. **Assistant Dashboard (`/dashboard`)**: Full 3-pane command center with KPI stats, segments, conversation stream, AI summaries, key detail extraction, manual overrides, reply composer with tone presets, grounded AI chat (*"Ask your inbox"*), and simulated inbound email generator.
2. **Client View (`/client`)**: Minimalist, distraction-free queue displaying **only** emails requiring direct personal attention, featuring two instant actions: *"Mark as handled"* and *"Ask my assistant to take over"*.

---

## What is Simulated vs. Real

### 🟢 Real (Live Production Code)
- **AI Classification, Summaries & Key Info Extraction**: Real LLM calls to Anthropic Claude (`claude-3-5-sonnet-20241022`) via `@anthropic-ai/sdk`.
- **Deterministic Rule-Based Fallback Engine**: If no API key is provided or if an API error occurs, an embedded rule engine executes zero-latency classification, key entity extraction, tone drafting, and grounded chat queries.
- **Database Architecture**: Real MongoDB Atlas database with compound indexes, full schema validation, and real-time computation of stats and segments.
- **Two-Way State Synchronization**: When a client marks an email as handled or asks their assistant to take over in `/client`, the change immediately reflects in the Assistant Dashboard and writes to the audit `ActivityLog`.
- **Authentication & Security**: Bcrypt password hashing, JWT authentication (Bearer token / httpOnly cookie), Helmet security headers, CORS allowlist, and Express rate limiting.

### 🟡 Simulated (Explicit in UI and Code)
- **OAuth Consent & Mailbox Sync**: Real Google and Microsoft consent screens require domain verification and Google Cloud app review. Here, the OAuth consent flow, token exchange, and 128-email sync progress are simulated for instant developer and evaluator onboarding.
- **Email Provider Architecture**: Structured cleanly behind an abstract interface (`server/src/providers/emailProviderInterface.js`, `gmail.js`, `outlook.js`) so production OAuth credentials can be dropped in without changing the core engine.
- **Outbound Sending**: Replies approved through the *"Review & Send"* modal simulate network transmission, append an outbound message to the thread in MongoDB, and transition the conversation state to *"Waiting for Response"*.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS 3, Lucide React, TanStack Query 5, Zustand |
| **Backend** | Node.js (ES Modules), Express 4, Mongoose 8, BcryptJS, JSONWebToken, Zod, Helmet, Express-Rate-Limit |
| **Database** | MongoDB Atlas (Multi-tenant workspaces, Compound indexes) |
| **AI Layer** | Anthropic Claude SDK (`@anthropic-ai/sdk`) + Deterministic Rule Fallback Engine |
| **Design** | Inter typography, tabular numbers, restrained teal accent (`#0f766e`), warm-gray base (`#faf9f6`), 1px borders, accessible semantic badges |

---

## Demo Credentials & Quick Start

### 1. Demo Logins (Pre-Seeded)
| Role | Email | Password | Primary Experience |
|---|---|---|---|
| **Assistant** | `assistant@executive.ai` | `password123` | Full 3-Pane Dashboard (`/dashboard`) |
| **Client** | `alex.hastings@acme.com` | `password123` | Minimal Action Queue (`/client`) |

*Note: You can also use the 1-click demo login buttons directly on the login page or switch roles instantly via the navbar badge.*

---

## Local Setup & Installation

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### Step 1: Clone and Navigate
```powershell
Set-Location "C:\Users\dines\.gemini\antigravity\scratch\personal-assistant"
Get-Location
```

### Step 2: Install Server Dependencies
```powershell
Set-Location "server"
npm install
```

### Step 3: Install Client Dependencies
```powershell
Set-Location "..\client"
npm install
```

### Step 4: Seed Database (~45 Realistic Email Threads)
```powershell
Set-Location "..\server"
npm run seed
```
*Expected Output:*
```text
[Seed] Connecting to database...
[MongoDB] Connected successfully
[Seed] Creating primary executive workspace...
[Seed] Creating demo accounts (Assistant & Client)...
[Seed] Seeding 45 rich conversations and message threads...
[Seed] Seeding completed successfully!
```

### Step 5: Start Backend and Frontend
In Terminal 1 (Server):
```powershell
Set-Location "server"
npm run dev
# Server listening on http://localhost:5055
```

In Terminal 2 (Client):
```powershell
Set-Location "client"
npm run dev
# Vite dev server running at http://localhost:5173
```

Open your browser to: **http://localhost:5173**

---

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | API server port | `5055` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0...` |
| `JWT_SECRET` | Secure cryptographic secret | `personal_assistant_jwt_secure_secret_token_key_2026_x9283` |
| `JWT_EXPIRES_IN` | Session token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `ANTHROPIC_API_KEY` | Optional: Anthropic Claude key | *(Leave empty to use deterministic fallback)* |

### Client (`client/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base API URL | `http://localhost:5055/api` |

---

## Deployment Instructions

### 1. Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) to allow Render instances to connect.
3. Under **Database Access**, create a database user and copy the connection string into `MONGODB_URI`.

### 2. Backend: Render (Web Service)
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service**.
3. Configure:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add the Environment Variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGODB_URI=<Your Atlas URI>`
   - `JWT_SECRET=<Your Secret>`
   - `CLIENT_URL=https://your-app.vercel.app`
   - `ANTHROPIC_API_KEY=<Optional Claude Key>`
5. Click **Deploy**. Note down your Render backend URL (e.g., `https://ownly-api.onrender.com`).

### 3. Frontend: Vercel
1. In [Vercel Dashboard](https://vercel.com), import your repository.
2. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL=https://ownly-api.onrender.com/api`
4. Deploy.

---

## Keyboard Shortcuts
| Key | Action |
|---|---|
| <kbd>j</kbd> | Navigate to next conversation in stream |
| <kbd>k</kbd> | Navigate to previous conversation in stream |
| <kbd>e</kbd> | Archive selected conversation (with Undo toast) |
| <kbd>r</kbd> | Open reply composer for selected conversation |
| <kbd>/</kbd> | Focus global search input |
| <kbd>?</kbd> | Open keyboard shortcuts help modal |
| <kbd>Esc</kbd> | Close open modals, drawers, or reset focus |

---

## Automated Acceptance Testing
Run the comprehensive end-to-end verification test suite:
```powershell
Set-Location "server"
node test-acceptance.js
```
*Tests all 12 core acceptance criteria: health, auth, live DB stats, classifications, manual overrides, simulation, drafts, send flow, grounded chat, client two-way sync, and audit logs.*
