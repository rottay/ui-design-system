---
"@rottay/design-system": minor
---

WO-DER-02. States and materials as derived roots: catalog rows 20/21
(`states.emphasis`, `states.focus-style`) gain their document and brandTheme
keypaths and now lower to 28 emitted `--ds-state-*` / `--ds-focus-ring*` /
`--ds-material-*` channels; the v2 decision document and the v1 migration
accept `general.states` / `appearance.general.states.{emphasis,focusStyle}`;
`BrandSurfaces` gains optional `stateEmphasis` / `focusStyle`. All additions
are optional; absent input keeps the prior byte-identical defaults
(`medium` emphasis, `ring` focus).

```contract-diff
signature ./server#Theme — normalized surfaces gain optional `stateEmphasis` and `focusStyle`; absent means `medium`/`ring`, byte-identical to the pre-decision foundation defaults
signature ./server#TenantThemeDocumentV2 — decisions `states.emphasis` and `states.focus-style` (catalog rows 20/21) now lower to 28 emitted `--ds-state-*`/`--ds-focus-ring*`/`--ds-material-*` channels; closed enum domains, additive
signature ./server#TenantThemeSimpleConfig — `general.states` optional input accepted (`emphasis`, `focusStyle`); the v1 lowering maps it to `surfaces.{stateEmphasis,focusStyle}` and the v2→v1 projection writes it back by name; the v1→v2 migration (`migrateDocumentV1ToV2`) does not carry it yet (dropped; gap registered for implementation)
```
