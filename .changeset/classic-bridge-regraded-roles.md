---
"@rottay/design-system": patch
---

Theme compiler: `ThemeCompilationModeBlock` gains an optional
`regradedStatusRoles` record (absent when the block regrades none), so a
compiled mode block that re-points a status role from its own re-derived ramp
says so explicitly. The classic adapter keeps the base block's seed for those
roles when it projects a mode — the frozen classic engine's contract ("the ramp
family is derived by Ant rather than consumed from the DS channels") is
restored exactly; the pre-lot projection is byte-identical. No CSS, no rendered
value and no existing API moves.

```contract-diff
signature .#ThemeCompilationModeBlock — gains the optional `readonly regradedStatusRoles?: readonly ThemeStatusRole[]`, absent when the block regrades none; additive optional member, every existing reader and writer type-checks unchanged (e36f2df24)
```
