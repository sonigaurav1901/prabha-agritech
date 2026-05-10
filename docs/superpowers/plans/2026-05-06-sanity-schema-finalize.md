# Sanity Schema Finalize — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the Sanity content schemas (TODO P-02) by adding YouTube + Callout blocks to blog rich text, fixing the workshop `endDate` cross-field validation, and committing the previously uncommitted Apr 30 work, all on a feature branch with a clean PR.

**Architecture:** Sanity v3 schema files in TypeScript, organized as document types under `src/sanity/schemas/` and inline object types under `src/sanity/schemas/blocks/`. Blocks (`youtube`, `callout`) are inline objects referenced from `post.body.of[]`, not registered as document types. Verification gate is `npx tsc --noEmit` (Sanity Studio runtime validation deferred to task D-08).

**Tech Stack:** Next.js 14, TypeScript strict, Sanity v3 (newly installed), `sanity` package.

**Spec:** `docs/superpowers/specs/2026-05-06-sanity-schema-finalize-design.md`

**Working directory:** `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development`

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `src/sanity/schemas/blocks/youtube.ts` | Create | Inline object: YouTube embed (url + caption) |
| `src/sanity/schemas/blocks/callout.ts` | Create | Inline object: 5-variant agritech callout |
| `src/sanity/schemas/post.ts` | Modify | Add youtube + callout to `body.of[]` |
| `src/sanity/schemas/workshop.ts` | Modify | Replace `endDate` validation with `r.custom()` pattern |
| `package.json` | Modify | Add `sanity` dependency |
| `package-lock.json` | Modify | Auto-updated by npm install |

`src/sanity/schemas/index.ts` is **not** modified — youtube and callout are inline objects, not document types, so they don't get registered there.

---

## Task 1 — Create feature branch and commit baseline (uncommitted Apr 30 work)

**Files:**
- Stage all currently untracked files in `Development/`

This task gets the existing scaffolding and Apr 30 schemas onto a branch as a clean baseline commit, so the design changes in Tasks 2–6 are reviewable in isolation.

- [ ] **Step 1: Verify clean state on `main`**

Run:
```bash
cd "C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Development"
git status
git branch --show-current
```

Expected: branch is `main`. Untracked files include `next.config.mjs`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `src/`, `tailwind.config.ts`, `tsconfig.json`. No tracked-but-modified files.

If branch is not `main`: `git checkout main` and re-run.
If there are tracked-modified files (M, not ??): STOP and ask Gaurav before proceeding.

- [ ] **Step 2: Create and switch to feature branch**

Run:
```bash
git checkout -b feature/sanity-schema-finalize
```

Expected: `Switched to a new branch 'feature/sanity-schema-finalize'`

- [ ] **Step 3: Stage the baseline files**

Stage them by name (do NOT use `git add -A` — `.env.local` exists and must never be staged, plus `node_modules/` should already be in `.gitignore` but we don't want to depend on that).

Run:
```bash
git add next.config.mjs package.json package-lock.json postcss.config.mjs tailwind.config.ts tsconfig.json src/
```

- [ ] **Step 4: Verify what's staged**

Run:
```bash
git status
```

Expected output should show all six config files plus `src/` as new files (`new file:`), and **nothing** from `node_modules/` or `.env.local`.

If `.env.local` or `node_modules/` appear staged: `git restore --staged <file>` and investigate `.gitignore`.

- [ ] **Step 5: Commit baseline**

Run:
```bash
git commit -m "$(cat <<'EOF'
chore(setup): scaffold Next.js project and draft Sanity schemas

- Next.js 14 + Tailwind + animation libs scaffolded (GSAP,
  Framer Motion, tsparticles)
- 8 Sanity document schemas drafted (post, category, teamMember,
  testimonial, project, vertical, workshop, partner)
- schemas/index.ts registers all document types

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds, hash is printed. Don't push yet.

---

## Task 2 — Install `sanity` package

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

The drafted schemas import from `'sanity'` (`defineType`, `defineField`). Without this dependency, `tsc --noEmit` cannot resolve the import. Sanity v3 is also required for D-08 Studio setup.

- [ ] **Step 1: Confirm package is missing**

Run:
```bash
node -e "try { require.resolve('sanity'); console.log('FOUND') } catch(e) { console.log('MISSING') }"
```

Expected: `MISSING`. If it says `FOUND`, skip to Step 4.

- [ ] **Step 2: Install sanity as a dependency**

Run:
```bash
npm install sanity@^3
```

Expected: package is added to `dependencies` in package.json. Install completes without errors. Some peer-dep warnings about React 18 / styled-components are normal — ignore.

- [ ] **Step 3: Verify install**

Run:
```bash
node -e "console.log(require('sanity/package.json').version)"
```

Expected: a version string starting with `3.` (e.g. `3.61.0`).

- [ ] **Step 4: Run type-check on the existing schemas**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with **no errors**. The schemas should now type-check cleanly because `sanity` exports `defineType`/`defineField` types.

If errors appear that are NOT in `src/sanity/`: those are pre-existing issues in the scaffolded code — STOP and report to Gaurav before continuing.
If errors appear in `src/sanity/`: fix them as they surface (most likely a `defineField` rule type mismatch). Each fix should be minimal and explained.

- [ ] **Step 5: Commit the install**

Run:
```bash
git add package.json package-lock.json
git commit -m "chore: install sanity v3 for schema type-checking"
```

Note: this is an interim commit on the feature branch. It will be squashed into the design-changes commit at PR merge time (squash merge), so the final `main` history is clean.

---

## Task 3 — Create the `youtube` block schema

**Files:**
- Create: `src/sanity/schemas/blocks/youtube.ts`

Inline object schema. Stores `url` (required) and optional `caption`. Frontend extracts the YouTube ID at render time.

- [ ] **Step 1: Create the blocks folder if it doesn't exist**

Run:
```bash
mkdir -p src/sanity/schemas/blocks
```

- [ ] **Step 2: Write `src/sanity/schemas/blocks/youtube.ts`**

```ts
import { defineType, defineField } from 'sanity'

export const youtube = defineType({
  name: 'youtube',
  title: 'YouTube Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (r) => r.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'url', subtitle: 'caption' },
  },
})
```

- [ ] **Step 3: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with no errors.

If there's an error pointing at this file, fix it before continuing.

---

## Task 4 — Create the `callout` block schema

**Files:**
- Create: `src/sanity/schemas/blocks/callout.ts`

5-variant inline object. Variant drives icon and color in the frontend; Sanity stores only the variant key. `body` is rich text but with no headings allowed.

- [ ] **Step 1: Write `src/sanity/schemas/blocks/callout.ts`**

```ts
import { defineType, defineField } from 'sanity'

export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: '💡 Pro Tip', value: 'tip' },
          { title: '⚠️ Watch Out', value: 'warning' },
          { title: '📌 Quick Note', value: 'note' },
          { title: '✅ Best Practice', value: 'success' },
          { title: '🌱 Field Story', value: 'case' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
      description: 'If blank, the variant default heading is shown',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    validation: (r) => r.required(),
                  }),
                ],
              },
            ],
          },
        },
      ],
      validation: (r) => r.required().min(1),
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

Note on `lists: []` and the trimmed `marks` — callouts shouldn't contain bullet lists or h2/h3 headings (they're already a visually-grouped element). We allow bold, italics, and links inside the body for emphasis.

- [ ] **Step 2: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with no errors.

---

## Task 5 — Wire `youtube` and `callout` into `post.body`

**Files:**
- Modify: `src/sanity/schemas/post.ts`

Reference the new block types from `body.of[]` via `{ type: 'name' }`. We do NOT add imports to `post.ts` — the types are resolved at runtime via the schema registry that we update in Task 6 (`index.ts`). This is the standard Sanity v3 pattern for inline object types: register once globally, reference by name everywhere.

- [ ] **Step 1: Read the current post.ts**

Run:
```bash
cat src/sanity/schemas/post.ts
```

Confirm the `body` field definition exists around lines 57–72 with `of: [{ type: 'block' }, { type: 'image', ... }]`.

- [ ] **Step 2: Edit `body.of[]` to add the two new types**

In `src/sanity/schemas/post.ts`, locate the `body` field and replace its `of` array.

**Before** (~lines 58–72):

```ts
defineField({
  name: 'body',
  type: 'array',
  of: [
    { type: 'block' },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'caption', type: 'string' }),
      ],
    },
  ],
  validation: (r) => r.required(),
}),
```

**After:**

```ts
defineField({
  name: 'body',
  type: 'array',
  of: [
    { type: 'block' },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'caption', type: 'string' }),
      ],
    },
    { type: 'youtube' },
    { type: 'callout' },
  ],
  validation: (r) => r.required(),
}),
```

Only the `of` array changes — two lines added. No imports.

- [ ] **Step 3: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with no errors. `{ type: 'youtube' }` is a plain object literal at compile time — Sanity validates the type-name lookup at runtime when Studio loads, which is deferred to D-08.

---

## Task 6 — Register `youtube` and `callout` in `schemas/index.ts`

**Files:**
- Modify: `src/sanity/schemas/index.ts`

Even though youtube and callout are inline object types (not document types), Sanity v3's Studio still requires them in the `schemaTypes` array so `{ type: 'youtube' }` references resolve.

- [ ] **Step 1: Edit `src/sanity/schemas/index.ts`**

**Before:**
```ts
import { post } from './post'
import { category } from './category'
import { teamMember } from './teamMember'
import { testimonial } from './testimonial'
import { project } from './project'
import { vertical } from './vertical'
import { workshop } from './workshop'
import { partner } from './partner'

export const schemaTypes = [
  post,
  category,
  teamMember,
  testimonial,
  project,
  vertical,
  workshop,
  partner,
]
```

**After:**
```ts
import { post } from './post'
import { category } from './category'
import { teamMember } from './teamMember'
import { testimonial } from './testimonial'
import { project } from './project'
import { vertical } from './vertical'
import { workshop } from './workshop'
import { partner } from './partner'
import { youtube } from './blocks/youtube'
import { callout } from './blocks/callout'

export const schemaTypes = [
  // Document types
  post,
  category,
  teamMember,
  testimonial,
  project,
  vertical,
  workshop,
  partner,
  // Inline object types (used in Portable Text fields)
  youtube,
  callout,
]
```

- [ ] **Step 2: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with no errors.

---

## Task 7 — Fix `workshop.endDate` cross-field validation

**Files:**
- Modify: `src/sanity/schemas/workshop.ts`

Replace the fragile `r.valueOfField('startDate')` call with the documented Sanity v3 `r.custom()` pattern that reads from the validation context.

- [ ] **Step 1: Locate the current `endDate` field**

Run:
```bash
grep -n "endDate" src/sanity/schemas/workshop.ts
```

Expected: shows the `endDate` defineField around lines 65–70 with `r.valueOfField('startDate')`.

- [ ] **Step 2: Edit `src/sanity/schemas/workshop.ts`**

**Before** (current lines ~65–70):

```ts
defineField({
  name: 'endDate',
  type: 'datetime',
  validation: (r) =>
    r.required().min(r.valueOfField('startDate')).error('End date must be after start date'),
}),
```

**After:**

```ts
defineField({
  name: 'endDate',
  type: 'datetime',
  validation: (r) =>
    r.required().custom((endDate, ctx) => {
      const start = (ctx.document as Record<string, unknown> | undefined)?.startDate as
        | string
        | undefined
      if (!start || !endDate) return true
      return (
        new Date(endDate as string) >= new Date(start) ||
        'End date must be on or after start date'
      )
    }),
}),
```

- [ ] **Step 3: Type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with no errors.

If you see an error like `Property 'document' does not exist on type 'ValidationContext'` — that means the Sanity types are stricter than expected. Adjust the cast: replace `ctx.document` with `(ctx as { document?: Record<string, unknown> }).document`.

- [ ] **Step 4: Confirm no other usage of `valueOfField` remains**

Run:
```bash
grep -rn "valueOfField" src/
```

Expected: **no output** (zero hits). If anything still references `valueOfField`, repeat the replacement pattern there.

---

## Task 8 — Final verification

**Files:** none (verification only)

Run all acceptance criteria from the spec.

- [ ] **Step 1: Confirm files exist**

Run:
```bash
ls src/sanity/schemas/blocks/
```

Expected: `callout.ts  youtube.ts`

- [ ] **Step 2: Confirm callout has all 5 variants**

Run:
```bash
grep -E "value: '(tip|warning|note|success|case)'" src/sanity/schemas/blocks/callout.ts | wc -l
```

Expected: `5`

- [ ] **Step 3: Confirm post.body wires both blocks**

Run:
```bash
grep -E "type: '(youtube|callout)'" src/sanity/schemas/post.ts | wc -l
```

Expected: `2`

- [ ] **Step 4: Confirm valueOfField is gone**

Run:
```bash
grep -rn "valueOfField" src/ ; echo "---exit:$?---"
```

Expected: `---exit:1---` (grep exits 1 when no match — the desired outcome).

- [ ] **Step 5: Final type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: passes with no errors and no warnings about the schema files.

If any of Steps 1–5 fail, fix the underlying issue before proceeding to the commit task.

---

## Task 9 — Commit design changes

**Files:**
- Stage and commit: all schema changes from Tasks 3–7

We have an interim commit from Task 2 (the `sanity` package install). Squash merge will collapse everything on this branch into one commit on `main`, so the interim commits are fine — they help reviewers in the PR.

- [ ] **Step 1: Review what's about to be committed**

Run:
```bash
git status
git diff --stat
```

Expected staged files: none yet. Expected modified/untracked files:
- `src/sanity/schemas/blocks/youtube.ts` (new)
- `src/sanity/schemas/blocks/callout.ts` (new)
- `src/sanity/schemas/post.ts` (modified)
- `src/sanity/schemas/index.ts` (modified)
- `src/sanity/schemas/workshop.ts` (modified)

Plus the spec + this plan if not yet committed:
- `docs/superpowers/specs/2026-05-06-sanity-schema-finalize-design.md` (new)
- `docs/superpowers/plans/2026-05-06-sanity-schema-finalize.md` (new)

- [ ] **Step 2: Stage everything**

Run:
```bash
git add src/sanity/schemas/blocks/youtube.ts src/sanity/schemas/blocks/callout.ts src/sanity/schemas/post.ts src/sanity/schemas/index.ts src/sanity/schemas/workshop.ts docs/
```

- [ ] **Step 3: Verify staged files**

Run:
```bash
git status
```

Expected: only the files listed above are staged. Nothing else.

- [ ] **Step 4: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
feat(sanity): finalize content schemas with YouTube + callout blocks

- Add youtube inline block (url + optional caption) for blog embeds
- Add callout inline block with 5 agritech-flavored variants:
  Pro Tip, Watch Out, Quick Note, Best Practice, Field Story
- Wire both blocks into post.body alongside existing block + image
- Register new blocks in schemas/index.ts so the type names resolve
- Fix workshop endDate cross-field validation: replace fragile
  Rule.valueOfField('startDate') with explicit r.custom() pattern
- Establish src/sanity/schemas/blocks/ folder for inline object types

Refs: TODO P-02
Spec: docs/superpowers/specs/2026-05-06-sanity-schema-finalize-design.md

Co-authored-by: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds.

- [ ] **Step 5: Show the full branch state**

Run:
```bash
git log --oneline main..HEAD
git diff --stat main..HEAD
```

Expected: 3 commits ahead of `main` (baseline, sanity install, design changes). Diff shows ~6–7 files changed.

---

## Task 10 — Approval gate (HUMAN GATE)

**Files:** none (this is a pause point, not a code change)

Per spec §5.4, Claude does NOT push or open a PR until Gaurav explicitly approves.

- [ ] **Step 1: Print the diff summary for Gaurav**

Run:
```bash
git log --oneline main..HEAD
echo "---"
git diff --stat main..HEAD
echo "---"
git diff main..HEAD -- src/sanity/schemas/blocks/
```

Show the output to Gaurav along with this prompt:

> "Three commits on `feature/sanity-schema-finalize`:
> 1. Baseline (Apr 30 scaffolding + 8 schemas)
> 2. Sanity package install
> 3. Design changes (YouTube + callout + workshop fix)
>
> All acceptance criteria met. Type-check passes. Approve to push and open PR?"

- [ ] **Step 2: WAIT for Gaurav's response**

If Gaurav says approve / proceed / yes / push / 👍 → continue to Task 11.
If Gaurav says wait / no / changes → STOP, address feedback, re-run Task 8 verification, return to this gate.

---

## Task 11 — Push branch and open PR

**Files:** none (git/gh operations)

- [ ] **Step 1: Push the branch with upstream tracking**

Run:
```bash
git push -u origin feature/sanity-schema-finalize
```

Expected: branch is created on `origin` and tracks `origin/feature/sanity-schema-finalize`.

- [ ] **Step 2: Open the PR via `gh`**

Run:
```bash
gh pr create --base main --head feature/sanity-schema-finalize --title "feat(sanity): finalize content schemas with YouTube + callout blocks" --body "$(cat <<'EOF'
## Summary
Finalizes Sanity content schemas (TODO P-02). Adds rich-text blocks for blog (YouTube embeds + 5 agritech-flavored callouts), fixes a fragile cross-field date validation on workshops, and commits the previously uncommitted Apr 30 scaffolding work.

## Changes
- **New:** `src/sanity/schemas/blocks/youtube.ts` — YouTube embed block (url + caption)
- **New:** `src/sanity/schemas/blocks/callout.ts` — 5-variant callout block (Pro Tip, Watch Out, Quick Note, Best Practice, Field Story)
- **Edit:** `src/sanity/schemas/post.ts` — register new blocks in `body.of[]`
- **Edit:** `src/sanity/schemas/index.ts` — add youtube + callout to `schemaTypes` array
- **Edit:** `src/sanity/schemas/workshop.ts` — replace `Rule.valueOfField` with `r.custom()` pattern for endDate
- **Baseline:** Apr 30 Next.js scaffolding + all 8 document schemas (post, category, teamMember, testimonial, project, vertical, workshop, partner)
- **Dep:** Add `sanity` v3 to dependencies (needed for type-checking schemas; also required for D-08 Studio setup)

## Spec
Full design: `docs/superpowers/specs/2026-05-06-sanity-schema-finalize-design.md`

## Verification
- [x] `npx tsc --noEmit` passes
- [x] All 5 callout variants present
- [x] `valueOfField` removed from codebase
- [ ] Sanity Studio runtime validation deferred to D-08

## Out of scope (intentionally)
- Sanity Studio setup → D-08
- Creating Sanity project at sanity.io → S-07 (blocked on Gaurav)
- Sanity client + GROQ queries → D-04
- Migrating existing 8 blog posts → content task

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: `gh` prints the PR URL. Print the URL back to Gaurav prominently — the URL is the deliverable.

- [ ] **Step 3: Final report to Gaurav**

Print:
> "PR opened: <URL>
> Title: feat(sanity): finalize content schemas with YouTube + callout blocks
> 3 commits ahead of main, will squash-merge to one commit on `main` when you click Merge.
>
> Merge is your call — review on GitHub, then squash-merge from the UI. After merge I can delete the branch."

- [ ] **Step 4: Update TODO.md**

Edit `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Document/TODO.md` — mark `P-02` as `✅ Done`.

**Before:**
```
| P-02 | Sanity schema — define all fields, validations, document types | 🔴 High | ⏳ Pending | Discuss one by one: post, teamMember, testimonial, project, vertical, workshop |
```

**After:**
```
| P-02 | Sanity schema — define all fields, validations, document types | 🔴 High | ✅ Done | Schemas finalized in PR — see feature/sanity-schema-finalize. Includes 8 document types + youtube/callout blocks. |
```

- [ ] **Step 5: Append Entry 015 to ClaudeInstructions.md**

Append a new entry to `C:/Users/gaura/OneDrive/Desktop/Claude Learn/Website_Dev/Document/ClaudeInstructions.md` summarizing this session (Entry 015), following the same format as Entry 014. Include: date 2026-05-06, topic "Sanity Schema Finalization (P-02)", instruction summary, what was processed, output produced (link to spec, plan, PR URL), status ✅ Done, feedback notes (Sanity package installed; D-08 unblocked).

The TODO and log updates can happen after the PR is opened — they describe the completed state.

---

## Acceptance Criteria (from spec §6)

- [ ] `src/sanity/schemas/blocks/youtube.ts` exists and exports `youtube` defineType
- [ ] `src/sanity/schemas/blocks/callout.ts` exists and exports `callout` defineType with 5 variants in the radio list
- [ ] `post.body.of[]` includes `{ type: 'youtube' }` and `{ type: 'callout' }` alongside existing `block` and `image`
- [ ] `workshop.endDate` validation uses the `r.custom(...)` pattern — no references to `r.valueOfField`
- [ ] `npx tsc --noEmit` passes from `Development/` with no new errors
- [ ] All schema files committed on branch `feature/sanity-schema-finalize`
- [ ] PR opened with the spec'd title and body, URL returned to Gaurav

---

## Rollback

If this plan needs to be aborted partway through:

```bash
# If commits are local-only (Tasks 1–9):
git checkout main
git branch -D feature/sanity-schema-finalize

# If branch is pushed but PR not merged (after Task 11):
gh pr close <number>  # close PR
git push origin --delete feature/sanity-schema-finalize  # delete remote branch
git checkout main
git branch -D feature/sanity-schema-finalize  # delete local branch

# If sanity package was installed and you want to undo:
npm uninstall sanity
```

The `node_modules/` and `.env.local` are gitignored, so the working tree stays clean either way.
