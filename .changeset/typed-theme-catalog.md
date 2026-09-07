---
"@rottay/design-system": major
---

## Typed control catalog, `ThemePatch` over decisions, and the end of the five catalogs

WO-CAT-02. `packages/core/src/contracts/theme` is a new first-level source root
(owner decision D-21 (b)) and holds the single typed catalog of what a tenant
can decide: one row per approved kit decision, with its tier, its closed domain,
its keypath, its declared fan-out and its minimum families. Every other listing
becomes a view of it — the public control document, the DB decision schema and
the seven gates that used to read `governance/manifest/controls/**`.

### Breaking changes

- `ThemePatch` changes meaning. It is now `DeepPartial<ThemeDecisions &
  SanctionedOverrides>` — what a tenant AUTHORS. The Theme-shaped ingestion
  patch the resolver merges keeps its own name, `ThemeLayerPatch`, and is
  exported from the same subpaths as before. Code that annotated a
  `DeepPartial<Theme>` as `ThemePatch` renames the annotation to
  `ThemeLayerPatch`; nothing about its runtime shape changed.
- `ThemeLayerPatch` no longer admits `id` or `name`, and `resolveTheme` refuses
  either by name at runtime. Theme identity comes from the roster row and the
  slug.
- `resolveTheme` refuses a `static-vertical` intent that carries a non-empty
  patch. A vertical authors its theme; it does not patch it.
- `ThemePatchEnvelope["source"]` loses the `"appearance-compat"` member, which
  never had a producer.
- `ThemeIntent` gains an optional `entitlement: { plan }`. A plan outside
  `standard | pro | internal` is refused by name.
- `CapabilityStatus` renames its non-active member to `declared`. Every shipped
  row is `active`, so no registry value changes.

### Added

- `assertThemePatch` and `ThemePatchError` from `@rottay/design-system/server`:
  a patch key that is neither a decision nor `chrome` is refused by name.
- A generated value schema for the v2 decision document. The document contract
  owns the key sets; the schema closes the values of every domain the catalog
  states in full, and the v2 door runs it.

### Removed

- `packages/core/scripts/check/modern-rescue/customization-model/index.json`,
  the hand-written fifth catalog. Its control laws live in the typed catalog and
  the gates that read it.
