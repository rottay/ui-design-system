# R1-P Phase 5 — Modern structural debt classification ledger (Codex C5)

Machine-readable companion: `phase5-ledger.json` (all 3,980 rows).

## Census source (identified)

| | |
|---|---|
| Gate | `packages/core/scripts/pattern-surface-ownership-gate.mjs` (**DS-A002**) |
| Baseline | `packages/core/scripts/pattern-surface-ownership-gate.baseline.json` (path-keyed multiset, decrease-only) |
| Allowlist | `packages/core/scripts/pattern-surface-ownership-gate.allowlist.json` (2 entries) |
| Scope | productive TS/TSX under `src/ui/patterns` + `src/ui/surfaces` only |
| Reproduced at entry | **3,980 findings / 478 productive files** |

Category totals reproduce C5 exactly: shared-chrome-literal 3,233 · native-interactive 293 ·
utility-class 314 · primitive-reconstruction 92 · local-svg 48.

**Scope note for the audit:** DS-A002 does **not** analyze `src/ui/structures` or
`src/ui/primitives`. The brief's "patterns/structures" framing overstates coverage —
structures carry no census signal at all today.

## Critical-path axis (how reachability was decided)

Two conjuncts, both required:

1. **BitHire reach** — 281 distinct DS symbols are imported by `app-bithire`; 277 resolve to
   DS source. BFS over the resolved internal import graph (2,911 files).
2. **Modern-runtime reach** — `engines/classic` and `engines/rustic` branches are *pruned*.
   Engine selection is a **runtime dynamic `import()`** in `createEngineComponent`
   (`patterns/data/data-table/presentation/table/index.tsx:57-59`), and app-bithire pins
   `engine: "modern"` (`app-bithire/src/app/layout.tsx:181`), so those branches never execute.

Static reachability alone is useless here: without pruning, 171 of 172 census files are
"reachable" because engine barrels statically name all three engines. With pruning the split
is decisive — **103 files / 1,974 findings on the critical path; 69 files / 2,006 findings off it.**

## Ledger totals (action × category)

| action | total | breakdown |
|---|---:|---|
| `NOT-CRITICAL-PATH` | 2,006 | shared-chrome 1,798 · native-interactive 151 · primitive-reconstruction 51 · local-svg 6 |
| `KIMI-LEDGER` | 1,762 | shared-chrome 1,407 · utility-class 314 · local-svg 41 |
| `BLOCKED-paint-coupled` | 143 | native-interactive 117 · primitive-reconstruction 26 |
| `BLOCKED-by-WIP` | 38 | shared-chrome 28 · native-interactive 7 · primitive-reconstruction 2 · local-svg 1 |
| `CANDIDATE-free-standing` | 22 | native-interactive 10 · primitive-reconstruction 12 |
| `IMPERATIVE-DOM(not-UI)` | 8 | native-interactive 8 |
| `FIXED-here` | 1 | primitive-reconstruction 1 |

### Shared-chrome literals (file-level only, as instructed)

| | files | literals |
|---|---:|---:|
| Modern+BitHire critical path | 91 | **1,435** |
| not critical path | 68 | 1,798 |

Sum 3,233. No per-literal work performed.

## The load-bearing finding: paint coupling, not WIP, is what blocks remediation

Of the 174 Claude-owned findings that are on the critical path **and** porcelain-clean,
**143 (82%) are skin-coupled**: an authored Modern skin rule already paints that exact element
through its `data-part`/`ds-*` hook, with values the WO-SKIN program transcribed verbatim from
the previous inline styles.

Example (`foundation/tokens/css/presentation/components/skin/collection-workspace-render-dispatch.css:80-102`)
pins `pagination-prev/next` and `page-size-select` background, border, radius and colour; the
`notification-center.css:38-45` header literally reads *"circular icon buttons: bell trigger +
row dismiss share one treatment"*.

Consequence: swapping the native element for a DS primitive changes which element the skin lands
on and layers the primitive's own chrome underneath. That cannot be certified value-preserving
without a sighted/visual check, which this phase forbids and which C5 reserves for Kimi. **These
143 are a joint Claude-structural + Kimi-visual wave, not unilateral Phase 5 work.** That is the
material scheduling fact for R1-P closure.

`BLOCKED-by-WIP` is only 38 findings — Kimi's WIP sits in engine/skin CSS and in
primitives/structures, largely *outside* the DS-A002 scope.

## Census precision defects found (recommend allowlist or rule refinement)

1. **`create-element-*` cannot distinguish imperative DOM from rendered UI — 8 findings.**
   `triggerDownload()` (`patterns/visualization/charts/runtime/exporting/foundation/file/index.ts:284`)
   and `browserDownloadCsv()` (`.../react/access/index.tsx:114`) build `document.createElement('a')`
   with `href`+`download`+`click()`. No DS primitive can express a blob download. **False positives.**

2. **`branding-preview-sandbox` is a legitimate permanent owner — 6 findings.**
   It renders deliberately raw, `readOnly` `button`/`input` swatches so a tenant can see its own
   chrome tokens applied to neutral elements. Composing DS primitives there would defeat the
   component's purpose. **Belongs in the allowlist with a reason.**

3. **`clickable-noninteractive` has no ancestor awareness.** It cannot see Escape-dismissal or
   `aria-activedescendant`. Verified by hand: `command-palette:221` is a modal **scrim** (root has
   `role="dialog" aria-modal` + focus trap; Escape is the keyboard equivalent), and
   `command-palette:300`/`363` are canonical **APG combobox/listbox options** where the absence of
   `tabIndex` is *correct* — adding one would break virtual focus. Same for `workspace-switcher:190`.

4. **The reported `line` is the flagged attribute, not the opening tag**, for
   `clickable-noninteractive`. Any downstream tooling anchoring on it reads the wrong element
   (this cost three correction rounds here).

## Genuine keyboard defects surfaced (handoff, not fixed)

After correct tag anchoring, 15 critical-path clickable hosts have a real keyboard gap
(full verdicts in `clickable-triage.json`). Highest-confidence, each verified by reading the source:

| site | defect |
|---|---|
| `notification-center/engines/modern:119` | `div[role=button][tabIndex=0]`, no Enter/Space — **FIXED, see below** |
| `user-profile-card/engines/modern:88,118` | whole card `onClick`, no role/tabIndex/key handler |
| `calendar-view/engines/modern:163,179` | day cells click-only |
| `tree-view:136` · `kanban-board:231` · `map-view:107` · `file-manager:306` | click-only |
| `saved-views:283` | click-only pill (also drag-and-drop) |

These are WCAG 2.1.1 failures on the Modern+BitHire critical path. Most are *not* mechanical
primitive swaps (`user-profile-card` and `notification-center:172` contain nested interactives, so
promoting the host to a button would nest controls) — they need per-case adjudication.

## Fix executed (1 file + its test)

`packages/core/src/ui/patterns/communication/notification-center/engines/modern/index.tsx`

Replaced the hand-built trigger `div[role="button"][tabIndex=0]` with the Modern `Button`
primitive (`import Button from '../../../../../primitives/inputs/Button/engines/modern'` — the
same idiom and identical path depth as `cockpit-header/engines/modern:30`, which uses
`variant="ghost"` for its icon trigger).

**Equivalence argument**

- *Geometry preserved verbatim.* Modern Button composes `{...pressMotion.variables, ...style}`
  (`engines/modern/index.tsx:338-341`) — the caller's `style` wins, so `height/width 40, padding 0`
  and the flex centring are byte-identical. Locked by a test.
- *Skin hook preserved.* Button honours P-79 — *"an explicit caller `data-part` wins over the
  default root anatomy"* (`:173-175`) — so `[data-part='trigger']` still matches. Its rest paint
  (`background: transparent; border: none; border-radius: 50%`) is pinned by a 2-class + attribute
  selector that outranks the Button variant skin, so **rest-state paint is unchanged**.
- *Props preserved.* `onClick`, `aria-label`, `data-testid` pass through
  (`ButtonProps extends ButtonHTMLAttributes`). `htmlType="button"` added explicitly so the native
  button cannot submit an enclosing form — preserving the `div`'s non-submitting behavior.
- *Behavior gained, none lost.* The `div` was focusable but had **no key handler**: keyboard users
  could focus it and never activate it (WCAG 2.1.1). A native `button` restores Enter/Space.
- *Declared visual delta, flagged for Kimi's sighted check:* `variant="ghost"` adds a hover tint
  and a `:focus-visible` ring where the div had none. A focusable control with no focus indicator
  is itself a WCAG 2.4.7 failure, so this is a correction rather than a redesign — but it is a
  pixel change and is recorded here rather than buried.

**Verification**

- `node scripts/pattern-surface-ownership-gate.mjs --check --quiet` → **exit 0 (GREEN)**
- Census `3980 → 3979`; `primitive-reconstruction 92 → 91`; **`native-interactive` unchanged at 293**
  (the primitive is not raw HTML, so no debt was displaced sideways).
- Baseline NOT re-seeded — the ratchet is decrease-only and reads this as a decrease, per instruction.
- Focal test: `npx vitest run .../tests/NotificationCenter.test.tsx` → **18/18 pass**
  (3 new + 15 pre-existing, which cover classic and rustic too — no cross-engine regression).

Three tests added, marked `// R1-P Phase5 — run in serial tanda`: native `BUTTON` tag with no
`role="button"` reconstruction and `data-part` intact; keyboard activation; 40×40 geometry.

## Not touched (per instruction)

Classic/Rustic engines · any candidates feature file · every foreign-dirty file · the census
baselines. No git operations, no `!important`, no new dependencies, no builds/typechecks/suites.
