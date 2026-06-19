# Agents Configuration
## MovieCloud — OpenCode AI Agent Setup & Skills Integration

---

## 1. Overview

This document configures the **OpenCode AI agent** to build the MovieCloud streaming platform. It includes project initialization commands, skill installations, agent roles, and workflow instructions. All skills are designed to be **compatible with OpenCode** — if a skill was built for Claude Code, equivalent configurations are provided for OpenCode.

---

## 2. Project Initialization

### 2.1 OpenCode Project Setup

```bash
# Install UIPro CLI globally (project scaffolding with AI support)
npm install -g uipro-cli

# Initialize project with OpenCode AI mode
uipro init --ai opencode
```

This creates the base project structure recognized by OpenCode's agent system. After initialization, the agent can read project context and execute tasks.

### 2.2 Project Context Files

OpenCode agents read these files to understand the project. All files should be placed in the project root:

| File | Purpose |
|------|---------|
| `prd.md` | Product requirements (reference this repo's prd.md) |
| `UI_UX.md` | Design specifications |
| `Schema.md` | Database schema |
| `Appflow.md` | Application flows |
| `Implementationplan.md` | Task-by-task build plan |
| `techstack.md` | Technology stack details |
| `agents.md` | This file — agent configuration |

Copy all generated `.md` files from this repository into the MovieCloud project root before starting the OpenCode agent.

---

## 3. Skills Installation

Install all 8 skills in order. Each skill extends the OpenCode agent's capabilities.

### Skill 1: Frontend Design Skills

```bash
npx skills add anthropics/claude-code --skill frontend-design
```

**Purpose:** Provides UI/UX design guidance, component layout suggestions, and responsive design patterns. The agent will reference `UI_UX.md` for detailed specs and use this skill to ensure design consistency.

**Usage in MovieCloud:**
- Designing the Netflix-like dark theme layout
- Building responsive breakpoints (mobile, tablet, desktop)
- Implementing hover animations and Framer Motion variants
- Ensuring accessibility (WCAG 2.1 AA)
- Creating skeleton loading states and error states

**OpenCode Compatibility:** This skill uses Claude Code's skill format. For OpenCode, the agent should reference the `UI_UX.md` document directly as the design source of truth. The skill's design principles are embedded in that document.

---

### Skill 2: Browser Use Skills

```bash
npx skills add https://github.com/browser-use/browser-use --skill browser-use
```

**Purpose:** Enables automated browser interactions — navigating pages, clicking elements, taking screenshots, and testing user flows.

**Usage in MovieCloud:**
- **End-to-end testing:** Automate the browse → search → play → seek flow
- **Visual regression testing:** Take screenshots of key pages and compare
- **Cross-browser testing:** Verify the site works on Chrome, Firefox, Safari
- **Mobile testing:** Simulate mobile viewports and test touch interactions
- **Admin testing:** Automate the scan → verify movies appear workflow
- **TMDB integration testing:** Verify posters load correctly

**Test Scenarios for Browser Use:**
```
1. Open homepage → Verify hero banner rotates → Screenshot
2. Search for "action" → Verify results appear → Click first result → Screenshot
3. Click "Play Now" → Verify video player loads → Screenshot
4. Navigate to /genre/comedy → Verify only comedy movies show
5. Open /admin → Enter password → Click "Scan Library" → Wait → Verify results
6. Resize to 375px width → Verify mobile layout → Screenshot
```

**OpenCode Compatibility:** The browser-use skill can be invoked via CLI. For OpenCode, configure it as an external tool that the agent can call during testing phases (Phase 5, Task 43 and Task 46).

---

### Skill 3: Code Reviewer

```bash
npx claude-code-templates@latest --skill development/code-reviewer
```

**Purpose:** Automated code review that checks for bugs, security vulnerabilities, performance issues, and best practices.

**Usage in MovieCloud:**
- **Security review of stream proxy:** Ensure no path traversal, no credential leaks
- **API review:** Check all endpoints for proper error handling, input validation
- **SQL injection prevention:** Verify parameterized queries are used everywhere
- **Performance review:** Check for N+1 queries, missing indexes, memory leaks
- **React best practices:** Check for missing keys, improper state management, memory leaks in effects

**Review Focus Areas for MovieCloud:**
```
Critical:
  - Stream proxy: No raw file paths exposed to client
  - Admin routes: Password verification is secure
  - MySQL queries: All use parameterized queries (? placeholders)
  - .env: No secrets committed to git

Important:
  - Video player: Proper cleanup on unmount (event listeners, intervals)
  - Image cache: No disk space leak (implement cleanup)
  - TMDB rate limiting: Queue system works correctly
  - CORS: Only allowed origins can access API

Nice to Have:
  - Component re-renders: Memoize expensive computations
  - Bundle size: Tree-shake unused code
  - Accessibility: All interactive elements have ARIA labels
```

**OpenCode Compatibility:** Run this skill after completing each phase. The agent should execute code review as a post-build step. Output should be saved to `reviews/phase-{N}-review.md`.

---

### Skill 4: Remotion Skills

```bash
npx skills add remotion/agent-skills
```

**Purpose:** Programmatic video generation using Remotion. Create videos with React components.

**Usage in MovieCloud:**
- **Generate trailer compilations:** Automatically create short video clips from movie posters with text overlays
- **Social media sharing videos:** Generate shareable video cards (movie poster + rating + "Watch on MovieCloud")
- **Loading animations:** Create branded loading/splash screen videos
- **Hero banner videos:** Instead of static images, use Remotion to create animated hero backgrounds
- **Promotional content:** Generate "New on MovieCloud this week" video reels

**Stretch Goals (Future):**
```
- Auto-generate 10-second preview clips from movie files
- Create animated "Coming Soon" teasers
- Generate YouTube Shorts / Instagram Reels from movie collection
```

**OpenCode Compatibility:** Remotion works as a standalone Node.js tool. The agent can invoke Remotion scripts during the content creation phase. Not required for MVP but installed for future use.

---

### Skill 5: Google Workspace (GWS) Skills

```bash
npm install -g @googleworkspace/cli
```

**Purpose:** Interact with Google Workspace tools — Sheets, Docs, Drive, etc.

**Usage in MovieCloud:**
- **Google Sheets as backup:** Export movie catalog to a Google Sheet for offline backup and sharing
- **Google Drive as poster backup:** Sync cached posters/backdrops to Google Drive as cloud backup
- **Movie inventory tracking:** Maintain a shared spreadsheet of the movie collection
- **Community feedback collection:** Google Form for user feedback linked to Google Sheets
- **Analytics reporting:** Generate weekly viewing stats reports in Google Sheets

**Configuration:**
```env
# Google Workspace API (optional, for backup/integration)
GWS_CLIENT_ID=your_google_oauth_client_id
GWS_CLIENT_SECRET=your_google_oauth_client_secret
GWS_REFRESH_TOKEN=your_refresh_token
GWS_SHEET_ID=your_movie_inventory_sheet_id
```

**OpenCode Compatibility:** The GWS CLI can be invoked as an external command. The agent should use it for backup/reporting tasks, not for core functionality. Configure as an optional integration in the admin panel.

---

### Skill 6: Shannon — Autonomous AI Pentester

```bash
npx skills add unicodeveloper/shannon
```

**Purpose:** Automated security penetration testing. Identifies vulnerabilities in the application.

**Usage in MovieCloud:**
- **Pre-launch security audit:** Scan the entire application before going public
- **Stream proxy security:** Test for path traversal, SSRF, authentication bypass
- **API security:** Test for injection attacks, rate limiting bypass, information disclosure
- **Admin panel security:** Test password protection, CSRF, brute force resistance
- **Dependency vulnerability scan:** Check npm packages for known CVEs

**Security Test Plan:**
```
1. Path Traversal Test:
   - GET /api/v1/stream/../../etc/passwd
   - GET /api/v1/stream/../../../.env
   Expected: 404/400, not file contents

2. SQL Injection Test:
   - GET /api/v1/movies/search?q=' OR 1=1 --
   - GET /api/v1/movies/1' UNION SELECT * FROM users --
   Expected: No SQL errors, empty or normal results

3. Rate Limiting Test:
   - Send 200 requests in 10 seconds to /api/v1/movies
   Expected: 429 Too Many Requests after limit

4. Admin Auth Test:
   - GET /api/v1/admin/scan (no password)
   - GET /api/v1/admin/scan?password=wrong
   Expected: 401 Unauthorized

5. CORS Test:
   - Request from unauthorized origin
   Expected: CORS headers not present

6. Dependency Audit:
   - Run: npm audit
   Expected: No critical/high vulnerabilities
```

**OpenCode Compatibility:** Shannon can be run as a standalone CLI tool. The agent should execute it during Phase 5 (Task 43/46) before launch. Save results to `security/audit-report.md`.

---

### Skill 7: Excalidraw Diagram Generator

```bash
npx skills add https://github.com/coleam00/excalidraw-diagram-skill --skill excalidraw-diagram
```

**Purpose:** Generate architecture diagrams, flowcharts, and visual documentation using Excalidraw.

**Usage in MovieCloud:**
- **Architecture diagram:** Visual representation of Frontend → Backend → WD Cloud → MySQL flow
- **API flow diagrams:** Request/response flows for streaming, search, TMDB integration
- **Database ER diagram:** Visual entity-relationship diagram
- **Deployment diagram:** Cloudflare Tunnel, local server, NAS layout
- **Component hierarchy:** React component tree visualization
- **Documentation illustrations:** Add diagrams to README and developer docs

**Diagrams to Generate:**
```
1. System Architecture Overview
   - Browser → Cloudflare Tunnel → Express API → MySQL + WD Cloud

2. Video Streaming Flow
   - Client → Stream Proxy → WD Cloud SMB → File Read → Pipe → Client

3. Library Scan Flow
   - Admin → API → WD Cloud Dir Read → Parse → TMDB → MySQL

4. TMDB Enrichment Pipeline
   - Filename → Parser → TMDB Search → TMDB Details → Cache → DB

5. Deployment Architecture
   - Home Network: NAS + Server + XAMPP → Cloudflare → Internet
```

**OpenCode Compatibility:** Excalidraw generates .excalidraw files that can be opened in excalidraw.com or embedded in documentation. The agent can generate these during the documentation phase (Task 47).

---

### Skill 8: UIPro CLI (Already Installed)

```bash
# Already installed globally in Step 2.1
npm install -g uipro-cli
```

**Purpose:** AI-powered UI project scaffolding and component generation.

**Usage in MovieCloud:**
- **Component scaffolding:** Generate base component files with proper TypeScript types
- **Page scaffolding:** Generate page templates with layout, metadata, loading states
- **Design system setup:** Generate Tailwind config from design tokens
- **Responsive preview:** Generate responsive layout previews

**OpenCode Compatibility:** This is the primary project initialization tool. It should be used in Task 1 and Task 2 of the Implementation Plan.

---

## 4. Agent Roles

The OpenCode agent can operate in different roles. Define these roles in your agent configuration:

### Role 1: Full-Stack Developer (Primary)

**Instructions:**
```
You are building MovieCloud, a Netflix-like movie streaming platform.

Read these documents before starting:
- prd.md: Full product requirements
- Schema.md: MySQL database schema
- UI_UX.md: Design specifications
- Appflow.md: Application flow diagrams
- Implementationplan.md: Step-by-step tasks
- techstack.md: Technology details

Follow the Implementationplan.md tasks IN ORDER.
Each task has acceptance criteria — verify all criteria before moving on.

Key constraints:
- NO AUTHENTICATION for MVP — site is public
- Database is MySQL on XAMPP port 3306
- Movies stream from WD Cloud NAS at 10.65.1.150 via SMB mount at /mnt/wdcloud
- TMDB API provides movie metadata and posters
- Design must match UI_UX.md specifications exactly
- Use Next.js 14+ App Router with TypeScript
- Use Tailwind CSS for styling
- Use Framer Motion for animations
```

### Role 2: Code Reviewer

**Instructions:**
```
You are reviewing the MovieCloud codebase for quality, security, and performance.

Focus areas:
1. Security: No path traversal, SQL injection, credential leaks
2. Performance: No N+1 queries, proper caching, lazy loading
3. Code quality: Clean TypeScript types, proper error handling
4. Best practices: React hooks rules, Next.js patterns, Express middleware

For each issue found, provide:
- File path and line number
- Severity: Critical / Important / Suggestion
- Description of the issue
- Suggested fix with code example

Save review results to reviews/phase-N-review.md
```

### Role 3: QA Tester (Using Browser Use Skill)

**Instructions:**
```
You are testing the MovieCloud application end-to-end using browser automation.

Test scenarios (in order):
1. Homepage loads with hero banner and movie rows
2. Scroll through all genre rows
3. Search for a movie title
4. Click a movie card → verify detail page
5. Click "Play Now" → verify video plays
6. Seek to different positions → verify no re-buffer
7. Add movie to My List → verify on My List page
8. Navigate to a genre page → verify correct movies
9. Test on mobile viewport (375x812)
10. Test on tablet viewport (768x1024)

Take screenshots at each step. Save to tests/screenshots/.
Report any failures with steps to reproduce.
```

### Role 4: Security Tester (Using Shannon Skill)

**Instructions:**
```
You are performing a security assessment of the MovieCloud platform.

Run Shannon pentester against:
- http://localhost:3000 (frontend)
- http://localhost:3001/api/v1 (backend API)

Focus on:
1. Stream proxy path traversal
2. SQL injection on search/filter endpoints
3. Admin panel authentication bypass
4. Rate limiting effectiveness
5. Information disclosure in error responses
6. Dependency vulnerabilities (npm audit)

Save results to security/audit-report.md
```

### Role 5: Documentation Writer (Using Excalidraw Skill)

**Instructions:**
```
You are creating visual documentation for the MovieCloud project.

Generate Excalidraw diagrams for:
1. System architecture overview
2. Video streaming flow
3. Library scan and TMDB enrichment flow
4. Database entity-relationship diagram
5. Deployment architecture

Save each diagram as docs/diagrams/{name}.excalidraw

Also generate PNG exports for embedding in README.md
```

---

## 5. Agent Workflow

### 5.1 Recommended Workflow for Building MovieCloud

```
Step 1: Setup (Role: Full-Stack Developer)
  → Read all .md documentation files
  → Execute Tasks 1-8 (project setup, DB, WD Cloud mount)

Step 2: Backend Core (Role: Full-Stack Developer)
  → Execute Tasks 9-18 (parser, TMDB, scanner, APIs, stream proxy)
  → Test each endpoint manually with curl

Step 3: Frontend Core (Role: Full-Stack Developer)
  → Execute Tasks 19-30 (styles, layout, components, pages)
  → Verify each page in browser

Step 4: Video Player (Role: Full-Stack Developer)
  → Execute Tasks 31-35 (Video.js, player features, watch page)

Step 5: Features & Polish (Role: Full-Stack Developer)
  → Execute Tasks 36-40 (My List, Continue Watching, Admin, 404)

Step 6: Code Review (Role: Code Reviewer)
  → Run code-reviewer skill on entire codebase
  → Fix all Critical and Important issues

Step 7: Security Audit (Role: Security Tester)
  → Run Shannon pentester
  → Fix all Critical and High vulnerabilities

Step 8: E2E Testing (Role: QA Tester)
  → Run browser-use skill through all test scenarios
  → Fix any failures

Step 9: Deployment (Role: Full-Stack Developer)
  → Execute Tasks 41-47 (optimization, tunnel, PM2, docs)

Step 10: Documentation (Role: Documentation Writer)
  → Generate all Excalidraw diagrams
  → Update README with diagrams
```

---

## 6. Skill Compatibility Matrix

| Skill | OpenCode Compatible | Claude Code Compatible | MVP Required | Phase |
|-------|-------------------|----------------------|--------------|-------|
| UIPro CLI | Yes (global CLI) | Yes | Yes | Setup |
| Frontend Design | Read UI_UX.md instead | Native | Yes | Build |
| Browser Use | Yes (external CLI) | Native | No (testing) | Testing |
| Code Reviewer | Yes (external CLI) | Native | No (review) | Review |
| Remotion | Yes (npm package) | Native | No (future) | Post-MVP |
| Google Workspace | Yes (global CLI) | Yes | No (backup) | Post-MVP |
| Shannon Pentester | Yes (external CLI) | Native | No (security) | Pre-launch |
| Excalidraw | Yes (external CLI) | Native | No (docs) | Documentation |

---

## 7. Environment Setup Checklist

Before starting the OpenCode agent, ensure:

```bash
# Check prerequisites
node --version          # v18+ or v20+
npm --version           # v9+
mysql --version         # 8.0+ (XAMPP)
phpmyadmin              # Running at localhost/phpmyadmin

# Check WD Cloud access
ls /mnt/wdcloud/        # Should show "Movies 2026"

# Check MySQL
mysql -u root -e "SHOW DATABASES;"  # Should show "moviecloud"

# Check TMDB API key works
curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_KEY"
# Should return Fight Club movie data

# Install all skills
npm install -g uipro-cli
npx skills add anthropics/claude-code --skill frontend-design
npx skills add https://github.com/browser-use/browser-use --skill browser-use
npx claude-code-templates@latest --skill development/code-reviewer
npx skills add remotion/agent-skills
npm install -g @googleworkspace/cli
npx skills add unicodeveloper/shannon
npx skills add https://github.com/coleam00/excalidraw-diagram-skill --skill excalidraw-diagram

# All skills installed. Start OpenCode agent.
```

---

## 8. Troubleshooting Skills

### Skill Installation Fails

Some skills use `npx skills add` which requires the `skills` package. If installation fails:

```bash
# Fallback: Install skills manually as dev dependencies
npm install -D @anthropic-ai/claude-code-skills
npm install -D browser-use
npm install -D remotion
npm install -D shannon
npm install -D excalidraw-diagram-skill
```

The agent can still reference the skill's functionality through documentation without the CLI wrapper.

### Browser Use Requires Display

Browser automation needs a display (even headless). On a server without GUI:

```bash
# Install headless dependencies (Ubuntu/Debian)
sudo apt-get install -y xvfb libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1

# Run with virtual display
xvfb-run npx browser-use ...
```

### Shannon Pentester Requires Network Access

Shannon needs to reach the running application. Ensure:
1. Backend is running on port 3001
2. Frontend is running on port 3000
3. Firewall allows localhost connections

---

## 9. File Structure After All Skills Installed

```
moviecloud/
├── .opencode/                    # OpenCode agent configuration
│   ├── config.json               # Agent settings
│   └── skills/                   # Installed skills
├── .env                          # Environment variables (not committed)
├── .env.example                  # Template (committed)
├── .gitignore
├── prd.md                        # Product requirements
├── UI_UX.md                      # Design specifications
├── Schema.md                     # Database schema
├── Appflow.md                    # Application flows
├── Implementationplan.md         # Build plan
├── techstack.md                  # Tech stack details
├── agents.md                     # This file
├── client/                       # Next.js frontend
├── server/                       # Express backend
├── database/                     # SQL migrations
├── docs/                         # Documentation
│   └── diagrams/                 # Excalidraw diagrams
├── reviews/                      # Code review results
├── security/                     # Security audit reports
└── tests/                        # Test artifacts
    └── screenshots/              # E2E test screenshots
```