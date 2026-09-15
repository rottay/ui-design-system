# Serialized milestone checkpoint — 2026-09-14 final

Pin: `b11997351` (+ the two evidence commits that follow; the measured product pin
is `b11997351`, tree clean). Coordinator: kimi-admin. Everything here was executed
serially on the clean checkout `/Users/daniel/Developer/Rottay/r4-recon-opus`
(branch `main`). This supersedes the "reported" status of the 605c5bf34 receipts:
the numbers below are VERIFIED with raw outputs in this directory.

## RUNTIME-01 receipt (one-build/public-package workflow) — PASS, verified

1. Build A on the restored state (`rottay/network-professional@1`): exit 0
   (`/tmp/build-final3.log`; exports-artifact-gate OK, 322 targets). Hashes of the 12
   tracked outputs: `02-hashes0-network-professional.sha`.
2. One valid profile selection changed: `brand-themes/bithire` RECIPES →
   `rottay/editorial-round@1` (`03-buildB-profile-change.log`, exit 0).
   Projection verified (`04-projectionB.txt`): the new id appears exactly once in the
   bithire facade artifact, the generated artifact-runtime module, `dist/styles.css`,
   `dist/bithire.css`, the bundled `dist/.../artifact-runtime/index.js` and the dist
   brand-themes chunk; zero occurrences of the old id in those legs. Hashes:
   `05-hashesB-editorial-round.sha` + `05b-hashesB-extended.sha`.
3. Public mount leg on the changed state (`06-mount-on-editorial.log`): exactly the
   two pinned tests fail, both with
   `expected 'rottay/editorial-round@1' to be 'rottay/network-professional@1'` —
   the positive proof the mount projects the fresh compile rather than refusing or
   serving stale JS; the other 22 mount tests pass.
4. Selection restored, build C (`07-buildC-restored.log`, exit 0).
   **Idempotence: build C byte-identical to build A on all 12 tracked outputs**
   (`09-idempotence.txt`). Mount 24/24 green on the restored state
   (`10-mount-restored.txt`). Tree restored clean; regenerated artifacts committed
   (`da95cf1b3`, toggle channels attributed to `04e835647`).

## decisions-lit official refresh — PASS

`11-decisions-lit-run.log`, `12-decisions-lit-check.log`: run + check exit 0;
republished artifact committed (`b11997351`). The recorded-vs-measured distinction
and the unresolved discrepancies stay as the instrument reports them.

## Gates at the pin — PASS

- liveness suite 129/129 + `--check-dispositions` OK (structural-constant partition).
- population 36/36; axis-difference 66/66; pilot 8/8 Chromium (29 applicable + 1 N/A,
  mutants red-by-name with baselines restored; record at
  `test-artifacts/gates/axis-difference-pilot/index.json`).
- family-cut drills 62/62; engine-audit 3,310 counters; read-without-producer OK;
  public-entrypoints OK; supplier-contract OK; typecheck:tests 0; roadmap:check OK.

## Full milestone suite — 18,296 passed / 23 failed of 18,338 (19 pending)

Raw JSON: `13-fullsuite.json` (6.3 MB); log: `13-fullsuite.log`. Exit 1 as expected
(red content exists). Exact failure classification (names verified against the
recovered sets in `evidence/checkpoint-2026-09-14/`):

- **16 = the inherited-red identity set, verified test by test**: LayoutBatch ×2
  (modern + rustic), CommunicationBatch PresenceBar, FloatButton backtop,
  AlertDialog real-engines, provenance-acceptance variable counts, WorkspaceSwitcher
  ×4 (integration, modern trigger, roving focus, nested-interactive menu), LiveFeed
  advanced, EmptyState action, customization-fields illegible-branding,
  tenant-document-v2, context-identity seven-consumers, Input cascade-roster
  (`probe-roster: input-modern-md matches its engine`). Owners: FAM-05..08 lane as
  registered; inherited ≠ waived.
- **3 = semantic-typography digests (rottay/bithire/evnto leg-A compaction)**:
  known wave-related debt already present in the initial candidate list, still open.
- **4 = NEW at this pin, under attribution (N4e dispatched)**: canonical-digest-identity
  ×2 and tenant-theme-artifact-stability ×2. Not present in any earlier list; the
  prime suspect is today's legitimate artifact regeneration for the toggle shape
  channels moving pinned digests. Root-cause first; re-anchor only where the movement
  is a reviewed change; fix if the movement is a real defect.
- All 12 other initial candidate-only reds are GREEN at this pin (radius-field
  projection, reduced-motion skeleton guard, EnvironmentToggle confirm modal,
  ChartTheme root scope, status-seeds accounting, SSR viewport ×2,
  shape/control-height ×2, capability-propagation, ChartTheme timeout).

## Residual obligation

N4e: attribution of the 4 new digest/stability failures (+ the 3 semantic-typography
digests if the same class), fixtures re-anchored with provenance only for reviewed
movements, or defect fix. Registered in WO-EVI-02.
