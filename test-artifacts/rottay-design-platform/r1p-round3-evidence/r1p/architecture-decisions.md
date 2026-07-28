# R1-P Architecture Decisions (Fable, 2026-07-27)

STATUS: **PROVISIONAL_IMPLEMENTED** (owner correction 2026-07-27): every AD below is a
decision proposed by the implementer, binding on writer agents DURING the wave, but NOT
accepted architecture until Codex's independent audit. W1/W2/W3 outcomes are
IMPLEMENTED_PENDING_INDEPENDENT_AUDIT — never COMPLETE/ACCEPTED. Static/artifact
equivalence claims are machine-level only; computed-style/browser equivalence is
SIGHTED_PENDING (Codex). AD-5c's app-platform normalization is flagged: app-platform is
an independent app, not BitHire's shared runtime owner — those edits are severable and
listed for adjudication in the handoff.

Binding for all R1-P writer agents. Deviations require returning to the orchestrator.
Inputs: Round 3 evidence (../), official doc Round 3 wave, Phase 0 state
(phase0-repo-state.txt: all target areas clean of concurrent WIP; live hashes ==
snapshot hashes, so Round 3 counts stand un-reproduced-again by identity).

## AD-1 · Canonical-value law (pixel-preserving de-duplication)

For every A/B overlap in a reachable state, the value that SHIPS today (cascade winner =
extension value) becomes the canonical BrandTheme value, and the extension re-declaration
is deleted. Exceptions where the COMPILED value is canonical (deliberate visual change,
listed in handoff item 14):
- evnto `--ds-font-family-base` / `--ds-font-family-heading`: compiled wins (restores
  the mandatory `"Noto Sans Arabic"` fallback — the extension drop is a confirmed
  regression).
No other deliberate pixel changes are authorized on the static path in this wave.
A-category rows (identical values): delete the extension declaration, no TS change.
B-category rows: update the BrandTheme TS field to the extension's rendered value, then
delete the extension declaration. Where the extension value is a var() indirection and the
corresponding BrandTheme field is a plain string passed through by the compiler, the var()
string moves into the TS field verbatim (compiler passes it through; APCA only checks ramp
-900 literals). Where a var() value cannot live in the contract field (typed as color and
parsed), the channel STAYS in extension inside a declared `capability-gap` exception block
(AD-2) and is reported — do not force it.

## AD-2 · Extension contract + provenance gate

extension.css may only contain declarations inside blocks covered by a structured
exception header comment (machine-parseable):

```
/* @ds-exception kind=<mode-block|media|reduced-motion|component-local|structural|capability-gap>
   owner=<claude|kimi|codex> purpose="<one line>" reachability=<shipped|mode:dark|mode:light|media|subtree>
   [retire="<condition>"] */
```

Legitimacy per kind: mode-block = values for a NON-default mode (the compiler owns the
default mode); media/reduced-motion = @media-gated; component-local = descendant-subtree
scope; structural = non-custom-property rules (pseudo-elements, focus, content);
capability-gap = flat-channel override the contract cannot yet express — DECREASE-ONLY
ratchet, must carry retire=.

New gate (NEW file, do not touch the 5 dirty scripts listed in phase0-repo-state.txt):
`packages/core/scripts/artifact-provenance-gate.mjs` + baseline + self-drills. AST-based
(postcss). RED when: (a) an extension declaration re-declares a compiler-emitted channel
for the same reachable state outside a declared exception block; (b) a capability-gap
count grows; (c) an exception header is malformed; (d) a mode-block redeclares the
DEFAULT mode's channels (that is the compiler's territory). Register in
ci-gates.manifest.mjs (verify it is clean before editing) as blocking.

## AD-3 · Compiler mode emission + Rottay correction

BrandTheme contract gains `appearance.defaultMode: 'light' | 'dark'` (bithire=light,
evnto=light, platform/rottay=dark). compileBrandTheme emits:
- BASE block: unconditional vertical selector, default-mode values, plus
  `color-scheme: <defaultMode>`.
- No compiler-emitted non-default-mode block in this wave (dark variants stay authored in
  extension as declared `mode-block` exceptions; teaching the contract full dark twins is
  R2+ work). This keeps the capability extension minimal and reusable.
Artifact-renderer spec: rottay's light-gated selector is REPLACED by the plain
unconditional selector (same shape as bithire/evnto). Rationale recorded: the platform
BrandTheme values ARE the dark palette and rottay is dark-by-default; the light gate was
a mislabel (Round 3 P2.1). Rottay extension: the dark-default block collapses under AD-1
(divergent values adopted into BrandTheme); the `.light` block remains as a declared
mode-block exception (light = non-default mode for rottay).
BitHire: the CLEAR MODE GUARD block is DELETED (the authored-then-reverted 55-prop
palette + the color-scheme dark→light contradiction). The dark palette block REMAINS as a
declared mode-block exception (it only matches explicit `data-theme='dark'`, which the
root-state contract only stamps on a real dark request; with defaultMode=light the guard
is redundant). `color-scheme` moves to compiler emission (base block, from defaultMode).

## AD-4 · DB single-emitter (REFINED per scoutdb 2026-07-27)

Two DB paths exist and must be kept distinct: the CANONICAL v1 compiler
(`compileTenantThemeConfig`, composition/tenant-theme) never calls the legacy emitters —
structurally immune, do not touch its emission; the LEGACY compatibility path
(`visual-config/index.ts`) carries the bug and is the fix target.

1. LIGHT overlap fix: in `generateTenantCssFromResolvedVisualConfig`, the legacy
   `brandingVariables()` must stop emitting the overlap set
   `--ds-color-{primary,secondary,accent}-{50..900}` + bare `--ds-color-{role}` — the
   OKLCH `compiledBrandVars` owns those keys. PRESERVE the four legacy-only keys the
   OKLCH compiler never emits: `--ds-color-primary-foreground`, `--ds-color-link`,
   `--ds-color-link-hover`, `--ds-color-border-focus`.
2. DARK block: legacy sRGB dark ramps are the SOLE author (no OKLCH dark competitor) —
   that is a capability gap (F), not dual emission. KEEP them this wave, wrapped in an
   explicit declared-exception comment with retire condition ("until OKLCH dark ramp
   derivation exists"), and scope the fail-closed assertion to the light merge. Do NOT
   invent dark OKLCH derivation in this wave.
3. Fail-closed: after building lightDeclarations, assert no two internal sources
   produced the same key with different values (throw with the key list); composition by
   construction, not spread-order luck. appearanceVars remains the sanctioned LAST layer
   (it is OKLCH + enforceTextContrast and already wins correctly — three emitters were
   found; appearance's priority is correct and documented).
4. APCA on shipped values: run `enforceTextContrast` over the FINAL merged
   lightDeclarations and darkDeclarations (mirroring what v1 already does), replacing the
   current appearance-slice-only pass. Honest scope note for docs: this covers the
   TEXT_CONTRAST_PAIRINGS semantic pairs (same guarantee as v1); ramp steps per se are
   checked by the static-path APCA only.
5. `buildRuntimeScale` keeps one out-of-scope consumer (old theming provider client-side
   branding override) — record as debt, do not delete the function; delete only the
   legacy ramp emission in visual-config.
6. W2 must verify and document whether the legacy path even runs for tenants with a
   compiled v1 artifact (`resolveVisualAuthority`/suppressedChannels) — if it does not,
   say so in the doc (bug reachability = brandTheme-only tenants without appearance,
   plus the tenant-preview editor — the highest-visibility consumer).
Known visual consequence (handoff item 14): brandTheme-only DB tenants (and the
brand-studio tenant preview) get OKLCH light ramps instead of sRGB. No existing test
pins the sRGB values (scout-verified: presence-only assertions), so no re-anchoring is
expected; if one goes red, adjudicate — do not widen.

ADJUDICATED W2 DEVIATIONS (accepted 2026-07-27, orchestrator): (i) §1 implemented as
"legacy emits a ramp/bare-role channel ONLY where the OKLCH compiler did not" — the
literal deletion would have erased the palette for branding-only tenants with no
brandTheme (a disappearance, not the intended value change); single-author-per-key holds
by construction. (ii) Fail-closed is a per-layer authority declaration
(legacy-branding=exclusive → throws on re-declaration; tokenOverrides+personality=compat
per 5 measured legitimate overrides; palette channels protected from every layer;
appearance exempt as final authority) — not a blanket compiled-vs-base throw, which the
pre-edit census proved would break real tenants.

## AD-5 · Root-state contract

- `data-tenant` / `data-vertical`: identity, SSR-owned, never mode.
- `data-engine`: SSR stamp + claim registry (unchanged).
- `data-theme`: MODE channel. Values `light` | `dark` explicit; `base` (or absence) =
  "vertical defaultMode" — base is NOT light; it resolves through
  `appearance.defaultMode`. Resolution and stamping stay in the existing DS
  ThemeProvider/claim registry; no new mechanism.
- `color-scheme`: compiler-emitted per AD-3; the pre-paint script may refine only `auto`.
- Reachability: the existing DS `setTheme` + `ds-theme-preference` persistence (already
  read by app-platform's boot script) becomes the single sanctioned mode writer. Wire the
  provider so an explicit stored preference stamps `data-theme='light'|'dark'`;
  app-platform (rottay, dark default with a fully-authored light palette) enables the
  mode switch. BitHire/evnto: mechanism ships; switch availability is gated by each
  vertical's static PRODUCT_PROFILE (their dark palettes are uncertified — enabling is an
  R2/R3 sighted decision, not hardcoded in shared components).
- app-bithire client trio (`data-account-tenant`/`data-brand-artifact`/`data-css-tenant`):
  cleanup becomes non-destructive claim-based (route through the DS claim registry or
  equivalent restore-prior-value semantics). Files are clean of WIP; app repo edit
  authorized.

## AD-5b · color-scheme writer reduction (scout finding)

ThemeProvider today claims inline `color-scheme` = `resolved==='dark'?'dark':'light'` on
every state, including `'base'`. With AD-3's compiler-emitted `color-scheme:
<defaultMode>` in the base block, that inline `light` would OVERRIDE rottay's stylesheet
`dark` (inline beats stylesheet). Decision: the inline claim becomes mode-aware — claim
inline `color-scheme` ONLY when resolved is `'light'` or `'dark'`; for `'base'`, no
inline claim: the stylesheet (compiler base block for bundled verticals; mode blocks for
explicit modes) owns it. DB tenants keep the inline claim (their theme resolves to
light/dark/auto, and the DB compiler does not emit color-scheme). Re-anchor the
root-attribute-authority census and theme-provider tests to the new claim set — that is a
test re-anchor with a behavioral reason, not baseline-widening.

## AD-5c · Mode persistence = cookie, single writer

`ds-theme-preference` localStorage is a dead read (zero writers repo-wide) and the
provider stomps out-of-band DOM writes on hydration. Decision: persistence is a COOKIE
named `ds-theme-preference` (values `light`|`dark`; absence = base/defaultMode).
app-platform's server layout reads the cookie and passes it as `forceTheme` into the
provider chain (SSR stamps `data-theme` correctly → provider hydrates to the same value →
no flash, no competing writer). The client toggle calls `useTheme().setTheme(mode)` (the
census-governed sole writer) AND writes the cookie. The dead localStorage boot script in
app-platform layout.tsx:100 is REPLACED by the cookie/SSR path (check the file is clean
first; if dirty, checkpoint as blocker). Toggle UI mounts in a CLEAN candidate
(settings-overview.tsx or whitelabel.tsx — scout-verified clean; topbar is DIRTY, avoid).
BitHire/evnto: no toggle this wave; mechanism is shared DS/provider behavior; availability
flag documented in each vertical profile file (BITHIRE via getBithireTenantOverrides seam,
platform via PLATFORM_PROFILE const) — no BitHire hardcoding in shared components.

## AD-6 · i18n / Arabic-safe

- EN default: verify only (already `'en'`).
- Mandatory-fallback guard IN THE COMPILER: compileBrandTheme fails if any emitted
  `--ds-font-family-*` stack omits the mandatory Arabic fallback (`"Noto Sans Arabic"`)
  for verticals whose supported-locale surface includes ar (define the mandatory list as
  a contract constant, not a magic string in the compiler). The evnto regression closes
  itself via AD-1 (extension declarations deleted → compiled stack with the fallback
  ships) and the guard prevents recurrence.
- `lang`/`dir` SSR+hydration test per Phase 6; no mass translations.

## AD-7 · Strategic tests (targets, each with a negative drill)

T1 BrandTheme mutation → artifact → composed-value propagation (kills N-2 class).
T2 planted flat-channel redeclaration without exception header → provenance gate RED.
T3 declared reduced-motion/media exception → gate GREEN (and removal of header → RED).
T4 mode reachability: stored preference → data-theme stamp → artifact mode block applies
   (jsdom transition test asserting computed custom-property change, not string snapshots).
T5 DB row → validation → compiler → SSR embed → hydrate (extend the existing fixture
   canary to assert ramp values are the OKLCH emitter's).
T6 planted second DB emitter for a ramp key → composition throws (fail-closed drill).
T7 APCA input == final composed value (drill: divergent planted value fails).
T8 BitHire-static vs TMM-DB divergence on the same tree (existing divergence suite
   re-anchored to the new composition).
T9 invalid locale → EN (exists; keep green).
T10 ar → lang/dir + font stack contains mandatory fallback (drill: stack without it →
    compiler error).
T11 hand-edited/stale artifact → build-vertical-artifacts --check RED (exists; add the
    hermetic drill that edits a temp copy).
T12 rottay: base state serves BrandTheme values (compiled block applies unconditionally);
    drill: light-gating the spec again → T12 RED.

## AD-8 · Writer areas and sequence

W1 (opus): static path — brand-themes TS ×3, extension.css ×3, brand-theme compiler,
artifact-renderer spec, artifact regeneration, provenance gate + drills, T1-T3, T11, T12.
W2 (opus): DB path — visual-config, color-math removal, APCA hookup, T5-T8.
W3 (sonnet): root state + i18n runtime — ThemeProvider mode writer + PRODUCT_PROFILE
gating, app-platform enablement, app-bithire trio cleanup, lang/dir tests, T4, T9, T10
(compiler guard itself is W1's file area; W3 provides the test).
W4 (orchestrator): docs, EvidenceManifest promotion, serial validation, handoff.
Sequence: W1 completes and validates focally BEFORE W2/W3 start; W2 then W3 (no parallel
heavy validation ever; agents run only single-file focal tests, never suites/typecheck/
build; final serial chain is the orchestrator's).

## AD-9 · Bundle regeneration BLOCKED (Kimi-conflict isolation)

`packages/core/styles/{bithire,evnto,index,platform,rottay}.css` are DIRTY in the
concurrent WIP (verified 2026-07-27). Regenerating bundles would rewrite them from
dist-state that may not include the concurrent session's un-built source edits —
unacceptable clobber risk. Therefore this wave: regenerate ONLY
`src/.../artifacts/*/index.css` via `build-vertical-artifacts.mjs` (clean files); do NOT
run `build-vertical-css.mjs`; bundles remain temporarily stale w.r.t. the new artifacts.
This is a documented reconciliation blocker (handoff item 15): bundle regeneration
happens when the concurrent WIP lands, as one command. Any bundle-parity check that goes
red because of this is expected and pre-attributed — do not "fix" it by widening
baselines or regenerating bundles.

## AD-10 · Adversarial verification of writer self-reports (added 2026-07-27 after owner challenge)

Writer agents' final reports are CLAIMS, not evidence — accepting them as-is would repeat
the exact failure Codex flagged in R1 (green self-reports read as certification). Before
the serial validation chain, the orchestrator independently: (1) diffs the full porcelain
of all three repos against each writer's declared file list — any undeclared touched file
or any Kimi-WIP file touched is a blocking finding; (2) re-runs the pixel-preservation
acid test from the comparison script, not from W1's stored JSON; (3) executes the
negative drills personally — planted flat-channel redeclaration → provenance gate RED,
planted second DB emitter → throw, hermetic stale-artifact → RED; (4) spot-recompiles
from source and verifies concrete channel values (--ds-card-bg rottay, --ds-color-bg-primary
bithire, evnto font stacks) against the reports. No claim from W1/W2/W3 enters the
official doc or the handoff without surviving this pass; anything unverified ships
labeled UNKNOWN, never PASS.

## Out of scope (do not touch)

Candidates visual work; Kimi's 140 dirty DS files + 102 dirty app files (census in
phase0-*-porcelain.txt); the 5 dirty script files; Classic/Rustic; Daisy; new deps;
new theme layers/namespaces; baselines widening; `!important`.
