---
"@rottay/design-system": minor
---

WizardSurface accepts app-owned viewport postures. Modern StepWizard exposes renderActions to compose its existing validated navigation controls into the canonical surface action runtime. Sticky/floating placement, hide/collapse and omitted legacy behavior reuse the original navigation and access decisions; Classic and Rustic remain frozen.

```contract-diff
signature .#WizardSurface — consumes optional app-owned SurfacePostures
signature .#WizardSurfaceProps — adds optional SurfacePostures
signature .#StepWizardProps — adds Modern-only renderActions over existing validated controls
```
