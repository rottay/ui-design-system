---
"@rottay/design-system": major
---

WO-RET-06 W-4 (BrandMotion step 4(i)). Brand Studio stops authoring the
open-ended `BrandMotion` fields, and its bounded export stops reading them.

- `PatternBrandStudio`: the Motion section and its six fields (`entrance`,
  `entranceDuration`, `hoverLift`, `hoverScale`, `pulseSpeed`,
  `skeletonStyle`) are removed from the editor. A draft that already carries
  them still round-trips unchanged through `value` / `onChange` and through
  `serializeThemeDraft` / `deserializeThemeDraft`; the editor no longer writes
  them.
- `flatThemeToTenantAppearanceAdvanced`: `motion.entranceDuration` no longer
  projects to the `--ds-motion-calm` token override. The projection carries
  palette, typography and chrome only.

Migration: express motion through the vertical `MotionProfile` and the bounded
`TenantMotionDial` (the governed `BrandMotion` fields `intensity`,
`durationScale`, `ambient`, `character`). An application that needs a fixed
calm duration in an exported appearance states `--ds-motion-calm` in its own
bounded token overrides. `BrandMotion` itself is unchanged in this release: the
theme-document schema still admits the twelve open-ended fields and the
personality lowering still reads them until stored documents are proven clean
(WO-RET-06 step 4(ii)); the interface narrows after that (step 4(iii)).

```contract-diff
export .#PatternBrandStudio — BREAKING: the Motion section and its six open-ended BrandMotion fields are removed from the editor; drafts carrying them still round-trip (WO-RET-06 W-4)
export .#flatThemeToTenantAppearanceAdvanced — BREAKING: motion.entranceDuration no longer projects to --ds-motion-calm; palette, typography and chrome only (WO-RET-06 W-4)
```
