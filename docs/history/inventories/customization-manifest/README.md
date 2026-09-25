# Quarantined — not authority

Sealed historical inventory quarantined here by WO-RET-03 (2026-09-19, D-05/D-08): no gate, generator or product path may read this tree as authority; the typed catalog (`packages/core/src/contracts/theme/runtime/catalog`) is the live control listing, and this corpus survives as evidence only.

## Narrowed — `cascade/` is live

The seal holds `controls/`, `families/`, `recipes/`, `schema/` and `index.json`. Its `cascade/` slice (root catalog, owner assignments and root cells) moved back to `packages/core/governance/manifest/cascade/`, the reverse of its cascade hunk in f66b1bd45. Those tables are live inputs the cascade gates and generators read, not evidence. Readers resolve them through `CASCADE_MANIFEST_REL`, and the seal fence (F4) refuses any path to them through this tree.

`controls/` has no live reader. The resolution probe calibrates against `packages/core/governance/manifest/calibration/index.json`, keyed by control id and validated against the typed catalog, and `theme-single-listing` refuses any script module that reads this slice.
