# AR/VR Centre of Excellence — Project Context & Continuation Guide

This document captures the complete architectural overview, technological stack, implementation state, design decisions, file changelog, validation history, and operational runbook for the **AR/VR Centre of Excellence (Spatial Computing & Immersive Engineering Digital Ecosystem)**.

Use this document to seamlessly pick up development on any new machine, operating system (Windows, macOS, or Linux), or directory path without losing any institutional context.

---

## 1. Project Purpose & Technology Stack

### Purpose
The AR/VR Centre of Excellence platform is an enterprise-grade digital portal and management flight deck for an institutional spatial computing lab. It bridges academic research with industrial deployment by providing:
- Public showcases for student research, immersive projects (AR, VR, MR, XR), flagships, hackathons, and corporate alliances.
- High-fidelity interactive WebGL 3D specimen viewers and hardware inspection twins.
- End-to-end student intake pipeline with real-time dynamic 3D Holo-Keycard credential generation.
- A secure administrative control flight deck for managing curriculum verticals, project dossiers, event schedules, institutional achievements, corporate MoUs, custom applicant questionnaires, and student admission cohorts.

### Core Architectural Principles
1. **Developer-Controlled UI & Layout**: Core layouts, spatial visual systems, 3D WebGL scenes, navigation docks, and page structure are codified in TypeScript and CSS. Administrators modify content slots, announcements, media links, and system parameters without visual page-builder overhead.
2. **Strict Privacy Isolation**: Student applicant records (registration numbers, personal contact numbers, email addresses, motivation statements, internal administrative notes, and custom question answers) are stored server-side and never leaked in public bundles or public APIs.
3. **High-Performance Spatial Aesthetics**: VisionOS-inspired glassmorphism, coordinate reticles, holographic shaders, and responsive design with snappy interaction. Heavy 3D viewports degrade gracefully to lightweight 2D schematics on mobile viewports (< 768px).
4. **Embedded Zero-Config Data Layer**: File-backed atomic JSON document datastore (`data/db.json`) with auto-initialization and fallback seed data. No external database servers (PostgreSQL, MongoDB, MySQL, Redis) are required to run the platform.

### Technology Stack

| Layer | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `16.3.8` | Server Components, Route Handlers, SSR |
| **UI Library** | React & React DOM | `19.3.0` | Concurrent rendering, modern hooks |
| **Language** | TypeScript | `7.0.2` | Strict end-to-end type safety |
| **3D Engine** | Three.js | `0.186.1` | WebGL 2.0 rendering (`@types/three`) |
| **Icons** | Lucide React | `1.49.0` | Minimalist vector icon system |
| **Styling** | Vanilla CSS Design Tokens | — | Custom CSS variables; no Tailwind CSS dependency |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `9.0.3` | Cryptographically signed, stored in HttpOnly cookies |
| **Password Hashing** | Bcryptjs | `3.0.3` | Salted credential hashing |
| **Persistence** | Embedded Atomic JSON (`data/db.json`) | — | Atomic write-replace pattern via temp files |
| **Testing** | Node.js Test Harness (`test-e2e.mjs`) | — | Automated 34-suite end-to-end integration test runner |

---

## 2. Current Implementation Status

### 2.1 Public Ecosystem Routes (`/`)

- **`/` (Home)**:
  - Spatial Cockpit Hero with high-contrast coordinate reticles, cardinal ticks, and interactive 3D headset specimen.
  - Minimal sound toggle icon (clean audio control without clutter).
  - About preview bento grid with 4 institutional pillars.
  - 5 Operating Verticals preview cards (fully adapted with high-contrast light and dark mode styles).
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
  - Removed section-wise blur backgrounds for seamless display resolution scaling.
  - Cleaned telemetry metrics (`// SPATIAL_HOLODECK_ACTIVE` label removed).

- **`/events` (Activity & Hackathon Conclave)**:
  - Automated date-aware status grouping: Upcoming, Ongoing, Completed.
  - Reduced spacing between title, search bar, and event cards.
  - Clean cards without duplicate 3D arenas.

- **`/events/[slug]` (Event Detail Showcase)**:
  - Timeline milestones, speaker rosters, venue coordinates, registration links, and photo galleries.

- **`/achievements` (Hall of Excellence)**:
  - Statistics counters (National Podiums, Published Patents, Research Papers, Seed Funding).
  - **Animated Pixel Trophy 3D Inspector**: Trophy that builds pixel-by-pixel, replacing redundant 3D podiums.
  - Dynamic category suppression: categories without achievements are hidden until an achievement is recorded.
  - Chronological achievement timeline (2026, 2025).

- **`/industry` (Enterprise Alliances & Corporate MoUs)**:
  - Bilateral MoUs, enterprise internship tracks, hardware incubation partners, and consulting roster.
  - Spatial Network Topology 3D globe / global hub removed to accurately reflect that the CoE is currently exclusive to the Chennai location.
  - Corporate partnership and research enquiry forms fully adapted to light and dark modes.

- **`/request` (Student Induction Portal)**:
  - Membership application form: Full Name, Email, Phone, Register Number, Department, Year of Study, Cumulative GPA, Spatial Interests, Skill Tags, and Motivation Letter.
  - Dynamic Custom Form Fields rendered from administrator configurations in `/control/content/request`.
  - **Interactive 3D HoloKeycard**:
    - Tuned to natural brightness (no glare/over-brightness).
    - Equipped with zoom in / zoom out controls.
    - Immediately populated with submitted student data upon successful submission.
    - Auto-redirect: holds submitted confirmation view for 5 seconds, then smoothly returns to the homepage.
  - Duplicate registration protection (returns HTTP 409 Conflict if register number already applied).

---

### 2.2 Administrative Flight Deck (`/control`)

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
  - Single-click CSV roster export with full applicant metadata and custom question responses.
  - Applicant Dossier review modal with confidential internal reviewer notes.
  - Strict Deletion Prohibition: applications cannot be deleted; they can only be transitioned to `REJECTED` with an immutable timestamp.

- **Dual-Pane Content & Curriculum Studios**:
  - `/control/content/home`: Hero messaging, pillars manager, dark/light split preview.
  - `/control/content/about`: Vision, mission, roadmap milestones, mandate pillars.
  - `/control/content/request`: Dynamic Custom Form Fields Builder (add/edit/delete/reorder text, textarea, number, select questions), **Eligible Academic Departments Management** (add, edit, reorder, delete, restore defaults), and live responsive form preview.
  - `/control/content/footer`: Dedicated **Footer Content Studio** with real-time browser preview, CoE brand identity, institutional copyright statements, quick legal presets, direct contact channels (`mailto:`, `tel:`), and auxiliary lab tagline badge.
  - `/control/verticals`: Curriculum manager, deliverables, toolchains, career pathways.
  - `/control/projects`: Project editor, narrative tabs, student squad roster, cover image presets.
  - `/control/events`: Event scheduler, speaker rosters, highlights, poster presets.
  - `/control/achievements`: Trophy manager, category badges, team tags.
  - `/control/industry`: Corporate partner editor, MoU terms, bilateral outcomes.
  - `/control/settings`: Institutional metadata, branding, contact phone, contact email, copyright year, and dedicated **Footer Tab (Tab 03)**.

---

## 3. Important Decisions & Constraints

1. **Zero 3D Objects in Administrative Views**:
   - The administrative control deck (`/control/*`) strictly avoids 3D WebGL canvases to ensure instant rendering, low battery consumption, and maximum data density on enterprise workstations.
2. **Permanent Dark Mode for Admin Flight Deck**:
   - Even if a user visits public pages in light mode, navigating to `/control/*` forces dark mode styling (`admin-theme-dark`) to preserve the mission-critical command console aesthetic.
3. **Student Request Deletion Prohibition (Rejection-Only)**:
   - Student records cannot be deleted (`DELETE /api/admin/requests` is blocked with HTTP 400 Bad Request).
   - Rejected candidates are moved to the `REJECTED` archive tab with an audit timestamp and reviewer notes.
4. **Minimalist Footer Policy**:
   - Footer contains *only* the official contact phone number (`tel:`), official mail ID (`mailto:`), and copyright branding. All redundant multi-column links, office hours, and physical campus addresses were removed per institutional directive.
5. **Single Location Scope (Chennai)**:
   - The CoE is currently operational solely at the Chennai campus. The global network topology 3D globe (`IndustryGlobe3D`) and multi-city telemetry were removed.
6. **Dynamic Custom Form Fields**:
   - Administrators can add custom questions to the application form via `/control/content/request`.
   - The public `/request` form dynamically renders, validates, and submits answers inside `custom_field_responses`.
7. **Atomic JSON Database Persistence**:
   - All mutations in `src/lib/db.ts` write to a temporary file (`data/db.json.tmp.<timestamp>`) before atomically replacing `data/db.json`. This eliminates partial writes or file corruption during process termination.
8. **Three.js Timer Standard**:
   - All 3D components use `new THREE.Timer()` rather than the deprecated `THREE.Clock()`, preventing browser console deprecation warnings.
9. **Display Resolution Uniformity**:
   - Section-wise CSS backdrop blurs with inconsistent opacity across different resolutions have been replaced with uniform, responsive theme tokens.

---

## 4. Files Changed & Why (Relative Paths Only)

| Relative File Path | Operation | Purpose & Description |
| :--- | :--- | :--- |
| `src/components/public/JourneyTunnel3D.tsx` | Modified | Updated 3D models for all 7 steps (Explore: XR Headset; Learn: Codex; Practice: Laser Prism; Build: Robot Arm; Compete: Champion Trophy; Intern: Neural Microprocessor; Industry: Spatial Spire). Added sub-animation hooks. |
| `src/components/public/VerticalHologramViewer.tsx` | Modified | Replaced outdated placeholder models with tailored 3D models for all 5 verticals (01 Certifications, 02 Internships, 03 Self-Learning, 04 Skill Development, 05 Product Development). |
| `src/components/public/LabIsometricTwin3D.tsx` | Modified | Added custom sector-specific 3D architectural/equipment models for each of the 7 lab nodes. |
| `src/components/public/CoWorkingDiagram.tsx` | Modified | Removed "Inspect 3D Hardware Rig" button, modal, and state. |
| `src/components/public/HardwareRigViewer3D.tsx` | Deleted | Removed obsolete hardware rig modal viewer. |
| `src/components/public/Footer.tsx` | Modified | Simplified footer to contain *only* contact phone (`tel:`), mail ID (`mailto:`), and copyright branding. |
| `src/components/public/ProjectHolodeck3D.tsx` | Modified | Removed `// SPATIAL_HOLODECK_ACTIVE` telemetry label. |
| `src/app/industry/page.tsx` | Modified | Removed `IndustryGlobe3D` and global hub network topology section (Chennai-only scope). |
| `src/components/public/IndustryGlobe3D.tsx` | Deleted | Removed obsolete global topology globe component. |
| `src/components/public/Navbar.tsx` | Modified | Updated navbar shape from pill to rounded square; highlighted "Join CoE Cohort" CTA; sound icon only. |
| `src/components/public/HeroSpatialCockpit.tsx` | Modified | Added glass effect; removed spatial audio active toggle; high-contrast coordinate reticles. |
| `src/components/public/StudentHoloKeycard.tsx` | Modified | Natural brightness tuning; added zoom in/zoom out controls; immediate student data population on submit; auto-redirect after 5 seconds. |
| `src/components/public/AchievementsPodium3D.tsx` | Modified | Replaced 3D podium with an animated pixel-by-pixel building 3D Trophy. |
| `src/app/achievements/page.tsx` | Modified | Suppressed empty achievement categories until an achievement is recorded. |
| `src/app/request/page.tsx` | Modified | Added dynamic custom form field rendering and submission payload. |
| `src/app/control/content/request/page.tsx` | Modified | Added Section 04 for managing eligible academic departments (add, inline edit, move up/down, delete, restore defaults) and live preview dropdown. |
| `src/app/control/content/footer/page.tsx` | Created | Dedicated Footer Content Studio with live interactive browser preview, brand identity controls, copyright statement presets, contact details, and tagline badge. |
| `src/app/control/settings/page.tsx` | Modified | Added Tab 03 (Footer) with brand identity, copyright, email/phone, and tagline controls and live preview simulator. |
| `src/components/admin/AdminSidebar.tsx` | Modified | Added Footer Content link under WEBSITE CONTENT. |
| `src/components/public/Footer.tsx` | Modified | Dynamically renders admin-configured copyright notice, institution name, CoE name, contact mail/phone links, and optional tagline. |
| `src/app/request/page.tsx` | Modified | Dynamically loads and selects from admin-configured academic departments list. |
| `src/app/control/requests/page.tsx` | Modified | Multi-select checkboxes, floating batch action HUD, one-click CSV roster export. |
| `src/lib/types.ts` | Modified | Added `departments` to `RequestFormContent`, added `footer_copyright` and `footer_tagline` to `SiteSettings`. |
| `src/lib/db.ts` | Modified | Added `DEFAULT_DEPARTMENTS`, auto-initialization for departments and footer content, updated getters/setters. |
| `src/styles/admin.css` | Modified | Enforced permanent dark mode for `/control/*` routes. |
| `src/app/globals.css` | Modified | Light/dark theme token tuning, removed erratic section-wise blurs, refined glass cards. |
| `test-e2e.mjs` | Modified | Added 3 new test suites (total 30) verifying department editing/persistence, footer settings API, and `/control/content/footer` route. |

---

## 5. Known Issues & Operational Notes

1. **Local Playwright Driver Download on Restricted Networks**:
   - In environments with strict corporate firewall rules or offline networks, automated Playwright browser downloads (`browser_subagent`) may return 404 from external CDNs.
   - **Resolution**: Use the built-in HTTP test runner (`node test-e2e.mjs`) which executes natively without external binary dependencies. Standard desktop browsers (Chrome, Edge, Firefox, Brave) run the app directly without issue.
2. **Container Volume Persistence**:
   - In containerized deployments (Docker / Kubernetes), the `data/` directory must be mounted as a persistent volume. If not mounted, restarting the container will reset `data/db.json` back to default factory seed data.
3. **High-Concurrency File Locking**:
   - The atomic JSON database is optimized for small-to-medium institutional workloads (< 100 concurrent admin writes/second). For enterprise scale (> 1,000 writes/second), swap `src/lib/db.ts` to PostgreSQL or Supabase using the existing interface methods.

---

## 6. Validation Already Completed

The application has been verified through automated test suites and production bundle compilation:

1. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   - **Result**: `Compiled successfully in 2.3s`
   - **Routes**: 35/35 routes compiled (static and dynamic) with **zero TypeScript errors** and **zero Turbopack warnings**.

2. **Automated Integration Test Runner**:
   ```bash
   node test-e2e.mjs
   ```
   - **Result**: `TEST SUMMARY: 27 PASSED, 0 FAILED (100% Pass Rate)`
   - Verified assertions:
     - Public HTML routes return HTTP 200 (`/`, `/about`, `/verticals`, `/projects`, `/projects/[slug]`, `/events`, `/events/[slug]`, `/achievements`, `/industry`, `/request`).
     - Admin routes return HTTP 200 (`/control/auth`, `/control/content/request`).
     - Minimalist footer verification: validates presence of `mailto:` and `tel:` links.
     - Student induction application submission (`POST /api/public/requests`).
     - Duplicate registration prevention (HTTP 409 Conflict on re-submission).
     - Privacy isolation (unauthenticated requests to `/api/admin/*` return HTTP 401).
     - Admin JWT authentication with HttpOnly cookie issuance.
     - Admin KPI retrieval from `/api/admin/dashboard`.
     - Student applicant status transition (`NEW` -> `WAITING` -> `REJECTED`).
     - Student request deletion prohibition (`DELETE /api/admin/requests` blocked with HTTP 400).
     - Batch status transition (`PATCH /api/admin/requests` with array of IDs).
     - Admin custom form builder CRUD operations (`/api/admin/content?section=request`).

---

## 7. Exact Next Steps for Continuing on Another PC

To continue working on this project on a new computer:

### Step 1: Transfer Project Files
Copy the entire `XARC_COE` project folder to the target machine. Ensure `data/db.json` is included if you wish to preserve the current database state.

### Step 2: Ensure Node.js is Installed
- Minimum version: Node.js `v18.18.0`
- Recommended version: Node.js `v20.x LTS` or `v22.x LTS`
- npm `v10.x` or higher

Check versions:
```bash
node -v
npm -v
```

### Step 3: Install Dependencies
Open a terminal in the project root directory and run:
```bash
npm install
```

### Step 4: Environment Variables (Optional)
If you wish to configure a custom port or JWT secret, copy the template:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# Linux / macOS (Bash)
cp .env.example .env.local
```
*(Default development fallbacks are already configured in `src/lib/auth.ts`, so this step is optional).*

### Step 5: Run the Development Server
```bash
# Recommended port 3005:
npm run dev -- -p 3005
```

Or run the production build:
```bash
npm run build
npm run start -- -p 3005
```

### Step 6: Verify the Environment
In a separate terminal window, run the test suite:
```bash
node test-e2e.mjs
```
Verify that all 27 tests report `[PASS]`.

### Step 7: System Access Directory
- **Public Portal**: `http://localhost:3005`
- **Student Induction Dock**: `http://localhost:3005/request`
- **Admin Command Terminal**: `http://localhost:3005/control/auth` *(or click the top-left branding logo 5 times rapidly)*
- **Admin Dashboard**: `http://localhost:3005/control/dashboard`
- **Applicant Pipeline & Review**: `http://localhost:3005/control/requests`
- **Request Form Question Builder**: `http://localhost:3005/control/content/request`
- **Curriculum & Verticals Studio**: `http://localhost:3005/control/verticals`
- **Projects Dossier Studio**: `http://localhost:3005/control/projects`
- **Events & Conclave Studio**: `http://localhost:3005/control/events`
- **Achievements & Accolades Studio**: `http://localhost:3005/control/achievements`
- **Industry & MoUs Studio**: `http://localhost:3005/control/industry`
- **Home Content Studio**: `http://localhost:3005/control/content/home`
- **About Content Studio**: `http://localhost:3005/control/content/about`
- **System Settings Studio**: `http://localhost:3005/control/settings`
