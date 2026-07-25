# Codex Audit — OLA 5 F2 closure attempt — 2026-07-23

Status: implementation accepted after Codex remediation; F2 remains partial
until its deterministic same-tree fixture is delivered.

No commit, push, PR, publish or certified-ledger change was made.

## Verdict

The submitted implementation contained real authority and presentation defects.
Codex corrected them and accepts the resulting code as the new working
baseline. The handoff is **not accepted as proof that F2 is closed** because it
explicitly omits the required compact/comfortable/spacious × EN/ES/AR fixture
and the four-plane same-tree equivalence proof.

Certified quality remains unchanged:

- 14/92 public primitives (15.2%);
- 14/119 total platform artifacts (11.8%).

F3 stays accepted and frozen. F4 and F5 have not started.

## Findings and remediation

### P0 — density was being applied twice

The submitted root provider derived `data-density` from the structural tenant
scale as well as from the semantic Appearance preference. That mixed three
different authorities:

1. `--ds-density-scale`: structural brand scale;
2. `--ds-density-mode-factor`: global semantic Appearance preference;
3. nested `data-density`: local relative override.

The base CSS already multiplies the first two at the root. Reusing the
structural scale as a root `data-density` posture multiplied density twice.

Codex corrected the contract:

- root posture is derived only from `appearance.general.density`;
- DB Appearance retains precedence over static Appearance through the existing
  normalized configuration path;
- root `data-density` is semantic JS/DOM metadata and does not reapply a CSS
  multiplier;
- only non-root density scopes apply compact/comfortable/spacious local
  factors;
- structural brand scale remains independent;
- the 44px coarse-pointer floor remains intact.

### P0 — Arabic-safe fallback could still be replaced

Appending `"Noto Sans Arabic"` in individual compiler branches was
insufficient. An advanced raw font-family channel could overwrite the safe
chain later in the Appearance merge.

Codex reinstated the Arabic-safe suffix as the final compiler invariant for
base, heading and display families. The tenant-selected family remains first,
the operation is idempotent, and mono remains intentionally independent.

### P1 — claimed density-writer migration was incomplete

Several files imported `densityScopeAttributes()` but still wrote
`data-density` directly. Codex migrated the productive DS consumers to the
canonical helper, including DataTable, MarkdownView, RecordFacts and
DecisionComparison. Portal propagation in Tooltip and Popover remains direct
because it forwards an established scope through a portal rather than
authoring a new posture.

The ARC09 auditor initially counted the canonical JSX spread as opaque paint.
Codex certified only the exact canonical export as a verified non-paint prop
bag and added a fail-closed regression: a same-named helper from any other
module still counts as an unknown spread. No ceiling or baseline was widened.

### P1 — DataTable failures were real

The two reported DataTable failures were not dismissed as stale:

- Typography overwrote a mobile-summary `data-part`, so the intended public
  anatomy disappeared;
- mobile-card suppression tied the Card selector specificity and did not win
  deterministically;
- one lazy-engine test retained a static `NodeList` across the render boundary.

Codex restored the public anatomy with a wrapper, made the suppression
specificity deterministic, and re-queried after the lazy boundary. The focused
DataTable suite is now fully green.

## Accepted F2 implementation

The following implementation is accepted and must not be rebuilt without a
focused failing regression:

- Arabic-safe typography compiler invariant for static and DB sources;
- nine declared semantic typography roles with explicit Modern consumption;
- stable implicit Modern `Text` behavior (`md` remains unchanged);
- one typed density vocabulary;
- root density metadata mounted through the canonical provider;
- DB-over-static semantic Appearance precedence;
- separation of structural scale, semantic global mode and nested local scope;
- canonical density attributes in productive DS consumers;
- density-aware Input and Button geometry;
- irreducible coarse-pointer touch floor.

## Why F2 remains partial

The required proof artifact is still absent. The continuation must provide one
deterministic real DS tree proving:

- BitHire static and The Management DB sources;
- compact, comfortable and spacious;
- EN, ES and AR/RTL;
- root DOM posture, JS context posture, compiled CSS variables and rendered
  geometry agree;
- a nested override changes only its subtree and restores correctly;
- structural scale is not interpreted as semantic posture;
- DB Appearance overrides static Appearance without a markup fork;
- long copy, wrapping, truncation and numeric typography remain valid.

Until Codex inspects that fixture, this audit makes no new visual claim.

## Validation

Executed serially:

- typography/density focused tranche: 83/83 pass;
- canonical root-provider integration: 2/2 pass;
- DataTable contract and real-engine suite: 35/35 pass;
- affected MarkdownView, RecordFacts, DecisionComparison and DataTable suites:
  53/53 pass;
- ARC09 counter suite: 23/23 pass;
- core typecheck: pass;
- engine-token audit: pass with 3,232 counters and unchanged baselines;
- sanctioned vertical CSS generation: complete;
- core pretest: pass;
- tenant channels: 1,615 inventoried, 236 acknowledged dead, zero new;
- ownership ratchet: 4,074/4,074.

The repeated `${NODE_AUTH_TOKEN}` warning is local npm configuration noise and
did not affect the results.

## Next implementation boundary

Continue OLA 5:

1. deliver only the missing deterministic F2 proof and inspection manifest;
2. keep the corrected F2 authorities and accepted F3 frozen;
3. execute both passes for the six P0 F4 families;
4. prepare the bounded F5 Candidates canary only after the DS tranche is green;
5. leave browser inspection, certification, ledger status and percentages to
   Codex.
