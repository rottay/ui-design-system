---
"@rottay/design-system": major
---

ARC-12 step 2 (P-88): the engine-level strips of seven primitives, which
shipped without a changeset (registered after the fact, 2026-10-15). Each
engine below stops honoring the caller anatomy named for it and stamps only
its own part. `id`, `aria-*`, every other `data-*` and
`className` still reach the root. Compose through `className`.

Break against the published 2.19.37, per family ("measured" means read in
the installed 2.19.37 `dist`, by the freeze-row9 adjudication, the DT table
or this lot):

- `Select`, modern, including its custom render path (E1, bfe7d5f89): the
  caller `data-part` and `data-state`. Not individually measured.
- `Input`, modern (E2, 3c466551f): the caller `data-part`. Measured: it won
  (`data-part ?? "root"`). The shell now always stamps `root`. The engine
  stamps its own `data-state`.
- `Link`, modern and rustic (E3, 4d8559be9): the caller `data-part` and
  `data-state`. Measured on rustic: the caller rest followed the own `root`
  part, so both a caller `data-part` (it won) and a caller `data-state`
  rendered. Modern not individually measured.
- `Badge`, modern (E5, e148b16fa): the caller `data-part` and `data-state`.
  Measured: the caller `data-part` won
  (`?? "root"` / `?? "anchor"`). Now `anchor` is always stamped.
- `Tag`, modern and rustic, and `Tag.Group` (E6, 8d0efc5de): the caller
  `data-part` and `data-state`. Measured on
  rustic: the caller rest followed the own `root` part, so both a caller
  `data-part` (it won) and a caller `data-state` rendered. Modern and
  `Tag.Group` not individually measured.
- `Avatar`, modern (E7, 76d1a390b): the caller `data-part`. Measured: it won
  (`?? "root"`). The engine stamps its own interaction `data-state`; whether
  a caller `data-state` survived that stamp in 2.19.37 was not measured.
- `Button`, modern and rustic (E9, 28e169406): the caller `data-part` and
  `data-state`. Measured. On modern, the
  caller `data-part` won (`?? "trigger"`) and a caller `data-state` rendered.
  On rustic, the engine stamped its own `trigger` part last, so a caller
  `data-part` never won; a caller `data-state` rendered at rest only (the
  own stamp carries a state when an interaction state exists). On rustic
  the break is therefore `data-state` at rest; the part half restores
  nothing released.

Consumer census of 2026-10-15: app-bithire passes `data-state` to the DS
`Button` at three production sites under the forced modern engine
(`ui/details/inline-editor/index.tsx:611`, `ui/upgrade/modal/index.tsx:297`
and `:334`). Three app CSS rules read it
(`.rt-upgrade-modal__cta[data-state="current"|"included"]`,
`.rt-detail-more-fields-toggle__button[data-state="expanded"]`), and they stop
matching on upgrade. Replacement: a modifier class set through `className`.
app-evnto and app-platform: no call site. The props stay typed and
`@deprecated` until WO-RET-07 removes them; removal timing follows the
owner's open version decision.

Overlap exception (owner, 2026-10-15): these identified P-88 and sync-SSR
breaks ship directly in this major, with an exact inventory, a migration
guide, replacements and reviewed evidence, by the owner's express exception
to the one-minor overlap rule. The exception does not extend to any other
deprecation or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
