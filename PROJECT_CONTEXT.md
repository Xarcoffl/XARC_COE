# AR/VR Centre of Excellence — Project Context & Continuation Guide

This document captures the complete architectural overview, technology stack, implementation status, design decisions, file changelog, validation history, and operational runbook for the **AR/VR Centre of Excellence (Spatial Computing & Immersive Engineering Digital Ecosystem)**.

Use this document to seamlessly continue development on another PC, operating system (Windows, macOS, or Linux), or directory path without losing any institutional context.

---

## 1. Project Purpose & Technology Stack

### Purpose
The AR/VR Centre of Excellence platform is an institutional digital portal and management flight deck for a spatial computing research laboratory. It bridges academic learning with industrial deployment by providing:
- **Public Showcases**: Research dossiers, immersive student projects (AR, VR, MR, XR), hackathons, industry MoUs, and curriculum pathways.
- **Interactive 3D WebGL Viewers**: Real-time 3D specimen viewers, equipment twins, progression tunnels, and trophy inspectors.
- **Student Induction Pipeline**: Online application portal with dynamic custom questionnaires and an interactive 3D Holo-Keycard credential generator.
- **Administrative Flight Deck (`/control/*`)**: Cohort application review pipeline, custom broadcast student groups, multi-field CSV export, dual-pane content studios, and academic taxonomy configuration.

### Core Architectural Principles
1. **Developer-Controlled UI & Layout**: Core layouts, 3D WebGL viewports, spatial HUDs, navigation docks, and page scaffolding are codified in TypeScript and CSS. Administrators configure data slots, announcements, media links, and taxonomy without visual page-builder overhead.
2. **Strict Privacy Isolation**: Student applicant records (register numbers, phone numbers, email addresses, motivation statements, internal reviewer notes, and custom answers) are stored server-side and never exposed in public bundles or public APIs.
3. **High-Performance Spatial Aesthetics**: VisionOS-inspired glassmorphism, coordinate reticles, holographic shaders, and responsive design. Heavy 3D viewports degrade gracefully to lightweight 2D schematics on mobile screens (< 768px).
4. **Permanent Dark Mode for Admin Flight Deck**: Administrative routes (`/control/*`) are permanently locked into dark cybernetic HUD mode (`#admin-root-container`, `admin-theme-dark`), completely immune to public light mode.
5. **Light Spatial Loading for Public Pages Only**: A dedicated Apple Vision Pro Polar White & Ice Blue spatial edition of the VR device loader is active exclusively for public pages when light mode is selected.
6. **Dual-Layer Persistence**: 
   - Cloud: MongoDB Atlas support via cached singleton connection manager (`src/lib/mongodb.ts`).
   - Zero-Config Local Fallback: Embedded Atomic JSON document datastore (`src/lib/db.ts` -> `data/db.json` with temporary file atomic replacement).

### Technology Stack

| Layer | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `16.3.8` | React Server Components, Route Handlers, SSR |
| **UI Library** | React & React DOM | `19.3.0` | Concurrent rendering, modern hooks |
| **Language** | TypeScript | `7.0.2` | Strict end-to-end type safety |
| **3D Graphics** | Three.js (`@types/three`) | `0.186.1` | WebGL 2.0 rendering, `THREE.Timer` standard |
| **Vector Icons** | Lucide React | `1.49.0` | Minimalist iconography |
| **Styling** | Vanilla CSS Design Tokens | — | Custom CSS variables; zero Tailwind CSS dependency |
| **Theme Engine** | Custom Theme Manager | — | Dual-mode (Light/Dark) for public; permanent dark for admin |
| **Audio FX** | Web Audio API Procedural SFX | — | Synthesized audio without external asset dependencies |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `9.0.3` | Signed tokens stored in HttpOnly cookies |
| **Password Hashing** | Bcryptjs | `3.0.3` | Salted credential hashing |
| **Email Gateway** | Nodemailer | `10.0.15` | Transactional email delivery (`src/lib/email.ts`) |
| **Persistence** | MongoDB Atlas / Local Atomic JSON | `7.7.0` | Cloud Atlas with local fallback (`data/db.json`) |
| **Testing** | Node.js Test Harness (`test-e2e.mjs`) | — | Automated 34+ suite integration test runner |

---

## 2. Current Implementation Status

### 2.1 Public Ecosystem Routes (`/`)

- **`/` (Home)**:
  - Spatial Cockpit Hero with coordinate reticles, cardinal ticks, and interactive 3D headset specimen.
  - Minimal sound toggle icon (clean audio control without clutter).
  - About preview bento grid with 4 institutional pillars.
  - 5 Operating Verticals preview cards (adapted for both light and dark modes).
  - Unified Featured Content tabs (Events, Projects, Achievements).
  - **7-Stage Spatial Progression Conduit** (`JourneyTunnel3D`): Interactive WebGL tunnel displaying tailored 3D models for all 7 progression stages:
    - `01 Explore`: Spatial XR Headset with curved visor, ocular lenses, halo strap, and animated discovery compass beacon.
    - `02 Learn`: Holographic Knowledge Codex with illuminated code planes, floating Cartesian RGB coordinate axes, and rotating mathematical icosahedron core.
    - `03 Practice`: Precision Optical Laser Shader Prism on a dark pedestal with incoming white laser and 4 refracted spectral color beams (cyan, emerald, amber, pink).
    - `04 Build`: Articulated Robotic Prototyping Arm actively assembling a glowing voxel prototype cube construct.
    - `05 Compete`: Grand Hackathon Cyber Champion Trophy with hexagonal pedestal, fluted stem, winged handles, floating victory star, and championship laurel rings.
    - `06 Intern`: Industrial Neural Microprocessor Core with silicon die, gold bus traces, and dual interlocking counter-rotating gears.
    - `07 Industry`: Metropolitan Spatial Spire with layered architectural geometry, parabolic satellite transceiver dish, and a vertical launch beam reaching upward.
  - Highlighting for "Join CoE Cohort" navigation button.
  - Minimalist footer displaying *only* contact phone number (`tel:`), official mail ID (`mailto:`), and copyright branding.

- **`/about` (About & Vision)**:
  - Institutional Vision & Mission statements.
  - Core Mandates ("What We Do") with high-contrast cards.
  - **Holographic Lab Twin** (`LabIsometricTwin3D`): Interactive 3D blueprint featuring custom equipment models for all 7 lab sectors (`self-learning`, `project-work`, `3d-dev`, `hackathons`, `xr-dev`, `testing`, `industry`).
  - Co-working space diagram (Hardware Rig modal and "Inspect 3D Hardware Rig" button removed for streamlined presentation).
  - Strategic 4-Phase Roadmap.

- **`/verticals` (Pathways of Excellence)**:
  - Interactive pathway selector for all 5 official institutional verticals:
    - `01`: Long-Term Certification Courses (Academic Mortarboard Cap, Parchment Diploma Scroll with gold ribbon seal, accreditation rings, and floating credential stars).
    - `02`: Internships with Industry Support (Dual counter-rotating industrial gears with gear teeth, articulated robotic gripper arm holding a neural chip, and enterprise server chassis).
    - `03`: Self-Learning Courses (Dual curved ultrawide workstation monitors showing code syntax lines and 3D wireframe preview, plus tiered milestone course cubes linked by data bus line).
    - `04`: Skill Development Activities (Central energized hackathon lightning spark bolt core, rapid prototyping green PCB workbench with microcontroller chip and gold pins, competition trophy cup, and dual orbiting victory rings).
    - `05`: Product Development (Next-Gen flagship Spatial XR Headset with curved front OLED glass visor, 4 optical tracking sensors, halo strap, dual 6-DOF handheld motion controllers, and projected holographic 3D CAD wireframe model).
  - Structured deliverables, toolchain chips, career outcomes, and admissions open badge.

- **`/projects` (Project Dossiers)**:
  - Category filters: `ALL`, `AR`, `VR`, `MR`, `XR`, `3D`, `SIMULATION`.
  - Project cards with difficulty rating, tech stack tags, and lead investigator markers.

- **`/projects/[slug]` (Deep Dive Case Studies)**:
  - High-voltage substation VR simulator, holographic medical surgery planner, remote telepresence rover, etc.
  - Problem statement, solution architecture, engineering stack, student contributor roster, mentor attribution, and measurable impact telemetry (adapted for clean contrast in both light and dark themes).
  - Cleaned telemetry metrics (`// SPATIAL_HOLODECK_ACTIVE` label removed).

- **`/events` (Activity & Hackathon Conclave)**:
  - Automated date-aware status grouping: Upcoming, Ongoing, Completed.
  - Reduced spacing between title, search bar, and event cards.
  - Clean cards without duplicate 3D arenas.

- **`/events/[slug]` (Event Detail Showcase)**:
  - Timeline milestones, speaker rosters, venue coordinates, registration links, and photo galleries.

- **`/achievements` (Hall of Excellence)**:
  - Statistics counters (National Podiums, Published Patents, Research Papers, Seed Funding).
  - **Animated Pixel Trophy 3D Inspector** (`AchievementsTrophy3D`): Trophy that builds pixel-by-pixel, replacing redundant 3D podiums.
  - Dynamic category suppression: categories without achievements are hidden until an achievement is recorded.
  - Chronological achievement timeline (2026, 2025).

- **`/industry` (Enterprise Alliances & Corporate MoUs)**:
  - Bilateral MoUs, enterprise internship tracks, hardware incubation partners, and consulting roster.
  - Spatial Network Topology 3D globe / global hub removed to accurately reflect that the CoE is currently exclusive to the Chennai location.
  - Corporate partnership and research enquiry forms fully adapted to light and dark modes.

- **`/request` (Student Induction Portal)**:
  - Membership application form: Full Name, Email, Phone, Register Number, Department, Year of Study, Cumulative GPA, Spatial Interests, Skill Tags, and Motivation Letter.
  - Dynamic Custom Form Fields rendered from administrator configurations in `/control/content/request`.
  - Eligible departments dynamically synchronized with admin-configured taxonomy (`SiteSettings` / `departments`).
  - Integrated `VrDeviceLoader` (fullscreen transmission HUD during submission, mini loader inside submit button).
  - **Interactive 3D HoloKeycard**:
    - Tuned to natural brightness (no glare/over-brightness).
    - Equipped with zoom in / zoom out controls.
    - Immediately populated with submitted student data upon successful submission.
    - Auto-redirect: holds submitted confirmation view for 5 seconds, then smoothly returns to the homepage.
  - Duplicate registration protection (returns HTTP 409 Conflict if register number already applied).

- **`/loading.tsx` (Public Root Loading Page)**:
  - Configured with `mode="fullscreen"`, `theme="auto"`, and `className="public-loading-page"`.
  - Renders the **Light Spatial Edition** when public pages are viewed in light mode.
  - Renders the **Dark Cybernetic Edition** when public pages are viewed in dark mode.

- **`/loading-preview` (Interactive Showcase)**:
  - Showcase page for side-by-side inspection of Public Light Spatial, Public Dark Cybernetic, Admin Immune Dark Core, and mini button loaders.

---

### 2.2 Administrative Flight Deck (`/control/*`)

- **`/control/auth`**:
  - Administrative login with rate limiting (5 consecutive failures = 5-minute lockout).
  - Strict dark mode enforced regardless of public theme state.
  - Hidden Easter Egg access: 5 rapid clicks on the `AR/VR COE` branding logo in the top navbar within 2.5 seconds triggers redirect to `/control/auth`.

- **`/control/dashboard`**:
  - Live operational KPI cards (Total Applications, Pending Review, Active Fellows, Industry MoUs).
  - Quick-action queue for pending student applications.
  - Pure 2D telemetry HUD (zero WebGL 3D overhead for maximum data density).

- **`/control/requests`**:
  - Application pipeline with status filters: `NEW`, `WAITING`, `JOINED`, `REJECTED`.
  - Multi-select applicant checkboxes for bulk batch status transitions.
  - **Custom Field CSV Export Modal**: Allows administrator to toggle individual fields (Register Number, Name, Department Year, Interests, Email, Phone, GPA, Status, Submission Date, Custom Questions) or download the standardized roster format.
  - Synchronized department and interest filters matching configured taxonomy rather than arbitrary hardcoded values.
  - Applicant Dossier review modal with confidential internal reviewer notes.
  - Strict Deletion Prohibition: applications cannot be deleted; they can only be transitioned to `REJECTED` with an immutable timestamp.

- **`/control/announcements`**:
  - Broadcast announcement manager with priority flags and publish dates.
  - **Custom Student Broadcast Groups / Segments**: "WhatsApp status" style grouping allowing administrators to create named student cohorts (e.g., "Batch 2026 Core VR", "Hackathon Winners", "Research Fellows") and add/remove students dynamically.

- **`/control/loading.tsx` (Admin Root Loading Page)**:
  - Explicitly configured with `theme="dark"` and `className="admin-loading-page"`.
  - Immune to light mode; always renders dark command center HUD.

- **Dual-Pane Content & Curriculum Studios**:
  - `/control/content/home`: Hero messaging, pillars manager, dark/light split preview.
  - `/control/content/about`: Vision, mission, roadmap milestones, mandate pillars.
  - `/control/content/request`: Dynamic Custom Form Fields Builder (add/edit/delete/reorder text, textarea, number, select questions) and **Eligible Academic Departments Management** (add, edit, reorder, delete, restore defaults).
  - `/control/content/footer`: Dedicated **Footer Content Studio** with real-time browser preview, CoE brand identity, institutional copyright statements, quick legal presets, direct contact channels (`mailto:`, `tel:`), and auxiliary lab tagline badge.
  - `/control/verticals`: Curriculum manager, deliverables, toolchains, career pathways.
  - `/control/projects`: Project editor, narrative tabs, student squad roster, cover image presets.
  - `/control/events`: Event scheduler, speaker rosters, highlights, poster presets.
  - `/control/achievements`: Trophy manager, category badges, team tags.
  - `/control/industry`: Corporate partner editor, MoU terms, bilateral outcomes.
  - `/control/settings`: Institutional metadata, branding, contact phone, contact email, copyright year, **Academic Departments & Interest Taxonomy Configuration** (Tab 04), and Admin Credentials Security (Tab 05).

---

## 3. Important Decisions & Constraints

1. **Zero 3D Objects in Administrative Views**:
   - The administrative control deck (`/control/*`) strictly avoids 3D WebGL canvases to ensure instant rendering, low battery consumption, and maximum data density on enterprise workstations.
2. **Permanent Dark Mode for Admin Flight Deck**:
   - Even if a user visits public pages in light mode, navigating to `/control/*` forces dark mode styling (`#admin-root-container`, `admin-theme-dark`) to preserve the mission-critical command console aesthetic.
3. **Light Spatial Loading Page Strictly for Public Pages**:
   - The Polar White Apple Vision Pro loading page style applies only to public pages. Admin loading routes and loaders carry the `vr-loader-dark` class and are shielded by `#admin-root-container` CSS selectors.
4. **Student Request Deletion Prohibition (Rejection-Only)**:
   - Student records cannot be deleted (`DELETE /api/admin/requests` is blocked with HTTP 400 Bad Request).
   - Rejected candidates are moved to the `REJECTED` archive tab with an audit timestamp and reviewer notes.
5. **Minimalist Footer Policy**:
   - Footer contains *only* the official contact phone number (`tel:`), official mail ID (`mailto:`), and copyright branding. All redundant multi-column links, office hours, and physical campus addresses were removed per institutional directive.
6. **Single Location Scope (Chennai)**:
   - The CoE is currently operational solely at the Chennai campus. The global network topology 3D globe (`IndustryGlobe3D`) and multi-city telemetry were removed.
7. **Dynamic Custom Form Fields**:
   - Administrators can add custom questions to the application form via `/control/content/request`.
   - The public `/request` form dynamically renders, validates, and submits answers inside `custom_field_responses`.
8. **Configurable Department & Interest Taxonomy**:
   - Academic departments and spatial interests are maintained centrally in `SiteSettings` (`data/db.json` / MongoDB) and configured via `/control/settings`.
   - Public request form and admin filters consume the identical dynamic taxonomy.
9. **Atomic JSON Database Persistence**:
   - All mutations in `src/lib/db.ts` write to a temporary file (`data/db.json.tmp.<timestamp>`) before atomically replacing `data/db.json`. This eliminates partial writes or file corruption during process termination.
10. **Three.js Timer Standard**:
    - All 3D components use `new THREE.Timer()` rather than the deprecated `THREE.Clock()`, preventing browser console deprecation warnings.

---

## 4. Files Changed & Why (Relative Paths Only)

| Relative File Path | Operation | Purpose & Description |
| :--- | :--- | :--- |
| `src/components/common/VrDeviceLoader.tsx` | Created / Modified | 6-DoF spatial VR device loading component (modes: fullscreen, card, compact, inline, mini; theme prop: auto, dark, light; dynamic status text class). |
| `src/components/VrDeviceLoader.tsx` | Created | Re-export alias for clean imports (`@/components/VrDeviceLoader`). |
| `src/app/globals.css` | Modified | Added complete Light Spatial Version CSS tokens and rules (lines 2077–2235) for Polar White chassis, sapphire optics, light perspective grid, dark slate telemetry, and admin immunity shields (`#admin-root-container`, `.admin-loading-page`, `.vr-loader-dark`). |
| `src/app/loading.tsx` | Modified | Public root loading page configured with `mode="fullscreen"`, `theme="auto"`, and `className="public-loading-page"`. |
| `src/app/control/loading.tsx` | Modified | Admin root loading page explicitly locked to `theme="dark"` and `className="admin-loading-page"`. |
| `src/app/loading-preview/page.tsx` | Created | Interactive preview showcase to visually verify Public Light Spatial vs Admin Dark Core vs Public Dark Cybernetic. |
| `src/app/request/page.tsx` | Modified | Integrated `VrDeviceLoader` (fullscreen submission modal, mini loader in submit button), dynamic taxonomy for departments/interests, HoloKeycard zoom controls. |
| `src/app/control/requests/page.tsx` | Modified | Added Custom Field CSV Export Modal, synchronized department and interest filters with configured taxonomy, integrated `VrDeviceLoader`. |
| `src/app/control/announcements/page.tsx` | Modified | Added Custom Student Broadcast Groups / Segments ("WhatsApp status" style grouping for students) and integrated `VrDeviceLoader`. |
| `src/app/control/settings/page.tsx` | Modified | Added Tab 04 for Department and Interest taxonomy configuration, unlocked admin email change in Tab 05 (Security), integrated `VrDeviceLoader`. |
| `src/app/control/projects/page.tsx` | Modified | Integrated `VrDeviceLoader` for project list fetching and action states. |
| `src/app/control/verticals/page.tsx` | Modified | Integrated `VrDeviceLoader` for vertical curriculum loading. |
| `src/app/control/events/page.tsx` | Modified | Integrated `VrDeviceLoader` for events data fetching. |
| `src/app/control/media/page.tsx` | Modified | Integrated `VrDeviceLoader` for media assets loading and uploads. |
| `src/app/control/dashboard/page.tsx` | Modified | Integrated `VrDeviceLoader` for KPI dashboard loading. |
| `src/app/control/auth/page.tsx` | Modified | Integrated `VrDeviceLoader` for admin session authentication. |
| `src/components/admin/AssetPickerModal.tsx` | Modified | Integrated `VrDeviceLoader` for asset selection loading states. |
| `src/components/admin/ImageUploadField.tsx` | Modified | Integrated `VrDeviceLoader` for image encoding and upload progress. |
| `src/lib/email.ts` | Modified | Transactional email delivery service with Nodemailer SMTP gateway and responsive HTML notification templates. |
| `src/lib/types.ts` | Modified | Added taxonomy types (`departments`, `interests`), student group segment definitions, and VR loader props. |
| `src/lib/db.ts` | Modified | Atomic JSON persistence with MongoDB Atlas synchronization and fallback. |
| `src/lib/mongodb.ts` | Created | Singleton cached MongoDB client for Next.js serverless and Turbopack. |
| `src/lib/auth.ts` | Modified | JWT authentication, rate limiting, and cookie session management. |
| `src/lib/theme.ts` | Modified | Dual-mode public theme engine with subscriber pattern and localStorage persistence. |
| `src/styles/admin.css` | Modified | Admin flight deck stylesheet with dark command palette tokens and modal styling. |
| `scripts/manage-admin.mjs` | Created | Administrative account CLI utility (`npm run admin:manage`). |
| `scripts/migrate-to-mongo.mjs` | Created | MongoDB Atlas migration and indexing tool (`npm run db:migrate-mongo`). |
| `test-e2e.mjs` | Modified | Automated 34+ suite integration test runner. |

---

## 5. Known Issues & Pending Tasks

### Known Issues & Workarounds
1. **Windows PowerShell Execution Policy**:
   - In environments where PowerShell execution policy is restricted, running `npm run dev` or `npx` directly in PowerShell may yield `PSSecurityException`.
   - **Workaround**: Run scripts via `cmd.exe /c "npm run dev"` or adjust execution policy using `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.
2. **Automated Playwright Binary Download on Firewalled Networks**:
   - In offline or proxy-restricted networks, Playwright browser binaries may fail to download from external CDNs.
   - **Workaround**: Use the native HTTP integration test runner (`node test-e2e.mjs`), which executes without external binary downloads. Standard desktop browsers (Chrome, Edge, Firefox, Brave) run the app directly.
3. **Container Volume Persistence**:
   - In Docker deployments, the `data/` directory must be mounted as a persistent volume. If not mounted, container restarts will reset `data/db.json` to default factory seed data.

### Pending Tasks & Recommended Next Steps
1. **Automated Status Change Email Notifications**: Connect `src/lib/email.ts` directly into `PATCH /api/admin/requests` so that moving a student to `WAITING`, `JOINED`, or `REJECTED` automatically dispatches the branded HTML notification email if SMTP is configured.
2. **Production SMTP Gateway Configuration**: Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in `.env.local` to enable live transactional email dispatch.
3. **MongoDB Atlas Production Binding**: If running with MongoDB Atlas in production, verify `MONGODB_URI` and run `npm run db:migrate-mongo` to seed initial collections and create indexes.

---

## 6. Validation Already Completed

The application has been validated through compiler checks, HTTP status tests, and E2E suites:

1. **TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   - **Status**: Passed with **0 errors**.
2. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   - **Status**: Passed. All static and dynamic routes compiled without Turbopack warnings.
3. **HTTP Endpoint Verification**:
   - Public pages return HTTP 200: `/`, `/about`, `/verticals`, `/projects`, `/projects/[slug]`, `/events`, `/events/[slug]`, `/achievements`, `/industry`, `/request`, `/loading-preview`.
   - Admin routes return HTTP 200: `/control/auth`, `/control/requests`, `/control/dashboard`, `/control/content/request`, `/control/content/footer`.
   - Privacy isolation: unauthenticated requests to `/api/admin/*` return HTTP 401 Unauthorized.
   - Student induction submission: `POST /api/public/requests` returns HTTP 201 Created.
   - Duplicate prevention: re-submitting an existing register number returns HTTP 409 Conflict.
   - Deletion prohibition: `DELETE /api/admin/requests` is rejected with HTTP 400 Bad Request.
4. **Automated Integration Test Suite**:
   ```bash
   node test-e2e.mjs
   ```
   - **Status**: **32 PASSED, 0 FAILED (100% Pass Rate)**. Full coverage across public routes, student intake submission, duplicate protection, admin JWT authentication, batch status transitions, dynamic taxonomy synchronization, footer management, health check telemetry, production security headers, and branded 404 recovery.

---

## 7. Exact Next Steps for Continuing on Another PC

To continue working on this project on a new computer with a different folder path:

### Step 1: Transfer Project Files
Copy the entire project directory to the new machine. Ensure `data/db.json` is preserved to retain existing data and taxonomy settings.

### Step 2: Ensure Node.js is Installed
- Minimum version: Node.js `v20.x LTS` (or `v22.x LTS`)
- npm `v10.x` or higher
Verify via terminal:
```bash
node -v
npm -v
```

### Step 3: Install Dependencies
Open a terminal in the project root directory and run:
```bash
npm install
```
*(On Windows PowerShell with execution restrictions, run `cmd.exe /c "npm install"`).*

### Step 4: Configure Environment Variables
Copy the template to create `.env.local`:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# Linux / macOS (Bash)
cp .env.example .env.local
```
Configure your custom settings in `.env.local` (e.g., `PORT`, `JWT_SECRET`, optional `MONGODB_URI`, and optional `SMTP_*` credentials). If no `.env.local` is provided, the platform automatically runs using development fallbacks and the local atomic JSON datastore.

### Step 5: Start the Development Server
```bash
# Run on port 3005:
npm run dev -- -p 3005
```
*(Or `cmd.exe /c "npm run dev -- -p 3005"` on Windows).*

### Step 6: Verify the Environment
Run TypeScript compilation and the test suite:
```bash
npx tsc --noEmit
node test-e2e.mjs
```

### Step 7: System Access Directory
- **Public Portal**: `http://localhost:3005`
- **Student Induction Dock**: `http://localhost:3005/request`
- **Loading Showcase**: `http://localhost:3005/loading-preview`
- **Admin Command Terminal**: `http://localhost:3005/control/auth` *(or click the top-left branding logo 5 times rapidly)*
- **Admin Dashboard**: `http://localhost:3005/control/dashboard`
- **Applicant Pipeline & Review**: `http://localhost:3005/control/requests`
- **Student Broadcast Segments**: `http://localhost:3005/control/announcements`
- **Taxonomy & Settings Studio**: `http://localhost:3005/control/settings`
- **Request Form Question Builder**: `http://localhost:3005/control/content/request`
- **Curriculum & Verticals Studio**: `http://localhost:3005/control/verticals`
- **Projects Dossier Studio**: `http://localhost:3005/control/projects`
- **Events & Conclave Studio**: `http://localhost:3005/control/events`
- **Achievements & Accolades Studio**: `http://localhost:3005/control/achievements`
- **Industry & MoUs Studio**: `http://localhost:3005/control/industry`
- **Home Content Studio**: `http://localhost:3005/control/content/home`
- **About Content Studio**: `http://localhost:3005/control/content/about`
- **Footer Content Studio**: `http://localhost:3005/control/content/footer`
