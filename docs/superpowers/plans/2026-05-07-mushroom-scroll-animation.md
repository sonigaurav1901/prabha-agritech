# Mushroom Scroll Story Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement P-01 — the signature seed→mycelium→mushroom scroll animation for the home page, with desktop pinned timeline, mobile one-shot reveal, and reduced-motion static fallback.

**Architecture:** Single feature folder `src/components/sections/home/MushroomScrollStory/` with three sibling variant components (Desktop / Mobile / ReducedMotion), seven SVG frame components, a GSAP timeline builder, and shared captions. Two new hooks (`useMediaQuery`, `usePrefersReducedMotion`) drive variant selection. Animation uses pure GSAP + ScrollTrigger (already installed) with `stroke-dashoffset` for the line-art "drawing-in" effect — no new packages, no Lottie.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, GSAP 3.12 + ScrollTrigger, `@gsap/react` `useGSAP` hook, inline SVG.

**Spec:** `docs/superpowers/specs/2026-05-07-mushroom-scroll-animation-design.md`

**Working directory:** `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development`

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `src/hooks/useMediaQuery.ts` | Create | SSR-safe media query subscription |
| `src/hooks/usePrefersReducedMotion.ts` | Create | Detects `prefers-reduced-motion: reduce` |
| `src/constants/content.ts` | Create | All site text content; for now contains only `MUSHROOM_STORY.captions` |
| `src/components/sections/home/MushroomScrollStory/index.tsx` | Create | Variant router (orchestrator) |
| `src/components/sections/home/MushroomScrollStory/DesktopStory.tsx` | Create | ≥768px: pinned + scrubbed timeline |
| `src/components/sections/home/MushroomScrollStory/MobileStory.tsx` | Create | <768px: IntersectionObserver one-shot |
| `src/components/sections/home/MushroomScrollStory/ReducedMotionStory.tsx` | Create | Static Frame 7 only |
| `src/components/sections/home/MushroomScrollStory/timeline.ts` | Create | `buildTimeline(scope)` — pure GSAP timeline factory |
| `src/components/sections/home/MushroomScrollStory/frames/Frame1Spore.tsx` | Create | Stage 1 SVG — soil + dormant spore |
| `src/components/sections/home/MushroomScrollStory/frames/Frame2Hyphae.tsx` | Create | Stage 2 SVG — first threads radiating |
| `src/components/sections/home/MushroomScrollStory/frames/Frame3Mycelium.tsx` | Create | Stage 3 SVG — full underground network |
| `src/components/sections/home/MushroomScrollStory/frames/Frame4Substrate.tsx` | Create | Stage 4 SVG — colonized substrate bag |
| `src/components/sections/home/MushroomScrollStory/frames/Frame5Pinning.tsx` | Create | Stage 5 SVG — bag with pins |
| `src/components/sections/home/MushroomScrollStory/frames/Frame6Cluster.tsx` | Create | Stage 6 SVG — oyster mushroom cluster |
| `src/components/sections/home/MushroomScrollStory/frames/Frame7Sunrise.tsx` | Create | Stage 7 SVG — rising sun + PRABHA wordmark |
| `src/app/page.tsx` | Modify | Dynamic-import `MushroomScrollStory` between Hero and (future) Philosophy |

**Class-name convention** (used by `timeline.ts` to query elements):
- Each frame's drawable paths use `.draw-frame-N` (where N is 1–7) so GSAP can target them with `gsap.to('.draw-frame-1', ...)`
- Each caption uses `.caption-stage-N`
- Element groups that fade out (e.g., spore in stages 4+) use `.fade-spore`, `.fade-hyphae`, etc.

---

## Task 1 — Create branch and verify clean state

**Files:** none (git only)

- [ ] **Step 1: Verify clean state on `main`**

```bash
cd "C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development"
git status
git branch --show-current
```

Expected: `main`, clean working tree (no modified, no untracked except possibly `.superpowers/` which is gitignored). If P-02's PR is still on its branch, that's fine — we branch off `main`, not from it.

If branch is not `main`: `git checkout main` and re-run.

- [ ] **Step 2: Pull latest from origin**

```bash
git pull origin main
```

Expected: up-to-date or fast-forwards to merged P-02 commit.

- [ ] **Step 3: Create and switch to feature branch**

```bash
git checkout -b feature/mushroom-scroll-story
```

Expected: `Switched to a new branch 'feature/mushroom-scroll-story'`

- [ ] **Step 4: Verify GSAP is installed**

```bash
node -e "console.log(require('gsap/package.json').version, require('@gsap/react/package.json').version)"
```

Expected: `3.12.x ... 2.1.x` — both installed already (no new deps needed).

If either is missing: STOP and report BLOCKED — package install was supposed to happen in baseline scaffolding.

- [ ] **Step 5: Initial type-check (baseline)**

```bash
npx tsc --noEmit
```

Expected: passes with 0 errors. This is our baseline before adding new files.

---

## Task 2 — Create `useMediaQuery` and `usePrefersReducedMotion` hooks

**Files:**
- Create: `src/hooks/useMediaQuery.ts`
- Create: `src/hooks/usePrefersReducedMotion.ts`

Both hooks must be SSR-safe (return `false` initially, then update after mount). They are simple, similar, and ship together.

- [ ] **Step 1: Create `src/hooks/` folder**

```bash
mkdir -p src/hooks
```

- [ ] **Step 2: Write `src/hooks/useMediaQuery.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query subscription. Returns false on first render
 * (server + client first paint), then updates to the live value after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", handler);

    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

- [ ] **Step 3: Write `src/hooks/usePrefersReducedMotion.ts`**

```ts
"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * Returns true when the OS-level "reduce motion" preference is enabled.
 * Use to disable scroll-linked or auto-playing animations.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMediaQuery.ts src/hooks/usePrefersReducedMotion.ts
git commit -m "$(cat <<'EOF'
feat(hooks): add useMediaQuery and usePrefersReducedMotion

SSR-safe React hooks for responsive variant selection and
WCAG 2.1 SC 2.3.3 reduced-motion compliance. Will drive the
MushroomScrollStory variant router.

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — Create captions in `src/constants/content.ts`

**Files:**
- Create: `src/constants/content.ts`

This is the project's single source for all hardcoded site text. Per CLAUDE.md, no JSX should hardcode strings. We're creating this file now with just the mushroom-story captions; future tasks (D-06) will fill in the rest of the site's content here.

- [ ] **Step 1: Create the folder**

```bash
mkdir -p src/constants
```

- [ ] **Step 2: Write `src/constants/content.ts`**

```ts
/**
 * Single source of all site text content.
 *
 * Add new content blocks here as features are built. Components must
 * import from this file rather than hardcoding strings in JSX (per CLAUDE.md).
 */

export const MUSHROOM_STORY = {
  captions: [
    "Every harvest begins as a single spore.",
    "It awakens, threads reaching into the soil.",
    "A hidden network — mycelium — spreads beneath.",
    "The substrate is colonized. Life takes hold.",
    "Pins emerge — the moment of birth.",
    "Oyster clusters bloom, ready for harvest.",
    "PRABHA — the rising sun of Indian agriculture.",
  ] as const,
  reducedMotionCaption: "From spore to harvest — the PRABHA story.",
} as const;
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Do NOT commit yet** — this commit will batch with the timeline builder in Task 5.

---

## Task 4 — Create the seven frame components

**Files (create all 7):**
- `src/components/sections/home/MushroomScrollStory/frames/Frame1Spore.tsx`
- `src/components/sections/home/MushroomScrollStory/frames/Frame2Hyphae.tsx`
- `src/components/sections/home/MushroomScrollStory/frames/Frame3Mycelium.tsx`
- `src/components/sections/home/MushroomScrollStory/frames/Frame4Substrate.tsx`
- `src/components/sections/home/MushroomScrollStory/frames/Frame5Pinning.tsx`
- `src/components/sections/home/MushroomScrollStory/frames/Frame6Cluster.tsx`
- `src/components/sections/home/MushroomScrollStory/frames/Frame7Sunrise.tsx`

Each frame is a pure SVG component with no animation logic of its own. Drawable paths receive class names of the form `draw-frame-N` (where N matches the file's stage number) so the parent timeline can query and animate them. The initial `stroke-dasharray` and `stroke-dashoffset` are set inline at length `200` (safely larger than any path's length in our 100-unit viewBox).

All frames render absolutely positioned at the same place — the parent stacks them in a relative container. Sizing is responsive via `w-full max-w-md aspect-square mx-auto`.

- [ ] **Step 1: Create the frames folder**

```bash
mkdir -p src/components/sections/home/MushroomScrollStory/frames
```

- [ ] **Step 2: Write `Frame1Spore.tsx`**

```tsx
export default function Frame1Spore() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Soil line — drawn first */}
      <path
        d="M 10 70 Q 30 68 50 70 T 90 70"
        className="draw-frame-1"
        stroke="#1B4332"
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="200"
        strokeDashoffset="200"
      />
      {/* Soil texture dots */}
      <circle cx="20" cy="78" r="1" fill="#1B4332" opacity="0.4" className="fade-soil-dots" />
      <circle cx="35" cy="82" r="0.8" fill="#1B4332" opacity="0.4" className="fade-soil-dots" />
      <circle cx="62" cy="80" r="1" fill="#1B4332" opacity="0.4" className="fade-soil-dots" />
      <circle cx="78" cy="84" r="0.8" fill="#1B4332" opacity="0.4" className="fade-soil-dots" />
      {/* The spore */}
      <circle
        cx="50"
        cy="76"
        r="2.5"
        className="draw-frame-1 fade-spore"
        fill="#D4A017"
        stroke="#1B4332"
        strokeWidth={1}
      />
      {/* Spore halo (pulsing glow) */}
      <circle
        cx="50"
        cy="76"
        r="5"
        fill="none"
        stroke="#D4A017"
        strokeWidth={0.5}
        opacity="0.4"
        className="fade-spore"
      />
    </svg>
  );
}
```

- [ ] **Step 3: Write `Frame2Hyphae.tsx`**

```tsx
export default function Frame2Hyphae() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Hypha threads — radiate from spore */}
      <g
        stroke="#1B4332"
        fill="none"
        strokeLinecap="round"
        className="draw-frame-2"
      >
        <path d="M 50 66 L 42 78" strokeWidth={1} strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 66 L 58 80" strokeWidth={1} strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 66 L 50 82" strokeWidth={1} strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 66 L 38 72" strokeWidth={0.8} strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 66 L 62 72" strokeWidth={0.8} strokeDasharray="200" strokeDashoffset="200" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 4: Write `Frame3Mycelium.tsx`**

```tsx
export default function Frame3Mycelium() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <g
        stroke="#1B4332"
        strokeWidth={0.8}
        fill="none"
        strokeLinecap="round"
        className="draw-frame-3"
      >
        <path d="M 50 56 L 42 65 L 34 70" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 42 65 L 38 78" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 56 L 58 65 L 66 70" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 58 65 L 62 78" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 56 L 50 70 L 50 85" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 70 L 44 80" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 70 L 56 80" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 34 70 L 28 85" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 66 70 L 72 85" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 56 L 30 60" strokeDasharray="200" strokeDashoffset="200" />
        <path d="M 50 56 L 70 60" strokeDasharray="200" strokeDashoffset="200" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 5: Write `Frame4Substrate.tsx`**

```tsx
export default function Frame4Substrate() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Bag outline */}
      <path
        d="M 30 25 Q 30 22 33 22 L 67 22 Q 70 22 70 25 L 72 80 Q 72 85 67 85 L 33 85 Q 28 85 28 80 Z"
        className="draw-frame-4 fade-bag"
        stroke="#1B4332"
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="400"
        strokeDashoffset="400"
      />
      {/* Tied top */}
      <path
        d="M 42 22 Q 50 17 58 22"
        className="draw-frame-4 fade-bag"
        stroke="#1B4332"
        strokeWidth={1.2}
        fill="none"
        strokeDasharray="200"
        strokeDashoffset="200"
      />
      {/* Mycelium hatch lines inside bag */}
      <g
        stroke="#1B4332"
        strokeWidth={0.5}
        opacity="0.6"
        className="draw-frame-4 fade-bag-hatch"
      >
        <line x1="35" y1="35" x2="42" y2="40" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="48" y1="32" x2="55" y2="38" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="60" y1="36" x2="65" y2="42" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="33" y1="48" x2="40" y2="52" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="50" y1="46" x2="56" y2="52" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="60" y1="50" x2="68" y2="55" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="36" y1="60" x2="44" y2="65" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="50" y1="62" x2="58" y2="68" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="38" y1="74" x2="46" y2="78" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="55" y1="74" x2="64" y2="78" strokeDasharray="200" strokeDashoffset="200" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 6: Write `Frame5Pinning.tsx`**

```tsx
export default function Frame5Pinning() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Mushroom pins poking from sides of bag */}
      <g
        stroke="#1B4332"
        strokeWidth={1.2}
        fill="#fff"
        strokeLinecap="round"
        className="draw-frame-5"
      >
        <ellipse cx="28" cy="38" rx="3" ry="2" strokeDasharray="200" strokeDashoffset="200" />
        <ellipse cx="72" cy="45" rx="3.5" ry="2.5" strokeDasharray="200" strokeDashoffset="200" />
        <ellipse cx="27" cy="55" rx="2.5" ry="2" strokeDasharray="200" strokeDashoffset="200" />
        <ellipse cx="73" cy="62" rx="3" ry="2" strokeDasharray="200" strokeDashoffset="200" />
        <ellipse cx="29" cy="70" rx="2" ry="1.5" strokeDasharray="200" strokeDashoffset="200" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 7: Write `Frame6Cluster.tsx`**

```tsx
export default function Frame6Cluster() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <g
        stroke="#1B4332"
        strokeWidth={1.5}
        fill="none"
        strokeLinejoin="round"
        className="draw-frame-6"
      >
        {/* Big mushroom 1 — left */}
        <path d="M 5 45 Q 22 25 38 45 Q 38 50 22 50 Q 5 50 5 45 Z" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="12" y1="45" x2="12" y2="49" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="22" y1="45" x2="22" y2="50" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="32" y1="45" x2="32" y2="49" strokeDasharray="200" strokeDashoffset="200" />
        {/* Big mushroom 2 — right (largest) */}
        <path d="M 55 38 Q 75 18 95 38 Q 95 43 75 43 Q 55 43 55 38 Z" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="65" y1="38" x2="65" y2="42" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="75" y1="38" x2="75" y2="43" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="85" y1="38" x2="85" y2="42" strokeDasharray="200" strokeDashoffset="200" />
        {/* Smaller mushroom front-center */}
        <path d="M 35 60 Q 50 45 65 60 Q 65 64 50 64 Q 35 64 35 60 Z" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="42" y1="60" x2="42" y2="63" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="50" y1="60" x2="50" y2="64" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="58" y1="60" x2="58" y2="63" strokeDasharray="200" strokeDashoffset="200" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 8: Write `Frame7Sunrise.tsx`**

```tsx
export default function Frame7Sunrise() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A017" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo glow */}
      <circle cx="50" cy="50" r="40" fill="url(#sun-glow)" className="draw-frame-7" />

      {/* Sun outline */}
      <circle
        cx="50"
        cy="50"
        r="14"
        fill="none"
        stroke="#D4A017"
        strokeWidth={1.8}
        strokeDasharray="200"
        strokeDashoffset="200"
        className="draw-frame-7"
      />

      {/* Rays */}
      <g stroke="#D4A017" strokeWidth={1.2} strokeLinecap="round" className="draw-frame-7">
        <line x1="50" y1="28" x2="50" y2="33" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="50" y1="67" x2="50" y2="72" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="28" y1="50" x2="33" y2="50" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="67" y1="50" x2="72" y2="50" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="34" y1="34" x2="38" y2="38" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="62" y1="62" x2="66" y2="66" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="34" y1="66" x2="38" y2="62" strokeDasharray="200" strokeDashoffset="200" />
        <line x1="62" y1="38" x2="66" y2="34" strokeDasharray="200" strokeDashoffset="200" />
      </g>

      {/* Horizon line */}
      <line
        x1="10"
        y1="78"
        x2="90"
        y2="78"
        stroke="#1B4332"
        strokeWidth={0.8}
        opacity="0.4"
        strokeDasharray="200"
        strokeDashoffset="200"
        className="draw-frame-7"
      />

      {/* PRABHA wordmark */}
      <text
        x="50"
        y="92"
        fontFamily="var(--font-playfair), serif"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        fill="#1B4332"
        letterSpacing="2"
        className="draw-frame-7-logo"
        opacity="0"
      >
        PRABHA
      </text>
    </svg>
  );
}
```

- [ ] **Step 9: Type-check after all 7 frames**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 10: Commit frames**

```bash
git add src/components/sections/home/MushroomScrollStory/frames/
git commit -m "$(cat <<'EOF'
feat(home): add MushroomScrollStory frames 1-7 (line art SVGs)

Seven inline-SVG components rendering the seed-to-harvest story:
Spore, Hyphae, Mycelium, Substrate, Pinning, Cluster, Sunrise.

Each draws in via stroke-dashoffset animation driven by the parent
timeline. Two-color palette: #1B4332 (prabha-forest) for mushroom
anatomy, #D4A017 (prabha-amber) for spore + sun.

Refs: TODO P-01

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 — Create the GSAP timeline builder

**Files:**
- Create: `src/components/sections/home/MushroomScrollStory/timeline.ts`

Pure factory function returning a configured `gsap.core.Timeline`. The timeline knows nothing about React or media queries; consumers (DesktopStory / MobileStory) decide when and how to use it.

- [ ] **Step 1: Write `src/components/sections/home/MushroomScrollStory/timeline.ts`**

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TimelineOptions {
  /** Enable scroll-pin behaviour (desktop). When false, returns a plain timeline meant to be played manually. */
  scrollPin: boolean;
  /** Section element (used as ScrollTrigger trigger and pin scope). */
  scope: HTMLElement;
}

/**
 * Build the master mushroom-story timeline.
 *
 * Stages occupy roughly equal slices of the timeline duration (10s).
 * In `scrollPin: true` mode, scroll position drives playback via ScrollTrigger
 * with scrub: 1 (1-second smoothing). In `scrollPin: false` mode, the caller
 * (MobileStory) plays the timeline once on viewport entry.
 */
export function buildTimeline({ scrollPin, scope }: TimelineOptions): gsap.core.Timeline {
  const tl = gsap.timeline({
    paused: !scrollPin, // mobile starts paused; desktop is driven by scroll
    scrollTrigger: scrollPin
      ? {
          trigger: scope,
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      : undefined,
  });

  // Each stage: ~1s draw, ~0.5s caption fade-in, ~0.3s caption fade-out
  // Total per stage: ~1.4s. Seven stages = ~9.8s timeline duration.

  // ---- Stage 1: Dormant Spore (t = 0-1.4s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-1`,
    { strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1, stagger: 0.05 },
    0,
  );
  tl.fromTo(`.caption-stage-1`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.2);
  tl.to(`.caption-stage-1`, { opacity: 0, duration: 0.3 }, 1.1);

  // ---- Stage 2: Hyphae Emerge (t = 1.4-2.8s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-2`,
    { strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1, stagger: 0.08 },
    1.4,
  );
  tl.fromTo(`.caption-stage-2`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 1.6);
  tl.to(`.caption-stage-2`, { opacity: 0, duration: 0.3 }, 2.5);

  // ---- Stage 3: Mycelium Network (t = 2.8-4.2s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-3`,
    { strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1.2, stagger: 0.04 },
    2.8,
  );
  tl.fromTo(`.caption-stage-3`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 3.0);
  tl.to(`.caption-stage-3`, { opacity: 0, duration: 0.3 }, 3.9);
  // Fade out spore + hyphae as we leave the underground scene
  tl.to(`[data-scope="${scope.dataset.scope}"] .fade-spore`, { opacity: 0, duration: 0.6 }, 4.0);

  // ---- Stage 4: Substrate Bag (t = 4.2-5.6s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-4`,
    { strokeDashoffset: 400 },
    { strokeDashoffset: 0, duration: 1.2, stagger: 0.03 },
    4.2,
  );
  tl.fromTo(`.caption-stage-4`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 4.4);
  tl.to(`.caption-stage-4`, { opacity: 0, duration: 0.3 }, 5.3);

  // ---- Stage 5: Pinning (t = 5.6-7.0s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-5`,
    { strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1, stagger: 0.1 },
    5.6,
  );
  tl.fromTo(`.caption-stage-5`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 5.8);
  tl.to(`.caption-stage-5`, { opacity: 0, duration: 0.3 }, 6.7);

  // ---- Stage 6: Oyster Cluster (t = 7.0-8.4s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-6`,
    { strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1.2, stagger: 0.05 },
    7.0,
  );
  tl.fromTo(`.caption-stage-6`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 7.2);
  tl.to(`.caption-stage-6`, { opacity: 0, duration: 0.3 }, 8.1);
  // Fade out bag and pins to make room for sun
  tl.to(
    `[data-scope="${scope.dataset.scope}"] .fade-bag, [data-scope="${scope.dataset.scope}"] .fade-bag-hatch`,
    { opacity: 0, duration: 0.6 },
    8.2,
  );

  // ---- Stage 7: Rising Sun (t = 8.4-9.8s) ----
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-7`,
    { strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1.2, stagger: 0.04 },
    8.4,
  );
  tl.fromTo(`.caption-stage-7`, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 8.6);
  // PRABHA wordmark fades in at the very end and stays
  tl.fromTo(
    `[data-scope="${scope.dataset.scope}"] .draw-frame-7-logo`,
    { opacity: 0 },
    { opacity: 1, duration: 0.6 },
    9.0,
  );

  return tl;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit timeline + captions**

```bash
git add src/components/sections/home/MushroomScrollStory/timeline.ts src/constants/content.ts
git commit -m "$(cat <<'EOF'
feat(home): add MushroomScrollStory timeline builder and captions

timeline.ts is a pure factory returning a GSAP timeline driven either
by scroll position (desktop) or play() (mobile). content.ts holds the
seven stage captions plus a reduced-motion fallback caption.

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 — Create `ReducedMotionStory` (static final-frame fallback)

**Files:**
- Create: `src/components/sections/home/MushroomScrollStory/ReducedMotionStory.tsx`

Renders only Frame 7 (Sunrise) with no animation, plus the reduced-motion caption. Section height collapses to content height — no min-height padding eats scroll real-estate.

- [ ] **Step 1: Create the variant folder if needed**

```bash
mkdir -p src/components/sections/home/MushroomScrollStory
```

- [ ] **Step 2: Write `ReducedMotionStory.tsx`**

```tsx
import { MUSHROOM_STORY } from "@/constants/content";
import Frame7Sunrise from "./frames/Frame7Sunrise";

export default function ReducedMotionStory() {
  return (
    <section
      className="relative w-full bg-prabha-night py-24"
      aria-label="PRABHA agriculture story"
    >
      <div className="max-w-md mx-auto px-6 flex flex-col items-center gap-8">
        <div className="relative w-full aspect-square max-w-sm">
          {/* Frame 7's drawable paths use strokeDashoffset=200 by default;
              for the static fallback we override the dashoffset to 0 inline
              via a wrapper class so the SVG renders fully drawn. */}
          <div className="reduced-motion-render absolute inset-0">
            <Frame7Sunrise />
          </div>
          {/* Force the PRABHA wordmark visible (frame's default opacity is 0) */}
          <style>{`
            .reduced-motion-render .draw-frame-7,
            .reduced-motion-render .draw-frame-7-logo {
              stroke-dashoffset: 0 !important;
              opacity: 1 !important;
            }
          `}</style>
        </div>
        <p className="font-display italic text-prabha-cream text-lg text-center">
          {MUSHROOM_STORY.reducedMotionCaption}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

## Task 7 — Create `MobileStory` (one-shot reveal under 768px)

**Files:**
- Create: `src/components/sections/home/MushroomScrollStory/MobileStory.tsx`

Uses IntersectionObserver to play the timeline once when the section enters viewport. No pin, no scrub. After playback, mushrooms hold their final state.

- [ ] **Step 1: Write `MobileStory.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MUSHROOM_STORY } from "@/constants/content";
import { buildTimeline } from "./timeline";
import Frame1Spore from "./frames/Frame1Spore";
import Frame2Hyphae from "./frames/Frame2Hyphae";
import Frame3Mycelium from "./frames/Frame3Mycelium";
import Frame4Substrate from "./frames/Frame4Substrate";
import Frame5Pinning from "./frames/Frame5Pinning";
import Frame6Cluster from "./frames/Frame6Cluster";
import Frame7Sunrise from "./frames/Frame7Sunrise";

const SCOPE_ID = "mushroom-story-mobile";

export default function MobileStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      sectionRef.current.dataset.scope = SCOPE_ID;
      timelineRef.current = buildTimeline({
        scrollPin: false,
        scope: sectionRef.current,
      });
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && timelineRef.current) {
            timelineRef.current.play();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-prabha-night min-h-[150vh] flex flex-col items-center justify-center py-16"
      aria-label="PRABHA agriculture story"
      data-scope={SCOPE_ID}
    >
      <div className="relative w-full max-w-sm aspect-square">
        <Frame1Spore />
        <Frame2Hyphae />
        <Frame3Mycelium />
        <Frame4Substrate />
        <Frame5Pinning />
        <Frame6Cluster />
        <Frame7Sunrise />
      </div>

      <div className="mt-8 h-16 px-6 text-center">
        {MUSHROOM_STORY.captions.map((caption, i) => (
          <p
            key={i}
            className={`caption-stage-${i + 1} font-display italic text-prabha-cream text-base absolute left-0 right-0 px-6 opacity-0`}
          >
            {caption}
          </p>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

---

## Task 8 — Create `DesktopStory` (pinned, scrub-driven timeline)

**Files:**
- Create: `src/components/sections/home/MushroomScrollStory/DesktopStory.tsx`

The flagship variant. Pin engages when section top hits viewport top, scrub maps scroll progress to the 10s timeline.

- [ ] **Step 1: Write `DesktopStory.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { MUSHROOM_STORY } from "@/constants/content";
import { buildTimeline } from "./timeline";
import Frame1Spore from "./frames/Frame1Spore";
import Frame2Hyphae from "./frames/Frame2Hyphae";
import Frame3Mycelium from "./frames/Frame3Mycelium";
import Frame4Substrate from "./frames/Frame4Substrate";
import Frame5Pinning from "./frames/Frame5Pinning";
import Frame6Cluster from "./frames/Frame6Cluster";
import Frame7Sunrise from "./frames/Frame7Sunrise";

const SCOPE_ID = "mushroom-story-desktop";

export default function DesktopStory() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      sectionRef.current.dataset.scope = SCOPE_ID;
      buildTimeline({
        scrollPin: true,
        scope: sectionRef.current,
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-prabha-night min-h-screen flex flex-col items-center justify-center"
      aria-label="PRABHA agriculture story"
      data-scope={SCOPE_ID}
    >
      <div className="relative w-full max-w-md aspect-square">
        <Frame1Spore />
        <Frame2Hyphae />
        <Frame3Mycelium />
        <Frame4Substrate />
        <Frame5Pinning />
        <Frame6Cluster />
        <Frame7Sunrise />
      </div>

      <div className="absolute bottom-16 left-0 right-0 h-12 px-6 text-center">
        {MUSHROOM_STORY.captions.map((caption, i) => (
          <p
            key={i}
            className={`caption-stage-${i + 1} font-display italic text-prabha-cream text-xl absolute left-0 right-0 px-6 opacity-0`}
          >
            {caption}
          </p>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit all three variants**

```bash
git add src/components/sections/home/MushroomScrollStory/DesktopStory.tsx src/components/sections/home/MushroomScrollStory/MobileStory.tsx src/components/sections/home/MushroomScrollStory/ReducedMotionStory.tsx
git commit -m "$(cat <<'EOF'
feat(home): add MushroomScrollStory variants (desktop, mobile, reduced-motion)

DesktopStory: pinned + scrubbed timeline (>=768px)
MobileStory: IntersectionObserver one-shot reveal (<768px)
ReducedMotionStory: static Frame 7 only (prefers-reduced-motion: reduce)

Each variant renders the same seven frame components from a shared
folder, with the timeline factory deciding play behavior.

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 — Create the orchestrator `index.tsx` and integrate into `page.tsx`

**Files:**
- Create: `src/components/sections/home/MushroomScrollStory/index.tsx`
- Modify: `src/app/page.tsx`

The orchestrator picks one of three variants based on hooks, then renders it. The home page imports it dynamically with `ssr: false` to keep it out of the critical FCP/LCP path.

- [ ] **Step 1: Write `index.tsx`**

```tsx
"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import DesktopStory from "./DesktopStory";
import MobileStory from "./MobileStory";
import ReducedMotionStory from "./ReducedMotionStory";

export default function MushroomScrollStory() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (reducedMotion) return <ReducedMotionStory />;
  if (isMobile) return <MobileStory />;
  return <DesktopStory />;
}
```

- [ ] **Step 2: Modify `src/app/page.tsx` to dynamically import and place the section**

Replace the file's contents with:

```tsx
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/home/HeroSection";

const MushroomScrollStory = dynamic(
  () => import("@/components/sections/home/MushroomScrollStory"),
  { ssr: false },
);

export default function Home() {
  return (
    <main>
      <HeroSection />
      <MushroomScrollStory />
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit orchestrator + page integration**

```bash
git add src/components/sections/home/MushroomScrollStory/index.tsx src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat(home): wire MushroomScrollStory into home page

Add variant-routing orchestrator (index.tsx) that picks
ReducedMotion / Mobile / Desktop based on user prefs and viewport.
page.tsx dynamic-imports it with ssr: false to keep it out of
the FCP/LCP critical path.

Refs: TODO P-01

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 — Manual browser verification

**Files:** none (verification only)

This is the qualitative gate. We can't unit-test "does the animation feel right" — we need eyes on the screen.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Run this with `run_in_background: true` if dispatching from a subagent — leave it running through verification, kill at the end.

Expected output includes `Local: http://localhost:3000`.

- [ ] **Step 2: Open `http://localhost:3000` in Chrome and verify desktop**

Manual checks:
- [ ] Hero section renders normally on top
- [ ] Mushroom story section appears below hero, on dark `prabha-night` background
- [ ] As you scroll into the section, it pins to the top of the viewport
- [ ] Continuing to scroll scrubs through 7 stages: spore → hyphae → mycelium → substrate bag → pinning → cluster → sunrise
- [ ] Each stage's line art draws in via stroke animation (NOT just fades in)
- [ ] Captions appear and fade per stage
- [ ] PRABHA wordmark fades in at the very end of stage 7
- [ ] After stage 7 completes, scrolling continues normally and section unpins
- [ ] No console errors

- [ ] **Step 3: Verify performance with Chrome DevTools Performance tab**

Open DevTools → Performance → Record → scroll through the section → Stop.

Look for:
- [ ] No frames longer than 16ms during the scroll-pin phase
- [ ] No layout-shift events
- [ ] Main thread is mostly idle (animation is on compositor)

If any frame exceeds 16ms: report DONE_WITH_CONCERNS with the screenshot of the flame graph and which paths are causing repaints.

- [ ] **Step 4: Verify mobile fallback**

Open DevTools → Toggle Device Toolbar (Ctrl+Shift+M) → Choose "iPhone 14 Pro" → Refresh page.

Manual checks:
- [ ] Section does NOT pin
- [ ] As you scroll into it (≥30% visible), the 7-stage animation auto-plays once over ~10 seconds
- [ ] After playback completes, mushrooms remain in their final state
- [ ] You can scroll past the section normally (no stuck pin)

- [ ] **Step 5: Verify reduced-motion fallback**

In DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → set to "reduce". Refresh.

Manual checks:
- [ ] Section is short (auto height, ~1 viewport or less)
- [ ] Only Frame 7 (Rising Sun + PRABHA wordmark) renders, fully drawn
- [ ] Caption shows "From spore to harvest — the PRABHA story."
- [ ] No animation is triggered when scrolling into the section

- [ ] **Step 6: Run Lighthouse mobile audit**

DevTools → Lighthouse → Device: Mobile → Categories: Performance → Analyze page load.

Expected: Performance score ≥ 90.

If under 90: report which audits failed (likely candidates: LCP if hero changed, TBT if GSAP runs synchronously). Investigate before proceeding.

- [ ] **Step 7: Stop the dev server**

If running in background: kill the process. If foreground: Ctrl+C in its terminal.

---

## Task 11 — Final verification + acceptance criteria check

**Files:** none (verification only)

- [ ] **Step 1: Confirm all expected files exist**

```bash
cd "C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development"
ls src/hooks/
ls src/constants/
ls src/components/sections/home/MushroomScrollStory/
ls src/components/sections/home/MushroomScrollStory/frames/
```

Expected output across all four directories:
- `src/hooks/`: `useMediaQuery.ts  usePrefersReducedMotion.ts`
- `src/constants/`: `content.ts`
- `src/components/sections/home/MushroomScrollStory/`: `DesktopStory.tsx  MobileStory.tsx  ReducedMotionStory.tsx  frames  index.tsx  timeline.ts`
- `frames/`: `Frame1Spore.tsx  Frame2Hyphae.tsx  Frame3Mycelium.tsx  Frame4Substrate.tsx  Frame5Pinning.tsx  Frame6Cluster.tsx  Frame7Sunrise.tsx`

- [ ] **Step 2: Final type-check**

```bash
npx tsc --noEmit
echo "---tsc-exit:$?---"
```

Expected: `tsc-exit:0`.

- [ ] **Step 3: Final branch state**

```bash
git log --oneline main..HEAD
git diff --stat main..HEAD
git status
```

Expected: 5 commits ahead of main (hooks → frames → timeline+captions → variants → orchestrator+page). Working tree clean.

- [ ] **Step 4: Acceptance criteria check (from spec §6)**

Run through every checkbox in spec §6 and verify each is satisfied:

```bash
# AC1: All 15 new files
find src/components/sections/home/MushroomScrollStory src/hooks/useMediaQuery.ts src/hooks/usePrefersReducedMotion.ts -type f | wc -l
```

Expected: at least 15 files (16 with the addition of `src/constants/content.ts`).

```bash
# AC verifying class-name conventions
grep -r "draw-frame-" src/components/sections/home/MushroomScrollStory/frames/ | wc -l
```

Expected: ≥ 30 occurrences across all 7 frames.

If any AC from spec §6 fails, report DONE_WITH_CONCERNS with the failing AC and what's missing.

---

## Task 12 — HUMAN approval gate

**Files:** none (this is a pause point)

Per spec §5.4, Claude does NOT push or open a PR until Gaurav explicitly approves.

- [ ] **Step 1: Print the diff summary for Gaurav**

```bash
cd "C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development"
git log --oneline main..HEAD
echo "---"
git diff --stat main..HEAD
```

Show the output to Gaurav along with this prompt:

> "Five commits on `feature/mushroom-scroll-story`:
> 1. Hooks (useMediaQuery + usePrefersReducedMotion)
> 2. Frame 1-7 SVGs
> 3. Timeline + captions
> 4. Three variant components
> 5. Orchestrator + page integration
>
> All AC met. Type-check passes. Manual browser tests passed (desktop pin + scrub, mobile one-shot, reduced-motion static). Lighthouse mobile Performance ≥ 90.
>
> Approve to push and open PR?"

- [ ] **Step 2: WAIT for Gaurav's response**

If Gaurav says approve / proceed / yes / push / 👍 → continue to Task 13.
If Gaurav says wait / no / changes → STOP, address feedback, re-run Task 11 verification, return to this gate.

---

## Task 13 — Push + open PR + update tracking docs

**Files:**
- Modify: `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Document/TODO.md`
- Modify: `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Document/ClaudeInstructions.md`

- [ ] **Step 1: Push the branch**

```bash
cd "C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development"
git push -u origin feature/mushroom-scroll-story
```

Expected: branch is created on `origin` and tracks `origin/feature/mushroom-scroll-story`.

- [ ] **Step 2: Open the PR via `gh`**

```bash
gh pr create --base main --head feature/mushroom-scroll-story --title "feat(home): mushroom scroll story — pinned timeline animation (P-01)" --body "$(cat <<'EOF'
## Summary
Implements P-01 — the signature seed→mycelium→mushroom scroll animation for the home page. Pinned timeline on desktop, IntersectionObserver one-shot on mobile, static final-frame for reduced-motion users.

## Changes
- 16 new files in `src/components/sections/home/MushroomScrollStory/` (orchestrator, 3 variant components, 7 frame components, timeline factory)
- 2 new hooks in `src/hooks/` (useMediaQuery, usePrefersReducedMotion)
- New `src/constants/content.ts` with MUSHROOM_STORY captions
- `src/app/page.tsx` — dynamic-import the section between Hero and (future) Philosophy

## Spec
docs/superpowers/specs/2026-05-07-mushroom-scroll-animation-design.md

## Verification
- [x] npx tsc --noEmit passes
- [x] Desktop pin + scrub + 7-stage draw verified at 60fps in Chrome DevTools
- [x] Mobile fallback (one-shot reveal) verified in DevTools mobile emulation
- [x] Reduced-motion fallback verified (DevTools Rendering panel)
- [x] Lighthouse mobile Performance >= 90
- [ ] Manual visual verification on real iOS Safari (post-merge by Gaurav)

## Out of scope (intentionally)
- Hindi caption translation -> Phase 2 i18n
- Sound design / music -> Phase 2
- Interactive hover effects on mushrooms -> Phase 2

## Merge style
Squash merge (collapses 5 branch commits into 1 on main).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: `gh` prints the PR URL. Capture it for the next steps.

- [ ] **Step 3: Update `Document/TODO.md`**

Edit `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Document/TODO.md` — find P-01:

**Before:**
```
| P-01 | Mushroom scroll animation — design & approach decision | 🔴 High | ❓ Needs Input | Decision: pure GSAP/SVG vs Lottie file. Recommend GSAP — no file dependency. Full discussion needed. |
```

**After (use actual PR URL):**
```
| P-01 | Mushroom scroll animation — design & approach decision | 🔴 High | ✅ Done | Implemented as pinned GSAP timeline + line-art SVGs — PR <PR_URL>. Spec at docs/superpowers/specs/2026-05-07-mushroom-scroll-animation-design.md |
```

- [ ] **Step 4: Append Entry 016 to `ClaudeInstructions.md`**

Edit `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Document/ClaudeInstructions.md`. Find the existing line:

```
## Next Steps — What Comes After Content Collection
```

Insert this Entry 016 ABOVE that line:

```markdown
---

### Entry 016
**Date:** 2026-05-07
**Topic:** P-01 Mushroom Scroll Animation — Spec, Plan, Implementation, PR

#### Instruction Given
> Continue with P-01 (mushroom seed→mycelium→mushroom GSAP scroll animation design). Use the visual companion for storyboard decisions. Pinned timeline on desktop, mobile fallback required.

#### What Claude Processed
- Used the brainstorming skill with visual companion to walk through scroll behavior, visual style, 7-stage storyboard, and mobile fallback decisions
- Validated each decision section-by-section before writing the spec
- Refined the original storyboard from "seed → plant → mushroom" (mixed metaphor) to authentic mushroom lifecycle (spore → hyphae → mycelium → substrate → pinning → cluster → sunrise)
- Discovered Tailwind token mismatch (spec used wrong amber hex) and corrected the spec before plan-writing
- Built the implementation via subagent-driven-development: 13 tasks executed sequentially, with type-check and manual browser verification gates

#### Output Produced
- **Spec:** docs/superpowers/specs/2026-05-07-mushroom-scroll-animation-design.md
- **Plan:** docs/superpowers/plans/2026-05-07-mushroom-scroll-animation.md
- **Code:** 16 new files in src/components/sections/home/MushroomScrollStory/, 2 new hooks, new src/constants/content.ts, page.tsx integration
- **PR:** <PR_URL> — squash-merge to main

#### Quality Gates Passed
- ✅ npx tsc --noEmit clean
- ✅ Desktop pin + scrub + 7-stage stroke-dashoffset draw verified at 60fps
- ✅ Mobile fallback (IntersectionObserver one-shot) verified
- ✅ Reduced-motion fallback (static Frame 7) verified
- ✅ Lighthouse mobile Performance ≥ 90

#### Status
`✅ Done — PR Opened` — All implementation tasks complete. Will move to fully ✅ Done after merge.

#### Feedback / Notes
- Visual companion was invaluable for the storyboard decisions — being able to see actual SVG renderings side-by-side made the line-art-vs-flat-vs-gradient choice obvious
- Two new reusable hooks (useMediaQuery + usePrefersReducedMotion) will be reused for cookie banner (P-07), parallax effects, and other responsive components
- src/constants/content.ts is now bootstrapped — future content tasks (D-06) extend it rather than create it

---
```

- [ ] **Step 5: Update the "Last updated" footer in ClaudeInstructions.md**

Find and edit:

```
*Last updated: 2026-05-07 | Maintained by Claude (claude-opus-4-7) for Gaurav's PRABHA Agritech website rebuild project*
```

(Date may already be 2026-05-07 — confirm and leave as-is if so.)

- [ ] **Step 6: Final report to Gaurav**

Print:
> "PR opened: <PR_URL>
> Title: feat(home): mushroom scroll story — pinned timeline animation (P-01)
> 5 commits on the branch, will squash-merge to one commit on main when you click Merge.
>
> TODO.md updated (P-01 ✅ Done with PR link).
> ClaudeInstructions.md Entry 016 appended.
>
> Merge is your call — review on GitHub, then squash-merge from the UI. After merge I can delete the branch."

---

## Acceptance Criteria (from spec §6)

- [ ] All expected files exist per the file table at the top of this plan
- [ ] Both new hooks (`useMediaQuery`, `usePrefersReducedMotion`) work standalone
- [ ] On desktop ≥768px, scrolling pins the section, scrubs through 7 stages, with stroke-dashoffset drawing visible
- [ ] All 7 captions appear in time with their stages
- [ ] On mobile <768px, the section does NOT pin; IntersectionObserver triggers a 4-second auto-play of all stages
- [ ] With `prefers-reduced-motion: reduce`, only Frame 7 renders, no animation
- [ ] Component is dynamically imported with `ssr: false`
- [ ] `npx tsc --noEmit` passes
- [ ] Lighthouse mobile Performance score is ≥ 90
- [ ] No SSR hydration warnings in console
- [ ] Section visually matches the §3.3 storyboard table

---

## Rollback

If this plan needs to be aborted partway through:

```bash
# If commits are local-only (Tasks 1-11):
git checkout main
git branch -D feature/mushroom-scroll-story

# If branch is pushed but PR not merged (after Task 13):
gh pr close <PR_NUMBER>
git push origin --delete feature/mushroom-scroll-story
git checkout main
git branch -D feature/mushroom-scroll-story
```

No third-party packages were installed by this plan, so there's nothing to npm-uninstall.
