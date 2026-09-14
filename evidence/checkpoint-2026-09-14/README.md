# Checkpoint 2026-09-14 — coordinator receipts, scope-corrected

Coordinator: kimi-admin. Pins: milestone commit `605c5bf34` (+ sweep repairs through
`794fb2414`); integration line later consolidated into `main` at
`3dd32ac681bd66f19966533a5a37f32bfc38ded0` (Codex post-107 audited pin).
This file corrects the SCOPE of receipts registered in WO-EVI-02 progress entries
12–13 per the Codex post-107 audit (`audit/post-107-checkpoint-2026-09-14/evidence.md`,
`runtime.md` R108-RUN-02). Historical entries stay append-only; this is the
authoritative scope statement. "Verified" = independently re-checkable from durable
artifacts here; "reported" = the run happened under the coordinator but its raw final
output was not durably recovered.

## Scope corrections (audit-driven)

| Receipt (as registered) | Actual resolution/scope | Status |
| --- | --- | --- |
| "Browser legs on the packed build": family causality sweep 429/429 | `packages/core/tests/support/family-causality/index.ts` imports the SOURCE server entrypoint via `@` (line 26) and reads SOURCE facade CSS (lines 29, 86); it mounts server markup and applies state attributes — source/computed-style causality, NOT packed-package or hydrated-interaction proof | Reported (scope corrected) |
| axis-difference 62/62 Chromium | Same source resolution class: Modern implementations + compiler from source, `resolveBundle({mode:'fresh'})` recomposed in memory; real Chromium, real computed styles, but not a packed install and no hydration | Reported (scope corrected) |
| Mount 24/24 + consumer 29/29 "against the BUILT package" | Repo vitest resolver maps `@rottay/design-system` (and `/server`, `/icons`) to SOURCE (`vitest.config.ts:140`); the consumer-proof gate separates its packed/export/typecheck legs from its source-backed fixture suite; counts alone do not promote to packed proof | Reported (scope corrected) |
| RUNTIME-01 one-build/public-package workflow (entry 12) | PARTIALLY CORROBORATED: the two 8-row SHA manifests (A/B builds) are byte-identical (`cmp` equal, sha256 `f144f1a3…`) covering three facade CSS files, the generated source runtime module, the combined vertical stylesheet and three generated vertical stylesheets — but NOT `dist/styles.css`, dist JS blocks, a packed tarball or mount output. Full command logs, package digest, first-build mount assertion output were not durably recovered | Partially corroborated; re-established as verified at the next serialized milestone (planned) |
| FULL MILESTONE SUITE 18,184 passed / 16 failed of 18,219 | Final raw JSON/log not recovered. The inherited-red 16 identities ARE recovered by exact full-test-name set intersection of the two preserved files below (initial candidate 29 failures ∩ base receipt 37 failures = exactly the 16). Candidate-only 13 in the initial list = 12 deterministic wave-related failures + 1 ChartTheme timeout (corrects the "thirteen … and Chart" phrasing); base-only 21 = Modern framework-projection artifacts missing `dist/modern-engine.css` (environment mismatch, not 21 candidate fixes) | Reported; inherited-red identity set verified from preserved files |
| decisions-lit republished (7/22) + check green | Was fresh at the milestone; STALE at pin `3dd32ac68` (door fingerprint de8ee3a53314 → b31fcfd4b9da over 826 files); refresh due at the next stable candidate via the official measured workflow | Stale — refresh scheduled |
| engine-audit 3,310 counters green, fallbackParity 0 | Independently re-executed by Codex post-107 at the audited pin, exit 0 | Verified |

## Recovered durable artifacts (this directory)

- `artifacts-after-buildA.sha`, `artifacts-after-buildB.sha` — SHA-256 manifests of the
  eight generated outputs after build A and build B of the RUNTIME-01 receipt
  (byte-identical; idempotence evidence). Partial corroboration only — see table.
- `fullsuite-failures.txt` — initial candidate failure list (29 named failures, before
  the sweep repairs; 16 inherited + 12 deterministic wave + ChartTheme timeout).
- `base-failures.txt` — base-fixture run at pin `25d245167` (37 failures; footer is a
  selected 956-test run, not a second full global run).
- `FILES.sha256` — SHA-256 of each file above.

## Inherited-red identity set (16, exact names via set intersection)

Two LayoutBatch engine cases; CommunicationBatch PresenceBar anatomy; FloatButton
backtop; AlertDialog real-engines; provenance-acceptance variable counts;
WorkspaceSwitcher ×4 (integration, modern trigger, roving focus, nested-interactive
menu); LiveFeed advanced; EmptyState action; illegible-branding contrast;
tenant-document-v2 effect reporting; context-identity seven-consumer inventory; Input
Modern cascade-roster fixture. Inherited ≠ waived: they keep their registered owners.

## Next verified milestone (commitment)

After the current correction block lands (WO-FAM-04/-02/-14, z-index instrument,
radio/shape adjudication): one serialized run on a pinned commit — supported build,
RUNTIME-01 workflow with FULL provenance (commands, package digest, dist + source
resolution, mount assertion output, before/after hashes of ALL artifacts incl.
`dist/styles.css` and both dist JS blocks), liveness/population/drills revalidation,
decisions-lit official refresh, EVI-05 pilot (29/29 applicable + 1 N/A if the
radio/shape contract review resolves), and the complete suite with raw JSON preserved
here. Only then does any number become "verified".
