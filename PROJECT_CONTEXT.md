# AR/VR Centre of Excellence — Project Context & Continuation Guide

This document captures the architecture, technical decisions, file changes, validation history, and operational runbook for the **AR/VR Centre of Excellence** digital platform. Use this guide to seamlessly continue development on any new machine or environment with a different folder path.

---

## 1. Project Purpose & Technology Stack

### Purpose
A full-stack digital platform for an academic and institutional **Centre of Excellence in AR/VR and Spatial Computing**. It bridges academic discovery with enterprise spatial technology through research showcases, interactive 3D hardware and specimen viewers, event management, project portfolios, industry collaboration archives, student intake pipelines, and an administrative control studio.

### Core Architecture Principles
1. **Developer-Controlled UI & Layout**: Core layouts, spatial visual systems, 3D scenes, navigation docks, and page structure are codified in TypeScript and CSS. Administrators edit content slots, announcements, media links, and system parameters without visual page-builder overhead.
2. **Strict Privacy Isolation**: Student applicant records (register numbers, emails, phone numbers, motivations, internal notes, custom field responses) are isolated behind authenticated endpoints and never exposed in public bundles or public APIs.
3. **High-Performance Spatial Aesthetics**: VisionOS-inspired glassmorphism, coordinate reticles, holographic shaders, and responsive design with snappy interaction.

### Technology Stack
- **Framework**: Next.js 16.3.8 (App Router, Turbopack)
- **Runtime & UI**: React 19.3.0, TypeScript 7.0.2
- **3D Graphics**: Three.js 0.186.1 (`@types/three`)
- **Styling**: Vanilla CSS Design Tokens (Custom CSS Variables, no Tailwind CSS)
- **Icons**: Lucide React 1.49.0
- **Authentication**: JWT (`jsonwebtoken`), password hashing (`bcryptjs`), stored in `HttpOnly`, `SameSite=Lax` cookies
- **Data Layer**: File-backed atomic JSON database (`data/db.json`) with auto-initialization and fallback seed data
- **Testing**: Automated End-to-End integration test suite (`test-e2e.mjs`)

---

## 2. Current Implementation Status

### Public Routes (`/`)
- `/` — Homepage: Hero with 3D Headset/Spatial Visual, 6-DoF Telemetry Cockpit, About Preview, 5 Research Verticals Preview (light mode adapted with high-contrast borders and specular cards), Featured Content tabs, Student Journey Timeline, and Final Join CTA.
- `/about` — Institutional Vision & Mission, Core Mandates ("What We Do"), Interactive 7-Sector Co-Working Space Blueprint, Multidisciplinary Environment, and Strategic Roadmap.
- `/verticals` — Interactive Vertical Selector covering 5 core pathways: Long-Term Certification, Industry Internships, Self-Learning, Skill Development, and Product Development with live 3D specimen inspection.
- `/projects` — Filterable project showcase (ALL, AR, VR, MR, XR, 3D, SIMULATION).
- `/projects/[slug]` — Standardized deep-dive project case study template.
- `/events` — Automated date-aware event status tabs (Upcoming, Ongoing, Completed), with `[STATUS // SCHEDULED]` badge removed.
- `/events/[slug]` — Standardized event detail showcase with registration link and gallery.
- `/achievements` — Statistics counters and chronological timeline (2026, 2025).
- `/industry` — Corporate alliances, bilateral MoUs, expert sessions, and industrial consultancy.
- `/contact` — Campus laboratory location, room, hours, email, and direct intake link.
- `/request` — Membership application form with live 3D Holographic Keycard preview, department selector, skills, multi-select interests, dynamic custom fields, and duplicate prevention.

### Administrative Control Studio (`/control`)
- `/control/auth` — Secure administrative login with rate limiting.
- `/control/dashboard` — Live operational KPI cards, recent applicant queue, and telemetry HUD (pure 2D, zero 3D objects).
- `/control/requests` — Student applicant review pipeline with status tabs (`NEW`, `WAITING`, `JOINED`, `REJECTED`), confidential reviewer notes, custom form responses viewer, and 2D Digital Security Pass modal.
- `/control/content/home` — Interactive dual-pane studio with preset themes (*Spatial Computing Lab*, *Industrial Metaverse*), section tabs, character count meters, interactive pillar manager, and scrollable live dark/light split preview.
- `/control/content/about` — Interactive dual-pane studio for Vision, Mission, reorderable mandate pillars, and strategic roadmap milestones with scrollable live split preview.
- `/control/content/request` — Dedicated studio with Custom Application Form Fields Builder (add/edit/delete/reorder text, textarea, number, select questions) and fully scrollable live public form preview.
- `/control/settings` — Identity & system studio with simulated browser tab, Google search snippet preview, live minimalist copyright footer simulator, password strength meter with checklist, and social links radar.
- `/control/verticals` — Dual-pane Curriculum & Verticals studio with visual pathway chips, deliverable manager, toolchain tags, career builder, and live card preview.
- `/control/projects` — Dual-pane Projects studio with category filters, search, cover image presets, narrative tabs, squad manager, and live card preview.
- `/control/events` — Dual-pane Events studio with category filters, poster visual presets, highlights manager, full syllabus narrative, and live card preview.
- `/control/achievements` — Dual-pane Accolades studio with category tabs, milestone dates, team tags, trophy photo presets, and live trophy card preview.
- `/control/industry` — Dual-pane Industry & MoUs studio with partner presets, MoU term status, outcomes manager, and live partner card preview.

---

## 3. Important Decisions & Constraints

1. **Zero 3D Objects in Admin Panels**:
   - Strictly enforced: all admin views use high-performance 2D SVG telemetry, distribution cards, and CSS digital credential passes.
2. **Student Request Deletion Prohibited (Rejection-Only)**:
   - Student requests **cannot be deleted under any circumstance**. They can only be transitioned to `REJECTED`.
   - `DELETE /api/admin/requests` is blocked at the API level (returns HTTP 400 Bad Request).
   - Rejected applicants are archived under a dedicated `REJECTED` filter tab in `/control/requests` with a `rejected_at` timestamp.
3. **Dynamic Custom Form Fields Builder**:
   - Admins can add customized questions (text, multiline textarea, number, or dropdown with options) in `/control/content/request`.
   - Questions are dynamically rendered on the public `/request` form, validated on submit, stored in `custom_field_responses`, and rendered in the admin dossier modal.
4. **Scrollable Live Public Preview across All Studios**:
   - All admin studios feature split-view previews with `maxHeight: calc(100vh - 120px)`, `overflowY: auto`, custom `.studio-preview-pane` scrollbars, and dark/light mode simulators.
5. **Full Light Mode Adaptation**:
   - Operating vertical cards, admin layouts, inputs, tables, modals, and telemetry are fully adapted for light mode with high-contrast saturated tokens, specular borders, and clean typography.
6. **Activity Hub Clean Presentation**:
   - `[STATUS // SCHEDULED]` badge removed from Event cards.
7. **Minimalist Copyright Footer**:
   - Single responsive row displaying dynamic copyright and operational status beacon.

---

## 4. Files Changed & Implementation Details (Relative Paths Only)

| Relative File Path | Type | Purpose & Description of Changes |
| :--- | :--- | :--- |
| `src/app/globals.css` | Modified | Added `.vertical-preview-card`, `.vertical-icon-box`, `.vertical-number-badge`, enhanced `.glass-card` light mode contrast, and added `.vertical-nav-btn`. |
| `src/styles/admin.css` | Modified | Added comprehensive `[data-theme='light']` rules for sidebar, header, cards, inputs, tables, modals, and `.studio-preview-pane` scrollbar styles. |
| `src/app/page.tsx` | Modified | Attached `.vertical-preview-card` to 5 operating vertical cards; removed hardcoded inline colors; updated text color tokens. |
| `src/components/public/EventCard.tsx` | Modified | Removed `[STATUS // SCHEDULED]` badge. |
| `src/components/public/VerticalSelector.tsx` | Modified | Replaced hardcoded dark background and white text with `.vertical-nav-btn` and CSS tokens. |
| `src/components/public/VerticalHologramViewer.tsx` | Modified | Increased ambient light and point light intensities so 3D specimens shine clearly in light mode. |
| `src/lib/types.ts` | Modified | Added `CustomFormField` interface; added `custom_fields?: CustomFormField[]` to `RequestFormContent`; added `custom_field_responses?: Record<string, string>` to `StudentRequest`. |
| `src/lib/db.ts` | Modified | Added default `custom_fields` array in `DEFAULT_REQUEST_CONTENT`; updated `submitStudentRequest` to accept and persist `custom_field_responses`. |
| `src/app/api/public/requests/route.ts` | Modified | Handled and forwarded `custom_field_responses` to database storage. |
| `src/app/control/content/request/page.tsx` | Modified | Upgraded to studio with dynamic Custom Form Fields Builder (add/edit/delete/reorder text, textarea, number, select) and fully scrollable live preview. |
| `src/app/request/page.tsx` | Modified | Dynamically renders custom form fields with validation and submission payload. |
| `src/components/admin/RequestDetailModal.tsx` | Modified | Displays student custom form field answers in the Application Dossier view. |
| `src/app/control/verticals/page.tsx` | Modified | Upgraded to interactive dual-pane studio with pathway chips, deliverables manager, toolchain tags, and live card preview. |
| `src/app/control/projects/page.tsx` | Modified | Upgraded to interactive dual-pane studio with category filters, cover presets, problem/solution narrative tabs, squad manager, and live card preview. |
| `src/app/control/events/page.tsx` | Modified | Upgraded to interactive dual-pane studio with poster visual presets, highlights manager, and live event card preview. |
| `src/app/control/achievements/page.tsx` | Modified | Upgraded to interactive dual-pane studio with category tabs, team tags, trophy photo presets, and live trophy card preview. |
| `src/app/control/industry/page.tsx` | Modified | Upgraded to interactive dual-pane studio with partner presets, MoU term status, outcomes manager, and live partner card preview. |

---

## 5. Known Issues & Pending Tasks

1. **Light Mode SVG Fine-Tuning**:
   - In `src/components/public/HeroSpatialCockpit.tsx`, minor inner SVG reticle lines use subtle opacities that can be made even more vivid on low-brightness monitors.
2. **Container Volume Persistence**:
   - In local setups, `data/db.json` is modified directly on disk. When deploying to containerized services (e.g., Docker, Kubernetes, Cloud Run), mount the `data/` folder on a persistent volume to preserve updates across restarts.
3. **Automated Subagent Browser Driver in Headless Windows Environments**:
   - Playwright automated browser recording in Antigravity IDE requires a local browser installation if the prebuilt binary mirror returns 404. Standard Chrome/Edge/Firefox work without issue.
4. **Planned Enhancements**:
   - Export student intake rosters as CSV/Excel directly from `/control/requests`.
   - Batch status update actions for student intake squads.

---

## 6. Validation Already Completed

- **Next.js Production Build**:
  - `npm run build` compiled successfully with **0 TypeScript errors** and **0 Turbopack warnings** across all 35 routes in 821ms.
- **Automated Integration Test Suite** (`node test-e2e.mjs`):
  - **26 passed, 0 failed (100% pass rate)**:
    - HTTP 200 checks on all public and admin pages.
    - Public Student Request Submission (`POST /api/public/requests`).
    - Duplicate Request Prevention (409 Conflict).
    - Privacy Isolation (Unauthenticated access to `/api/admin/requests` returns 401).
    - Admin Authentication (Signed HttpOnly cookie issuance).
    - Admin Dashboard KPI retrieval.
    - Applicant Status Workflow (`NEW` -> `WAITING` -> `REJECTED`).
    - Deletion Prohibition Enforcement (`DELETE /api/admin/requests` blocked with HTTP 400).
    - Admin Request Form Content Management (`GET` and `POST /api/admin/content?section=request`).
    - Minimalist Footer verification (Copyright-only).
- **Custom Form Fields & Studio APIs**:
  - Verified end-to-end: admin custom question configuration, public form dynamic rendering, submission capturing, database persistence, and review modal display.

---

## 7. Exact Next Steps for Continuing on Another PC

Follow these steps to continue working on this project on a new computer:

### Step 1: Copy the Project Files
Ensure the entire directory, including `data/db.json` and `test-e2e.mjs`, is transferred to the new computer.

### Step 2: Install Node.js Prerequisites
- Recommended Node.js version: **v20.x** or **v22.x LTS**
- npm version: **v10.x** or higher

### Step 3: Install Dependencies
Open a terminal in the project root directory and run:
```bash
npm install
```

### Step 4: Environment Variables (Optional)
If custom JWT secrets or port overrides are needed, create a `.env.local` file:
```env
PORT=3005
JWT_SECRET=your_secure_development_jwt_secret_min_32_chars
```
*(If omitted, default secure development fallbacks configured in `src/lib/auth.ts` are automatically used).*

### Step 5: Build and Run the Application
```bash
# 1. Build optimized Next.js bundle
npm run build

# 2. Start production server on port 3005 (or default 3000)
npm run start -- -p 3005
```

For live development with hot reload:
```bash
npm run dev -- -p 3005
```

### Step 6: Verify with Automated Integration Tests
In a second terminal window, run:
```bash
node test-e2e.mjs
```
Confirm all 26 test suites report `[PASS]`.

### Step 7: Access URLs
- **Public Ecosystem**: `http://localhost:3005`
- **Public Request Form**: `http://localhost:3005/request`
- **Administrative Login**: `http://localhost:3005/control/auth` *(or 5 rapid clicks on the top-left logo)*
- **Admin Dashboard**: `http://localhost:3005/control/dashboard`
- **Admin Applicant Pipeline**: `http://localhost:3005/control/requests`
- **Admin Request Form Studio**: `http://localhost:3005/control/content/request`
- **Admin Curriculum & Verticals Studio**: `http://localhost:3005/control/verticals`
- **Admin Projects Studio**: `http://localhost:3005/control/projects`
- **Admin Events Studio**: `http://localhost:3005/control/events`
- **Admin Achievements Studio**: `http://localhost:3005/control/achievements`
- **Admin Industry & MoU Studio**: `http://localhost:3005/control/industry`
- **Admin Home Studio**: `http://localhost:3005/control/content/home`
- **Admin About Studio**: `http://localhost:3005/control/content/about`
- **Admin Settings Studio**: `http://localhost:3005/control/settings`
