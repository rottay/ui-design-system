---
"@rottay/design-system": major
---

E8-b typography engine strip + instrument wave (WO-ARC-12, owner decision 1
R4-SCOPE option 1, 2026-10-14). No public type changes.

- The modern and rustic typography engines (Heading, Text, Paragraph, Link) no
  longer honor caller `data-part`/`data-state`. Both props are `@deprecated`
  (see `ret-07-inert-caller-props-and-command-home-field`). The engines stamp
  `data-part="root"` themselves; styling moves to the declared class hooks.
  Classic is covered separately by `arc12-step3-classic-strips` (S3-4).
  Declared typography tiers are restored, so modern/rustic text renders at
  its documented size/leading/tracking again. 57 showroom baselines were
  re-approved by the delegated sighted review and regenerate in their own
  window.
- Break against the published 2.19.37: the modern engine let a caller
  `data-part` win (`data-part ?? "root"`) and spread every other caller
  attribute, `data-state` included, onto the root. Both now stop. On
  rustic: `data-state` only; the part half restores nothing released (the
  2.19.37 rustic engine stamped `root` after the caller rest). The
  props were not inert in the release. Consumer census of 2026-10-15:
  app-bithire passes `data-state` to a DS `Text` at two production sites
  (`features/applications/surface/components/detail/journey-ribbon/index.tsx:107`,
  `features/candidates/surface/screens/record/create/view/sections/readiness/index.tsx:197`),
  and three app CSS rules read them
  (`.rt-app-journey__label[data-state="current"|"future"]`,
  `.rt-candidate-create-readiness-percent[data-state="complete"]`). That app
  forces the modern engine, so the rules stop matching on upgrade. Migration:
  key the rule on a modifier class the app sets through `className`.
- The `axis-difference` checker (internal tooling, never published) replaces its
  stand-in renders with real mounts (WO-EVI-02 wave 1).
- Generated artifacts (CSS mirrors, cascade manifests, theme-graph, hooks
  contract, surface report, pack inventory) refreshed to the tree; no consumer
  contract moved.

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
