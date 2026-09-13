---
"@rottay/design-system": patch
---

WO-EVI-05. The Modern segmented control takes its transition durations from the
dial-scaled motion roles (`--ds-motion-feedback`, `--ds-motion-reveal`) instead of
the raw `--ds-motion-fast` / `--ds-motion-normal` rungs, so a tenant's
`motion.dial` duration scale reaches it. At the default scale of 1 the painted
durations are unchanged in every first-party vertical, and the raw rungs remain
the fallback where no role is emitted.
