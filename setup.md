# AR/VR Centre of Excellence — Project Setup Guide

Welcome to the **AR/VR Centre of Excellence (Spatial Computing & Immersive Engineering Digital Ecosystem)**. This comprehensive guide walks you through every step required to clone, configure, build, run, and verify the project on any computer (Windows, macOS, or Linux).

---

## Table of Contents

1. [System Prerequisites](#1-system-prerequisites)
2. [Quick Start (60-Second Setup)](#2-quick-start-60-second-setup)
3. [Step-by-Step Installation](#3-step-by-step-installation)
   - [Step 1: Clone the Repository](#step-1-clone-the-repository)
   - [Step 2: Environment Configuration](#step-2-environment-configuration)
   - [Step 3: Install Dependencies](#step-3-install-dependencies)
   - [Step 4: Database Auto-Initialization](#step-4-database-auto-initialization)
4. [Running the Application](#4-running-the-application)
   - [Development Server](#development-server)
   - [Production Build & Server](#production-build--server)
5. [Automated End-to-End Testing](#5-automated-end-to-end-testing)
6. [Administrative Flight Deck & Credentials](#6-administrative-flight-deck--credentials)
7. [System Architecture & Route Directory](#7-system-architecture--route-directory)
8. [Database Maintenance & Backups](#8-database-maintenance--backups)
9. [Troubleshooting & Common Questions](#9-troubleshooting--common-questions)

---

## 1. System Prerequisites

Before starting, ensure your local development machine satisfies the following requirements:

| Tool | Recommended Version | Minimum Version | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | **v20.x LTS** or **v22.x LTS** | `v18.18.0` | Required for Next.js 16 App Router |
| **npm** | `v10.x` or higher | `v9.x` | Bundled automatically with Node.js |
| **Git** | `v2.30+` | `v2.20+` | For cloning and version control |
| **Web Browser** | Chrome, Edge, Firefox, Brave | Any modern browser | WebGL 2.0 enabled for 3D spatial scenes |
| **Operating System** | Windows 10/11, macOS, Linux | Any POSIX or Win32 | Fully cross-platform |

> [!NOTE]
> **No external database server is required!**
> The project uses an embedded, atomic JSON document datastore (`data/db.json`). You do **not** need to install PostgreSQL, MongoDB, MySQL, or Redis to run this application.

---

## 2. Quick Start (60-Second Setup)

For experienced developers who want to get up and running immediately:

```bash
# 1. Clone repository
git clone <repository-url>
cd XARC_COE

# 2. Install dependencies
npm install

# 3. Start local development server on port 3005
npm run dev -- -p 3005

# 4. In a separate terminal, verify all 26 test suites
node test-e2e.mjs
```

Open **[http://localhost:3005](http://localhost:3005)** in your browser to view the spatial ecosystem.

---

## 3. Step-by-Step Installation

### Step 1: Clone the Repository

Clone the repository to your local drive using Git:

```bash
# Clone using HTTPS:
git clone https://github.com/your-org/arvr-coe.git XARC_COE

# Or clone using SSH:
git clone git@github.com:your-org/arvr-coe.git XARC_COE

# Navigate into the project root:
cd XARC_COE
```

---

### Step 2: Environment Configuration

The application includes sensible zero-configuration defaults for all settings. If you want to customize the port or JWT secret for production hardening, copy the provided `.env.example` file:

```bash
# Windows (PowerShell):
Copy-Item .env.example .env.local

# Linux / macOS (Bash):
cp .env.example .env.local
```

#### Environment Variables Reference (`.env.local`)

```env
# Server Port (default: 3000, recommended development: 3005)
PORT=3005

# JWT Secret for Administrative Sessions
JWT_SECRET=arvr-coe-pec-super-secret-jwt-key-2026

# Node Environment
NODE_ENV=development
```

> [!TIP]
> In production environments, replace `JWT_SECRET` with a strong random 32-character string (e.g., generated with `openssl rand -base64 32`).

---

### Step 3: Install Dependencies

Install the project packages using `npm install`:

```bash
npm install
```

#### Core Packages Installed:
- **Next.js (`v16.3.8`)**: Modern App Router, Server Components, and API Route handlers.
- **React & React DOM (`v19.3.0`)**: High-performance rendering engine.
- **Three.js (`v0.186.1`) & `@types/three`**: WebGL 3D specimen rendering, spatial cockpit, and HoloKeycard.
- **Lucide React (`v1.49.0`)**: Clean, minimalist vector iconography.
- **Bcryptjs (`v3.0.3`)**: Cryptographic password hashing for admin credentials.
- **Jsonwebtoken (`v9.0.3`)**: Signed JWT tokens stored in HttpOnly cookies.
- **TypeScript (`v7.0.2`)**: Strict end-to-end type safety.

---

### Step 4: Database Auto-Initialization

The database layer (`src/lib/db.ts`) has a self-healing auto-initialization mechanism:

1. When the server launches and receives its first request, it checks whether `data/db.json` exists.
2. If `data/db.json` is missing, `src/lib/db.ts` automatically creates the `data/` folder and populates `data/db.json` with a rich seed dataset:
   - Default Superadmin user (`admin@coe.edu`)
   - Institutional settings, branding, contacts, and campus coordinates
   - 5 Operating Verticals with comprehensive syllabi
   - 6 Research & Deployment Projects
   - 3 Flagship Events & Hackathons
   - 5 Milestone Achievements & Accolades
   - 6 Corporate & MoU Industry Partners
   - Dynamic Request Form configuration with custom field definitions
   - Sample student applications for induction testing

> [!NOTE]
> You do **not** need to run database migrations, seed scripts, or schema setups. It happens automatically.

---

## 4. Running the Application

### Development Server

Run the development server with live hot-reloading:

```bash
# Run on default port 3000:
npm run dev

# Or run on port 3005 (recommended to avoid conflicts):
npm run dev -- -p 3005
```

Once running, navigate to:
- **Public Portal**: `http://localhost:3005`
- **Admin Command Terminal**: `http://localhost:3005/control/auth`

---

### Production Build & Server

To test or deploy in high-performance production mode:

```bash
# 1. Compile the production bundle (TypeScript checks + route optimization):
npm run build

# 2. Launch the optimized production server:
npm run start -- -p 3005
```

During `npm run build`, Next.js compiles 35 static and dynamic routes. You should see a clean build with zero TypeScript or route compilation errors.

---

## 5. Automated End-to-End Testing

The repository includes a comprehensive, standalone integration test suite (`test-e2e.mjs`) that verifies public routes, student applications, admin authentication, rate-limiting, CRUD operations, and custom form builders.

With the server running on port `3005`:

```bash
node test-e2e.mjs
```

### What the Test Suite Verifies (26/26 Tests):
1. **Public HTML Pages**: `/`, `/about`, `/verticals`, `/projects`, `/events`, `/achievements`, `/industry`, `/contact`, `/request`.
2. **Student Induction Submission**: Submits an application with dynamic custom field answers, tests verification code generation, and rejects duplicate register numbers.
3. **Admin Security & Authentication**: Tests invalid credential rejection, brute-force rate-limiting, and successful signed JWT issuance.
4. **Admin Dashboard & CRUD APIs**: Tests status updates (`WAITING`, `JOINED`, `REJECTED`), private admin notes persistence, and CRUD studios for Verticals, Projects, Events, Achievements, and Industry partners.
5. **Dynamic Request Form Builder**: Tests adding custom fields (`text`, `textarea`, `select`, `checkbox`), reordering fields, public rendering, and candidate response recording.

---

## 6. Administrative Flight Deck & Credentials

### Default Administrator Credentials

| Field | Value |
| :--- | :--- |
| **Email** | `admin@coe.edu` |
| **Password** | `Admin@ARVR2026!` |
| **Access URL** | [http://localhost:3005/control/auth](http://localhost:3005/control/auth) |

### Hidden Easter Egg Access
In addition to typing `/control/auth` directly:
- Rapidly click the **`AR/VR COE` branding logo** in the top-left navigation dock **5 times within 2.5 seconds** from any public page.
- An animated authentication portal will trigger, redirecting you directly to the Command Terminal login.

### Security Highlights:
- **Zero 3D in Admin Panel**: The admin control deck is completely free of 3D WebGL meshes to maximize performance and data density.
- **HttpOnly Cookies**: Session tokens are signed using JWT and stored in secure HttpOnly cookies, immune to XSS token theft.
- **Brute Force Protection**: 5 consecutive failed login attempts trigger an automated 5-minute client lockout.
- **Applicant Data Confidentiality**: Student contact info, registration numbers, and motivation letters are isolated on the server and never exposed to public bundles.
- **Strict Rejection Policy**: Student requests cannot be arbitrarily deleted; they are formally marked as `REJECTED` to maintain institutional audit logs.

---

## 7. System Architecture & Route Directory

```
ARVR/
├── data/
│   └── db.json               # Atomic JSON database (auto-seeded on first run)
├── public/
│   ├── favicon.ico           # Institution favicon
│   └── icons/                # Static icons and assets
├── src/
│   ├── app/                  # Next.js App Router (Public & Admin Routes)
│   │   ├── page.tsx          # Home page (Spatial Cockpit & 3D Hero)
│   │   ├── about/            # Mission, Vision, and 7-Sector Co-working Map
│   │   ├── verticals/        # 5 Operating Pathways & Syllabi
│   │   ├── projects/         # Project Showcase & Detail Views
│   │   ├── events/           # Activity Hub, Hackathons, & Bootcamps
│   │   ├── achievements/     # Accolades, Grants, & Milestone Counters
│   │   ├── industry/         # Corporate Alliances & Bilateral MoUs
│   │   ├── contact/          # Lab Coordinates & Operating Hours
│   │   ├── request/          # Student Induction Form & 3D Holo-Keycard
│   │   ├── control/          # Administrative Flight Deck
│   │   │   ├── auth/         # Admin Login Terminal
│   │   │   ├── overview/     # KPI Analytics Radar
│   │   │   ├── requests/     # Student Induction Pipeline & Modal Review
│   │   │   ├── verticals/    # Dual-Pane Curriculum Studio
│   │   │   ├── projects/     # Dual-Pane Project Dossier Studio
│   │   │   ├── events/       # Dual-Pane Activity & Conclave Studio
│   │   │   ├── achievements/ # Dual-Pane Accolades Studio
│   │   │   ├── industry/     # Dual-Pane Partnership Studio
│   │   │   ├── content/      # Home, About, & Request Form Custom Field Builder
│   │   │   ├── settings/     # Site-wide Metadata & Institutional Config
│   │   │   └── profile/      # Administrator Profile & Password Update
│   │   └── api/              # Secure REST API Endpoints
│   │       ├── public/       # Public-facing APIs (Submission, Published Content)
│   │       └── admin/        # Admin-authenticated APIs (Protected by JWT)
│   ├── components/
│   │   ├── public/           # Vertical Dock, 3D HoloKeycard, Spatial Scene
│   │   └── admin/            # Admin Layout, Request Modal, Studio Dual-Panes
│   ├── lib/
│   │   ├── auth.ts           # JWT verification & rate-limiting logic
│   │   ├── db.ts             # Atomic JSON file I/O & data seeders
│   │   └── types.ts          # TypeScript interfaces & domain schemas
│   └── styles/
│       └── admin.css         # Admin panel styling & Light/Dark themes
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for Next.js, Node, & OS files
├── package.json              # Project dependencies & scripts
├── test-e2e.mjs              # 26-suite end-to-end integration test runner
└── tsconfig.json             # TypeScript configuration
```

---

## 8. Database Maintenance & Backups

### How Persistence Works
- All site content, settings, and student applications are stored in `data/db.json`.
- Changes made in the Admin Panel write to a temporary file (`db.json.tmp.<timestamp>`) and are atomically renamed to `db.json`. This prevents file corruption during server restarts or concurrent writes.

### How to Create a Manual Backup
```bash
# Backup database
cp data/db.json data/db.backup.json
```

### How to Reset to Factory Defaults
To reset all content, events, projects, and settings back to original clean defaults:
1. Stop the running server (`Ctrl + C`).
2. Delete the `data/db.json` file:
   ```bash
   # Windows (PowerShell):
   Remove-Item data/db.json

   # Linux / macOS (Bash):
   rm data/db.json
   ```
3. Restart the server (`npm run dev -- -p 3005`). A fresh database will be created and populated automatically.

---

## 9. Troubleshooting & Common Questions

### Q1: `Error: listen EADDRINUSE: address already in use :::3005` (or `:::3000`)
**Cause:** Another process is already running on the requested port.  
**Solution:** Either specify a different port or terminate the existing process:
```bash
# Option A: Start on an alternative port (e.g. 3006)
npm run dev -- -p 3006

# Option B (Windows): Kill process occupying port 3005
Get-Process -Id (Get-NetTCPConnection -LocalPort 3005).OwningProcess | Stop-Process -Force

# Option B (Linux / macOS): Kill process occupying port 3005
npx kill-port 3005
```

---

### Q2: Windows PowerShell error `running scripts is disabled on this system`
**Cause:** Windows execution policy blocks unsigned PowerShell scripts by default.  
**Solution:** Run the following command in PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

### Q3: The 3D scene or Holo-Keycard is lagging or showing a blank canvas
**Cause:** WebGL hardware acceleration might be disabled in your browser, or you are running on low-power mobile power-saver mode.  
**Solution:**
1. Open your browser settings and verify **"Use graphics acceleration when available"** is toggled ON.
2. In Google Chrome or Microsoft Edge, navigate to `chrome://gpu` to verify WebGL 2.0 status.
3. Note that the application automatically degrades gracefully: on mobile viewports (< 768px), heavy 3D specimens are limited to optimize battery and framerate.

---

### Q4: How do I change the Administrator Password?
1. Log in to the Admin Panel at `/control/auth`.
2. Navigate to **Control Flight Deck > Profile** (`/control/profile`).
3. Enter your current password (`Admin@ARVR2026!`) and set your new desired password.
4. Alternatively, you can edit `data/db.json` directly and update the password hash if you are locked out.

---

### Q5: Production Database Migration (MongoDB Atlas)
By default, the platform uses an embedded atomic JSON datastore (`data/db.json`) requiring zero setup. To connect to MongoDB Atlas for cloud production:
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user (e.g. `arvr_admin`).
3. Under **Network Access**, whitelist your server IP (or `0.0.0.0/0` for cloud hosting).
4. Copy your connection string and add it to `.env.local`:
   ```bash
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/arvr_coe?retryWrites=true&w=majority"
   ```
5. Migrate all local data with a single command:
   ```bash
   npm run db:migrate-mongo
   ```
6. Start the server: `npm run dev -- -p 3005`. The app will automatically connect to MongoDB Atlas and keep `data/db.json` as an offline fallback.

---

### Q6: Docker Deployment & Data Persistence
If containerizing the application using Docker, ensure the `data/` directory is mounted as a persistent Docker volume:
```bash
# Using docker compose:
docker compose up -d

# Or standard docker run:
docker run -p 3005:3000 -v ./data:/app/data arvr-coe-image
```

---

## Need Further Help?
- Refer to [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for architectural invariants, design decisions, and system history.
- Run `node test-e2e.mjs` anytime to verify all public and administrative subsystems are functioning at 100%.

