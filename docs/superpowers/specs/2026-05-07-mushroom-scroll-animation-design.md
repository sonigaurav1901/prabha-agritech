# Mushroom Scroll Story Animation — Design Spec

**Date:** 2026-05-07
**Project:** PRABHA Agritech website rebuild
**TODO ref:** P-01 (Mushroom scroll animation — design & approach decision)
**Status:** Approved by Gaurav (2026-05-07) — pending implementation plan

---

## 1. Context

The original PRABHA Agritech rebuild plan (PrabhaAgritech_WebsiteRebuild.md, Entry 004) called for a "Seed-to-Mushroom Scroll Journey" as the signature home-page animation. Entry 011's gap analysis locked in **pure GSAP + SVG (no Lottie)** to avoid a 1.5MB bundle hit. P-01 has remained open as the highest-priority planning blocker.

This spec finalizes the storyline, visual style, scroll behavior, mobile fallback, and accessibility approach so implementation can begin.

## 2. Goals & non-goals

**Goals**
- A signature, scroll-linked animation that tells PRABHA's mushroom-cultivation story from spore to harvest
- Smooth 60fps on mid-tier desktop (4-core CPU, integrated GPU)
- Graceful mobile fallback that preserves narrative intent without scroll-pin fragility
- WCAG-compliant reduced-motion fallback
- Zero new paid dependencies (free GSAP only — no Club GSAP)
- Bundle cost under 50KB gzipped for the entire animation feature

**Non-goals (explicitly out of scope)**
- Lottie / external JSON animations (rejected per Entry 011)
- Three.js / WebGL effects (overkill, not in budget)
- Photographic backgrounds (we have those in the Hero already; this section is illustrated by design — visual rhythm)
- Music / sound design (Phase 2)
- Multi-language captions (Phase 2 — Hindi i18n is not yet in scope)
- Interactive elements within the animation (clicking a mushroom does nothing — read-only storytelling)

## 3. Design

### 3.1 Page placement

Sits between **HeroSection** (already built) and **PhilosophySection** (D-16). Page flow:

```
[Navbar — sticky]
[HeroSection — photo collage, "Rising Sun of Agriculture"]
[MushroomScrollStory — THIS SPEC]   ← inserts here
[PhilosophySection — Brand philosophy]
[VerticalsSection — 5 flip cards]
... rest of home page
```

### 3.2 Scroll behavior — pinned timeline

Section pins to viewport when its top edge reaches the top of the screen. Scrolling continues; that scroll progress is mapped (scrubbed) to a GSAP timeline that drives the animation. After the timeline completes, section unpins and the page scrolls normally.

**Pin distance:** `+=400%` (4 viewport heights of pinned scroll). At 60fps assumption + average scroll speed, this gives ~6–10 seconds of animation time per visit, which is the right pacing for a 7-stage story.

**Scrub:** `scrub: 1` (1-second smoothing) so the animation doesn't feel mechanically locked to wheel ticks.

### 3.3 Storyline — 7 stages

| # | Scroll % | Stage | Visual |
|---|---|---|---|
| 1 | 0% | **Dormant Spore** | Soil line + amber spore + soft amber glow halo |
| 2 | 15% | **Hyphae Emerge** | Spore + 5 white threads radiating into soil |
| 3 | 30% | **Mycelium Network** | Full branching white web underground (~12 path segments) |
| 4 | 50% | **Substrate Bag Colonized** | Cylindrical bag emerges from earth, mycelium hatch lines inside |
| 5 | 65% | **Pinning** | Bag with 5 small mushroom pins poking through sides |
| 6 | 85% | **Oyster Cluster** | Bag + 3 mature oyster mushroom clusters fanning out |
| 7 | 100% | **Rising Sun** | Sun + rays + amber halo + PRABHA wordmark fading in below horizon |

**Storyline rationale:** Replaces the original draft's stages 2–3 ("seed cracks → stem → leaf") which were botanically a plant, not a mushroom. The refined arc is biologically authentic and animates dramatically better in line art — viewers literally watch white mycelium threads draw themselves underground via stroke-dashoffset animation.

The 7-stage table above is the contract. The actual SVG path data and proportions are finalized during implementation when each `Frame*.tsx` component is built. The brainstorming session's preview HTML (gitignored under `.superpowers/`) shows the approved visual direction but is not a source-of-truth artifact.

### 3.4 Visual style — line art

- **Stroke color:** `#1B4332` (Tailwind token: `prabha-forest`) — primary stroke for all mushroom anatomy
- **Accent color:** `#D4A017` (Tailwind token: `prabha-amber`) — spore + sun + halo glow only
- **Stroke width:** 1.5px (most paths), 1px (mycelium threads), 1.8px (sun outline)
- **Stroke linecap:** `round`
- **No fills** except the spore (amber) and the sun halo (gradient)
- **No drop shadows or filters** — keep GPU cost low

### 3.5 Animation technique — stroke-dashoffset draw-in

Each stage's elements are SVG `<path>` (or grouped paths) with:

- Initial state: `stroke-dasharray: pathLength`, `stroke-dashoffset: pathLength` (path completely invisible)
- Animated state: `stroke-dashoffset: 0` (path fully drawn)

GSAP timeline tweens `stroke-dashoffset` from full → 0 as scroll advances through that stage's range. Effect: the mushroom appears to be drawn line-by-line in real time as the user scrolls.

For each stage transition:
- Outgoing elements that no longer fit the scene (e.g., spore in stages 4+) fade out via opacity
- Incoming elements draw in via stroke-dashoffset
- Persistent elements (e.g., substrate bag in stages 4–6) hold steady

### 3.6 Captions

Each stage has an on-screen caption that fades in 100ms after the stage's visual starts drawing and fades out 100ms before the next stage begins.

| Stage | Caption text |
|---|---|
| 1 | *"Every harvest begins as a single spore."* |
| 2 | *"It awakens, threads reaching into the soil."* |
| 3 | *"A hidden network — mycelium — spreads beneath."* |
| 4 | *"The substrate is colonized. Life takes hold."* |
| 5 | *"Pins emerge — the moment of birth."* |
| 6 | *"Oyster clusters bloom, ready for harvest."* |
| 7 | *"PRABHA — the rising sun of Indian agriculture."* |

Caption font: `font-display` (Orbitron per CLAUDE.md), italic, 1.25rem, white text on the dark forest section background. Position: bottom-center of viewport while pinned.

Captions live in `src/constants/content.ts` under `MUSHROOM_STORY.captions[]` so they're translatable later.

### 3.7 Mobile fallback (<768px viewport)

Detect via `useMediaQuery('(max-width: 767px)')`. Render a separate component:

- **No pin.** Section is normal-flow with height `min-h-[150vh]`.
- **One-shot reveal** triggered by IntersectionObserver: when section enters viewport (threshold 0.3), play the entire 7-stage timeline as a 4-second auto-sequence using GSAP's same timeline, but without `scrollTrigger.scrub`.
- All 7 stages remain visible and use the same SVGs as desktop (we re-use the asset, not re-author it for mobile).
- After the sequence completes, mushrooms hold their final state and the page continues normally.

This eliminates iOS Safari pin-scroll bugs entirely and keeps mobile scroll cost low.

### 3.8 Reduced-motion fallback

Detect via `usePrefersReducedMotion()` hook (custom; reads `window.matchMedia('(prefers-reduced-motion: reduce)')`).

When reduced motion is preferred:
- Render the **final-state SVG only** (stage 7 — sun + horizon + PRABHA wordmark)
- No animation, no scrub, no pin
- Caption: a single static line — *"From spore to harvest — the PRABHA story."*
- Section height: `auto` (just content height, no min-height padding)

This satisfies WCAG 2.1 SC 2.3.3 and gives a respectful experience to users with vestibular disorders.

### 3.9 Performance budget

| Metric | Target | Notes |
|---|---|---|
| Bundle (gzip) | <50KB | GSAP core + ScrollTrigger ≈ 38KB; component itself <12KB |
| Initial render | <16ms | Component is below-the-fold; lazy via dynamic import |
| Animation frame budget | <16ms (60fps) | Only `stroke-dashoffset`, `opacity`, and `transform` are tweened — all GPU-cheap |
| First paint impact | 0ms | `dynamic(() => import(...), { ssr: false })` — never blocks FCP/LCP |
| Layout shift contribution | 0 | Section has fixed `min-height` reserved on render |

### 3.10 Component file structure

```
src/components/sections/home/
├── MushroomScrollStory/
│   ├── index.tsx                 ← orchestrator: media query + reduced-motion routing
│   ├── DesktopStory.tsx          ← pinned timeline + scrub (≥768px)
│   ├── MobileStory.tsx           ← one-shot reveal (<768px)
│   ├── ReducedMotionStory.tsx    ← static final frame
│   ├── frames/
│   │   ├── Frame1Spore.tsx
│   │   ├── Frame2Hyphae.tsx
│   │   ├── Frame3Mycelium.tsx
│   │   ├── Frame4Substrate.tsx
│   │   ├── Frame5Pinning.tsx
│   │   ├── Frame6Cluster.tsx
│   │   └── Frame7Sunrise.tsx
│   ├── timeline.ts               ← buildTimeline(refs) — pure function returning gsap.timeline
│   └── captions.ts               ← stage caption metadata (mirrors content.ts MUSHROOM_STORY.captions)
└── home/page.tsx                 ← imports MushroomScrollStory dynamically
```

**Why this structure:**
- One file per frame keeps each SVG focused (~30–80 lines each), easy to tweak art independently
- `timeline.ts` is the only file that knows about GSAP — keeps the rest of the code framework-agnostic
- Three story variants (Desktop / Mobile / ReducedMotion) are explicit instead of conditional logic in one file
- The `frames/` folder is reusable across all three variants

### 3.11 Hooks needed

Two custom hooks (new):

- `useMediaQuery(query: string): boolean` — standard SSR-safe media query hook
- `usePrefersReducedMotion(): boolean` — reads `prefers-reduced-motion: reduce`

Both go in `src/hooks/`. They're independent, testable, and reusable across other components (cookie banner, parallax effects, etc.).

## 4. Files changed

| Path | Action | Lines (est.) |
|---|---|---|
| `src/components/sections/home/MushroomScrollStory/index.tsx` | Create | ~50 |
| `src/components/sections/home/MushroomScrollStory/DesktopStory.tsx` | Create | ~80 |
| `src/components/sections/home/MushroomScrollStory/MobileStory.tsx` | Create | ~50 |
| `src/components/sections/home/MushroomScrollStory/ReducedMotionStory.tsx` | Create | ~30 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame1Spore.tsx` | Create | ~40 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame2Hyphae.tsx` | Create | ~50 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame3Mycelium.tsx` | Create | ~80 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame4Substrate.tsx` | Create | ~70 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame5Pinning.tsx` | Create | ~70 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame6Cluster.tsx` | Create | ~90 |
| `src/components/sections/home/MushroomScrollStory/frames/Frame7Sunrise.tsx` | Create | ~60 |
| `src/components/sections/home/MushroomScrollStory/timeline.ts` | Create | ~120 |
| `src/components/sections/home/MushroomScrollStory/captions.ts` | Create | ~20 |
| `src/hooks/useMediaQuery.ts` | Create | ~20 |
| `src/hooks/usePrefersReducedMotion.ts` | Create | ~20 |
| `src/constants/content.ts` | Modify (or Create if missing) | +12 — add `MUSHROOM_STORY.captions` |
| `src/app/page.tsx` | Modify | +5 — dynamic import + place between Hero and Philosophy |

Total: 15 new files, 2 modifications, ~870 new lines (most of it SVG path data).

## 5. Implementation, verification & git workflow

### 5.1 Verification

- **`npx tsc --noEmit`** must pass
- **Manual browser test desktop** — scroll through, verify pin engages, all 7 stages draw, captions appear, smooth at 60fps. Use Chrome DevTools Performance panel; flame graph must show no >16ms frames.
- **Manual browser test mobile** (Chrome DevTools mobile emulation, iPhone 14 Pro) — verify no pin, IntersectionObserver triggers reveal, animation plays once and holds final state.
- **Reduced-motion test** — enable "Reduce motion" in OS settings (or DevTools Rendering panel → Emulate CSS media `prefers-reduced-motion: reduce`). Verify only Frame 7 renders, no animation.
- **Lighthouse mobile audit** — Performance score ≥ 90 on the home page after this section is added (acceptance criterion CLAUDE.md).

### 5.2 Branch

`feature/mushroom-scroll-story` off `main`. Same flow as P-02 PR.

### 5.3 Commit plan

Multiple atomic commits on the branch, squash-merged at PR time. Suggested split:

1. `feat(hooks): add useMediaQuery and usePrefersReducedMotion`
2. `feat(home): add MushroomScrollStory frames 1–7 (line art SVGs)`
3. `feat(home): wire MushroomScrollStory desktop pinned timeline`
4. `feat(home): wire MushroomScrollStory mobile + reduced-motion fallbacks`
5. `feat(home): integrate MushroomScrollStory into page.tsx`
6. `content: add MUSHROOM_STORY.captions to content.ts`

Each commit independently passes type-check.

### 5.4 Approval gate before PR

After all commits land locally and the manual tests pass, **Claude stops and shows Gaurav** the diff summary, the branch's commit log, and a screen recording or screenshot reference. Claude does NOT push or open a PR until Gaurav explicitly says "approve" / "proceed".

### 5.5 PR title and body

**Title:** `feat(home): mushroom scroll story — pinned timeline animation (P-01)`

**Body:**
```markdown
## Summary
Implements P-01 — the signature seed→mycelium→mushroom scroll animation for the home page. Pinned timeline on desktop, one-shot reveal on mobile, static final-frame for reduced-motion users.

## Changes
- 15 new files in `src/components/sections/home/MushroomScrollStory/` (orchestrator, 3 variant components, 7 frames, timeline, captions)
- 2 new hooks in `src/hooks/` (useMediaQuery, usePrefersReducedMotion)
- `src/constants/content.ts` — add MUSHROOM_STORY.captions
- `src/app/page.tsx` — dynamic-import the section between Hero and Philosophy

## Spec
docs/superpowers/specs/2026-05-07-mushroom-scroll-animation-design.md

## Verification
- [x] npx tsc --noEmit passes
- [x] Desktop pin + scrub + 7-stage draw verified at 60fps in Chrome
- [x] Mobile fallback (one-shot reveal) verified in DevTools mobile emulation
- [x] Reduced-motion fallback verified
- [x] Lighthouse mobile Performance ≥ 90

## Out of scope (intentionally)
- Hindi caption translation → Phase 2 i18n
- Sound design / music → Phase 2
- Interactive hover effects on mushrooms → Phase 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5.6 Merge

**Squash merge** (matches P-02 precedent). Six branch commits collapse to one on `main`.

## 6. Acceptance criteria

- [ ] All 15 new files exist and follow the file structure in §3.10
- [ ] Both new hooks (`useMediaQuery`, `usePrefersReducedMotion`) work standalone (smoke test by importing them in a test page)
- [ ] On desktop ≥768px, scrolling the home page pins the section, scrubs through 7 stages, with each stage's stroke-dashoffset drawing visible
- [ ] All 7 captions appear in time with their stages
- [ ] On mobile <768px, the section does NOT pin; IntersectionObserver triggers a 4-second auto-play of all stages
- [ ] With `prefers-reduced-motion: reduce`, only Frame 7 (Rising Sun) renders, no animation
- [ ] Component is dynamically imported with `ssr: false` and does not contribute to FCP/LCP
- [ ] `npx tsc --noEmit` passes
- [ ] Lighthouse mobile Performance score is ≥ 90 on the home page after integration
- [ ] No `prefers-reduced-motion`/`useMediaQuery` SSR hydration warnings in console
- [ ] Section visually matches the 7-stage table in §3.3 — each frame's elements (spore, hyphae, mycelium, bag, pins, cluster, sun) are present and distinguishable

## 7. Out of scope but related (Phase 2 candidates)

- Hindi captions (i18n)
- Sound design — gentle ambient growth sounds tied to stage transitions
- Interactive hover — mushroom caps respond to mouse hover after final stage
- Stage 7 logo animation upgrade — animated mark drawing instead of static fade-in
- Reusable `<DrawnSVG>` wrapper component if the line-art aesthetic gets adopted in other sections (e.g., 5-verticals flip cards)

---

*Approved by Gaurav 2026-05-07. Next step: writing-plans skill produces the implementation plan.*
