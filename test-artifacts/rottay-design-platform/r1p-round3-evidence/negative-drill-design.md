# Negative Drill Design — Static Theme Provenance (Round 3)

Status: DESIGN ONLY. None of these drills were executed in Round 3 (read-only session; no
builds permitted). They are the acceptance mechanism for R1-P remediation: a gate may not be
cited as proof of single authority until its corresponding negative drill has been run and
observed to FAIL the gate.

Principle: a green gate that has never failed on a planted violation is untested. Every
"single authority" guard below must be demonstrated in both directions: clean input → PASS,
planted violation → FAIL with an actionable message.

## Drill catalog

### ND-1 — Planted second author (root/base duplication)
Plant: add to `_source/extension.css` a `:root`/base-scope declaration of a custom property
already emitted by the compiled BrandTheme block, with the SAME value.
Expected: the selector-aware overlap gate (R1-P deliverable) fails with the property name,
both sources, and both file:line locations. Byte-reproducibility checks
(`build-vertical-artifacts --check`) are expected NOT to catch this — the drill also
documents that limitation.

### ND-2 — Planted contradiction (root/base conflict)
Plant: same as ND-1 but with a DIFFERENT value.
Expected: gate fails, classifying it as contradiction (category B), not mere duplication.
The drill proves the gate distinguishes A from B.

### ND-3 — Planted inert conditional
Plant: add a `[data-theme="dark"]` (or media-dark) block for a vertical whose product policy
pins light mode, setting a shared property.
Expected: reachability-aware gate flags it as inert (category D) or requires an explicit
allowlist entry with owner + retirement condition (category H). A gate that only checks
name overlap will wrongly pass or wrongly fail this — the drill pins the required semantics.

### ND-4 — Planted second emitter
Plant: a scratch build step (or test fixture) that emits one `--ds-*` channel into a second
shipped stylesheet alongside the vertical artifact.
Expected: the emitter-uniqueness check (R1-P deliverable; likely a bundle-level census
comparing declared channel owners vs emitting files) fails, naming both emitters.

### ND-5 — Planted second runtime writer
Plant: a test-only client effect that sets a root attribute (e.g. `data-theme`) already
owned by SSR.
Expected: the writer-uniqueness guard (runtime assertion or hydration test) fails. This
drill covers the SSR-vs-client-provider family, not just CSS.

### ND-6 — Propagation drill (positive control)
Change a designated canary token in the BrandTheme TS fixture source; rebuild in a sandbox;
assert the artifact changes at the expected location AND nowhere else.
Then change the same channel only in extension.css; assert the gate reports the extension as
a non-canonical author for that channel.
Expected: proves the canonical source actually propagates (behavioral propagation, protocol
property #5) and that the artifact is not silently pinned by the extension.

### ND-7 — Stale-artifact drill
Modify the BrandTheme TS fixture without regenerating; run `--check`-equivalent.
Expected: FAIL (this is the one property the existing reproducibility check should already
enforce). Running this drill documents what the existing gate DOES cover, so its scope is no
longer overstated.

## Execution rules

- Drills run only in a sandbox/worktree copy or CI job, never in the shared working tree
  (concurrent-session law).
- Each drill records: plant diff, gate command, full gate output, PASS/FAIL, and revert
  confirmation.
- Drill results are attached to the R1-P closure evidence; certification language in any
  future audit may cite a gate only alongside its most recent drill result.
- Any gate whose drill cannot be made to fail is reported as NON-ENFORCING, and every claim
  resting on it downgrades to UNKNOWN.

## Open items to finalize during R1-P (not in this round)

- Exact gate names/commands once the selector-aware overlap gate exists (Claude owns
  architecture/gate; see roadmap in the official doc Round 3 section).
- Whether ND-4 runs at bundle level (post-build census) or source level (import graph).
- CI placement and cadence (per-PR vs nightly) — decision belongs to R1-P, recorded with
  owner and date.
