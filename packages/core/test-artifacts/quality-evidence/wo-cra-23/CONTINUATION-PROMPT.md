# WO-CRA-23 `modern-rescue` — continuation prompt

Hand this to a fresh session. It is written as instructions, not as a report. Everything here is
measured; where a number is a floor rather than a total, it says so.

---

## 1. The goal, and what is already answered

**From each tenant's configuration, the same React tree must render as genuinely different
companies.**

That question is **answered and verified**, twice — do not re-open it, build on it:

- **Sighted.** Six captures of `oauth-transition`, the one surface whose ambient glow derives from
  the tenant primary: bithire navy, evnto editorial paper, platform quiet near-black. Three
  products. Files in `sighted/`, README carries the bundle shas and the three declared limits.
- **Measured, and this is the one that decides what work is worth doing.** Every `var()` chain in
  381 skin files resolved to its terminal, per cell — 258 families, 14,666 painted declarations, six
  cells:

```
families reached      bithire 253 · evnto 252 · rottay 253   of 258
naming table          spread of 562
DS-literal + inline fallback + undeclared    ~⅓ of all painted declarations
```

> The asymmetry is in **naming**, not in **reach**. A declaration terminating in a DS literal, an
> inline fallback, or nothing is **identical across all three verticals by construction**. About a
> third of the painted surface is pinned to the generic layer, so **another wave of channel
> authoring does not move it.**

That killed the obvious next programme. Do not propose it again without new evidence.

---

## 2. Standing laws — the owner's, non-negotiable

- Nothing legacy. No production app. No compatibility owed. Every token under our control.
  **Nothing hardcoded.**
- **Aesthetic and typographic choices are never escalated to the owner.** They are either the
  tenant's (a channel) or yours (an architecture decision). If you are about to escalate, you have
  mis-framed it — re-read it as *"should a literal exist where a tenant channel belongs"* and decide.
- **Commits and version publishes are allowed. Never push.**
- Author `davila23 <daniel.avila@rottay.com>`. No `Co-Authored-By`, no AI attribution, no emoji —
  text icons only (`✓ ✗ → • ─ │ ├ └`).
- **Never `git checkout` or `git restore` on a directory.** A 2026-02-05 incident destroyed a week
  of work. Back a file up and restore by copy if you must.

---

## 3. The living documents — read these, update these

| file | what it is | who writes it |
|---|---|---|
| `PROGRAM-STATE.md` | **The resume authority.** 114 sections, every law with the measurement that produced it and every retraction that corrected it. | coordinator, per finding |
| `family-ledger.json` | 252 rows: `id · layer · category · family · sourceOwner · layerProfile · state · sourceCommits · lastCommit`. | lane, per family touched |
| `harness/primitives/` | The instruments, each with its own control set and a README carrying the traps. | lane that builds one |
| `sighted/` | The six captures + README. The only visual evidence the programme has. | whoever runs chromium |
| the task list | Ownership and briefs. | coordinator |

**The task description is the sole authority on ownership and scope.** Chat is a pointer to it. I
split a brief across two channels three times and it caused two near-collisions and one lane
answering four questions it never received.

---

## 4. Where things live — the map that cost the most to learn

### The four tiers

```
primitives/   engine-switched leaves            Button, Input, Badge, Tag, Segmented
patterns/     reusable task widgets             PatternDataTable, PatternFormBuilder
structures/   page chrome around a pattern      CollectionHeader, TableToolbar, ColumnMenu
surfaces/     whole-screen recipes              ListSurface, CollectionWorkspaceSurface
```

### The CSS trees — there is more than one, and searching one is not a census

```
foundation/tokens/css/
  foundation/themes/default.css          the base: :root light block + dark block
  foundation/base/typography.css         the static and fluid type ramps
  presentation/components/skin/*.css     STRUCTURES (146 files) — .ds-structure .ds-<family>
  runtime/engines/{modern,rustic}/skin/  PRIMITIVES + PATTERNS (123 modern)
  facade/artifacts/{bithire,evnto,rottay}/
      _source/extension.css              HAND-AUTHORED per vertical
      index.css                          GENERATED — never hand-edit, lint:artifacts fails
```

Three things are named alike and are not the same:

```
src/…/facade/artifacts/<v>/index.css     TOKENS only — 2,196 lines, 0 component rules
packages/core/styles/<v>.css             committed mirror, bundled FROM src
dist/<v>.css                             the shipped bundle — 124,844 lines, skins included
```

**`dist` is not one age.** `build:vertical-css` rewrites `dist/*.css` from `src` while leaving
`dist/**/*.js` untouched, because the artifact half imports the compiler *from* `dist`. Measuring
"against dist" is meaningless without naming which half.

### Where a repair belongs

| the defect is | fix it in |
|---|---|
| a DS default that is a theme's value | `foundation/themes/default.css`, re-based onto a role channel with the literal kept as the fallback arm |
| one vertical's palette | that vertical's `_source/extension.css` — **not** the brand-theme TS |
| an engine's richer vocabulary | that engine's skin, **declared**, not smuggled through a fallback arm |
| a family's own anatomy | its skin file in the correct tree |

**Never the brand-theme TS if `_source/extension.css` can carry it.** `runtime/tenant`'s public
entrypoint budget is 300,773 source bytes and **129,341 of them — 43% — are brand-theme source
reachable from a `"use client"` entrypoint.** Three separate edits blew that gate in one night, and
twice it was the *comment*, not the value: five lines cost 305 bytes over, one line cost 32 over,
none fits. **In a brand theme the explanation costs client bytes — put the why in the commit.**

---

## 5. Rulings already made — do not re-litigate

1. **Severance repair, in preference order.** (c) rekey onto an anchor the caller cannot remove —
   an attribute the engine stamps unconditionally and does not spread (`[role='radiogroup']` for
   Segmented, `[data-variant]` for Button and list-toolbar). Weight-identical, so no browser
   adjudication is owed. (b) rekey onto the scope class — costs one weight unit, must be measured.
   (a) stop severing at the call site — treats a symptom.
2. **Weight preservation is correct only when nothing competes in the band you would occupy.**
   Badge deliberately dropped to (0,2,0) *because* the compensating pattern rules sit at (0,3,0)–(0,4,0)
   and would otherwise be clobbered. That was measured at 0/6 sites losing paint.
3. **A family compensation expires the moment its underlying channel is fixed.** Removing it is part
   of the repair, and only its author remembers it exists.
4. **`oklab` is correct**, the four contracts naming `oklch` are aged. The mix's second endpoint is
   the page ground — achromatic — and hue is undefined at chroma 0, exactly where cylindrical
   interpolation is unstable. Attributed to `8d2062008`, a deliberate `feat`.
5. **The fill is not supposed to separate; the edge is.** `track/page` runs 1.00–1.07 in all five
   cells. A border-only track is still a track **when the border is healthy** (1.25–1.46 band).
6. **Do not mint a public channel for one surface.** Derive from the tenant's accent with
   `color-mix` instead — that is what makes bithire's glow blue and evnto's neutral.
7. **`--ds-color-bg-canvas` is an alias in light and a deliberate literal in dark.** Documented pin
   at `default.css:2105`. Not a defect; a deferred design question.

---

## 6. Measurement laws — every one paid for

- **A green must name its scope.** Four contracts described a compiler that no longer exists, with
  no visible red, because nobody ran `vitest run src/foundation/tokens` — 40 files, 355 tests. A
  filtered green was read as a suite green all night, by everyone including the coordinator.
- **A census without a positive control is not evidence**, and **a control that mirrors the code
  instead of the corpus cannot fail.** Plant shapes lifted from the tree.
- **Add the motivating case to the control set**, not just the shapes you thought of. One instrument
  shipped a passing 6-shape control while missing the family it was written for.
- **When a census returns zero, check its input is not empty.** A failed `git show` wrote 0 bytes and
  postcss parsed it into a spotless zero.
- **A count is a floor.** Every re-measured scope collapsed: 585→333, 35→3, 16→13. And an instrument
  that reports one item at a time hides its own total — fixing three button shadow channels exposed
  a fourth.
- **Attribute by re-running per commit, never by reading a diff.** Use a tree **with `node_modules`**;
  a fresh worktree returns `ERR_MODULE_NOT_FOUND`, which reads identically to a failing gate.
- **A mechanism argument loses to an outcome test**, every time it was tried.
- **Verify authorship before deconflicting.** Check file mtimes and `git status` before touching
  anything; three near-collisions were avoided this way and one was not.
- **`data-part` is vocabulary, not an identifier**; reachability is a property of a **component**,
  not of a part name. Anchor to the scope class.
- **The fallback-inert law.** `var(--a, --b)` never reaches `--b` if `--a` is declared in scope.
  Corollary: **declaring a name that was undeclared flips every read site at once**, without any of
  them being edited — the most expensive repair shape in this codebase.

---

## 7. Open work — measured, adjudicated, unowned

Full briefs in the task list. Summary only:

| item | state |
|---|---|
| `root-component-authority` | repair correct but **incomplete** — `-hover` exposed, `-active` likely. Repeat: base declares the generic scale, modern declares its own. |
| `elevation-surface-lift` | not started. The modal skin lost its required `background-color` line. |
| `reduced-motion-guard` | not started. One unguarded animation reintroduced by a header extraction. |
| four `oklch` contracts | adjudicated aged — correct the contracts, not the compiler. |
| `fluid-ramps` ×3 | aged. Return the **1.875rem** rung between the declared `1.5` and `2`, removed by `edf91a41f`'s deletion sweep. **Two ramp gaps exist** — the second is above the 2.5rem top; this contract points at the lower. |
| `evnto/light` hairline 1.20 | last edge below the band. Same shape as rottay's, in evnto's own light ramp. **Diagnostic first:** if evnto's light ramp has a usable step, the compression is specific to the dark end; if not, linear-hex spacing is how these ramps are authored at both ends. Different work orders. |
| Badge `default` light 3.82 | pre-existing, measured, not repaired. |

**Nothing is baselined, and nothing may be.** Attribution is a deliverable in its own right: for each
row, *when did it go red* and *is it a live defect or a contract that aged*. Different answers,
different work.

---

## 8. Working rules for the session

- Batch tests at the end of a wave, not per lane. The build and chromium are **machine singletons** —
  one at a time, and announce before taking one.
- **Gate every commit on the test exit code**, captured directly and never through a pipe. A trailing
  command eats it: a build exited 1 three times while the harness reported 0.
- Commit with **explicit pathspecs**. Never `git add -A` in a shared tree.
- Comment economy: only what is necessary — and in a brand theme, less than that.
- If a repair costs specificity, **specify it and do not ship it**. Hand the cascade question to a
  sighted pass with a concrete diff rather than a worry.
- **Refuse the thin win.** A value that clears a floor by a hair retires the finding without fixing
  it — twice this programme nearly shipped the step judgement would take, sitting just under where
  it needed to be.
