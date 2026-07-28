# Round 3 — Static Theme Provenance Audit — SUMMARY

Date: 2026-07-27 · Auditor: Claude (Fable 5 orchestrator + 8 opus/sonnet agents, read-only
fleet) · Trigger: Codex dual-authoring finding · Official doc updated:
`docs-engineering/archive/audits/2026-07-26-ds-modern-whitelabel-independent-audit-davila.md`
(new appended wave: "Round 3 — Static theme provenance and dual-authoring correction").

## Verdict

Codex's finding is **CONFIRMED in substance and extended**. The static vertical artifact is
dual-authored (compiled BrandTheme block + hand-authored `_source/extension.css`), the
overlap exists in ALL THREE first-party verticals (not only BitHire), and the worst case is
structural, not incremental: Rottay's compiled block is a dark palette emitted under a
light-gated selector and **never applies in any reachable state** — the hand-authored
extension is the sole effective author of the Rottay theme. R1's runtime/cascade/hydration/
CI/i18n acceptance stands; the uniqueness of static theme provenance is REOPENED as phase
**R1-P**, which must close before R2 visual acceptance.

## Reproduced numbers (parser-based, snapshot-frozen, byte-identity-verified)

| Vertical | Compiled unique | Extension unique | Shared | Final A/B/C/D/E |
|---|---|---|---|---|
| bithire | 1,024 | 575 | **188** | 20/42/3/122/1 |
| evnto | 319 | 159 | **82** | 79/2/0/1/0 |
| rottay | 462 | 976 | **267** | 0/0/0/267/0 (all with F facet) |

vs Codex (BitHire): 1024 ✓ · 188 ✓ · light 14 ✓ · dark(banner) 114 ✓ · guardrails 48 ✓ ·
extension 575 vs 576 (Codex's regex counted `--clickable` from a SELECTOR — false
positive) · clear-guard 79 vs 83 (bucket-definition dependent; ours is published and
recomputable per name).

## Load-bearing discoveries

1. Rottay compiled block = dark palette under `[data-theme='light']` selector
   (`artifact-renderer/index.ts:65`); 180/267 values byte-identical to the extension's
   dark-default block. NEEDS_OWNER_DECISION on intent.
2. All three products ship `data-theme="base"`; light/dark unreachable in product shells;
   showroom reaches both via `forceTheme` (so D-category conflicts are observable today).
   The bithire guardrails banner's premise ("app pins light") is FALSE.
3. 44 bithire compiled values dead at IDENTICAL specificity (selector differs only in
   quote style — invisible to textual scans).
4. Behavioral propagation fails outright on the traced rottay channel (`--ds-card-bg`:
   editing TS source + regenerating changes nothing in any state).
5. bithire `darkPrimaryColor` (#6BB5F5) never ships; hand-authored #1e84e6 ships instead.
6. DB path: second ramp emitter (legacy sRGB) silently overrides the OKLCH compiler for
   primary/secondary/accent on every DB customer tenant; APCA validates the unshipped
   values.
7. `color-scheme: dark` → `light` same-selector contradiction, both hand-authored
   (extension.css:376 vs :647), reproduced byte-identically by the build.
8. Shipped-state visual regressions inside the B set: bithire canvas #F4F8FB→#ffffff,
   panel gradient→flat, ink lightened, badge→pill, breadcrumb rem→px; evnto drops
   "Noto Sans Arabic" from both font stacks (live i18n regression).
9. Same pattern in other subsystems: typography dark line-height, density local factor,
   unguarded motion literal, root-attribute app trio bypassing the claim registry,
   chrome-vs-material card split, 165-name dual emission into one layer,
   `--ds-divider-text-color` self-duplicate, 223 identical-selector duplicate groups in
   the shipped bundle, `--rt-*`/`--ds-*` violated in both directions (byte-parallel rule
   in two repos with different values), DS shipping bithire product semantics.
10. Positive exemplar: `recipe-profile-single-path.test.tsx` already implements
    census + planted-conflict drill — the exact discipline now mandated.

## Legitimate overlaps (not defects)

- The 3 `--ds-motion-*` reduced-motion zeroings (C — compiler cannot express @media).
- 1 component-local bithire override (E — correctly scoped subtree).
- The F facet as a NEED: 100% of dark/media/color-scheme handling structurally must live
  in extension.css today because compileBrandTheme emits a single flat block (no modes,
  no @media, no color-scheme — verified against compiler source).
- Evnto's 79 A-duplications are not visual defects today, but are pure drift surface.

## Remaining UNKNOWNs (never converted to PASS)

- 85 bithire rows resolvedEquality UNKNOWN (25 in shipped state) — color-mix/calc chains;
  need Codex computed-style capture (probe specs in `source-to-runtime-trace.md`).
- DOM/computed-style winners for all cascade conclusions — static analysis only this
  round; SIGHTED-PENDING (Codex).
- Codex's clear-guard=83 bucket definition (unpublished).
- Rottay light-gated spec intent (owner decision).
- R1's original evidence bundle content (unrecoverable — /tmp reaped; recorded as an
  evidence-governance finding).

## Preventive protocol (adopted in the official doc, P6)

Six properties, each separately evidenced, for any "single authority" claim: author
uniqueness · emitter uniqueness · writer uniqueness · precedence correctness · behavioral
propagation · negative drill. Plus laws L1-L7 (no grep-as-evidence, no unclassified
intersections, generated≠single-source, determinism≠ownership, no totals without
denominator, UNKNOWN≠PASS, mandatory vertical trace). Drills ND-1..ND-7 in
`negative-drill-design.md`.

## R1-P (new roadmap phase, official doc P7)

R1 → **R1-P** → R2. Owners: Claude (architecture/contract/compiler/gate/docs), Kimi
(paused until authority defined, then visual craft), Codex (final audit, computed styles,
BitHire/TMM acceptance). Nine scoped items; no remediation implemented this session.

## File inventory (this bundle)

| File | Content |
|---|---|
| SUMMARY.md | this file |
| methodology.md | snapshot procedure, hashes, delegation map, anti-overclaim rules |
| {bithire,evnto,rottay}-overlap.json | full per-declaration extraction + overlap records + buckets + contradiction + cascade-by-state (all counts recomputable) |
| classification.json / classification-core.json | per-name A-I classification, per-state results, reachability evidence, decisive file:line |
| classification.md | final adjudicated classification + the 23 overlaps that matter |
| source-to-runtime-trace.md | two-channel hop tables + six-property scoring + DOM probe specs |
| audit-postmortem.md | 7 hypotheses adjudicated TRUE + aggravators + credit |
| single-authority-protocol.md | protocol draft (landed in official doc P6) |
| negative-drill-design.md | ND-1..ND-7 drill catalog for R1-P |
| verification-notes.md | what was/wasn't verified, deltas vs Codex, session hygiene |
| claims-extraction.md | verbatim prior-doc claims with line numbers (F-1..F-12 exposure table) |
| compiler-capability-map.md | BrandTheme contract surface, emitter shapes, cannot-express residue, --check scope |
| sweep-1/2/3-*.md | dual-authority pattern sweeps across 11 other subsystems |
| scripts/ | extract-declarations.mjs, cascade-by-state.mjs, reproduce-artifact.mjs, classify/, composition-map.md |
| snapshots/ | frozen inputs with SHA256 + pre-edit official doc copy |
| compiled.txt, ext.txt, overlap.txt, app-rt.txt, ds-rt.txt | intermediate agent scratch (retained for reproducibility) |

## Session hygiene

Read-only on ui-design-system/app-bithire (and every repo): zero writes, zero builds/
tests/servers/regenerations, zero git-state changes. Writes: this directory + the official
doc (append-only wave). No commit/push/PR/publish/tag. The doc edit is left UNCOMMITTED
for Codex review.
