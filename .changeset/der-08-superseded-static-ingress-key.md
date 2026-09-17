---
"@rottay/design-system": patch
---

WO-DER-08: the control manifest's static ingress key is `staticThemePath`, and
it is the ONLY key. The producers (theme catalog records, manifest generation)
emit it and every reader — the resolution probe's static arm, its
`buildIngressInput`, and the cascade normalization check — reads that one key.

THE WINDOW IS CLOSED. It closed on its gate, not on a date: while it was open,
`INGRESS_ARMS['static-brand-theme']` also declared `supersededIngressKey`
(`staticBrandThemePath`) and `supersededRegistryKey` (`brandThemePath`), and
`readIngressKey` returned `{ path, key, superseded }` so a not-yet-regenerated
manifest still resolved its door. The trigger test
`window trigger: the superseded key is still carried by a committed manifest`
went red once all 22 manifests under `governance/manifest/controls/**` were
regenerated onto `staticThemePath`, and that failure was executed. With it went
both superseded keys, their arms in `readIngressKey` (now `{ path, key }`, one
key per door), the `|| staticBrandThemePath` fallback in
`scripts/check/tokens/cascade/normalization/`, the theme-catalog note, the
producer's WINDOW warning in `scripts/generate/tokens/manifest/generation/`,
and the window tests themselves.

WHAT REMAINS, AND IT FAILS CLOSED. Three pins in
`scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/`:
the committed capability registry declares every active row's door under the
current `themePath`; a row carrying `brandThemePath` declares NO door; and a
manifest with no `staticThemePath` is refused by name. The arm's two superseded
members are additionally pinned `undefined`.

The registry half of the same door — `TenantCapabilityDeclaration.brandThemePath`
-> `themePath` — is the BREAKING sibling, declared in
`der-08-brand-theme-path-rename.md`.
