# P4A state — cra12-motion-governance

Status: **COMPLETE**. DS slice GREEN, drill 4/4, unit suite 12/12.

| checkpoint | result |
|---|---|
| 1. Recensus (`--repositories ui-design-system`) | 2 failures, both hash drift at ds-internal; no ratchet growth |
| 2. Attribution via pre-drain mirror | superseded registry reproduced byte-exact on all 10 rows; diff = 18 removals, **0 additions** |
| 3. Re-anchor (2 rows, downward only) | global-keyframes 130/16 → 122/14; raw-motion-timing 584/231 → 574/229 |
| 4. Provenance | both `reanchor` records rewritten to the existing schema (SHA `f3720ea8`, 2026-07-27, owner `claude/R1-P`); superseded records preserved verbatim under `supersedes` |
| 5. Gate rerun | `CRA12 motion governance: PASS`, exit 0 |
| 6. Drill | `node --test cra-12-motion-governance.reanchor.test.mjs` → 4/4, planted violation still RED |
| 7. Ledger | `remediation/p4a-ledger.md` |

Write scope actually touched: `packages/core/scripts/cra-12-motion-governance.registry.json`
only. The gate script and both test files were read, run, and left byte-identical.

No git operations. No commits. One command at a time.

Open item handed back (out of scope, refused): the four-repo run is RED with 14
failures including two genuine **increases** at `app-bithire/product` (292 > 282
files) and `app-bithire/marketing` (69 > 68) — the receiving side of the drain.
Not re-anchored: counts may never be widened. See the ledger's REFUSED section,
including the scope-dependence of `global-keyframes` digests that makes the
DS-only and four-repo runs mutually exclusive against one registry.
