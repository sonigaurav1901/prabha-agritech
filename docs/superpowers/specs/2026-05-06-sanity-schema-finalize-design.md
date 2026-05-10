# Sanity Schema Finalize — Design Spec

**Date:** 2026-05-06
**Project:** PRABHA Agritech website rebuild
**TODO ref:** P-02 (Sanity schema)
**Status:** Approved by Gaurav (2026-05-06) — pending implementation plan

---

## 1. Context

Sanity schemas were drafted on 2026-04-30 in `src/sanity/schemas/` (work was uncommitted and unlogged). All 6 required document types from TODO P-02 exist (`post`, `teamMember`, `testimonial`, `project`, `vertical`, `workshop`) plus 2 supporting types (`category`, `partner`) and an `index.ts` that registers them. The schemas are well-structured: validation rules, previews, orderings, and required-field markers are in place.

This spec finalizes the schemas with three targeted changes so the work can be committed and the next blocker (D-08, Sanity Studio setup) is unblocked.

## 2. Goals & non-goals

**Goals**
- Allow YouTube embeds in blog post body
- Allow callouts (5 agritech-flavored variants) in blog post body
- Fix the fragile cross-field date validation on `workshop.endDate`
- Commit the result on a feature branch

**Non-goals (explicitly out of scope)**
- Sanity Studio setup (`sanity.config.ts`, deskStructure) — deferred to D-08
- Creating the Sanity project at sanity.io — blocked on Gaurav (S-07)
- Writing the Sanity client (`src/lib/sanity.ts`) and GROQ queries — deferred to D-04
- Migrating the 8 existing blog posts from prabhaagritech.com — content task for later
- `siteSettings` singleton — contradicts CLAUDE.md ("All text content in `src/constants/content.ts`")
- Multi-author posts, hex colors on `vertical`, or any other YAGNI extensions

## 3. Design

### 3.1 New block: `youtube`

A reusable inline object usable wherever Portable Text accepts custom blocks. For now, registered only in `post.body`.

```ts
defineType({
  name: 'youtube',
  title: 'YouTube Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      validation: (r) => r.required().uri({ scheme: ['https'] }),
    }),
    defineField({ name: 'caption', type: 'string' }),
  ],
  preview: { select: { title: 'url', subtitle: 'caption' } },
})
```

**Notes:**
- No video-ID field — frontend extracts ID from URL with a small helper.
- Caption is optional (visually rendered as `<figcaption>` if present).
- Frontend renderer should lazy-load the iframe (e.g., `react-lite-youtube-embed` or a click-to-play wrapper) for performance.

### 3.2 New block: `callout`

5 fixed variants. Variant drives icon and color in the frontend mapping; Sanity stores only the variant key.

```ts
defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      type: 'string',
      options: {
        list: [
          { title: '💡 Pro Tip',       value: 'tip' },
          { title: '⚠️ Watch Out',     value: 'warning' },
          { title: '📌 Quick Note',    value: 'note' },
          { title: '✅ Best Practice', value: 'success' },
          { title: '🌱 Field Story',   value: 'case' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'title', type: 'string' }), // optional — variant default heading shown if blank
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }] }],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { variant: 'variant', title: 'title' },
    prepare: ({ variant, title }) => ({
      title: title || `${variant} callout`,
      subtitle: variant,
    }),
  },
})
```

**Why this shape:**
- `variant` enforces design consistency. 5 variants ≥ 4 costs nothing and the "Field Story" type maps to PRABHA's existing content style (farmer anecdotes already feature in the live blog).
- `title` is optional; if blank the frontend renders the default "💡 Pro Tip" / "🌱 Field Story" header.
- `body` is rich text but with only `Normal` block style — callouts must not contain h2/h3.
- Color + icon mapping lives in the frontend (`src/components/blog/Callout.tsx`), not Sanity. This keeps content separate from presentation.

### 3.3 Fix: `workshop.endDate` cross-field validation

`Rule.valueOfField()` exists in Sanity v3 but does not always re-validate when the referenced field changes and is brittle under `liveEdit`. Replace with the documented v3 custom-validation pattern:

**Before:**
```ts
validation: (r) =>
  r.required().min(r.valueOfField('startDate')).error('End date must be after start date'),
```

**After:**
```ts
validation: (r) =>
  r.required().custom((endDate, ctx) => {
    const start = (ctx.document as Record<string, unknown> | undefined)?.startDate as string | undefined
    if (!start || !endDate) return true
    return new Date(endDate as string) >= new Date(start) || 'End date must be on or after start date'
  }),
```

### 3.4 Decisions intentionally NOT made today

| Possible issue | Verdict | Reason |
|---|---|---|
| `project.startedYear` evaluates `new Date().getFullYear()` at module load | Leave | Stale by ≤1 year; Studio reloads cycle absorbs it |
| `category.color` validation uses `.warning()` not `.error()` | Leave | Optional field; soft warning is correct |
| `teamMember` has 5 separate social URL fields | Leave | Explicit > generic array — better Studio UX |
| `post.author` is single ref (no co-authors) | Leave | YAGNI — not needed for current 8 posts |
| No `siteSettings` singleton | Leave | Contradicts CLAUDE.md |
| `vertical.colorTheme` is enum, no hex | Leave | Frontend mapping is the right home for design tokens |

## 4. Files changed

| File | Change |
|---|---|
| `src/sanity/schemas/blocks/youtube.ts` | **NEW** — inline object schema (3.1) |
| `src/sanity/schemas/blocks/callout.ts` | **NEW** — inline object schema (3.2) |
| `src/sanity/schemas/post.ts` | Add `youtube` and `callout` to `body.of[]`; import from `./blocks/` |
| `src/sanity/schemas/workshop.ts` | Replace `endDate` validation (3.3) |
| `src/sanity/schemas/index.ts` | No change — `youtube` and `callout` are inline objects (used inline in document fields), not standalone document types |

`blocks/` subfolder convention keeps inline-object schemas separate from document schemas. Future inline blocks (e.g., `quote`, `gallery`) go here too.

## 5. Implementation, verification & git workflow

### 5.1 Verification

- **No runtime verification possible today.** Sanity Studio (D-08) is not set up, so the `sanity` package's type-check and runtime validation cannot run locally yet. Validation will surface when Studio first loads.
- **Type-check gate:** `npx tsc --noEmit` must pass in the Development folder after changes — that's the only safety net we have before D-08.

### 5.2 Branch

`feature/sanity-schema-finalize` branched off `main`. (No `dev` branch exists yet — this is the first feature branch and establishes the flow described in CLAUDE.md.)

### 5.3 Commit plan — two commits on the same branch

**Commit 1 — baseline** (the previously uncommitted Apr 30 work: Next.js scaffolding + all 8 schemas as drafted + `index.ts`):

```
chore(setup): scaffold Next.js project and draft Sanity schemas

- Next.js 14 + Tailwind + animation libs scaffolded (GSAP,
  Framer Motion, tsparticles)
- 8 Sanity document schemas drafted (post, category, teamMember,
  testimonial, project, vertical, workshop, partner)
- schemas/index.ts registers all document types

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
```

**Commit 2 — today's design changes** (matches §4 file changes):

```
feat(sanity): finalize content schemas with YouTube + callout blocks

- Add youtube inline block (url + optional caption) for blog embeds
- Add callout inline block with 5 agritech-flavored variants:
  Pro Tip, Watch Out, Quick Note, Best Practice, Field Story
- Wire both blocks into post.body alongside existing block + image
- Fix workshop endDate cross-field validation: replace fragile
  Rule.valueOfField('startDate') with explicit r.custom() pattern
- Establish src/sanity/schemas/blocks/ folder for inline object types

Refs: TODO P-02
Spec: docs/superpowers/specs/2026-05-06-sanity-schema-finalize-design.md

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
```

Splitting commits keeps "what was already there" separable from "what we approved today" — useful when reviewing later.

### 5.4 Approval gate before PR

After both commits land locally and `npx tsc --noEmit` passes, **Claude stops and shows Gaurav the diff summary** (files changed, line counts, commit messages). Claude does NOT push or open a PR until Gaurav explicitly says "approve" / "proceed" / "create the PR".

### 5.5 Push + PR creation

Once approved:

1. `git push -u origin feature/sanity-schema-finalize`
2. Open PR via `gh pr create` with this title and body:

   **Title:** `feat(sanity): finalize content schemas with YouTube + callout blocks`

   **Body:**
   ```markdown
   ## Summary
   Finalizes Sanity content schemas (TODO P-02). Adds rich-text blocks for blog (YouTube embeds + 5 agritech-flavored callouts), fixes a fragile cross-field date validation on workshops, and commits the previously uncommitted Apr 30 scaffolding work.

   ## Changes
   - **New:** `src/sanity/schemas/blocks/youtube.ts` — YouTube embed block (url + caption)
   - **New:** `src/sanity/schemas/blocks/callout.ts` — 5-variant callout block (Pro Tip, Watch Out, Quick Note, Best Practice, Field Story)
   - **Edit:** `src/sanity/schemas/post.ts` — register new blocks in `body.of[]`
   - **Edit:** `src/sanity/schemas/workshop.ts` — replace `Rule.valueOfField` with `r.custom()` pattern for endDate
   - **Baseline:** Apr 30 Next.js scaffolding + all 8 document schemas (post, category, teamMember, testimonial, project, vertical, workshop, partner)

   ## Spec
   Full design: `docs/superpowers/specs/2026-05-06-sanity-schema-finalize-design.md`

   ## Verification
   - [x] `npx tsc --noEmit` passes
   - [ ] Sanity Studio runtime validation deferred to D-08

   ## Out of scope (intentionally)
   - Sanity Studio setup → D-08
   - Creating Sanity project at sanity.io → S-07 (blocked on Gaurav)
   - Sanity client + GROQ queries → D-04
   - Migrating existing 8 blog posts → content task

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

3. Print the PR URL back to Gaurav.

### 5.6 Merge

PR merge is **Gaurav's call**, not Claude's. Default merge style: **squash merge** to `main` (one PR = one commit on main, clean history). After merge: delete the feature branch.

## 6. Acceptance criteria

- [ ] `src/sanity/schemas/blocks/youtube.ts` exists and exports `youtube` defineType
- [ ] `src/sanity/schemas/blocks/callout.ts` exists and exports `callout` defineType with 5 variants in the radio list
- [ ] `post.body.of[]` includes `{ type: 'youtube' }` and `{ type: 'callout' }` alongside existing `block` and `image`
- [ ] `workshop.endDate` validation uses the `r.custom(...)` pattern from 3.3 — no references to `r.valueOfField`
- [ ] `npx tsc --noEmit` passes from `Development/` with no new errors
- [ ] All schema files committed on branch `feature/sanity-schema-finalize`

## 7. Out of scope but related (Phase 2 candidates)

- Quote / pull-quote block (`<blockquote>` styled)
- Image gallery block (multiple images with caption per row)
- Code block (if Bharat ever writes how-to posts with config snippets)
- Multi-author support (`post.coAuthors` array)
- Hindi (`hi`) translations on `post`, `vertical`, `workshop` once i18n strategy is decided

---

*Approved by Gaurav 2026-05-06. Next step: writing-plans skill produces the implementation plan.*
