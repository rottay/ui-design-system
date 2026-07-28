# Audit Postmortem — Why R0/R1 Missed the Dual-Authored Static Theme (Round 3)

Date: 2026-07-27. Author: Claude (orchestrator). Scope: the official reconciled audit
(`docs-engineering/archive/audits/2026-07-26-ds-modern-whitelabel-independent-audit-davila.md`,
685 lines at commit ca53acf) failed to detect or classify the general overlap between the
compiled BrandTheme block and the hand-authored `_source/extension.css` inside each static
vertical artifact — 188 shared custom-property names in BitHire, 82 in Evnto, 267 in Rottay —
despite correctly finding two downstream symptoms (the CLEAR MODE GUARD and the inert dark
lines). This postmortem adjudicates the seven candidate failure hypotheses with evidence.

The controlling fact: the official document contains ZERO occurrences of `extension.css`,
`_source`, `compileBrandTheme`, or `build-vertical-artifacts` (verified by grep over all 685
lines; see `claims-extraction.md` headline). The artifact was always analyzed as a file,
never as a build output with two authored inputs.

## Hypothesis adjudication

### H1 — "The audit verified the runtime winner, not author uniqueness" — TRUE

The entire R2 correction cycle (doc L48-67) is about WINNER determination: `:is()` static
specificity, shadowed-fallback classification, "name collision is not proof of effective
authority; per-channel winners require computed-style validation" (L193). Authority was
modeled as a cascade question. Authorship — who is entitled to declare the value — was never
a tracked dimension. The doc's own precedent proves the archetype was known on a different
axis: L315 records that `DEFAULT_LOCALE`'s "claim to be the single declaration was false"
because a mount point hardcoded `'en'`. The same failure shape on the theming axis went
unexamined.

### H2 — "The artifact was treated as an atomic unit" — TRUE

- L80 describes the vertical artifact in one authority-table cell as "Code-owned vertical
  baseline" — collapsing a typed, APCA-checked TS source and a free-form 6,247-line
  hand-authored CSS file into one owner.
- L249-252 traces provenance FROM the artifact path onward ("`build-vertical-css.mjs`
  composes from `base.css` + the artifact **by path**") and explicitly stops there. The
  generator step upstream of the artifact file was never opened.
- The artifact's own second banner (`index.css:1041` in BitHire: "Declared artifact
  extension (authored source, mechanically scoped)") states the dual authorship in-band; it
  was never quoted in the audit.

### H3 — "`build-vertical-artifacts --check` proves reproducibility, not absence of contradiction" — TRUE (with a sharper edge)

Verified against the script (`build-vertical-artifacts.mjs:45,129-150`) and by Round 3's own
measurement: `--check` re-renders compiled+extension and byte-compares. Round 3 re-rendered
all three artifacts through the same path and got byte-identical SHA256 matches — INCLUDING
the `color-scheme: dark` → `color-scheme: light` same-selector contradiction
(`extension.css:376` vs `:647`). Reproducibility reproduces the contradiction; a green
`--check` is fully compatible with unbounded hand-authored overrides. Sharper edge: the doc
never even names this gate — it appears only inside the aggregate "DS blocking gates 23/23
passed" (L646). An unnamed gate cannot have its scope reasoned about; the aggregate count
laundered a reproducibility check into an authority certification.

### H4 — "engine-token-audit only controls a narrow subset of ramps" — TRUE

Verified by direct inspection of `engine-token-audit.mjs` (2,899 lines, ~30 decrease-only
ratchet counters). Exactly three counters touch the artifacts, each narrowly: dark
pure-black elevations, dark focus-ring defects, and `countHandAuthoredRampHex()`
(`engine-token-audit.mjs:2449-2463`) — a presence-count regex over `_source/extension.css`
only, scoped to exactly 7 semantic roles × 9 ramp steps (63 possible names, 3 slugs),
assuming drift by construction without verifying per instance. It never reads the compiled
block, never diffs a hand-authored value against the derived one, and checks no other token
family (typography, chrome, spacing, motion, base colors). Ruled out for
compiled-vs-extension comparison: `build-vertical-artifacts.mjs --check` (byte staleness
only), `daisy-projection-contract.test.mjs` (DaisyUI vocabulary only),
`css-layer-paint-gate.test.mjs` (one selector pattern), `gat-07-exact-proof.mjs` (doc-claim
corpus). A general "does extension.css redeclare a channel the compiled block already set"
check does not exist anywhere in `packages/core/scripts/`.

### H5 — "Valid final CSS hides the conflict" — TRUE

CSS last-wins semantics make the concatenated artifact both syntactically valid and
deterministic. The measured contradiction (`sameSelectorConflicts` in
`bithire-overlap.json`: same normalized selector, `dark` then `light`, lastWins `light`)
parses without any diagnostic. Every tool that consumed the artifact — bundler, tests,
browsers — sees a well-formed stylesheet. Determinism was read as health.

### H6 — "Too much horizontal census, too little vertical traceability" — TRUE

R1's instruments were censuses: 409 app `--ds-*` declarations across 44 files (L327), 1,316
`!important` (L330), 907 app CSS files (L331), the 1,615-channel matrix (L256-278). The one
parser-grade instrument (`app-ds-boundary-gate.mjs`, L446) classifies the APP side of the
collision and never inspects artifact authorship. No single channel was ever traced
source → compiler → artifact → bundle → DOM. Round 3's two-channel trace
(`source-to-runtime-trace.md`) found the dual authorship at the second hop.

### H7 — "'Single authority' was accepted without a second-author drill" — TRUE (with credit where due)

R1 DID practice negative drills — for precedence and wiring: the tenant-layer
reintroduction drill (C2, L415-417), workflow-script-wiring drills (R1.1), claim-identity
same-value drills (R1.1), the DB-canary single-axis drill (C2). None of them plants a second
AUTHOR of a tenant channel. The recipe subsystem independently shows the missing pattern
implemented correctly (`recipe-profile-single-path.test.tsx`: census + planted conflicting
value proven inert — see `sweep-2-recipes-typography-density-motion.md`), so the
organization possessed the technique; it was applied to one subsystem and not to the one
carrying the "single authority" certification.

## Aggravating factors (not hypotheses; found during Round 3)

1. **The R1 evidence bundle is unrecoverable.** The doc header (L7) points to
   `/private/tmp/rottay-design-platform-independent-audit/` "pending promotion via
   EvidenceManifest v1". `/private/tmp` was reaped by a reboot before Round 3 ran; the
   bundle and the checkpoint file are gone. L133 flagged the risk ("417MB of artifacts are
   machine-local and unreferenced"); promotion never happened. R1's own per-line evidence
   can no longer be re-examined — only its self-descriptions in the doc.
2. **Aggregate gate reporting.** "23/23 passed, zero excluded" (L646) cites no denominator
   membership. This violates what Round 3 now codifies as L5 (no total without denominator
   and method): the artifact gate's real scope (byte parity) was invisible inside the total.
3. **The scorecard knew.** `single-authority(model) 5.0` (L208) was already the lowest-scored
   architecture dimension after gate truthfulness. The number was right; the narrative
   ("ONE authority per channel", L226) outran it.

## What R1 did right (and Round 3 keeps)

- Append-only correction culture with explicit RETRACTED/OVERSTATED labels (L221-222,
  L394-395) — Round 3 uses the same convention.
- The R2-2 `:is()` specificity retraction shows claims were re-litigated against spec.
- Winner-level cascade analysis was substantially correct and is NOT retracted: the
  unlayered tenant tail, (0,1,1) static specificity, and the app-boundary classification
  survive Round 3 unchanged.
- The i18n single-declaration failure (L315) was found and fixed by exactly the discipline
  that was missing on the theming axis — the capability existed.

## Root cause, one sentence

The audit certified "one authority" by proving the cascade produces a deterministic winner
and the pipeline reproduces bytes deterministically, while never asking who is authorized
to author each channel — and both proofs are fully compatible with two uncoordinated
authors, which is what the artifacts actually contain.
