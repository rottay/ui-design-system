# Deprecation receipts — one-time independent audit of the five re-minted receipts (2026-10-03, record b)

Auditor: claude-fable-5-1 (independent; read-only on the DS tree and the sibling checkouts; no edit, build, git write, `--write-receipts` or `--audit-receipts`). Companion of `packages/core/contracts/package/deprecations/receipts/audits/2026-10-03/index.json` (the 22 kept receipts); this record covers ONLY the five receipts that carry no audited mark after the WO-RET-01 reconciliation adoption re-minted them.

- DS commit at audit: `b6e0e68f0f067325cc169e02ffd5db2eca3acf98` (tree = HEAD + the uncommitted adoption: ledger re-homing, five receipts re-minted)
- Receipts file `packages/core/contracts/package/deprecations/receipts/index.json` sha256 `e246485c41961f6aec3b1b94eaa2d674ecfe0d3f26ef6fb2ad5d23177618fa97` (as minted, unmarked, the file audited here)
- Ledger `packages/core/contracts/package/deprecations/index.json` sha256 `287af9d0104240eceb7c19f69aa94431754bae5352d19c2c76182bd729df9aef` (working tree, after the re-homing)
- Method per receipt: `git -C ../<app> show <commit>:<path> | shasum -a 256` = fileDigest; first line containing the needle = matchLine and sha256(line) = matchDigest (the gate's `matchOf`); canonical-JSON digest of the CURRENT ledger row = rowDigest (`rowDigestOf`); canonical-JSON digest of the receipt body without `integrity` and without the audit keys = integrity at minting (`mintIntegrityOf`); `git merge-base --is-ancestor <commit> origin/main`; `git remote get-url origin`; needle still present at the sibling HEAD. No fetch was run: origin/main is the local tracking ref.
- Gate acceptance: the JSON record carries `audit.date`, `audit.auditor` (contains `claude-fable-5-1`), `receipts[].{row,kind,path,needle,commit,recorded.*,recomputed.{fileSha256,matchLine,matchDigest,rowDigest,integrity},checks (nine booleans),verdict}`; `auditRecordDisagreement()` of the working-tree gate returns null for each of the five against this record.

## Sibling checkouts at audit

| app | origin | HEAD | origin/main |
|---|---|---|---|
| app-bithire | https://github.com/rottay/app-bithire.git | ad2252f098acaa50a7d99f3d21d469bc9826a42f | ad2252f098acaa50a7d99f3d21d469bc9826a42f |
| app-evnto | https://github.com/rottay/app-evnto.git | 2ed7a6058e0c7e9a153fee1c7c20994e0694331f | 2ed7a6058e0c7e9a153fee1c7c20994e0694331f |
| app-platform | https://github.com/rottay/app-platform.git | e02e91b73e7679071563ab8872b2d4d89ee6a1f7 | e02e91b73e7679071563ab8872b2d4d89ee6a1f7 |

Result: 5 VERIFIED, 0 FAILED.

## Receipts

| # | row | path | commit | fileDigest (recomputed) | line | matchDigest (recomputed) | rowDigest (recomputed, current row) | integrity at minting (recomputed) | on origin/main | verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| 9 | src/components/primitives/display/tooltip/contracts/index.ts#TooltipPlacement.'left' | ../app-bithire/src/ui/forms/create/page-shell/components/index.tsx | ad2252f098acaa50a7d99f3d21d469bc9826a42f | 3b2b991fd8608a5e82d94c98624f88725a92b115148ec854270c1b3f31e93be8 | 295 | fda8603805c8d87aad53038cd99a2b6f0e582309cae18ffa4e307cf8e55c6810 | 57f7418a0254ac5c30d4d00566c3b90ef5864a116c155d0ff1831c1449197d82 | 8bbd52d8fa5de9f3e6397e4755822e3d45b0484381314506bc6d19a862033a0e | true | VERIFIED |
| 10 | src/components/primitives/display/tooltip/contracts/index.ts#TooltipPlacement.'left' | ../app-bithire/src/ui/tables/collection/preview/index.tsx | ad2252f098acaa50a7d99f3d21d469bc9826a42f | 7d852d5b3e3d23d9f7e2702f61ebd49f5f47749b98feff96b15b2142b534828e | 447 | 0017ae7de9996188a5ffb69f34d8642212e6ec451ee5fa31c0130abfddf1d3e5 | 57f7418a0254ac5c30d4d00566c3b90ef5864a116c155d0ff1831c1449197d82 | b2f7479a142ef16b963a99f25222a6c2c201858286e6a2fa544f9066ede14f98 | true | VERIFIED |
| 11 | src/components/primitives/display/tooltip/contracts/index.ts#TooltipPlacement.'right' | ../app-bithire/src/vertical/surface/shell/role-switcher/index.tsx | ad2252f098acaa50a7d99f3d21d469bc9826a42f | 4bfe31d6be21e1182ac1e385c0545dd3e467e834ea6db4aec8ed2bf61afcb3e2 | 271 | 98951eaeb91dbcf795c7e8ecbaee17fab89b629a176c243830ec04433cb43609 | d93342a1fde220622e27026cffb046ef0a257f42678137801388109e7c3f1fe1 | 89807646e2f96159f50b957c87986199d57f044653ba08df867caf1c21c5ae91 | true | VERIFIED |
| 12 | src/components/primitives/display/tooltip/contracts/index.ts#TooltipPlacement.'right' | ../app-bithire/src/vertical/surface/shell/role-switcher/index.tsx | ad2252f098acaa50a7d99f3d21d469bc9826a42f | 4bfe31d6be21e1182ac1e385c0545dd3e467e834ea6db4aec8ed2bf61afcb3e2 | 304 | 9e59bb171fa0f28bc1272d01828aad4d95b264c8a1b8cb0e124e043da2ddb73f | d93342a1fde220622e27026cffb046ef0a257f42678137801388109e7c3f1fe1 | da58cba98e8e15ab7e16442c10a59b09f7dad4728b2bb7c6a6112fc5c8d9e73d | true | VERIFIED |
| 19 | src/components/primitives/inputs/toggle/contracts/index.ts#SwitchSize | ../app-platform/src/features/services/feature-flags/surface/screens/relations/rules/index.tsx | e02e91b73e7679071563ab8872b2d4d89ee6a1f7 | 696812e08ea76b6863a1c88c2016237937dbe9742f0699d27e1f7157f376b484 | 61 | 451984b6b0eb4d2742a660052d2e420f6f43fd4a8d28602ed0294cecb030d8d7 | e3e20e33ebf64c6ff5a2d0d00769c9807ece472203e96a4d6a1c1804c41e8700 | 584ad10eaceff79e3ec40565e4748247c27e0697aad1c4e2d38beedd346af0dc | true | VERIFIED |

Every recomputed value equals the recorded one; the nine checks (fileDigestMatches, needlePresentAtCommit, matchLineMatches, matchDigestMatches, rowDigestMatches, integrityMatches, commitReachableFromOriginMain, repositoryMatchesOrigin, needleStillAtHead) are true for each of the five. Why they were re-minted: the four `TooltipPlacement` rows changed `receiver` WO-RET-01 -> WO-RET-06 at the adoption (row digest f1cd38f0/1771fed8 -> 57f7418a/d93342a1); the `SwitchSize` row changed in the ledger commit 5639cde7a (its wording after fb03f7af1 narrowed the type to sm/md/lg; row digest 8e811456 -> e3e20e33, unchanged by this adoption) after the kept record was made at 3b517fd13, so its audited receipt was stale at HEAD. The sibling files and needles are unchanged: fileDigest, matchLine and matchDigest are identical to the kept record's entries 9-12 and 19.

## The 22 kept receipts after the re-homing

- Audited receipts in the file: 22; row digest changed vs the current ledger (stale): 0; integrity invalid: 0; disagreements with the kept record (gate `auditRecordDisagreement`): 0. All 22 cite `compat-consumed` rows whose receiver stays WO-RET-01 and whose rows did not change at the adoption, so the gate's "0 stale" is confirmed.
- The kept record lists 28 entries; the receipts file holds 27 (22 audited + 5 here). The kept entry with no receipt is #27 (`src/foundation/contracts/kernel/common/index.ts#LegacySizeAlias`, app-platform `.../relations/rules/index.tsx`): the row is `debt` and carries no consumer receipt at HEAD b6e0e68f0 already (not a change of this adoption). An orphan record entry is inert for the gate.

This record is a HISTORICAL AUDITED verification at the commits named; it says nothing about later commits of the sibling repositories. With the siblings absent, a forger who fabricates both a receipt and this record passes the gate; closure is therefore run with the siblings present.
