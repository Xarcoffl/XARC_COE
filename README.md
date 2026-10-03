# AR/VR Centre of Excellence Website
### Spatial Computing & Immersive Engineering Digital Ecosystem

A full-stack, production-quality digital ecosystem for the **AR/VR Centre of Excellence**, built with Next.js (App Router), TypeScript, Three.js, and Vanilla CSS design tokens embodying **Professional Spatial Computing**. Fully configurable by the administrator (institution name, site title, favicon, SEO meta description, contact information, branding, and content).

---

## 1. Architectural Highlights

- **Developer-Controlled Architecture**: Page structures, navigation, visual system, typography, and responsive layouts are controlled in code. The administrator manages content slots only. No layout builders or theme manipulators.
- **Privacy & Domain Isolation**: Student request details (names, register numbers, personal emails, phone numbers, motivations, private notes) are strictly isolated behind server-side authentication and are never exposed via public APIs or rendered into public bundles.
- **Two Distinct Interfaces**:
  - **Public Experience**: Immersive, futuristic spatial computing aesthetic with 3D interactive hero, coordinate grids, glassmorphism, responsive cards, and shallow navigation (1–2 clicks).
  - **Administrative System**: Functional, data-dense, dark slate interface optimized for efficient content and request processing.

---

## 2. Public Experience (`/`)

| Page | URL | Description |
| :--- | :--- | :--- |
| **Home** | `/` | Compact 6-section layout: Hero (3D Spatial Visual, VR headset, controllers, holographic HUD rings), Short About Preview, 5 Verticals Preview, Featured Content tabs (What's Happening: Events, Projects, Achievements, max 3), Student Journey, Final Join CTA. |
| **About** | `/about` | Mission, Vision, What We Do, Interactive Co-Working Space Diagram (7 operational sectors), Multidisciplinary Environment, and 4-Phase Roadmap. |
| **Verticals** | `/verticals` | Interactive Vertical Selector for the 5 pathways: Long-Term Certification, Industry Internships, Self-Learning, Skill Development, and Product Development. |
| **Projects** | `/projects` | Categorized showcase (ALL, AR, VR, MR, XR, 3D, SIMULATION) with project cards. |
| **Project Detail** | `/projects/[slug]` | Standardized template: Hero, Overview, Problem, Solution, Technologies, Gallery, Team, Result & Outcome, Related Projects. |
| **Events** | `/events` | Automated status tabs (Upcoming, Ongoing, Completed) calculated from event start/end dates. |
| **Event Detail** | `/events/[slug]` | Standardized template: Poster/Hero, Details, About, Highlights, Gallery, Registration Link, Related Events. |
| **Achievements** | `/achievements` | Verified statistics counters, chronological timeline by year (2026, 2025), and category filters. |
| **Industry** | `/industry` | Corporate partners, bilateral MoUs, industrial visits, expert sessions, and consultancy projects. |
| **Contact** | `/contact` | Official campus location, room, email, hours, and direct Request to Join callout. |
| **Request to Join** | `/request` | Student form with validation, personal email address, multi-select interests, experience levels, motivation, accuracy confirmation, and clean success state. |

---

## 3. Administrative System (`/control`)

- **Hidden Discoverability**: 5 rapid clicks within 2.5 seconds on the top-left `AR/VR COE` logo redirects to `/control/auth`.
- **Default Administrator Credentials**:
  - **Email**: `admin@coe.edu`
  - **Password**: `Admin@ARVR2026!`
- **Authentication**: Signed JWT session stored in an HttpOnly cookie with brute-force rate limiting (5 failed attempts trigger a 5-minute lockout).
- **Admin Dashboard** (`/control/dashboard`): Live KPI cards for New Requests, Waiting, Joined, Events, Projects, Achievements, Recent Requests, and Upcoming Events.
- **Student Request Management** (`/control/requests`):
  - Filters by Status (`NEW`, `WAITING`, `JOINED`), Department, Year, Interest, and Search.
  - Review Modal with student details, motivation, timestamps.
  - Private Administrator Notes (persisted confidentially).
  - Status Transitions: `[ JOIN COE ]`, `[ KEEP WAITING ]`.
  - Permanent Rejection: `[ REJECT & DELETE ]` with confirmation modal permanently purges the record (no rejected archive).
- **Content Management**:
  - Home Page Copy (`/control/content/home`)
  - About Page Copy (`/control/content/about`)
  - Verticals (`/control/verticals`)
  - Projects (`/control/projects`) - CRUD, Draft/Published toggle, Featured toggle
  - Events (`/control/events`) - CRUD, Draft/Published toggle, Featured toggle
  - Achievements (`/control/achievements`) - CRUD, Category, Year, Featured toggle
  - Industry Alliances (`/control/industry`) - CRUD for Partners and Activities
  - Settings & Profile (`/control/settings`) - Institutional info and password update

---

## 4. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Start production server (default port 3000, or custom port e.g. 3005)
npm run start -- -p 3005

# 4. Run automated end-to-end integration test suite
node test-e2e.mjs
```
