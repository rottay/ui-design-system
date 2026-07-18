# CRA17 icon supplier decision — 2026-07-17

## Authority and status boundary

This ledger records the supplier decision required by `WO-CRA-17`. It does not
claim the rest of CRA17, change the live roadmap status, close DS-IMP-090 or
DS-IMP-091, publish a package, or certify a visual matrix that has not been
captured and reviewed. The machine-readable mirror is
[`../test-artifacts/craft/cra-17/icon-supplier-decision.json`](../test-artifacts/craft/cra-17/icon-supplier-decision.json).

## Decision at the deadline

**Select Phosphor Icons 2.1.10 under MIT as the final fallback supplier for
this deadline.** Hugeicons Pro is not eligible at the deadline because:

- no Hugeicons Pro package is installed in this workspace or declared in the
  producer manifests/lockfile;
- no written authorization artifact verifiably grants the required seats,
  vendoring and internal-distribution rights for Rottay's private package,
  application bundles and hermetic CI;
- no Hugeicons install, authentication or build command was run, and this
  decision process made **zero calls** to `npm.hugeicons.com`.

The last statement is bounded process evidence, not a historical packet
capture. The host appears in the CRA17 acceptance text as a prohibited build
dependency; it was not contacted to make this decision.

This is a licensing and reproducibility fallback, not a claim that Phosphor
won a sighted beauty comparison against Hugeicons. An unlicensed/uninstalled
candidate cannot enter the build or visual bakeoff merely to manufacture a
comparison result.

## Evidence already established

| Check | Result | Evidence boundary |
| --- | --- | --- |
| Phosphor package and license | `@phosphor-icons/react@2.1.10` is installed/pinned; its package metadata and license file identify MIT | Local source/package inspection; no new legal interpretation |
| Offline adapter | The governed adapter manifest pins Phosphor 2.1.10 and exact local SSR module/export pairs | `packages/core/src/graphics/icons/foundation/semantic/adapters/phosphor-2.1.10.json` |
| Canonical 40 membership | All 40 roles below exist exactly once in the governed corpus and exactly once in the pinned adapter | Rechecked while preparing this ledger; semantic and adapter identity only, not optical quality |
| Bounded prior canary | CRA16 records 33/33 DS semantic/mark SSR checks, 8/8 generator adversarial checks, deterministic 263-role generation, and 21/21 BitHire architecture checks | `test-artifacts/craft/cra-16/certification.json`; bounded canary evidence, not CRA17 completion |
| Optical capture integrity | 12 mobile screenshots account for all 1,920 required role cells and are byte-counted and SHA-256 pinned | `test-artifacts/craft/cra-17/optical-matrix/capture-manifest.json`; machine integrity only, with `sightedReview` still `pending` |
| Hugeicons eligibility | No installed/declared package and no verifiable written rights artifact at the deadline | Workspace/manifests/lockfile scan; does not assert what may exist outside accessible evidence |
| Hugeicons private-registry traffic | 0 install/auth/build commands and 0 observed calls during this decision | Process observation only; no claim about historical traffic outside this decision |

## Canonical 40-role bakeoff corpus

This corpus is frozen for the CRA17 supplier/optical matrix. It deliberately
samples common product work and includes all six governed BitHire roles.

| Category | Count | Semantic roles |
| --- | ---: | --- |
| Actions | 6 | `action.add`, `action.edit`, `action.delete`, `action.save`, `action.search`, `action.filter` |
| Navigation | 5 | `navigation.home`, `navigation.back`, `navigation.forward`, `navigation.menu`, `navigation.more` |
| Status | 5 | `status.success`, `status.warning`, `status.error`, `status.loading`, `status.pending` |
| Communication | 4 | `communication.email`, `communication.message`, `communication.notification`, `communication.send` |
| Authentication | 4 | `access.login`, `auth.password`, `auth.passkey`, `auth.sso` |
| Data | 5 | `data.chart`, `data.table`, `data.database`, `data.report`, `data.trend` |
| AI | 5 | `ai.assistant`, `ai.agent`, `ai.tool`, `ai.guardrail`, `ai.recommendation` |
| BitHire | 6 | `bithire.candidate`, `bithire.interview`, `bithire.pipeline`, `bithire.evidence`, `bithire.job`, `bithire.offer` |
| **Total** | **40** | Exact; no aliases or supplier glyph names |

## Required visual/optical matrix

The required cross-product is:

- sizes: 12, 16, 20 and 24px;
- engines: classic, modern and rustic;
- schemes: light and dark;
- form factor: mobile;
- brand contexts: BitHire and The Management.

That is 1,920 required role cells (`40 × 4 × 3 × 2 × 1 × 2`). This number is
the planned matrix size, not a passing-test count.

### Sighted evidence still pending

The 12 capture files and their 1,920 role cells now have a machine-readable
inventory with byte counts and SHA-256 hashes. That proves capture presence and
integrity only. No human optical verdict is recorded, and the manifest remains
explicitly `sightedReview: "pending"`. The following remain pending and must
not be inferred from the supplier decision or from capture existence:

- human sighted review of the complete 1,920-cell atlas;
- legibility, optical weight, alignment and distinctness at each size;
- classic/modern/rustic, light/dark, mobile, BitHire/The Management results;
- RTL, forced-colors and every supported variant/optical fallback;
- RSC, hydration and the complete four-facade accessible-renderer matrix;
- measured one-icon bundle output, per-entry retention and tree-shaking;
- completion of `Icon`, `BrandMark`, `CloudServiceMark` and
  `FeaturePictogram` as four fully separated certified asset classes.

The machine boundary is enforced by
`packages/core/scripts/cra-17-integral-gate.mjs`. Its `--structural` mode can
report final-only evidence as pending; its default final mode fails while the
sighted review or any other required evidence remains pending. Neither mode
writes roadmap status or closes source items.

The existing CRA16 SSR/canary results remain valid only for their recorded
scope. They are not sighted evidence and are not silently promoted to cover
the matrix above.

## Rollback

Keep the pinned Phosphor 2.1.10 adapter and the one-minor compatibility aliases
as the safe line. A supplier or asset-class adapter must be independently
disableable without changing semantic IDs or conflating functional icons,
brand/provider marks and pictograms. If later CRA17 facade work regresses,
return to the CRA16-certified adapter/package boundary (`d609b519`,
`@rottay/design-system@2.19.28`) while retaining this supplier decision and
repairing forward; do not introduce a Hugeicons network dependency as a
rollback.

## Reopening the Hugeicons decision

Reopen only when all of the following exist:

1. written, verifiable authorization from the rights holder covering the
   required seat model, source/package access, vendoring or approved mirroring,
   private-package/internal application distribution and hermetic CI/build
   agents;
2. an installed, version-pinned package that builds offline with zero
   `npm.hugeicons.com` calls and no public supplier-type leakage;
3. the same exact 40-role matrix completed for both candidates, with captures
   and a recorded sighted review rather than inferred visual claims;
4. SSR/RSC/hydration, accessibility, provenance, tree-shaking and measured
   one-icon/per-entry bundle evidence at least equal to the certified Phosphor
   boundary;
5. an explicit owner decision accepting the license, visual and migration
   tradeoff.

Until then, Hugeicons Pro remains out of the dependency graph and Phosphor
2.1.10 remains the supplier decision for CRA17 implementation.
