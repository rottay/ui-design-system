# WO-SKIN-06 checkpoint CK-D inventory (read-only) — forms + record + workflow

Scope: the 17 files named in the CK-D row of `wo-skin-06-triage.md` §6, verified
against `node scripts/engine-token-audit.mjs | grep fleet.inlinePaint` (counts match
exactly, 591 total):

| file | sites |
|---|---:|
| `patterns/forms/filter-builder/engines/modern/index.tsx` | 78 |
| `patterns/forms/filter-builder/engines/rustic/index.tsx` | 39 |
| `patterns/forms/form-builder/engines/modern/index.tsx` | 55 |
| `patterns/forms/form-builder/engines/rustic/index.tsx` | 50 |
| `patterns/forms/step-wizard/engines/modern/index.tsx` | 37 |
| `patterns/forms/step-wizard/engines/rustic/index.tsx` | 25 |
| `patterns/forms/invoice-template/engines/modern/index.tsx` | 20 |
| `patterns/forms/invoice-template/engines/rustic/index.tsx` | 28 |
| `structures/record/form-sections/index.tsx` | 65 |
| `structures/record/record/index.tsx` | 34 |
| `structures/record/edit-fields/index.tsx` | 24 |
| `patterns/workflow/approval-workflow/engines/modern/index.tsx` | 40 |
| `patterns/workflow/approval-workflow/engines/rustic/index.tsx` | 24 |
| `surfaces/pages/forms/guided-draft-form/index.tsx` | 66 |
| `surfaces/pages/forms/form/index.tsx` | 3 |
| `surfaces/pages/forms/wizard/index.tsx` | 2 |
| `surfaces/pages/forms/detail-form/index.tsx` | 1 |

`patterns/forms/filter-panel` and the other three `patterns/workflow/*` components
(approval-inbox, moderation-gallery, operational-ledger, shift-matrix) are **not**
in CK-D scope and were not read.

Channel scope, class legend (STATIC / STATE-SELECTED / RUNTIME), and the
discriminator are the ones defined in `wo-skin-04-navigation-inventory.md` and
`wo-skin-06-triage.md` §2. **Zero `data-part`/anatomy anywhere in this family**
(grep-confirmed across all 17 files) and **no skin CSS exists yet for any of
them** — greenfield, same starting state as every prior checkpoint. All
9 candidate scope classes below (`ds-filter-builder`, `ds-form-builder`,
`ds-step-wizard`, `ds-invoice-template`, `ds-form-sections`, `ds-record`,
`ds-edit-fields`, `ds-approval-workflow`, `ds-guided-draft-form`) are
grep-confirmed FREE in `foundation/tokens/css/`.

---

## 1. Headline

591/591 sites read by hand (not the resolver's depth-4 substitution — a full read
of all 17 files). Classification: **589 A (STATIC/STATE-SELECTED), 1 B, 1
contested-C** (see §4). CK-D is even more homogeneous than the triage's 99%
estimate suggested, and it is **DaisyUI-coupling-free** — a real difference from
WO-SKIN-04's navigation family (FloatButton/Steps/Stepper), which had deep
DaisyUI structural dependencies. It is also **suppression-risk-free**: grep
across `engines/{modern,rustic,classic}/theme.css` and `runtime/personality.css`
for every CK-D component name returns zero hits. There is no legacy layer to
reconcile against anywhere in this checkpoint — a first for this program.

**The one thing the triage got wrong for this checkpoint**: §6 describes CK-D's
contents as sharing "one form/section/step vocabulary; `getToneShell`/
`getToneAccent` tone maps." That premise does not survive contact with the
files, in the same way CK-C's "one shared vocabulary" premise did not (see the
2026-07-13 correction at the bottom of the triage doc). See §2.

## 2. The tone-vocabulary map — verify, don't assume

`getToneShell`/`getToneAccent` are real, but they are **private, unexported
functions that live only in `structures/record/form-sections/index.tsx`**
(lines 120–182). A repo-wide grep for `getToneShell|getToneAccent` returns
exactly one file. Nothing in patterns/forms, nothing in
`structures/record/record` or `edit-fields`, nothing in
`patterns/workflow/approval-workflow`, nothing in the four surfaces files
imports or references these functions — they cannot be imported (not exported)
and nothing hand-rolls a call-alike of the same name. **"Tone" as a literal word
appears in zero of the other 16 files** (grep-confirmed).

What actually exists is **six independent enum-to-static-style maps**, one per
component, each its own vocabulary, each following the same shape the
discriminator names in §2 of the triage (a bounded enum selecting among
author-time-static leaves — category A) but sharing no code and, mostly, no
values:

| file | map | keys | shape |
|---|---|---|---|
| `form-sections/index.tsx:120,146,184` | `getToneAccent`/`getToneShell`/`getSectionHeaderPattern` (3 functions, one shared `tone` param) | `default \| editorial \| technical \| governance` | flat `color-mix()` strings per key |
| `structures/record/record/index.tsx:99-150` | `variantStyles` object literal (not a function) | `default \| editorial \| technical \| governance \| metrics` | **mixed**: some keys are `linear-gradient(...)`, others are flat `color-mix()` |
| `structures/record/edit-fields/index.tsx:422-433` | `requirementDotColor` / `requirementDefaultCopy` | `required \| recommended \| optional` | flat token per key, single channel (dot `background`) |
| `patterns/forms/invoice-template/engines/modern/index.tsx:22-27` | `statusStyles` | `draft \| sent \| paid \| overdue` | `{background: color-mix 15%, color: token}` pairs |
| `patterns/forms/invoice-template/engines/rustic/index.tsx:22-27` | `statusColors` | `draft \| sent \| paid \| overdue` | single flat token per key, paired with a **hardcoded `color: '#fff'`** at the call site (line 160) — a pre-existing "no hardcoded colors" violation, record only |
| `patterns/workflow/approval-workflow/engines/modern/index.tsx:29-53` | `statusBadgeStyle` / `statusLineStyle` | `pending \| approved \| rejected \| escalated \| skipped` | flat token per key (unscaled: `var(--ds-color-success)`) |
| `patterns/workflow/approval-workflow/engines/rustic/index.tsx:29-35` | `statusColors` (bg/text/dot triplet) | same 5 keys | scaled-token triplets (`var(--ds-color-success-50/700/500, #hex)`) |
| `surfaces/pages/forms/guided-draft-form/index.tsx:141-146` | `DraftStatusBadge`'s `statusMap` | `unsaved \| saving \| saved \| error` | `{label, color}` pairs |

**Import graph: zero edges between any of these eight maps.** Every one is a
private, file-local `const`/`function`. This is the same finding CK-C's
correction recorded for `FILTER_PILL_*`: a plausible-sounding "shared
vocabulary" claim in a planning doc, refuted by checking who actually imports
what.

**Where form-sections and record genuinely overlap (and where they diverge)**:
`FormSectionTone` (form-sections) and `RecordSummaryStrip`'s `variant` prop
(record) use the **same four names** (`default`/`editorial`/`technical`/
`governance`, record adds a fifth, `metrics`) and, for two of the four shared
names, **byte-identical border values**:

| shared name | form-sections `getToneShell(...).border` | record `variantStyles[...].border` | match? |
|---|---|---|---|
| `editorial` | `color-mix(in srgb, var(--ds-color-border-secondary) 82%, var(--ds-color-bg-primary) 18%)` | `color-mix(in srgb, var(--ds-color-border-secondary) 82%, var(--ds-color-bg-primary) 18%)` | **identical** |
| `technical` | `color-mix(in srgb, var(--ds-color-border-secondary) 84%, var(--ds-color-text-muted) 16%)` | `color-mix(in srgb, var(--ds-color-border-secondary) 84%, var(--ds-color-text-muted) 16%)` | **identical** |
| `governance` | `color-mix(in srgb, var(--ds-color-border-secondary) 82%, var(--ds-color-bg-primary) 18%)` (form-sections' `border`, not `activeBorder`) | `color-mix(in srgb, var(--ds-color-border) 62%, var(--ds-color-bg-primary) 38%)` | **diverged** — different base token (`-secondary` vs not) and different percentages |
| `default` | `sectionBorder` = `var(--ds-color-border-secondary)` | `borderColor` = `var(--ds-color-border-secondary)` | identical (both are the plain token, no color-mix) |

But **every `background`/`surface` value diverges in shape, not just value**:
form-sections' `surface`/`mutedSurface` are always a flat single `color-mix()`;
record's `background` for `editorial` and `governance` is a two-stop
`linear-gradient(180deg, color-mix(...) 0%, color-mix(...) 100%)` — a
different recipe, not a re-tinted copy. `technical`'s background is flat in
both (also value-identical: `color-mix(in srgb, var(--ds-color-bg-secondary)
9x%, transparent)`, though the percentage differs: form-sections 94%/90%
split between `surface`/`mutedSurface`, record single 94%).

**Verdict for the tone-vocabulary map**: form-sections and record are two
independently-authored vocabularies that **partially converged by accident**
(the border formulas for `editorial`/`technical` match to the byte, most
plausibly because both were written against the same informal "border-secondary
tinted 15–18% toward the accent" convention that was never promoted to a shared
function) and diverged everywhere else (backgrounds, the `governance` border,
and record's fifth `metrics` variant with no form-sections equivalent). **This
must be preserved as two separate token sets.** A migration must not "notice"
the editorial/technical border match and unify it into one shared `--ds-*`
variable across both components — that coupling does not exist in the source
today (each file resolves its own literal), and a future edit to one file's
border formula must not silently move the other's pixels. If the team wants an
actual shared tone vocabulary this is a legitimate refactor target, but it is a
**visual-parity decision**, out of scope for a byte-exact migration.

The other five status maps (invoice-template ×2, approval-workflow ×2,
guided-draft-form ×1) key on entirely different domain enums (invoice status,
approval status, draft-save status) and share no values with each other or with
the tone pair above — expected, not a finding.

## 3. Is the patterns/forms vs record+workflow+surfaces split the right seam?

**Yes, on code-sharing grounds — but not for the reason §6 gave.** The proposed
D1 = patterns/forms (332 sites, 8 files) / D2 = record + workflow + surfaces
(259 sites, 9 files) split is defensible, but not because D1 shares a tone
vocabulary that D2 also uses (it doesn't — see §2). The real seams:

- **`patterns/_internal/engines/modern/styles.ts`** (the DaisyUI-replacement
  chrome kit: `panelCardStyle`, `cardBodyStyle`, `pillBadgeStyle`,
  `pillBadgeSmStyle`, `spinnerStyle`, etc.) is imported by **both**
  `invoice-template/engines/modern/index.tsx` (D1) **and**
  `approval-workflow/engines/modern/index.tsx` (D2). This is the one real,
  code-shared, cleanly-adopted vocabulary in CK-D (11 fleet-wide importers,
  confirmed by grep; 2 of them are in this checkpoint). It crosses the
  proposed D1/D2 line. Whichever half migrates second should not re-derive
  `panelCardStyle`/`pillBadgeSmStyle` — check what the first half already did
  with this shared module.
- **`surfaces/pages/forms/guided-draft-form/index.tsx`** (D2, 66 sites)
  directly composes `patterns/forms/step-wizard` (`PatternStepWizard`, D1) and
  `surfaces/pages/forms/wizard/index.tsx` (D2, 2 sites) also composes it. Both
  `form/index.tsx` and `detail-form/index.tsx` (D2) compose
  `patterns/forms/form-builder` (`PatternFormBuilder`, D1). **The four
  surfaces files are composition-only** (their own paint is 3+2+1+66=72 sites,
  almost entirely page chrome: sticky-bar gradients, error-card borders,
  section-nav active-state ternaries) — they do not repaint anything the
  pattern components already own. This is the real justification for keeping
  the surfaces files in D2 rather than D1: they are a downstream consumer, not
  a paint-vocabulary peer of filter-builder/form-builder/step-wizard/
  invoice-template.
- **Keyframe collisions cut across the proposed line, not along it**: the
  `pulse` keyframe name is injected by `step-wizard` (D1, both engines) and by
  `approval-workflow/engines/rustic/index.tsx` (D2) — see §6. If D1 and D2 run as
  separate batches, whichever runs second must know the first batch's
  keyframe-naming decision for `pulse`, because there are two incompatible
  variants of it already living in this one checkpoint.

Net: split is fine for sequencing large work, but the two halves are not
independent — flag the `_internal/engines/modern/styles.ts` import and the
`pulse` keyframe name as the two things that must be decided once, before
either half starts, not independently per half.

## 4. Category B / contested-C

**Confirmed B (1 site)** — `patterns/forms/form-builder/engines/modern/index.tsx:279`,
inside `renderReadOnlyValue`'s `case 'color'`:
```tsx
<span style={{ width: 20, height: 20, borderRadius: 'var(--ds-radius-sm)', background: String(val), border: '1px solid var(--ds-color-border)' }} />
```
`val` is the field's saved value — a swatch of whatever color the user picked,
rendered back in read-only mode. Matches the triage §4 `SKIN-EXEMPT-RUNTIME-VALUE`
class exactly (cited there as `:279 String(val)`).

**Contested C (1 site)** — the triage §5 table lists
`surfaces/pages/forms/guided-draft-form | 1 | :164 color`, attributing it to the
custom-property-hatch category. On inspection, line 164 (current file) sits
inside `DraftStatusBadge`:
```tsx
const statusMap: Record<DraftStatus, { label: string; color: string }> = {
  unsaved: { label: 'Unsaved changes', color: 'var(--ds-color-warning)' },
  saving:  { label: 'Saving...',        color: 'var(--ds-color-text-muted)' },
  saved:   { label: lastSavedAt ? `Saved ${lastSavedAt}` : 'Saved', color: 'var(--ds-color-success)' },
  error:   { label: 'Save failed',      color: 'var(--ds-color-error)' },
};
const { label, color } = statusMap[status];
```
`DraftStatus` is a closed 4-value enum and every `color` leaf is an
author-time-static token — structurally identical to the discriminator's own
worked A-example, `STATUS_PILL_STYLES[status.variant]` (triage §2). This reads
as **A (STATE-SELECTED → `[data-status]`)**, not C. Flagging as a probable
pre-existing miscategorization rather than asserting it outright, since file
line numbers can drift between when the triage was written and now — **worth a
5-minute re-check against the resolver's original site list before CK-D's
contract is written**, the same way CK-C's premise got a written correction
rather than a silent fix.

No other B or C candidates found anywhere in the other 15 files on a full read.

## 5. Bridge rules — dead/live disposition per P-76

**There are none.** Grepped `engines/{modern,rustic,classic}/theme.css` and
`runtime/personality.css` for every CK-D component name and public
export name (filter-builder, form-builder, step-wizard, invoice-template,
form-sections, record/record-field/record-panel/record-summary, edit-field/
inline-editor, approval-workflow, guided-draft) — **zero hits**. Unlike
WO-SKIN-04's Menu/Steps/Stepper (which each had a substantial pre-existing
`.rottay-*` rule block to reconcile against), CK-D has no legacy layer at any
specificity, dead or live. There is nothing for a migration to accidentally
suppress or un-suppress. This checkpoint is the cleanest greenfield case the
program has hit so far — record this explicitly so the contract step does not
spend time hunting for a suppression risk that isn't there.

## 6. Interaction paint: imperative writes, keyframes

**Imperative `.style.x =` writes: 2 mechanisms, both in filter-builder, both the
same shape.** `engines/modern.tsx:597-602` and `engines/rustic.tsx:671-676` each
implement the "Add filter" dropdown row hover via `onMouseEnter`/`onMouseLeave`
setting `e.currentTarget.style.background` directly, rather than a style-object
ternary or a `:hover` rule:
```tsx
onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--ds-color-bg-secondary)'; }}
onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
```
Migration target per the kit: delete the handlers, transcribe to a real
`:hover` rule scoped to the row. No other imperative writes found anywhere
else in CK-D (form-builder, step-wizard, invoice-template, form-sections,
record, edit-fields, approval-workflow, and all four surfaces files are 100%
declarative style objects/ternaries).

**Per-instance `<style>` tags / keyframes: 5 files, 5 declarations, with a real
collision.** All five are loading-skeleton or transition shimmer effects:

| file | keyframe name | content (min-opacity) | counter-blind? |
|---|---|---|---|
| `step-wizard/engines/modern/index.tsx:257` | `pulse` | 0.5 | yes |
| `step-wizard/engines/rustic/index.tsx:250` | `pulse` | 0.4 | yes |
| `form-builder/engines/modern/index.tsx:641` | `formBuilderPulse` | 0.5 | yes |
| `form-builder/engines/rustic/index.tsx:582` | `ds-form-error-in` (transition-in, not a shimmer) | n/a | yes |
| `approval-workflow/engines/rustic/index.tsx:209,229` | `pulse` | 0.4 | yes (injected twice, same declaration, both branches) |

**The collision the lane's law warns about (§7.3 of the triage) is live inside
this one checkpoint, not hypothetical**: the literal global name `pulse` is
declared with **two different bodies** — `step-wizard/engines/modern/index.tsx`'s
version dims to 50% opacity, `step-wizard/engines/rustic/index.tsx`'s and
`approval-workflow/engines/rustic/index.tsx`'s both dim to 40% (the latter two are
byte-identical to each other, the former is not). Because these are
runtime-injected via React `<style>` children rather than module-scoped CSS,
mounting a modern StepWizard and a rustic StepWizard (or ApprovalWorkflow) on
the same page today — e.g. the showroom's engine-comparison view — means
whichever `@keyframes pulse` declaration lands in the DOM last wins for every
element on the page referencing `animation: pulse ...`, silently changing the
other component's shimmer intensity. Pre-existing, record-only, but it is the
concrete proof for why every one of these must become an
engine-and-component-namespaced skin keyframe (e.g.
`ds-step-wizard-modern-pulse` / `ds-step-wizard-rustic-pulse` /
`ds-approval-workflow-rustic-pulse`) rather than collapsed into one shared
name even where two of the three already happen to share a body — the
byte-identical pair sharing a body today is coincidence, not a documented
contract, and must not be relied on.

**The correctly-shared keyframe precedent, for contrast**: `filter-builder`'s
loading spinner (modern.tsx:635) references `animation: 'ds-spin ...'`, which
resolves to a real, single, already-shared keyframe defined once in
`engines/rustic/theme.css:1052` — cross-engine (a modern-engine file consuming
a keyframe physically defined in rustic's theme.css), but not per-instance and
not duplicated. `patterns/_internal/engines/modern/styles.ts`'s `spinnerStyle`
(consumed by `invoice-template` and `approval-workflow` modern engines)
references a *different* keyframe, `spin` (defined in both
`foundation/animations/keyframes.css` and, redundantly, `engines/modern/
theme.css:1103` — a pre-existing second-emitter pair, not this checkpoint's
defect to fix). So CK-D's modern engine actually references **two differently
named, both pre-existing, both already-shared** spinner keyframes (`ds-spin`
and `spin`) depending on which component you're in — a naming inconsistency
worth a one-line flag to the team, not a migration blocker.

## 7. Anatomy today

Every one of the 17 files carries **zero `data-part`** (grep-confirmed) and,
with one exception, **zero first-party classNames** — everything is Tailwind
utility classes (layout/typography only, e.g. `flex items-center gap-2`,
`text-xl font-bold`, `opacity-50`), DS-primitive-component classes (from
`Box`/`Flex`/`Card`/etc., which are already-migrated components outside this
checkpoint's scope), or no className at all. The one exception:
`step-wizard/engines/modern/index.tsx:232` stamps `ds-step-wizard-skeleton` (+
`__progress`/`__content` children) on its loading state — grep-confirmed **zero
references anywhere in `foundation/tokens/css/`**, a dead BEM-style hook, same shape as
Menu's compound classNames in WO-SKIN-04. Harmless today (inline styles cover
everything), not a precedent to copy.

**DaisyUI coupling: none.** Grepped every file for a bare DaisyUI structural
class (`btn`, `input-`, `select-`, `steps`, `menu`, etc.) — the closest thing
found was `filter-builder/engines/modern/index.tsx:261`'s `sizeClass = compact ?
'input-xs select-xs' : 'input-sm select-sm'`, computed but **never applied to
any element** (grep-confirmed: `className=` never references `sizeClass`
anywhere in the file) — dead code, not live coupling. This makes CK-D the
first checkpoint in the WO-06 program confirmed fully free of the
`daisy.classConsumers` ratchet on both counts (no live class, no residual dead
reference worth tracking against the ratchet since it never renders).

## 8. Engine asymmetries, dead code, pre-existing defects (record only)

- **Three independent step-indicator visual languages for the same concept**:
  `step-wizard`'s modern and rustic engines both render numbered-circle +
  connecting-line indicators but with different token conventions (modern:
  flat `var(--ds-color-primary)`; rustic: scaled `var(--ds-color-primary-600)`
  family — expected engine asymmetry). `form-builder/engines/modern/index.tsx`
  (lines 826-899, 984-1056) **independently re-implements a near-identical**
  numbered-circle step indicator for its own `layout="steps"` mode (same 32px
  circle, same `isActive || isCompleted` background logic, same boxShadow
  focus ring `0 0 0 4px color-mix(...)`) — a third, separately-authored copy
  of the same visual idea, not imported from step-wizard. `form-builder/
  engines/rustic.tsx` uses a **completely different** visual language for the
  same concept (an underlined tab bar, `s.stepItem(active)`, no circles, no
  connector line at all) — a genuine cross-engine, cross-component asymmetry
  worth flagging as three independent implementations of "which step am I on."
  Preserve all three as-is; do not reconcile during migration.
- **`filter-builder/engines/rustic/index.tsx`'s AND/OR group-logic button** uses a
  filled-primary-vs-outlined visual distinction with an explicit code comment
  explaining the design intent (filled = stricter AND, outlined = looser OR);
  `engines/modern.tsx`'s equivalent button uses the same conceptual
  distinction but with flatter tokens and no comment — same idea, no shared
  code, consistent with the rest of this checkpoint's zero-cross-file-sharing
  pattern.
- **`invoice-template/engines/rustic/index.tsx:160`** hardcodes `color: '#fff'` on
  the status badge (white text assumed to have sufficient contrast against
  any of the four `statusColors` backgrounds) — a literal hex, not a token,
  violating the DS's own no-hardcoded-colors rule. Pre-existing, static, must
  transcribe byte-exact (not fix) during migration.
- **`invoice-template/engines/modern/index.tsx`** relies on ~7 Tailwind
  `opacity-*` utility classes (`opacity-50`, `opacity-10`, `opacity-30`,
  `opacity-60`, `opacity-70`) for its watermark/de-emphasis effects;
  `engines/rustic.tsx` achieves the same visual result with inline
  `opacity: 0.1` etc. `opacity` is not a counted channel in either form (per
  the WO-SKIN-04 channel list), so neither mechanism shows up in the fleet
  counter and neither is threatened by P-76 (preflight does not touch
  opacity) — noted for completeness, no migration action implied.
- **`guided-draft-form/index.tsx`'s `SectionNav`** implements the "active
  section" highlight ternary independently in its `pills` branch (lines
  253-309) and its `sidebar` branch (lines 344-410) — same
  `isActive`/`hasErrors` priority logic, restated rather than shared as one
  function, in the same file. Minor, in-file duplication only.
- **Three near-identical page-chrome surfaces disagree on one token**:
  `surfaces/pages/forms/form/index.tsx`'s error-card border uses
  `var(--ds-color-error)`; `wizard/index.tsx` and `detail-form/index.tsx` both
  use `var(--ds-color-error-500)` for the conceptually identical error card.
  Tiny, but the kind of thing a skin's `--ds-*` naming pass should reconcile
  only if the team explicitly signs off on a visual-parity change — not a
  byte-exact migration's job to notice-and-fix.

## 9. Method

Read all 17 files in full (not sampled). Counted-channel classification used
the discriminator in `wo-skin-06-triage.md` §2 (condition-position vs.
value-position; enum-switch functions with all-static leaves resolve to A).
Cross-checked every proposed scope class and every component name against
`foundation/tokens/css/` via grep for bridge-rule and classname-collision risk (§5, §7).
Did not re-run the resolver's mechanical site enumeration; site *counts* per
file are taken from `engine-token-audit.mjs`'s live output (§ header table),
matched exactly against the brief's numbers before reading began.
