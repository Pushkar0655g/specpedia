# SpecPedia

> The AI-powered product encyclopedia.

Explore 100+ smartphones with AI-driven insights, plain-language spec explanations, and side-by-side comparisons. Ad-free and lightweight.

## Overview

SpecPedia helps users choose devices with confidence through:
- **Device Catalog**: Browse devices in Folio Grid, Ledger, or Stacks views.
- **Oracle (AI Buying Advisor)**: Natural-language recommendation engine powered by Groq LLM grounded directly in real catalog specifications.
- **Spec Glossary**: Plain-language explanations for complex technical terms (LTPO, IP68, UFS, SoC, etc.).
- **Price Trends**: Weekly market tracking highlighting top price fallers and risers with SVG sparklines.
- **Side-by-Side Comparisons**: Structured comparison tables with AI comparison summaries.

## Architecture

- **Frontend**: React 19, Vite, Framer Motion, Vanilla CSS Design System with Parchment and Midnight themes.
- **Backend**: Node.js, Express, Supabase (PostgreSQL), Groq AI SDK.
- **Contract**: OpenAPI 3.0 REST API specification.

## Brand Assets

The SpecPedia brand identity pairs scholarly manuscript aesthetics with a neo-brutalist tech archive design language.
- **Brand Source Files**: `brand/` contains original SVG seals with C2PA provenance manifests (`seal-colour.svg`, `seal-stamp-ink.svg`, `seal-stamp-parchment.svg`, `seal-favicon.svg`).
- **Asset Pipeline**:
  - `client/scripts/strip-seals.mjs`: Strips heavy C2PA metadata blocks and outputs optimized web SVGs to `client/public/seals/`.
  - `client/scripts/generate-icons.mjs`: Generates PWA PNG icons, Apple touch icons, and OpenGraph share banners (`npm run icons` in `client`).
- **Guidelines**: See [`brand/logo-usage.md`](file:///brand/logo-usage.md) for full palette specs, typography rules, and component integration examples.

## License

MIT © 2025 SpecPedia.
