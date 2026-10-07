---
"@rottay/design-system": minor
---

The scrim ladder, Phase 1 (owner decision Q4, 2026-10-06: `surfaces.overlays`
is a semantic scrim ladder for Modal/Sheet and equivalent overlays, derived from
the surface/mode canon). No live paint changes.

**The ladder is always produced.** Every compiled block now states
`--ds-overlay-light`, `--ds-overlay-medium` and `--ds-overlay-heavy` from the
surfaces deriver: the block's canon hue (`--ds-color-black` in a light block,
the block's own `--ds-color-bg-primary` in a dark one) at the canon strengths
0.52 / 0.78 / 0.90. The three steps mean context / focus / interrupt: the page
behind stays a readable reference, recedes, or is suppressed. Each first-party
artifact gains these six declarations (three per mode block) and nothing else.
They paint only where a backdrop carries `data-intensity`, which today means a
Modal or Sheet given `overlayIntensity`; no DS, showroom or application call site
passes it, so no rendered scrim moves. A tenant's v1 `--ds-color-bg-overlay` no
longer feeds the ladder.

**Pro strength door.** `overrides.chrome.scrim.{light,medium,heavy}` (and the v1
`visualFoundation.advanced.chrome.scrim`) takes a strength per step inside the
step's band — light [0.40, 0.62], medium [0.66, 0.81], heavy [0.86, 0.95] — and
lowers into `surfaces.overlayStrength`, never into a chrome channel. Standard
plans are refused with the existing sanctioned-override wording; an
out-of-band strength or an unknown step is refused by name. `scrim` is not a
vertical chrome family: `TENANT_THEME_CHROME_FAMILIES` and every vertical
envelope digest are unchanged, so no persisted tenant artifact digest moves. The
two schema drift sentinels move for this declared widening.

**Scrim-door census.** `DocumentAdmission.scrimDoors` names every authored value
that paints a scrim outside the ladder — `chrome.modal.overlayBg`, an
`overlayBackdrop` other than `none | blur(0-24px)`, a v1 `--ds-overlay-*` colour,
a chromatic v1 `--ds-color-bg-overlay` — and still admits it. Nothing is refused
by this lot.

**Retired.** The internal, unpublished `Overlay` backdrop (zero importers) and
its three `.rottay-overlay[data-intensity]` rules, together with the
`.rottay-overlay` backdrop-filter rule whose only producer was that component;
the frozen Rustic Modal computes the same `none` without it. The evnto
experience baseline's unread `overlays` entry is deleted.

```contract-diff
signature ./server#DocumentAdmission — gains `scrimDoors: readonly ScrimDoorFinding[]`, the authored values that paint a scrim outside the ladder, admitted and named
export ./server#ScrimDoor — added: the four scrim doors the census names
export ./server#ScrimDoorFinding — added: one named finding (door, path, value, message)
signature ./server#TenantThemeChrome — gains `scrim?: TenantOverlayStrengths`, the Pro scrim ladder strengths
signature .#BrandSurfaces — gains `overlayStrength?: TenantOverlayStrengths`, the ladder strengths a theme states per step
export .#TenantOverlayStrengths — added: `{ light?, medium?, heavy? }` scrim strengths (alpha) per ladder step
```
