# SpecPedia Brand & Logo Usage Guidelines

## Brand Essence
**SpecPedia** = scholarly manuscript × neo-brutalist tech archive.
Parchment, ink, sealing wax, and gold leaf; sharp corners, heavy rules, hard offset shadows; zero generic gradients, zero glassmorphism.

---

## Visual Identity & Color Palette

### Codex (Light) Palette
| Role | Token / Hex | Use |
| :--- | :--- | :--- |
| **Parchment bg** | `--color-bg-primary` (`#F4EFE6`) | Canvas, page background |
| **Surface / Deep Surface** | `--color-bg-surface` (`#EBE4D5` / `#DFD7C6`) | Cards, panels, drawers |
| **Ink (Text & Borders)** | `--color-text-primary` (`#1B1B1B`) | Outlines, headings, wordmark "Spec" |
| **Secondary / Muted Ink** | `--color-text-secondary` (`#4A4A4A` / `#8A8272`) | Supporting copy, timestamps, captions |
| **Sealing-Wax Red (Primary)** | `--color-primary` (`#7A3E2C`, dark `#5A2C1F`) | Wordmark "Pedia", wax seals, primary CTAs |
| **Antique Gold (Accent / AI)** | `--color-accent` (`#C9A227`, dark `#A8861E`) | Oracle marks, highlight badges, nib cursors |
| **Slate Ink (Support)** | `#2F4F4F` | Accent metadata tags |

### Midnight (Dark) Palette
- **Backgrounds**: `#141210` / `#1E1B17` / `#26221C`
- **Text & Outlines**: Parchment `#F2EBDE`
- **Accent Gold**: `#C9A227`
- **Seals**: In Midnight mode, monochrome marks use the parchment tone (`#F2EBDE`) on dark surfaces.

---

## Typography
- **Wordmark & Headings**: `Cinzel` (serif, small-caps feel), letter-spacing `0.02–0.04em`.
  - Pattern: **"Spec"** in Ink (`var(--color-text-primary)`) + **"Pedia"** in Sealing Wax (`var(--color-primary)`).
- **Body & Prose**: `Inter` / system sans-serif.
- **Data, Specs & Eyebrows**: `JetBrains Mono` (uppercase, `0.15em` tracking), e.g., `"AI-POWERED PRODUCT ENCYCLOPEDIA"`.

---

## Logo Mark: The Wax Seal

The official SpecPedia symbol is an irregular-edge wax seal with an embossed quill-stroke "S" and an antique gold astrolabe star on the rim.

### Variants
1. **Colour (`seal-colour.svg`)**:
   - Deep wax red background (`#7A3E2C`), parchment S-stroke (`#F4EFE6`), and gold star (`#C9A227`).
   - Used in the primary navigation wordmark lockup, hero entrance, and AI Oracle surfaces.
2. **Ink Stamp (`seal-stamp-ink.svg` / `seal-ink.svg`)**:
   - Pure ink monochrome `#1B1B1B`. Used on light parchment surfaces.
3. **Parchment Stamp (`seal-stamp-parchment.svg` / `seal-parchment.svg`)**:
   - Pure parchment monochrome `#F4EFE6`. Used on dark / midnight surfaces.
4. **Favicon (`seal-favicon.svg`)**:
   - Optimized high-contrast mark for tab icons and small PWA renders.

---

## Asset Pipeline & Provenance Guardrails

> [!IMPORTANT]
> Raw vector files in `brand/` retain cryptographic C2PA provenance manifests in `<metadata>…</metadata>` blocks.
> **NEVER** serve files directly from `brand/` in production web builds.

1. **Stripping Script**:
   - `client/scripts/strip-seals.mjs` extracts vector geometry and fills from `brand/` into `client/public/seals/` while stripping the `<metadata>` blocks, reducing file size to <12KB.
2. **Icon Generation**:
   - `client/scripts/generate-icons.mjs` renders from `client/public/seals/seal-favicon.svg`:
     - `icon-192.png` & `icon-512.png` (PWA application icons)
     - `apple-touch-icon.png` (180x180 iOS touch icon)
     - `maskable-512.png` (512x512 canvas with seal at 80% safe-zone scale on `#F4EFE6`)
     - `og-cover.png` (1200x630 social share card)
   - Trigger anytime assets change via `npm run icons` in `client/`.

---

## React Component Usage

```jsx
import SealMark from './SealMark';

// Standard colour seal (default 32px)
<SealMark variant="colour" size={30} />

// Theme-aware monochrome stamp (switches between ink and parchment based on theme)
<SealMark variant="mono" size={40} />

// Decorative hero stamp with animation
<SealMark variant="colour" size={56} decorative className="codex-hero-seal" />

// Spinning state during AI streaming/loading
<SealMark variant="colour" size={24} spin={isLoading} decorative />
```

---

## Brand Do's and Don'ts

- ✅ **DO** keep sharp corners (`border-radius: 0`), heavy 2–3px borders, and hard offset drop shadows (`4px 4px 0px #000`).
- ✅ **DO** use the two-tone wordmark: **Spec** (ink) + **Pedia** (wax red).
- ❌ **DON'T** use generic gradients, cyan/neon colors, or glassmorphism blurs.
- ❌ **DON'T** distort the seal proportions or remove the astrolabe star.
- ❌ **DON'T** serve raw C2PA-tagged SVG files directly from the root `brand/` folder.
