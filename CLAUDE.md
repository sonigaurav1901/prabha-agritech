# CLAUDE.md — PRABHA Agritech Website
> Claude reads this file automatically at the start of every session in this folder.
> Do not delete this file. Update it as the project evolves.

---

## Project Overview

**Client:** Bharat Soni — CEO & Founder, PRABHA Agritech
**Developer:** Gaurav (with Claude Code)
**Purpose:** Agritech consulting website — mushroom farming, hydroponics, beekeeping, agri-training
**Live domain:** prabhaagritech.com
**Budget:** $0/month — free stack only, no exceptions

---

## Tech Stack (Non-Negotiable)

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript — strict mode, no `any` |
| Styling | Tailwind CSS only — no inline styles |
| UI Base | shadcn/ui |
| Animations | Framer Motion + GSAP + ScrollTrigger |
| Scroll Story | GSAP ScrollTrigger (seed → mushroom) |
| Particles | tsparticles |
| Database | Firebase Firestore (Spark plan — free, always on) |
| CMS | Sanity.io (free tier) |
| Email | Resend (free tier) |
| Hosting | Vercel (free tier) |
| Source Control | GitHub |

---

## Coding Standards

- **TypeScript strict** — no `any`, no implicit types
- **Functional components only** — no class components
- **Tailwind for all styling** — no inline styles, no CSS modules unless necessary
- **Framer Motion for UI animations** — entrance, hover, route transitions
- **GSAP for scroll-linked animations** — ScrollTrigger, timeline, pin
- **No direct database calls from components** — always use Repository layer (`src/lib/repositories/`)
- **No API keys in component code** — all in `.env.local`, server-side only
- **Dynamic imports for heavy libs** — GSAP, Three.js, tsparticles must be dynamically imported
- **All text content in labels file** — `src/constants/content.ts` — never hardcode strings in JSX
- **Add `metadata: {}` to every Firestore document** — for future extensibility

---

## Git Branching Rules

```
main        ← production branch (what prabhaagritech.com runs)
dev         ← integration branch (all features merge here first)
feature/*   ← new features (branch from dev)
fix/*       ← bug fixes (branch from dev)
hotfix/*    ← urgent production fixes (branch from main)
```

**Rules:**
- NEVER push directly to `main`
- NEVER push directly to `dev` — always use a feature branch + PR
- Feature branches: `feature/hero-section`, `feature/contact-form`, etc.
- Fix branches: `fix/navbar-mobile-menu`, `fix/form-validation`, etc.
- Merge flow: `feature/*` → PR → `dev` → test → PR → `main` → auto-deploy

**Commit message format:**
```
feat:     new feature
fix:      bug fix
style:    styling only
refactor: code restructure (no behavior change)
perf:     performance improvement
content:  content/copy changes
chore:    config, deps, tooling
```

---

## Folder Conventions

```
src/app/              ← pages and API routes (Next.js App Router)
src/components/       ← all React components
  layout/             ← Navbar, Footer, WhatsAppButton
  sections/           ← page sections (home/, about/, services/, etc.)
  ui/                 ← shadcn base components
  animations/         ← reusable animation wrappers
src/lib/              ← core logic
  firebase.ts         ← Firebase client
  sanity.ts           ← Sanity client
  email.ts            ← Resend helper
  repositories/       ← data access layer (one file per collection)
src/constants/        ← all static text and labels
  content.ts          ← ALL page text — headings, body, CTAs, labels
  colors.ts           ← design token references
src/data/             ← static structured data (no DB needed)
  verticals.ts        ← 5 service objects
  stats.ts            ← impact numbers
  roadmap.ts          ← 2025-2030 milestones
  navigation.ts       ← menu links
src/hooks/            ← custom React hooks
src/types/            ← shared TypeScript types
public/               ← static assets
  logo/               ← logo-light.svg, logo-dark.svg
  images/             ← hero, team, projects, verticals
  animations/         ← Lottie JSON files
```

---

## Key Files — Quick Reference

| File | Purpose |
|---|---|
| `src/constants/content.ts` | ALL text content — change text here, not in components |
| `src/lib/firebase.ts` | Firebase Firestore client initialization |
| `src/lib/sanity.ts` | Sanity client + GROQ query helpers |
| `src/lib/email.ts` | Resend email sending helper |
| `src/lib/repositories/` | All database access — never call Firebase directly from components |
| `src/app/layout.tsx` | Root layout — Navbar, Footer, WhatsApp button, fonts, metadata |
| `.env.local` | All secret keys — never commit this file |
| `.env.local.example` | Template of all required keys — safe to commit |

---

## What NOT to Do

- Do NOT install new packages without discussing first
- Do NOT modify `tailwind.config.ts` color tokens without updating `content.ts`
- Do NOT write Firebase code directly in components — use repositories
- Do NOT commit `.env.local` — it is in `.gitignore`
- Do NOT push to `main` directly — always PR from `dev`
- Do NOT add comments to code that hasn't been changed
- Do NOT add features beyond what is requested in a task
- Do NOT use paid services — everything must stay on free tiers
- Do NOT hardcode text strings in JSX — use `CONTENT` from `src/constants/content.ts`
- Do NOT use `any` type in TypeScript

---

## Animation Rules (Important)

- **GSAP ScrollTrigger** — for scroll-linked animations (seed→mushroom, roadmap timeline)
- **Framer Motion** — for entrance animations, hover effects, route transitions
- **tsparticles** — hero background particles only
- All heavy animation components must use `dynamic()` import with `{ ssr: false }`
- On mobile: reduce particle count, disable 3D, simplify scroll story
- Use `useGSAP()` hook (not `useEffect`) for GSAP — ensures proper cleanup
- Test all animations at 60fps before committing

---

## Planning Documents Location

All planning docs are at:
`C:\Users\gaura\OneDrive\Desktop\Claude Learn\Website_Dev\Document\`

| Document | Read When |
|---|---|
| `ProjectBlueprint.md` | Start of any session — full context |
| `ClaudeInstructions.md` | Full session history and decisions |
| `Architecture.md` | Building any new component or page |
| `FirebaseFirestoreGuide.md` | Working with Firebase |
| `TODO.md` | Checking what needs to be done next |

---

*Last updated: April 2026*
