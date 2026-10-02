# Guide — the legacy shell/dock class retirement (WO-FAM-11, owner ruling 8)

Cross-app guide. The per-app impact sections live in the
[`app-bithire`](./app-bithire/index.md) and [`app-evnto`](./app-evnto/index.md)
packets; [`app-platform`](./app-platform/index.md) measured zero references.
Release declaration: `.changeset/fam-11-legacy-class-retirement.md` (major).

## What changed

`AppShell` and `ActionDock` stamp **only** the canonical class spelling —
`ds-app-shell*` and `ds-action-dock*`. The 24 superseded classes
(`rottay-app-shell*` ×19, `rottay-action-dock*` ×5) are retired with no
compatibility arm. The dual-stamp migration window that announced the rename
never reached a published version: it opens and closes inside the same
release, so the net effect for every consumer is a plain, hard rename in one
major. Two in-package consumers moved in the same lot — StepWizard's sticky
dock (`actionPosture="sticky-bottom"`) now stamps
`ds-action-dock` / `ds-action-dock__actions`, and the collection-workspace
sticky-bar skin selector reads the canonical name.

Paint was never on the class: the skins key on the anatomy
(`data-part` / state attributes) and the class is only a scope. That is why
the migration is a rename and nothing else.

## Who is affected

Any consumer that greps its stylesheets **or tests** for the old prefixes:

```bash
grep -rnE 'rottay-(app-shell|action-dock)' src tests
```

Zero matches — no work. Measured across the consumer repositories on
2026-10-02, the register holds 13 sites: app-bithire has 6 selectors in 3
CSS files (mobile action-tray overrides, drawer and sidebar overrides), and
app-evnto has 7 lines in one test file (`phone-navigation.test.tsx`).
app-platform: none. The full file:line register ships in the major changeset.

## The exact rename

`rottay-app-shell` → `ds-app-shell`, same BEM member, one for one. The
`data-part` column is the stable hook the node carries — where one exists,
prefer it over the class in the replacement selector.

| Superseded | Canonical | `data-part` on the same node |
| --- | --- | --- |
| `rottay-app-shell` | `ds-app-shell` | `root` |
| `rottay-app-shell__skip-link` | `ds-app-shell__skip-link` | `skip-link` |
| `rottay-app-shell__navigation-sidebar` | `ds-app-shell__navigation-sidebar` | `navigation-sidebar` |
| `rottay-app-shell__navigation-logo` | `ds-app-shell__navigation-logo` | `navigation-logo` |
| `rottay-app-shell__navigation-body` | `ds-app-shell__navigation-body` | `navigation-body` |
| `rottay-app-shell__navigation-footer` | `ds-app-shell__navigation-footer` | `navigation-footer` |
| `rottay-app-shell__navigation-drawer` | `ds-app-shell__navigation-drawer` | none — class is the only hook |
| `rottay-app-shell__navigation-drawer-body` | `ds-app-shell__navigation-drawer-body` | none — class is the only hook |
| `rottay-app-shell__navigation-drawer-header` | `ds-app-shell__navigation-drawer-header` | `navigation-drawer-header` |
| `rottay-app-shell__navigation-drawer-logo` | `ds-app-shell__navigation-drawer-logo` | none — class is the only hook |
| `rottay-app-shell__navigation-close` | `ds-app-shell__navigation-close` | `navigation-close` |
| `rottay-app-shell__navigation-trigger` | `ds-app-shell__navigation-trigger` | `navigation-trigger` |
| `rottay-app-shell__main` | `ds-app-shell__main` | `main-area` |
| `rottay-app-shell__header` | `ds-app-shell__header` | `header` |
| `rottay-app-shell__header-slot` | `ds-app-shell__header-slot` | `header-left` |
| `rottay-app-shell__header-slot--center` | `ds-app-shell__header-slot--center` | `header-center` |
| `rottay-app-shell__header-slot--right` | `ds-app-shell__header-slot--right` | `header-right` |
| `rottay-app-shell__content` | `ds-app-shell__content` | `content` |
| `rottay-app-shell__footer` | `ds-app-shell__footer` | `footer` |
| `rottay-action-dock` | `ds-action-dock` | `root` |
| `rottay-action-dock__actions` | `ds-action-dock__actions` | none — class is the only hook |
| `rottay-action-dock__action` | `ds-action-dock__action` | none — class is the only hook |
| `rottay-action-dock__overflow` | `ds-action-dock__overflow` | none — class is the only hook |
| `rottay-action-dock__overflow-trigger` | `ds-action-dock__overflow-trigger` | none — class is the only hook |

Migration rules:

1. Rename class for class, in the same pull request that bumps the app past
   this major. Specificity is unchanged — one class swapped for one class
   keeps every rule's exact `(a,b,c)`, including inside a `:is()` arm.
2. Where the node carries a `data-part` (per the table), prefer the
   `data-part` attribute in the replacement selector and fall back to the
   `ds-*` class only where no part exists. The boundaries-imports ratchet
   already counts these reaches in app-bithire; migrating to `data-part`
   where it exists moves the reach out of private-anatomy territory instead
   of parking it under a new class name.
3. Do not reintroduce the old spelling and do not add a local alias or shim.
   There is no window left to stay compatible with.

## Verification

In the app, after the rename and the bump:

```bash
grep -rnE 'rottay-(app-shell|action-dock)' src tests   # expect: nothing
pnpm typecheck && pnpm build && pnpm test              # the app's own suites
```

Then the visual spot-check for the surfaces the register touched: the mobile
action tray (bottom placement, fixed mode) and the navigation drawer +
sidebar paint exactly as before — a renamed selector at equal specificity
cannot move a pixel, so any visible difference means the rename missed a
selector, not that the cascade changed.

The same contract is proven from the design-system side, from source **and**
from the packed published tarball, in
`packages/core/tests/integration/consumer/shell-canon.test.tsx`: every
canonical class lands on the node the contract names, the rewritten consumer
selectors each reach their node at the specificity of the spelling they
replace, and zero superseded tokens survive in the rendered DOM or in the
built `dist/styles.css`.
