---
"@rottay/design-system": patch
---

A disabled ColumnSettings move grip dims by the tenant's `states.emphasis`.

The first row's move-up grip and the last row's move-down grip are always
disabled. The Modern skin dimmed them with a literal `opacity: 0.3`, which
overrode the composed Button's dial-driven dimming, so the grip ignored the
tenant. The rule now reads
`opacity: calc(0.5 * var(--ds-state-disabled-opacity))`: the grip's resting 0.5
times the states dial. A disabled grip therefore stays below a resting one at
every posture, and hover and press stay excluded on it.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern component under
`EngineProvider` (computed `opacity` of the disabled grip, `data-engine="modern"`
on `html` and on a nested `[data-ds-root]`):

| scope | `states.emphasis` | before | after |
| --- | --- | --- | --- |
| bithire | `strong` | 0.30 | 0.25 |
| evnto | `medium` | 0.30 | 0.30 |
| rottay | `medium` | 0.30 | 0.30 |
| a tenant authoring `subtle` | `subtle` | 0.30 | 0.34 |
| a tenant authoring `medium` | `medium` | 0.30 | 0.30 |
| a tenant authoring `strong` | `strong` | 0.30 | 0.25 |

The resting grip (0.5), its hover and keyboard-focus lift (1) and the Button's
own focus ring are unchanged. A palette-only tenant does not move the value.
