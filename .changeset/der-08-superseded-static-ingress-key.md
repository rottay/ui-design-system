---
"@rottay/design-system": patch
---

WO-DER-08: the control manifest's static ingress key is `staticThemePath`. The
producers (theme catalog records, manifest generation) emit it, and every
reader — the resolution probe's static arm, its `buildIngressInput`, and the
cascade normalization check — still accepts the superseded
`staticBrandThemePath` with the same `current ?? superseded` lookup, because
all 21 committed manifests under `governance/manifest/controls/**` carry only
the old key until they are regenerated.

The window closes on a gate, not a date. The test
`window trigger: the superseded key is still carried by a committed manifest`
in `scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/`
(run by `test:scripts`) fails as soon as no committed control manifest carries
`staticBrandThemePath` — that is, on the first manifest regeneration that is
committed. That failure is the end of the window: the same change deletes
`supersededIngressKey`, its `??` arms, the normalization fallback and the
trigger test. The same file pins, over every committed stop that resolves
through the static door, that the old and the new key lower identically.
