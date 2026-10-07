---
"@rottay/design-system": patch
---

WO-ARC-22 L6C (owner directive 2026-10-07): the status-filter-pills' icon
sizes leave the 12px/14px literals and follow the governed icon ramp
(`--ds-icon-xs-size` / `--ds-icon-sm-size`). The token-audit
channelLiteral ceiling returns to its pre-L6 value (90) — the correction
comes from the source, not the baseline. Measured deltas are ≤ 1.44px per
icon (the bithire sm icon is −12%, disclosed; nothing breaks).
