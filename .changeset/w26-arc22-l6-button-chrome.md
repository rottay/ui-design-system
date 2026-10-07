---
"@rottay/design-system": minor
---

WO-ARC-22 L6 (the final lot; owner packet 2026-10-06 §E-1): the Button
primitive gains `chrome="none"` (the shared ControlChrome axis), and the
status-filter-pills drain onto it — the local Pill and its kernel wiring are
deleted, and the private `--ds-filter-pill-focus-ring` retires (the
primitive's ring wins by layer, measured). The pill keeps its shape and type
through the primitive's own props (shape="round" and the size type), per the
A1 law. The pills' icon sizes now write the Button channels
(`--ds-button-{sm,md}-icon-size`) instead of size literals — the values are
byte-preserved.

```contract-diff
signature .#ButtonProps — gains chrome?: ControlChrome (WO-ARC-22 L6)
```
