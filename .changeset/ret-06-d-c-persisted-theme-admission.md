---
"@rottay/design-system": patch
---

WO-RET-06, disposition lot of the owner's dated disposition D-C (2026-10-07).
Backward-compatible admission and reading of existing stored theme documents
is preserved. `BrandSurfaces.materials` and `BrandMotion` stop being
deprecations; they stay published with their exact types. No type, schema,
lowering or runtime changes.

- The `@deprecated` tag is removed from `BrandSurfaces.materials` and from
  `BrandMotion`; the field line and the interface are unchanged.
- Their two rows leave the deprecation ledger, with their two `notice` entries
  in the `release-3-0` codemod map. The 4.0 removal recorded for them by
  `.changeset/ret-01-compat-rows-receiver-4-0.md` and
  `.changeset/ret-01-brand-motion-evnto-preset.md` no longer applies. The
  ledger note about the assumed `4.0` line leaves with the last rows it named.
- The interface is not narrowed. No database was inspected: narrowing or
  migrating requires an authorized census or migration outside the design
  system (WO-RET-06 step 4(ii), owner/ops).
- New authoring stays governed by the catalog and permissions.

Documented in `docs/consumer-contract/persisted-theme-admission`.

```contract-diff
signature .#BrandSurfaces — `materials` loses the `@deprecated` tag (D-C); type unchanged
signature .#BrandMotion — loses the `@deprecated` tag (D-C); interface unchanged
```
