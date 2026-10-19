# 💼 AnZ Job Portal

A modern, production-ready, AI-augmented Full-Stack Job Application and Talent Management Platform. Built with a **Next.js 16** frontend and an **Express 5** backend using **Drizzle ORM**, **MySQL**, **Redis**, and **Google Gemini AI**.

---

## 📑 Table of Contents

- [Features](#-features)
  - [Candidate Experience](#candidate-experience)
  - [Recruiter & Admin Portal](#recruiter--admin-portal)
  - [AI & Intelligence Engine](#ai--intelligence-engine)
  - [Architecture & Security](#architecture--security)
- [Tech Stack](#-tech-stack)
- [Monorepo Structure](#-monorepo-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Database Setup & Seeding](#4-database-setup--seeding)
- [Running the Application](#-running-the-application)
  - [Development Mode (HMR)](#development-mode-dual-process)
  - [Production Mode (Unified Single-Process)](#production-mode-single-process)
- [Running Tests](#-running-tests)
- [API Route Overview](#-api-route-overview)
- [License & Author](#-license--author)

---

## ✨ Features

### Candidate Experience
- **Smart Profile Management**: Manage headline, biography, location/address, social/portfolio links, and technical skill tags.
- **Dynamic Completeness Scoring**: Calculates real-time profile completeness scores (0–100%) to encourage candidates to complete essential fields before applying.
- **Job Discovery & Matching**: Explore active job posts, search by keyword/department, and preview required skills with visual match indicators.
- **One-Click Application & Duplicate Guard**: Apply with tailored cover letters; includes backend duplicate-submission guards.
- **Real-Time Application Status**: Track review pipelines (`pending` ➔ `shortlisted` ➔ `hired` or `rejected`) with recruiter review notes.

### Recruiter & Admin Portal
- **Job Post Lifecycle**: Create, draft, publish, update, and close job postings with structured skill requirements.
- **Applicant Breakdown & Pipeline**: Filter candidates by skill match count and review status; inspect detailed profile snapshots.
- **Feedback & Decisioning**: Review candidate submissions with status updates and actionable feedback notes.
- **Role-Based Access Control (RBAC)**: Fine-grained permission model (`candidate`, `admin`, `superadmin`) enforcing route and operation safety.

### AI & Intelligence Engine
- **Google Gemini Flash Integration**:
  - **Candidate Feedback**: Generates constructive, actionable feedback comparing candidate profiles against specific job requirements.
  - **Candidate Suggestions**: Analyzes job descriptions and ranks top-matching candidates.
  - **Application Summaries**: Summarizes candidate qualifications and cover letters for rapid recruiter evaluation.
- **Redis Response Caching**: AI responses are cached in Redis to minimize API latency and optimize token expenditure.
- **Intelligent Rate Limiting**: Dedicated rate limiters on AI and auth endpoints prevent resource exhaustion.

### Architecture & Security
- **Unified Single-Process Production Serving**: Next.js exports a static SPA bundle served directly by the Express backend with an SPA fallback router, eliminating multi-server deployment overhead.
- **Dynamic Same-Origin Client**: Frontend API client seamlessly auto-detects production (same-origin `/api/v1`) vs. local development (`:3000` targeting `:4000`) without manual `.env` changes.
- **Session Security**: Argon2 password hashing, secure HTTP-only cookies, MySQL session store (`express-mysql-session`), and custom header CSRF protection.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Zustand](https://zustand-demo.pmnd.rs/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Backend** | [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Zod](https://zod.dev/) |
| **Database & ORM** | [MySQL 8](https://www.mysql.com/), [Drizzle ORM](https://orm.drizzle.team/), [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) |
| **Caching & Storage** | [Redis](https://redis.io/) via `ioredis`, MySQL Session Store |
| **AI Integration** | [Google Gemini 2.5/3.8 Flash](https://ai.google.dev/) via `@google/genai` |
| **Testing** | [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest) |

---

## 📂 Monorepo Structure

```
job_apply/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment parsing (Zod) and app configuration
│   │   ├── db/              # Drizzle schema, migrations, connection, and seeders
│   │   ├── middleware/      # Auth, RBAC permissions, error handlers, rate limiters
│   │   ├── modules/         # Modular feature domains:
│   │   │   ├── ai/          # Google Gemini AI services and controllers
│   │   │   ├── applications/# Candidate applications and admin review pipeline
│   │   │   ├── auth/        # Register, login, session validation (Argon2)
│   │   │   ├── candidates/  # Profile, skills delta sync, completeness score
│   │   │   ├── dashboard/   # Metrics for candidate and admin dashboards
│   │   │   ├── jobs/        # Public and admin job management
│   │   │   ├── rbac/        # Roles & permissions system
│   │   │   └── users/       # Admin user management
│   │   ├── app.ts           # Express app setup, SPA fallback, static serving
│   │   └── index.ts         # Server bootstrap
│   ├── tests/               # Vitest integration test suites (49 tests)
│   ├── .env.example         # Template for backend environment variables
│   ├── drizzle.config.ts    # Drizzle ORM configuration
│   └── package.json
├── frontend/
│   ├── app/                 # Next.js App Router pages (jobs, admin, candidate)
│   ├── components/          # Reusable UI components (Shadcn/UI, Tailwind)
│   ├── lib/
│   │   ├── api-core.ts      # Dynamic environment-aware HTTP fetch client
│   │   └── utils.ts
│   ├── store/               # Zustand state stores (auth, user state)
│   ├── next.config.ts       # Static export configuration (`output: "export"`)
│   └── package.json
├── package.json             # Root monorepo scripts
└── README.md
```

---

## 📋 Prerequisites

Make sure you have the following installed on your system:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v9.x` or `v12.x` (`npm install -g pnpm`)
- **MySQL**: `v8.0+` running locally or accessible via network
- **Redis**: `v6.0+` (optional for local run; fallback gracefully handles cache misses)
- **Google Gemini API Key**: (Optional, needed for AI feedback and candidate recommendations)

---

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd job_apply
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
pnpm --prefix backend install
pnpm --prefix frontend install
```

### 3. Environment Configuration

Copy the example environment file in the backend directory:

```bash
# On Linux / macOS / Git Bash:
cp backend/.env.example backend/.env

# On Windows PowerShell:
Copy-Item backend/.env.example backend/.env
```

Open `backend/.env` and configure your credentials:

```ini
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000,http://localhost:4000

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=anz_job_portal

# Session Secret (provide a long random string)
SESSION_SECRET=your_super_secret_session_key_min_32_chars
SESSION_MAX_AGE_DAYS=7

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Default Seed Superadmin
SEED_ADMIN_NAME="AnZ Admin"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

*(Optional Frontend Config)*: The frontend includes `frontend/.env.local` pointing to `http://localhost:4000/api/v1` during development. You don't need to change this under standard setup.

---

### 4. Database Setup & Seeding

Run the automated database setup script from the root:

```bash
pnpm db:setup
```

This single command executes:
1. `db:create`: Automatically creates the MySQL database `anz_job_portal` if it doesn't already exist.
2. `db:migrate`: Applies all Drizzle ORM schema migrations (tables, foreign keys, indexes).
3. `db:seed`: Idempotently seeds initial roles (`admin`, `candidate`), permissions, and the default admin user account.

#### Default Admin Credentials:
- **Email**: `admin@example.com` (or the value set in `SEED_ADMIN_EMAIL`)
- **Password**: `ChangeMe123!` (or the value set in `SEED_ADMIN_PASSWORD`)

---

## 💻 Running the Application

### Development Mode (Dual Process)

In development, you can run the backend and frontend separately with hot-module replacement (HMR):

**Terminal 1 (Backend API on `:4000`):**
```bash
pnpm dev:backend
```

**Terminal 2 (Frontend UI on `:3000`):**
```bash
pnpm dev:frontend
```

Visit **`http://localhost:3000`** in your browser. The frontend automatically proxies requests to the backend on `:4000`.

---

### Production Mode (Single-Process)

In production, the frontend is compiled into a static export and served directly by the Express backend on the same port:

```bash
# 1. Build both frontend static export and backend TypeScript
pnpm build

# 2. Start the unified production server
pnpm start
```

Visit **`http://localhost:4000`** in your browser.
- **Web App**: Served at `http://localhost:4000/`
- **REST API**: Served at `http://localhost:4000/api/v1/`
- **Health Check**: `http://localhost:4000/api/health`

---

## 🧪 Running Tests

The test suite contains 8 test files with 49 unit and integration tests covering the complete authentication cycle, RBAC permissions, job management, candidate profile completeness, duplicate application guards, and Gemini AI endpoints.

To run the tests:

```bash
pnpm test
```

Or watch mode:

```bash
pnpm --prefix backend test:watch
```

> **Note**: The test suite uses a dedicated test database (`anz_job_portal_test`) configured in `backend/.env.test`, automatically isolated from your development data.

---

## 📡 API Route Overview

All API endpoints are versioned under `/api/v1`:

| Route Prefix | Access | Description |
| :--- | :--- | :--- |
| `GET /api/health` | Public | Server uptime and health probe |
| `POST /api/v1/auth/register` | Public | Candidate account registration |
| `POST /api/v1/auth/login` | Public | Session login (HTTP-only cookie) |
| `GET /api/v1/auth/me` | Authenticated | Current user profile and permissions |
| `POST /api/v1/auth/logout` | Authenticated | Clears session cookie |
| `GET /api/v1/jobs` | Public | List active job listings with skill tags |
| `GET /api/v1/jobs/:id` | Public | Retrieve public job posting details |
| `POST /api/v1/jobs/:id/apply` | Candidate | Submit job application with cover letter |
| `GET /api/v1/candidate/profile` | Candidate | Retrieve personal profile and skills |
| `PUT /api/v1/candidate/profile` | Candidate | Update headline, bio, address, and skills delta |
| `GET /api/v1/candidate/applications` | Candidate | View submitted applications and status |
| `GET /api/v1/dashboard/candidate` | Candidate | Candidate dashboard metrics & profile score |
| `GET /api/v1/admin/jobs` | Admin | List all jobs with applicant & skill breakdown |
| `POST /api/v1/admin/jobs` | Admin | Create job listing (draft or active) |
| `PATCH /api/v1/admin/jobs/:id/status`| Admin | Publish, draft, or close job |
| `GET /api/v1/admin/applications` | Admin | Review candidate applications pipeline |
| `PATCH /api/v1/admin/applications/:id`| Admin | Update status (`shortlisted`, `hired`, `rejected`) + feedback note |
| `GET /api/v1/ai/jobs/:id/suggest-candidates` | Admin | Gemini AI candidate recommendation for job |
| `GET /api/v1/ai/applications/:id/summary` | Admin | Gemini AI application summary |
| `GET /api/v1/ai/jobs/:jobId/candidates/:candidateId/feedback` | Admin | Gemini AI candidate feedback & qualification match |

---

## 📄 License & Author

- **Author**: Malik Md Apu Rahman
- **License**: [ISC](https://opensource.org/licenses/ISC)
