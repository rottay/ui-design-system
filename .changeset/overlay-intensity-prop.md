---
"@rottay/design-system": minor
---

OVM-ADOPT (WO-EVI-02 lane): Modal and Sheet gain an `overlayIntensity?: 'light' | 'medium' | 'heavy'` prop. On the modern engines it stamps `data-intensity` on the backdrop, and the modern skins paint the tenant overlay ladder channel `--ds-overlay-<step>` on that backdrop, falling back to the exact previous default scrim chain (`--ds-modal-overlay-bg` / `--ds-sheet-overlay-bg` → `--ds-color-bg-overlay`), so a tenant that never defines the ladder sees byte-identical paint. On Modal, a custom `scrim` (`overlayOpacity`) keeps precedence: when both are passed the scrim wins and `data-intensity` is not stamped.

```contract-diff
signature .#ModalProps — gains overlayIntensity?: 'light' | 'medium' | 'heavy' (the tenant overlay ladder step painted on the backdrop; a custom overlayOpacity scrim keeps precedence and the attribute is not stamped) (OVM-ADOPT)
signature .#SheetProps — gains overlayIntensity?: 'light' | 'medium' | 'heavy' (the tenant overlay ladder step painted on the backdrop) (OVM-ADOPT)
```
