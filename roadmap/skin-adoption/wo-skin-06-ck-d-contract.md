# WO-SKIN-06 · CK-D — forms + record + workflow — design contract

591 sites, 17 files, **six independent skins** (not one). Inventory:
`wo-skin-06-ck-d-inventory.md` — code over inventory on any disagreement.

## Why this cluster first

It is the cleanest in the program: **589 of 591 sites are category A**, there is **zero DaisyUI
coupling**, and **zero `theme.css` / `personality.css` rules target any of its components** — no
legacy layer to reconcile, a first for this program. The work is mechanically simple. What makes it
non-trivial is only its size, so it splits in two checkpoints that run in parallel.

## The premise the triage got WRONG — do not inherit it

The triage said CK-D shares "one form/section/step vocabulary; `getToneShell`/`getToneAccent` tone
maps". **False.** Those helpers are **private, unexported functions in ONE file**
(`structures/record/form-sections/index.tsx:120-182`); a repo-wide grep returns exactly one hit, and
the word "tone" appears in **zero of the other 16 files**. What exists is **six independent
enum-to-static-style maps, one per component**, sharing no code and mostly no values.

**Therefore: one token set per component.** A migration that points two components at one token set
flattens real differences — a VISUAL change inside a byte-exact pass, which is forbidden. If two
maps turn out value-identical, say so in the report and STILL keep them separate; unification is a
later design decision with its own baselines.

## Checkpoints

| ckpt | files | sites |
| --- | --- | --- |
| **F — patterns/forms** | filter-builder (78+39), form-builder (55+50), step-wizard (37+25), invoice-template (28+20) | 332 |
| **R — record + workflow + surfaces** | form-sections 65, approval-workflow (40+24), record 34, edit-fields 24, guided-draft-form 66, form 3, wizard 2, detail-form 1 | 259 |

## The law this batch runs under (P-76)

Tailwind's preflight sits in the unnamed `base` layer, which sorts AFTER every `rottay-*` layer. It
KILLS `border-width` (and any shorthand setting one), `margin` and `padding` on every element. CK-D
has no bridge rules at all, so nothing here is at risk of being revived — but the second half of the
law still binds: **an unlayered skin is what makes the migration work.** When you move an inline
border into a skin, the skin wins and the pixels hold. When you invent a border that was never
inline, you have painted something new.

An app-level `!important` beats even an unlayered skin. `app-bithire/src/styles/detail-chrome.css`
overrides header/record chrome that way. Do not assume your skin is the last word in the app.

## Standing decisions

1. **The discriminator.** Ask WHERE the runtime identifier LANDS, not whether one is mentioned.
   `getToneShell(tone)` — a switch over a fixed enum returning static `color-mix()` strings — and
   `isOpen ? shell.surface : shell.mutedSurface` are **STATE-SELECTED**: the leaves are author-time
   tokens and the identifier only SELECTS. They become `[data-tone=…]` / `[data-open]` rules. Only a
   value computed FROM DATA is RUNTIME.
2. **`data-part` is a shared VOCABULARY, not an identifier.** Anchor EVERY rule to the component's
   own scope class. Never a bare `[data-part='x']`. Never a descendant selector that could reach a
   component this one is BUILT FROM. And **never require a `data-part` on a component a parent may
   re-stamp** — that is exactly how Typography lost its colour to the rail in WO-SKIN-05.
3. **Before moving a paint key out of a style object, grep that object for a spread that also sets
   it.** A later key silently overwrites an earlier spread; lifting the key hands the cascade back
   to the spread and the pixels move even though every value is identical (P-78).
4. **A numeric literal glued to a colour is an ALPHA BYTE, not a percentage.** `color + '15'` is
   8.24%. Never convert it to `color-mix(… 15%)`.
5. **Imperative `.style.x =` writes — FOUR, all in `filter-builder` (checkpoint F).**
   `engines/modern.tsx:598,601` and `engines/rustic.tsx:672,675`, on mouse enter/leave. An earlier
   revision of this contract placed them in `form-sections`; that was WRONG (form-sections has zero,
   grep-confirmed — the R pre-step agent caught it by reading the code instead of obeying the brief).
   They use the `(e.currentTarget as HTMLDivElement).style.background =` shape, which **the counter
   is BLIND to** — filter-builder can reach `inlinePaint: 0` with the hover mechanism fully intact
   and inline. Check whether any CSS competes with them before transcribing (the identical mechanism
   was LIVE in one component and DEAD in another elsewhere in this program). Transcribe each to a
   `:hover` rule on the SAME element it wrote to, and PIN the hover in the spec first — a pixel gate
   only catches what a baseline photographs, and no rest shot photographs a hover.
6. **Local `@keyframes` shadow a global of the same name and win** (last parsed). Rename + namespace
   every keyframe you move; never delete a local "duplicate" without measuring which one paints.
7. Scope classes grep-verified FREE across CSS **and** CSS-in-JS. Text colour painted inline via
   props never moves to CSS. Border shorthands over maybe-undefined tokens are ATOMIC.
8. **The counter is not the coverage checklist — the INVENTORY is.** It is blind to string contents
   (`@keyframes`, per-instance `<style>` tags), to `.style.x as any =`, and to SVG presentation
   attributes. Four of its bugs were fixed yesterday; assume more. Reconcile your hand count against
   it and REPORT THE DELTA.

## Pre-step coverage

- Torture sections `?forms=1` (F) and `?record=1` (R), each with its own `data-testid` root and
  per-component Stack testids.
- Deterministic fixtures rendering every state a rule will key on (each component's tone enum, open/
  closed, disabled, error, the step-wizard's step states, the approval-workflow's statuses).
- Specs `forms-batch.spec.ts` and `record-batch.spec.ts`: 4 rest shots each
  ({rottay,bithire} × {modern,rustic} × w1280) + interaction pins wherever hover paint exists —
  **filter-builder's condition-row hover is MANDATORY, in BOTH engines** (it is the cluster's only
  imperative write, it is invisible to the counter, and a migration that deletes it without
  transcribing breaks an interaction no baseline photographs).
- **Never `waitForTimeout` after a hover.** Use the `waitForSettled` idiom from
  `overlay-batch.spec.ts` (poll opacity/transform/box-shadow until unchanged across three frames).
  A baseline recorded mid-transition is inherited forever.
- Contract tests per checkpoint: every part + state attribute reaches the DOM.
- Each pre-step also GREPS its family's unit tests for assertions on inline paint (`toHaveStyle`,
  `.style.`, `getAttribute('style')`) and REPORTS them file:line without editing. The orchestrator
  adjudicates them while the migration runs.
