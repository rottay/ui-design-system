---
"@rottay/design-system": patch
---

E8-b typography engine strip + instrument wave (WO-ARC-12, owner decision 1
R4-SCOPE option 1, 2026-10-14). No public type changes.

- The modern and rustic typography engines (Heading, Text, Paragraph, Link) no
  longer honor caller `data-part`/`data-state`; both props were already
  `@deprecated` and inert (see `ret-07-inert-caller-props-and-command-home-field`).
  The engines stamp `data-part="root"` themselves; styling moves to the declared
  class hooks. Classic is untouched. Declared typography tiers are restored, so
  modern/rustic text renders at its documented size/leading/tracking again —
  57 showroom baselines were re-approved by the delegated sighted review and
  regenerate in their own window.
- The `axis-difference` checker (internal tooling, never published) replaces its
  stand-in renders with real mounts (WO-EVI-02 wave 1).
- Generated artifacts (CSS mirrors, cascade manifests, theme-graph, hooks
  contract, surface report, pack inventory) refreshed to the tree; no consumer
  contract moved.
