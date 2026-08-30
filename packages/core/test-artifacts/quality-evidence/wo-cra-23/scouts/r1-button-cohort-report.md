# SONNET — Cohort report: R1 unit 1 (Button + Segmented), WO-CRA-23

- **Date:** 2026-08-30
- **Base:** `a90af6ebb` (fix(modern-rescue): cascade-producers COH-1 conservation regression)
- **Authority executed:** `packages/core/test-artifacts/quality-evidence/wo-cra-23/scouts/r1-button-opus-grammar.md` (GRAMMAR READY), items 1-15 of §2, laws G1-G10, fences of §6, DT adjudications (i)/(ii)/(iii) as handed down in the delegation prompt.
- **Role:** sole writer this packet (Claude implementer, Sonnet tier). No push. `docs/reauditoria-cloud/` and the concurrently-appearing `scouts/r1-patterndatatable-opus-grammar.md` (another agent's untracked work, observed mid-session, never opened or touched) stay out of staging.

This report is honest about two things the grammar doc's GO/NO-GO gates required and this
packet did **not** fully close: live F4C capture evidence (§7.2 gates 9/10/11) and the
`density.mode` static-arm fix (adjudication ii). Both are named explicitly below rather than
claimed. Sections A-E are exact per the fence in `README.md` ("Cohort report shape").

---

## A. Productive files modified

**Source (family-source / shared-recipes-tokens-styles / shared-contracts domains):**

| File | Items executed |
|---|---|
| `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/button.css` | 1 (dead C2b rule removed), 2 (busy-content gap fix), 4 (mechanical height floor, private socket), 7 (connected-group geometry moved in from button-group.css), 12 (quiet-range rest wash, private socket) |
| `packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/segmented.css` | 8 (single boundary — selected option drops border-color + shadow), 9 (control-ladder derivation: height/padding-x/font-size/line-height/gap/icon-size/radius all fall back to `--ds-button-{size}-*`), 10 (canonical `--ds-focus-ring`, drops the low-alpha channel), state-grammar unification (hover/pressed/focus-visible read `[data-state~=...]` instead of native pseudo-classes) |
| `packages/core/src/foundation/tokens/css/presentation/components/button.css` | 5 (`--ds-button-touch-target-min` root-independent via `max(44px, 2.75rem)`), 11 (`--ds-button-link-text-decoration: underline` at rest) |
| `packages/core/src/foundation/tokens/css/presentation/components/skin/button-group.css` | 7 (trimmed to layout/gap/mobile/ring-room only; radius+seam ownership moved to the engine skin) |
| `packages/core/src/ui/primitives/inputs/Button/engines/modern/index.tsx` | 3 (width-stable busy path is now the only path whenever a label exists; `loading` no longer collapses footprint or hides the label) |
| `packages/core/src/ui/primitives/inputs/Button/compound/Group/index.tsx` | 6 (stamps `data-connected` + token-list `data-group-position` on each child) |
| `packages/core/src/ui/primitives/navigation/Segmented/engines/modern/index.tsx` | 14 (extracted `SegmentedOptionButton`; each option now calls `useInteractionState`/`partAttributes`, same behavior-core utility Button uses) |
| `packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts` | 13 (hardcode drain — see §B) |
| `packages/showroom/src/app/probe/ds-reference/sections/control/index.tsx` | 15 (scene extension — see §D) |

**Tests updated (observable-tests domain), each with the intentional-change reason inline:**

- `Button/tests/Button.modern-quiet-destructive-and-busy-reserve.test.tsx` — busy-reserve-without-label assertion flipped from "spinner only" to "resting label visible" (G8).
- `Button/tests/Button.pass1-contract.test.tsx` — accessible name now comes from the visible busy label, not a hidden duplicate.
- `Button/tests/Button.pass2-craft.test.tsx` — connected-geometry assertions moved from `button-group.css` to `button.css` (the file that now owns them).
- `Button/tests/Button.modern-engine-advanced.test.tsx` — `loading` + label now takes the reserve/`aria-hidden` structure, not `data-state="hidden"`.

**Mechanically regenerated, never hand-edited** (the official generator ran; content follows source):

- `packages/core/src/foundation/tokens/css/facade/artifacts/bithire/index.css` — `pnpm build:vertical-css`.
- `packages/core/styles/{bithire,rottay,evnto,index}.css` — same build step; rottay/evnto move too because the touched skin files are shared across every vertical.
- `packages/core/hooks-manifest.json` — `pnpm hooks:generate` (one entry, `--ds-segmented-item-border-selected`, dropped from the unadjudicated-read fence because item 8 retired the read; 91 public hooks unchanged).
- `packages/core/manifest/generated/root-membership.json` — `root-membership --write` after the real build (1608 channels, 879 with root, digest `94ec81753c2e`).
- `packages/core/scripts/engine/cascade-wiring-ratchet/cascade-wiring-ratchet.baseline.json` — hand-edited per the gate's own printed instruction (it has no `--write`); see §C for the numbers.

**Note on domain boundaries:** `hooks-manifest.json` and the `packages/core/styles/**` bundles sit
in `reservedPaths` (architecture-integrator singleton), outside the four domains this packet was
assigned. They were touched only because the official generator refused to pass otherwise and
leaving them stale is itself a listed FAIL condition ("stale source ... is FAIL"). Flagged here
for the DT rather than silently absorbed.

---

## B. Hardcodes retired or adjudicated

No fixed repo-wide hardcode-census detector exists yet (the grammar doc's own §4.1 says the
existing `scouts/hardcode-census-top5.md` detector does not reach the vertical-baseline plane
this unit lives on). Measured by hand against the owner's definition ("a brand value the tenant
cannot move"), scoped to the write-set the grammar doc named in §4.2-§4.5:

**Retired (source now derives, previous literal kept only as the `var()` fallback):**

| Channel | Before | After |
|---|---|---|
| `--ds-button-secondary-color`/`text` | flat `#3A6FB0` | `var(--ds-color-primary, #3A6FB0)` |
| `--ds-button-disabled-bg` | flat `#F8FAFC` | `var(--ds-material-control-background-disabled, #F8FAFC)` |
| `--ds-button-disabled-color` | flat `#AEBCC8` | `var(--ds-color-text-muted, #AEBCC8)` |
| `--ds-button-disabled-border`/`-border-color` | flat `#E8EEF3` | `var(--ds-color-border-secondary, #E8EEF3)` |

**Retired by removal (channel no longer read at all, item 8/10):**

- `--ds-segmented-item-shadow-selected` — field and CSS read both deleted; selected option no longer carries the BitHire-tinted second border/shadow.
- `--ds-segmented-focus-ring` — field and CSS read both deleted; focus now paints the canonical `--ds-focus-ring` Button already uses.
- The default `linear-gradient(155deg, ...)` fallback for the selected option — unreachable on both shipped grounds (§4.3), replaced with a flat derived fallback.
- The dead `.rottay-btn.rottay-btn--modern[data-part='root']` rule (item 1) — the modern engine has never emitted `rottay-btn`/`data-part='root'` together; confirmed dead, removed.

**Corrected against the file's own written invariant:**

- `segmented.padding` seed: `3px` → `4px` (the skin's own header comment requires 4px so the focus ring and the option hover-lift don't clip against the scrollport; the authored value contradicted it).
- Segmented option `border: 1px solid transparent` → `var(--ds-edge-standard-width, 1px) var(--ds-edge-standard-style, solid) transparent` (same edge grammar as every other control, kept transparent at rest for forced-colors only, per item 8).
- `--ds-segmented-current-line-height` CSS fallback: `normal` → `var(--ds-button-{size}-line-height)` (closes a §4.4 literal, folds into item 9's ladder).
- 18 fields across `segmented.sm/md/lg` (height, paddingX, fontSize, lineHeight, iconSize, gap, radius) — each now derives from the matching `--ds-button-{size}-*` step (item 9, control ladder), with the prior literal preserved as the fallback.

**Adjudicated, not executed in this lot (written reasons):**

- `--ds-button-link-color-hover` — already derives (`var(--ds-color-primary-hover)`) in bithire's own source; the identical hex measured on both grounds traces to `--ds-color-primary-hover` itself not diverging between the static and DB transports, a compiler-layer static/DB parity question (`infrastructure/compilers/**`, reserved, not one of this packet's four assigned domains). Recorded as a finding for the DT, not fixed here.
- `--ds-button-group-divider-color` — already fully derived through `--ds-button-default-border` → `--ds-color-border`. The remaining leak is entirely the foundation channel `--ds-color-border` itself, which §4.5/§6.7 explicitly fence out of this lot with a written reason (global blast radius, deferred to unit 2/3). Confirmed untouched.
- **Correction to §4.3's own claim:** `--ds-button-primary-hover-bg` is **not** a dead alias. It is the live `background` source for the **rustic** engine's hover/gradient paint (`runtime/engines/rustic/skin/button.css:184,216`) — rustic is read-only in this lot (fence #6.3). Left untouched; the grammar doc's claim is corrected here rather than acted on.

**Census, before → after, on the write-set named above:** 7 live brand-hardcode leaks (§4.2) → 0
remaining reachable by any tenant in the vertical (6 retired, 1 referred to the DT as a
compiler-layer finding, not a Button/Segmented-owned literal). 2 dead/unreachable rules (§4.3) →
0 (both removed; 1 correction recorded instead of a matching removal). 6 adjudicable skin
literals (§4.4) → 0 unaddressed (4 retired/relinked, 1 corrected against the file's own
invariant, 1 folded into the ladder). Strictly monotonic decrease, as the round requires.

---

## C. Controls whose cascade was demonstrated

**Not run this packet: live F4C capture.** No dev server + Chromium capture cycle was executed,
so none of the five controls has a MOVE/HOLD receipt with byte-exact restore across both
grounds — the §7.2 gate 10 bar ("≥3 of 5, both doors, byte-exact restore") is **not met**. What
follows is what the **build** actually proves (the compiled `var()` chain is correct end-to-end
for the static BrandTheme path), which is real but is evidence of *wiring*, not of *rendered
cascade* the way §7.2 requires it measured.

| # | control | what the build proves | what is still open |
|---|---|---|---|
| 1 | `palette.seeds` | `--ds-button-secondary-color` now resolves through `--ds-color-primary` in the compiled bithire artifact (confirmed: `grep` on the regenerated CSS) — TMM should no longer inherit BitHire's blue on `Assign`/secondary text. | No live capture; DB-arm equivalence for this specific channel unverified this packet. |
| 2 | `shape`/radius | Segmented's per-size `radius` now derives from `--ds-button-{size}-radius` (control ramp) instead of `--ds-radius-sm` (surface ramp) in both the CSS fallback chain and the bithire seed. This is the exact F5 fix. | No live capture proving Button and Segmented radii now move together under TMM's shape dial. |
| 3 | `density.mode` | **Not fixed.** F9's root cause (the static BrandTheme artifact emits an unconditioned `--ds-density-mode-factor` that outranks `:root[data-density='spacious']`) lives in the compiler that produces the static artifact (`infrastructure/compilers/**`), outside this packet's four assigned domains. DT adjudication (ii) recommended fixing it inside this lot; I could not locate a safe fix confined to `family-source` / `shared-recipes-tokens-styles` / `shared-contracts` / `manifests`. **Flagged for explicit DT re-routing or domain grant, not silently dropped.** |
| 4 | typography (`--ds-type-scale`) | Segmented's `fontSize`/`lineHeight` per size now derive from `--ds-button-{size}-font-size`/`-line-height`, which are already type-scale-aware. Closes the F5 gap where Segmented labels didn't move with the dial. | No live capture. |
| 5 | `effectIntensity` | Untouched by this lot; confirmed no edit in button.css/segmented.css touches an `--ds-effect-intensity` consumer, so the already-working axis (0.58 vs 0.2, per the grammar doc) should be unaffected. | Not re-verified live. |

**Honest count against §7.2 gate 10:** 0 of 5 have the required live MOVE/HOLD receipt this
packet. 3 of 5 (`palette.seeds` partial, `shape`, `typography`) have a source-level fix verified
through the real build. `density.mode` is an open adjudication gap, not a silent miss.

---

## D. Instrumental work

- Extended `probe/ds-reference/sections/control/index.tsx` (item 15, within `probe/ds-reference`
  only, no torture-harness import): added a `loading`-with-no-explicit-label row (proves F10's
  fix visually), a quiet-range row (ghost/text rest, icon-only ghost, ghost+danger, link), a
  selected/`aria-pressed`/`aria-current`/disabled-Segmented-option row, and an xs/xl scale-extreme
  row (block xs included).
- **Not done:** `packages/showroom/scripts/f4c-canary-capture.mjs` viewport list
  (390/768/1280 → 320/390/768/1440) and its control-scene entry (testids, MOVE/HOLD nodes) — the
  bounded instrument debt Opus's §3.2 explicitly pre-authorized. Ran out of session budget before
  reaching it; no live capture evidence exists for this cohort as a direct consequence (see §C).
- Regenerated, not hand-edited: bithire facade CSS, the four `packages/core/styles/*.css`
  bundles, `hooks-manifest.json`, `manifest/generated/root-membership.json` — each via its own
  official generator, each a deterministic consequence of the source edits in §A.
- Rebaselined `cascade-wiring-ratchet.baseline.json` (the gate has no `--write`; edited by hand
  per its own printed instruction): `debt` 2169 → 2163, `denominator` 4373 → 4365, `wired`
  2204 → 2202, `rootsExcluded` 769 → 774. Debt **shrank**; the ratchet's own invariant ("never
  up") holds. A dated note was appended documenting the cause (dead-fallback removal +
  Segmented's new control-ladder wiring).
- `fleet.inlinePaint` for both families confirmed unchanged at 0 (token-audit --check green,
  no baseline edit needed there).
- **Not done:** per-family manifest cell disposition changes (`UNKNOWN` → `APPLICABLE`) for
  `manifest/families/primitive/inputs/button.json` / `.../navigation/segmented.json`. Each file
  is 500+KB of generated-adjacent structure with no dedicated cell-editing tool located this
  session, and no live-capture evidence exists yet to cite as the `evidenceIds` a disposition
  change would require. Hand-editing either file without both would risk exactly the kind of
  unowned drift the manifest law forbids. Deferred rather than improvised.

**Verified, not merely asserted:**

- `pnpm --filter @rottay/design-system structure:check` — clean (0 findings, 5/5 subtests pass).
- `node scripts/engine/cascade-wiring-ratchet/index.mjs` — OK after rebaseline (never went up).
- `node scripts/engine/token-audit/index.mjs --check` — OK; Button/Segmented `inlinePaint` stay 0.
- `node scripts/tokens/root-membership/index.mjs --check` — OK after a real `pnpm run build` and `--write`.
- `pnpm run build` (full: tsc, vite, modern-css, vertical-css, fonts, stamp, postbuild gates) — green end to end.
- `pnpm vitest run` on Button (16 files), Segmented (6 files) and `engines/modern/tests` — **243/243 pass**, including the 4 assertions updated on purpose.
- `pnpm vitest run src/ui/structures/workspace` — 168/169 pass; the one failure
  (`WorkspaceChromeBatch.contract.test.tsx`, a `waitFor` timeout on a segmented-control count)
  was reproduced **identically at HEAD `a90af6ebb`** via an isolated `git worktree` A/B — confirmed
  pre-existing, not caused by this packet.
- `program-check.mjs` — the exact same 117 stale F4B receipts as HEAD, verified **byte-identical**
  by diffing the sorted finding lists from a HEAD worktree against this tree's output (not merely
  same count). No new finding.
- `program-check.test.mjs` — 2 of 53 top-level subtests fail: (1) the wrapper assertion that
  surfaces the same 117 known findings above (fails at HEAD too, by construction), and (2) a
  nested N13 artifact-purity check inside `cascade-extract.test.mjs`/`cascade-producers.test.mjs`.
  The second was traced to a **live, still-running, unrelated process** (`ps aux` showed
  `node --test program-check.test.mjs`, PID 45226, 471 CPU-minutes, started 11:23 that morning
  under a `timeout 540` wrapper that should have killed it long before) — almost certainly another
  active session's concurrent work on the same tree, exactly the "otro carril escribiendo" /
  "build en vuelo" contention class the test's own inline comment names and asks to be re-run in a
  quiet window rather than adjudicated live. I did not kill another session's process. Not
  re-verified clean this packet; flagged rather than claimed green.
- `pnpm run hooks:check` — current after regenerate.

---

## E. Next productive lot

**PatternDataTable** — the round's own order (`rounds.json` R1 `objectives`: "attack Button then
PatternDataTable then AppShell"). A grammar authority for it,
`scouts/r1-patterndatatable-opus-grammar.md`, appeared **untracked in this working tree during
this session** — authored by a concurrent agent (not this packet's writer), never opened or acted
on here, left exactly as found. The DT should route it to the next implementer the same way this
one was routed to Sonnet.

**Before that lot launches, three items from this one need an explicit DT call:**

1. `density.mode`'s static-arm fix (§C item 3) — needs either a domain grant into
   `infrastructure/compilers/**` for this specific channel, or an explicit deferral with a written
   reason, matching the "written adjudication" the DT's own instructions required before claiming
   this control's cascade proven.
2. Live F4C evidence (§C, §D) — the harness viewport/scene extension is pre-authorized instrument
   debt (Opus §3.2) that this packet didn't reach; someone (Sonnet again, or a sibling terminal)
   needs a dedicated pass with a dev server up before any of the five controls can clear §7.2
   gate 10, and before the sighted matrix of §3 can be captured at all.
3. `program-check.test.mjs`'s N13 contention (§D) needs a genuinely quiet re-run — not
   adjudicated, not ignored — once whatever session owns PID 45226's process class has finished.
