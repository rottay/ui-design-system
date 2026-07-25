# Codex Audit — OLA 5 continuation — 2026-07-23

Status: F3 accepted after Codex remediation; F2 accepted as partial progress;
OLA 5 remains incomplete.

No commit, push, PR or publish was made.

## Verdict

The continuation is **not accepted as a completed OLA 5**.

- F3 / DS-A008 semantic motion is accepted.
- F2 / DS-A006 and DS-A007 typography and density is useful progress, but it
  is not closed.
- F4, the two-pass P0 component tranche, did not start.
- F5, the bounded BitHire Candidates canary, did not start.

Certified quality therefore remains unchanged:

- 14/92 public primitives (15.2%);
- 14/119 total platform artifacts (11.8%).

The delivery does not justify adding a component to the certified ledger.

## Accepted F3 result

The existing typed motion authority now includes the four missing semantic
recipes:

- `feedback.hover`;
- `feedback.focus`;
- `feedback.error`;
- `disclosure.reveal`.

Codex verified:

- the single registry now contains 16 bounded recipes;
- every recipe is deterministic, finite and at most 500ms;
- governed recipes use compositor-safe transform/opacity output;
- reduced motion resolves to the final state with zero duration;
- legacy duration aliases drain to the canonical 120/200/320/500ms scale;
- the canonical and compatibility duration channels remain aligned.

Codex added a direct CSS contract for the duration aliases and
reduced-motion branch. No new motion registry or parallel authority was
introduced.

## F2 progress that is accepted

The following work is retained:

- the base font chain includes an Arabic-safe fallback;
- the nine semantic typography roles have declared defaults;
- explicit Modern Typography roles consume their semantic token chain;
- Modern Input geometry consumes the effective density scale;
- Button continues to consume the same density scale;
- `DensityScope` and `useDensity()` provide a typed, bounded local posture
  contract;
- the scoped density contract is exported from the public package;
- compact, comfortable and spacious remain separate from layout-view
  preferences;
- the 44px coarse-pointer floor remains irreducible.

## Why F2 is not closed

Claude's handoff described the density runtime as a unique authority, but the
implementation only proved a local scope:

- the root tenant provider does not yet mount the scoped density contract;
- existing ad-hoc `data-density` writers have not been migrated;
- static `BrandTheme`, DB `appearance`, CSS emission and JS context do not yet
  have one same-tree equivalence proof;
- the Arabic fallback can still be replaced by a tenant compiler value that
  omits Arabic coverage;
- no deterministic density fixture proves compact/spacious behavior across
  EN, ES and AR/RTL;
- Heading still has no accepted semantic default.

The documentation on `DensityScope` was corrected so it no longer promises
global authority that the implementation does not provide.

## Typography regression prevented

The continuation silently changed every Modern `Text` without an explicit
`textStyle` from its established `md` default to semantic `body`. The compiled
body role is smaller than the previous default, so that change would have
retuned existing applications without a deterministic visual migration.

Codex restored the established default:

- implicit `Text` remains `md`;
- semantic `body` remains available and fully consumed when explicitly
  requested;
- a focused test prevents an unreviewed implicit retune;
- a future default migration requires a deterministic fixture and sighted
  evidence.

## Rustic test adjudication

The reported Rustic Typography failure was a stale expectation, not an engine
regression. The engine correctly consumes the canonical
`--ds-font-family-mono` channel while the test still expected the legacy
`--ds-font-mono` alias. Codex updated the test to the canonical contract.

## Visual inspection

Codex inspected the live Showroom route
`/probe/brand-locale-evidence` in the in-app browser.

Two real trees were checked:

1. BitHire static source, English, LTR.
2. The Management DB source, Arabic, RTL.

Sighted result:

- tenant identity, palette, typography and surface treatment differ visibly;
- Arabic copy renders and the document direction changes to RTL;
- the same fixture structure is retained;
- the inspected Arabic document has no measured horizontal overflow
  (`scrollWidth === clientWidth`);
- no overlapping text or clipped control was observed in the inspected
  viewport.

This is valid evidence for the existing static-vs-DB/i18n channel. It is not
evidence that density, semantic defaults or F4 component craft are complete.
No visual acceptance is claimed for motion timing from a static screenshot.

## Codex remediation

Codex changed only the bounded audit defects:

- exported the scoped density contract publicly;
- corrected its documentation to state its real local guarantee;
- prevented the unproven implicit Modern Text retune;
- updated the stale Rustic canonical-token expectation;
- added typography, Arabic-fallback and motion-alias regression tests;
- regenerated the supplier contract through the sanctioned generator.

No baseline was widened and no unrelated dirty-worktree change was reverted.

## Validation

Executed serially:

- focused suite: 7 files, 94/94 tests pass;
- core typecheck: pass;
- core pretest: pass;
- supplier contract: regenerated and current;
- Daisy projection contract: 5/5 pass;
- tenant channel gate: 1,615 inventoried, 236 acknowledged dead, zero new;
- ownership ratchet: 4,074/4,074;
- vertical artifacts and CSS: current;
- application boundary, theme parity and pattern/surface ownership: pass;
- `git diff --check`: pass.

The repeated `${NODE_AUTH_TOKEN}` warning comes from local npm configuration;
it did not alter command results.

## Required continuation

Continue OLA 5 rather than opening OLA 6:

1. close the remaining global density and typography authority gaps;
2. keep accepted F3 frozen;
3. complete both passes for the six P0 component families;
4. expose deterministic static-vs-DB, locale, density and hostile-content
   fixtures;
5. migrate one bounded Candidates canary only after the DS tranche is green;
6. let Codex perform browser inspection and decide certification.
