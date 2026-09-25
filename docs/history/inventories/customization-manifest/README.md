# Quarantined — not authority

Sealed historical inventory quarantined here by WO-RET-03 (2026-09-19, D-05/D-08): no gate, generator or product path may read this tree as authority; the typed catalog (`packages/core/src/contracts/theme/runtime/catalog`) is the live control listing, and this corpus survives as evidence only.

## Narrowed — `cascade/` is live

The seal holds `controls/`, `families/`, `recipes/`, `schema/` and `index.json`. Its `cascade/` slice (root catalog, owner assignments and root cells) moved back to `packages/core/governance/manifest/cascade/`, the reverse of its cascade hunk in f66b1bd45. Those tables are live inputs the cascade gates and generators read, not evidence. Readers resolve them through `CASCADE_MANIFEST_REL`, and the seal fence (F4) refuses any path to them through this tree.

`controls/` no longer lists the controls anything must cover. The resolution probe calibrates against `packages/core/governance/manifest/calibration/index.json`, keyed by control id and validated against the typed catalog; the constitution check asks the typed catalog which controls need a cascade root cell, and names the rows without one that the calibration table registers as uncalibrated. `theme-single-listing` refuses any other script module that reads this slice. The constitution check still reads it for its domain-kind self-validation and for the tier, domain and vocabulary it holds the live cascade root cells to.

`families/` no longer feeds any family binding: root-checklists and the skins evidence drill read the live map at `packages/core/governance/manifest/bindings/` (one cell per inventory family, seeded from these cells and validated both ways by the taxonomy parity gate). Its remaining live readers, each listed by the seal fence with its slice, are the constitution check at its socket-ownership leg and at its governed-cell self-validation, and the resolution probe's family-cell narrowing of negative controls. The socket-ownership leg has no live source to move to yet: the bindings map carries family identity, not the `themeControls[].internalChannels` edges the leg cross-checks against every root's `terminalReach`.
