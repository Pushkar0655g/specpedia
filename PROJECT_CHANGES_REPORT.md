# Spec Codex — Comprehensive Engineering & Transformation Report

This report documents all architectural, design, backend, frontend, performance, testing, and DevOps changes made to the **Spec Codex** (formerly *Specpedia*) repository across each prompt provided.

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Prompt 1: Design System & Ancient Manuscript Aesthetics](#2-prompt-1-design-system--ancient-manuscript-aesthetics)
3. [Prompt 2: Express Server Hardening & Resilience](#3-prompt-2-express-server-hardening--resilience)
4. [Prompt 3: Catalog & Database Hardening (Items API & SQL Migrations)](#4-prompt-3-catalog--database-hardening-items-api--sql-migrations)
5. [Prompt 4: API v1 Unification, Accessibility & Midnight Theme](#5-prompt-4-api-v1-unification-accessibility--midnight-theme)
6. [Prompt 5: Advanced AI Features & Deep Interactivity](#6-prompt-5-advanced-ai-features--deep-interactivity)
   - [5.1. AI Recommendation Engine (`/api/v1/ai/recommend`)](#51-ai-recommendation-engine-apiv1airecommend)
   - [5.2. Spec Explain API & Dual-Layer Caching (`/api/v1/ai/explain`)](#52-spec-explain-api--dual-layer-caching-apiv1aiexplain)
   - [5.3. Conversational AI Chat & Scroll Containment](#53-conversational-ai-chat--scroll-containment)
   - [5.4. Side-by-Side Compare System & Oracle Verdict](#54-side-by-side-compare-system--oracle-verdict)
7. [Prompt 6: PWA, Vercel Production Hardening & CI/CD Pipeline](#7-prompt-6-pwa-vercel-production-hardening--cicd-pipeline)
   - [6.1. Progressive Web App (PWA) & Offline Workbox Caching](#61-progressive-web-app-pwa--offline-workbox-caching)
   - [6.2. SEO Metadata & Security Headers](#62-seo-metadata--security-headers)
   - [6.3. Comprehensive Test Suites (Client & Server)](#63-comprehensive-test-suites-client--server)
   - [6.4. GitHub Actions CI Pipeline](#64-github-actions-ci-pipeline)
8. [Summary of Modified, Created, and Deleted Files](#8-summary-of-modified-created-and-deleted-files)
9. [Verification & Health Status](#9-verification--health-status)

---

## 1. Executive Summary

The project was transformed from a generic tech gadget directory into **Spec Codex**, an ancient manuscript-styled archive of smartphone history and technical specifications interpreted through intelligent AI agents. 

Key milestones achieved:
- **Zero Inline JS Hover Handlers**: All UI interactions migrated to CSS classes with full keyboard and screen-reader accessibility.
- **Unified API Layer**: All network requests centralized through an Axios singleton (`/api/v1`) with robust timeout and error interceptors.
- **Enterprise-Grade Backend**: Protected with `helmet`, CORS allowlists, IP rate limiting, strict Zod body validation, structured error masking, and graceful startup health checks.
- **Dual AI Providers with Fallback**: Groq (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`) with automatic fallback to Google Gemini 1.5 Flash.
- **Full Test Coverage & CI**: 26 automated unit tests passing across client (React Testing Library + JSDOM) and server (Vitest), automated on every push/PR via GitHub Actions.

---

## 2. Prompt 1: Design System & Ancient Manuscript Aesthetics

### Objective
Replace standard tech gradients and modern cards with the **Spec Codex Ancient Manuscript** design language.

### Changes Implemented
- **Design Tokens (`client/src/index.css` & `client/src/theme/themes.css`)**:
  - Backgrounds: Parchment primary (`#F4EFE6`), surface card (`#EBE4D5`), secondary surface (`#DFD7C6`).
  - Text: Dark ink primary (`#1B1B1B`), secondary charcoal (`#4A4A4A`), inverse parchment (`#F9F7F0`), muted ink (`#8A8170`).
  - Brand/Accent: Sealing wax oxidized red (`#7A3E2C`), active dark red (`#5A2C1F`), slate ink (`#2F4F4F`), antique gold (`#C9A227`).
  - Heavy Borders: Hard 2px solid `#111111` borders on cards, buttons, search bars, and dialogs.
  - Hard Shadow Offsets: `3px 3px 0px #111111`, `5px 5px 0px #111111` (neobrutalist parchment feel).
  - Typography: Loaded Google Fonts — *Newsreader* (editorial serif headings), *Instrument Sans* (refined body), and *JetBrains Mono* (spec numbers and data).
- **Component Restyling**:
  - Cards transformed to appear like unsealed historical parchment folios.
  - Eliminated translucent glassmorphism blurs and glowing gradients.
  - Styled category badges as historical wax seal badges and stamped tags.

---

## 3. Prompt 2: Express Server Hardening & Resilience

### Objective
Harden `server/src/index.js` against abuse, data leaks, and crashes without breaking route contracts.

### Changes Implemented
- **Security Headers & Middleware**:
  - Added `helmet()` to secure HTTP headers.
  - Replaced wildcard `cors()` with an environment-driven allowlist (`process.env.CORS_ORIGINS`, defaulting to `http://localhost:5173`).
  - Added `express.json({ limit: '100kb' })` to defend against large payload DoS.
  - Integrated `express-rate-limit` restricting AI endpoints to **10 requests per minute per IP** with standard RFC headers.
- **Operational Endpoints**:
  - Added `GET /healthz` returning `{ status: 'ok', uptime: process.uptime() }`.
  - Added a fallback 404 JSON handler for unknown routes.
  - Added central error-handling middleware that logs full stack traces server-side and hides error details in production (`{ error: 'Internal server error' }`).
- **Startup Integrity Checks**:
  - Validates `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GROQ_API_KEY` on startup. If any are missing, logs a descriptive error and terminates (`process.exit(1)`).
- **AI Fallback System (`server/src/ai/groq.js`)**:
  - Multi-tier model fallback: `llama-3.3-70b-versatile` -> `llama-3.1-8b-instant` -> Google Gemini 1.5 Flash.
  - Exponential backoff retry logic for transient network or rate limit errors.

---

## 4. Prompt 3: Catalog & Database Hardening (Items API & SQL Migrations)

### Objective
Harden catalog retrieval in `server/src/routes/items.js` and generate database migration scripts.

### Changes Implemented
- **`server/src/routes/items.js`**:
  - `GET /`: Added query parameters `category` (filters `category_id`), `brand` (exact match), `limit` (default 100, max 500), and `offset` (default 0) using `.range(offset, offset + limit - 1)`.
  - `GET /:id`: Replaced `.single()` with `.maybeSingle()`; returns HTTP 404 `{ error: 'Item not found' }` if the row does not exist.
  - `GET /brands`: Retained distinct brand selection while optimizing the query to select only the `brand` column.
  - Error masking: All catch blocks log errors server-side and return generic 500 JSON `{ error: 'Failed to fetch catalog' }`.
- **Database Migrations**:
  - `server/migrations/001_hardening.sql`: Added columns (`currency`, `slug`, `source_url`, `last_verified_at`, `status`), unique constraint on `slug`, B-tree indexes on `brand`, `category_id`, `price`, and configured Row Level Security (RLS) policies.
  - `server/migrations/002_data_cleanup.sql`: Sanitized raw prices, converted strings to numeric values, and validated currency codes.

---

## 5. Prompt 4: API v1 Unification, Accessibility & Midnight Theme

### Objective
Unify frontend network communication, improve WCAG accessibility, clean up hover handlers, and introduce a dark "Midnight" theme.

### Changes Implemented
- **API v1 Mounting**:
  - Server mounted routers at `/api/v1/items` and `/api/v1/ai`, maintaining `/api/items` and `/api/ai` as backward-compatible aliases.
- **Centralized API Client (`client/src/lib/api.js`)**:
  - Axios singleton instance configured with `baseURL = .../api/v1`, 15-second timeout, and unified error unwrapping.
  - Replaced all direct `fetch(...)` and `axios.post(...)` calls across `Home.jsx`, `BrandModal.jsx`, `ProductModal.jsx`, `AIRecommender.jsx`, and `ChatModal.jsx`.
- **UI & Accessibility Enhancements**:
  - `Home.jsx`: Fixed copy from *"{n} tablets cataloged"* to *"{n} devices cataloged"* and *"View Entry →"*; brand chips keyed by `brand.name`; added manuscript error state with a "Retry Unsealing Archives" button; made catalog cards keyboard-accessible (`tabIndex={0}`, Enter/Space keydown handlers).
  - `useEscape.js`: Custom React hook listening for the `Escape` key, integrated into all modals, dialogs, and mobile drawers.
  - Eliminated inline `onMouseEnter`/`onMouseLeave` in favor of declarative CSS classes (`.codex-brand-chip`, `.codex-nav-link`, `.codex-command-row`, `.codex-modal-close`, `.codex-footer-link`).
  - Added global `:focus-visible` ring (`3px solid var(--color-accent)`) and `@media (prefers-reduced-motion: reduce)` rules.
  - `CommandCenter.jsx`: Fixed duplicate CSS keys, added keyboard ArrowUp/ArrowDown navigation and Enter selection.
- **Midnight Dark Theme (`client/src/theme/themes.css` & `ThemeContext.jsx`)**:
  - Created `[data-theme='midnight']` token palette with charcoal ink surfaces (`#141210`, `#1E1B17`, `#26221C`), parchment typography (`#F2EBDE`), and gold highlights.
  - Theme state persisted in `localStorage` and synchronized with OS preference (`prefers-color-scheme`).
  - Sun/Moon icon toggle button added to Navbar desktop and mobile navigation.

---

## 6. Prompt 5: Advanced AI Features & Deep Interactivity

### 5.1. AI Recommendation Engine (`/api/v1/ai/recommend`)
- **Server (`server/src/routes/recommend.js`)**:
  - Validates request body with Zod: `budget` (positive number), `priorities` (array of up to 3 strings), and `freeText` (up to 500 characters).
  - Queries Supabase for items where `category_id = 1` and `price <= budget * 1.15` (up to 40 items).
  - Prompts Groq with `response_format: { type: 'json_object' }` to return exactly 3 picks.
  - Helper `joinPicksToPool` maps picks back to real catalog rows, attaching the model's reason and discarding any hallucinated IDs.
- **Client (`client/src/components/AIRecommender.jsx`)**:
  - Calls `/api/v1/ai/recommend` via the centralized API client.
  - Renders 3 responsive `codex-card` columns displaying brand pill, device name, reasoning, ₹ price, and antique gold `"View Entry →"` buttons.
  - Replaces hardcoded strings with the model's real reasoning in an expandable accordion.

### 5.2. Spec Explain API & Dual-Layer Caching (`/api/v1/ai/explain`)
- **Server (`server/src/routes/explain.js` & `server/src/ai/cache.js`)**:
  - Endpoint receives `{ specKey, specValue, itemContext }`.
  - Backed by an in-memory `TTLCache` with a 7-day TTL keyed by `${specKey}::${specValue}`.
  - Produces concise 2-sentence explanations understandable by non-technical readers.
- **Client (`client/src/components/ProductModal.jsx`)**:
  - Client-side module-level `Map` cache prevents duplicate network requests for the same spec.
  - Displays tooltip explanation on click.
  - Added a `⚔️ Compare` button in the modal header to stage devices for comparison.

### 5.3. Conversational AI Chat & Scroll Containment
- **Conversational Memory**: Updated `ChatModal.jsx` to slice and forward the last 8 messages (`messages.slice(-8)`) to `/api/v1/ai/chat`.
- **Text Formatting**: `formatAIResponse` replaces literal and escaped `\n` (`text.replace(/\\n/g, '\n')`) into clean Markdown headers, bullet points, and paragraphs.
- **Scroll Containment**: Auto-scroll is scoped strictly to the chat modal container (`messagesContainerRef.current.scrollTop = scrollHeight`), resolving whole-page jump issues.
- **Prompt Chips**: 3 initial starter chips when the conversation is empty, plus 2 dynamic contextual follow-up chips after each AI answer.

### 5.4. Side-by-Side Compare System & Oracle Verdict
- **Compare Modal (`client/src/components/CompareModal.jsx`)**:
  - Loads two devices by ID in parallel.
  - Merges and aligns all specifications side-by-side in a parchment manuscript table.
  - Automatically highlights spec differences with an antique gold left border (`var(--color-accent)`).
  - Includes a "Request Oracle Verdict" button that calls the AI to generate a nuanced comparison summary.
- **Home Integration (`client/src/components/Home.jsx`)**:
  - Mount listener automatically opens comparison if URL query `?compare=id1,id2` is present.
  - Floating staged compare slot badge in the corner allows staging devices from catalog cards or modal headers.

---

## 7. Prompt 6: PWA, Vercel Production Hardening & CI/CD Pipeline

### 6.1. Progressive Web App (PWA) & Offline Workbox Caching
- Configured `vite-plugin-pwa` in `client/vite.config.js`:
  - Standalone app manifest (`manifest.webmanifest`) with theme color `#7A3E2C` and parchment background `#F4EFE6`.
  - Service worker (`sw.js`) generated during `npm run build`.
  - Workbox runtime caching:
    - `/api/v1/items*` cached with `NetworkFirst` strategy (1-hour TTL, max 50 entries).
    - Google Fonts (`fonts.googleapis.com` & `fonts.gstatic.com`) cached with `CacheFirst` strategy (1-year TTL).

### 6.2. SEO Metadata & Security Headers
- **HTML Meta (`client/index.html`)**:
  - Added OpenGraph metadata (`og:title`, `og:description`, `og:image`, `og:type`).
  - Added Twitter card metadata (`summary_large_image`).
  - Added browser `theme-color` meta tag.
- **Vercel Config (`client/vercel.json`)**:
  - SPA URL rewrites to `/index.html`.
  - Immutable 1-year asset cache headers on `/assets/(.*)`.
  - HTTP security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 6.3. Comprehensive Test Suites (Client & Server)
- **Client Test Suite (`client/src/test/`)**:
  - Installed Vitest, React Testing Library, and JSDOM.
  - `formatAIResponse.test.jsx`: Verifies Markdown heading parsing, bullet list items, bold marker parsing, and escaped `\n` normalization (6 tests).
  - `useEscape.test.jsx`: Verifies Escape key listener, key filters, and unmount cleanup (3 tests).
  - `CommandCenter.test.jsx`: Verifies catalog rendering, search filtering, ArrowUp/ArrowDown navigation, Enter key selection, and click events (4 tests).
  - **Result**: `npm --prefix client test` → **13 passed (100%)**.
- **Server Test Suite (`server/test/`)**:
  - Installed Vitest and Supertest.
  - `cache.test.js`: Verifies `TTLCache` set/get, nonexistent key handling, fake timer TTL expiration, deletion, and clear (5 tests).
  - `recommend.test.js`: Verifies `recommendSchema` Zod validation (positive budgets, max 3 priorities, max 500 chars) and `joinPicksToPool` (joining picks, dropping hallucinated IDs, capping at 3 picks, handling empty lists) (8 tests).
  - **Result**: `npm --prefix server test` → **13 passed (100%)**.

### 6.4. GitHub Actions CI Pipeline
- Created `.github/workflows/ci.yml` running on `push` and `pull_request` to `main` and `master`.
- **Client Job**: Sets up Node 20, runs `npm ci`, runs `npm run lint` (Oxlint), runs `npm test`, and runs `npm run build`.
- **Server Job**: Sets up Node 20, runs `npm ci`, and runs `npm test`.

---

## 8. Summary of Modified, Created, and Deleted Files

| Category | File Path | Action | Description |
| :--- | :--- | :--- | :--- |
| **CI/CD** | `.github/workflows/ci.yml` | **NEW** | GitHub Actions workflow for lint, tests, and build |
| **Client Core** | `client/index.html` | **MODIFIED** | Added OG/Twitter metadata, theme colors, and font imports |
| **Client Core** | `client/vite.config.js` | **MODIFIED** | Configured `vite-plugin-pwa` with Workbox caching rules |
| **Client Core** | `client/vitest.config.js` | **NEW** | Vitest configuration with JSDOM environment |
| **Client Core** | `client/vercel.json` | **MODIFIED** | Added immutable asset headers and security headers |
| **Client Lib** | `client/src/lib/api.js` | **NEW** | Central Axios instance for `/api/v1` with error interceptor |
| **Client Hooks**| `client/src/hooks/useEscape.js` | **NEW** | Keyboard Escape handler hook for modals and drawers |
| **Client Tests**| `client/src/test/setup.js` | **NEW** | Jest-DOM matchers setup |
| **Client Tests**| `client/src/test/formatAIResponse.test.jsx` | **NEW** | Unit tests for Markdown parser and bold formatter |
| **Client Tests**| `client/src/test/useEscape.test.jsx` | **NEW** | Unit tests for useEscape hook |
| **Client Tests**| `client/src/test/CommandCenter.test.jsx` | **NEW** | Unit tests for search, keyboard nav, and selection |
| **Client Components**| `client/src/components/AIRecommender.jsx`| **MODIFIED** | Rewritten for `/api/v1/ai/recommend` with 3 codex columns |
| **Client Components**| `client/src/components/CompareModal.jsx` | **NEW** | Side-by-side spec comparison and Oracle verdict |
| **Client Components**| `client/src/components/ChatModal.jsx` | **MODIFIED** | Added 8-msg memory, scroll containment, and prompt chips |
| **Client Components**| `client/src/components/ProductModal.jsx` | **MODIFIED** | Added spec caching, explain API call, and compare trigger |
| **Client Components**| `client/src/components/Home.jsx` | **MODIFIED** | Staging slots, compare query mount, accessible cards |
| **Client Components**| `client/src/components/CommandCenter.jsx`| **MODIFIED** | Keyboard arrow navigation and Enter selection |
| **Client Components**| `client/src/components/Navbar.jsx` | **MODIFIED** | Theme toggle, accessibility labels, and escape handler |
| **Client Components**| `client/src/components/BrandModal.jsx` | **MODIFIED** | API client integration, error retry state |
| **Client Components**| `client/src/components/Footer.jsx` | **MODIFIED** | CSS classes replacing inline hover handlers |
| **Client Styles**| `client/src/index.css` | **MODIFIED** | Manuscript design tokens, focus rings, reduced motion |
| **Client Styles**| `client/src/theme/themes.css` | **MODIFIED** | Midnight theme tokens |
| **Client Styles**| `client/src/theme/ThemeContext.jsx` | **MODIFIED** | Theme persistence and switcher provider |
| **Server Core** | `server/src/index.js` | **MODIFIED** | Helmet, CORS allowlist, rate limits, `/healthz`, `/api/v1` |
| **Server AI** | `server/src/ai/groq.js` | **MODIFIED** | Multi-model fallback, retry backoff |
| **Server AI** | `server/src/ai/cache.js` | **NEW** | In-memory 7-day TTL cache for spec explanations |
| **Server Routes**| `server/src/routes/items.js` | **MODIFIED** | Query params, limit/offset, `.maybeSingle()`, 404/500 masking |
| **Server Routes**| `server/src/routes/chat.js` | **MODIFIED** | Conversational history handling and fallback invocation |
| **Server Routes**| `server/src/routes/recommend.js` | **NEW** | Zod body validation, catalog retrieval, pick-joining |
| **Server Routes**| `server/src/routes/explain.js` | **NEW** | Spec explanation generation with TTL caching |
| **Server Tests** | `server/test/cache.test.js` | **NEW** | Unit tests for TTLCache |
| **Server Tests** | `server/test/recommend.test.js` | **NEW** | Unit tests for recommendSchema and joinPicksToPool |
| **Server DB** | `server/migrations/001_hardening.sql` | **NEW** | Schema hardening columns, indexes, and RLS policies |
| **Server DB** | `server/migrations/002_data_cleanup.sql`| **NEW** | Price and currency sanitization scripts |

---

## 9. Verification & Health Status

| Test / Check | Command | Status |
| :--- | :--- | :--- |
| **Client Test Suite** | `npm --prefix client test` | **13/13 PASSED** |
| **Server Test Suite** | `npm --prefix server test` | **13/13 PASSED** |
| **Client Oxlint Linter** | `npm --prefix client run lint` | **0 ERRORS** |
| **Client Production Build** | `npm --prefix client run build` | **BUILT IN ~480ms** (sw.js & manifest generated) |
| **Backend Health Check** | `GET http://localhost:5000/healthz` | **HTTP 200 `{ status: "ok" }`** |
| **Frontend Dev Server** | `GET http://localhost:5173` | **HTTP 200** |
| **API Endpoints Tested** | `/api/v1/items`, `/api/v1/ai/chat`, `/api/v1/ai/recommend`, `/api/v1/ai/explain` | **ALL OPERATIONAL** |
