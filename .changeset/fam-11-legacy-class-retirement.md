---
"@rottay/design-system": major
---

## WO-FAM-11 (owner ruling 8) — the shell/dock class vocabulary is canonical-only

AppShell and ActionDock emit **only** the canonical `ds-*` class spelling.
The 24 superseded classes — 19 `rottay-app-shell*` + 5 `rottay-action-dock*`
— are retired. The dual-stamp window that announced them never reached a
published version (the apps pin 2.19.37, which emits zero canonical classes,
and the minor changeset that described the window is deleted unconsumed in
this release), so for every consumer the net effect of this major is a hard
rename `rottay-*` → `ds-*`. Any consumer stylesheet, test or skin fragment
selecting the old spelling stops matching at this bump. There is no
compatibility arm and no shim.

```contract-diff
signature ./structures/app-shell#AppShell — emits only the canonical `ds-app-shell*` class vocabulary; the `rottay-app-shell*` spelling is retired in the same release that announced it
signature ./structures/action-dock#ActionDock — emits only the canonical `ds-action-dock*` class vocabulary; the `rottay-action-dock*` spelling is retired in the same release that announced it
```

The migration path is the rename and nothing else: substitute the canonical
class for the superseded one, selector by selector, in the same pull request
that bumps past this major. Specificity is unchanged — one class for one
class keeps every rule's exact `(a,b,c)`. The full rename table (with the
`data-part` each node carries) and the verification step live in the
migration guide, `packages/core/docs/consumer-contract/migration/legacy-class-retirement.md`;
the per-app impact sections live in the `app-bithire` and `app-evnto`
packets. The rename table in summary:

| Superseded family | Canonical family | Classes |
| --- | --- | --- |
| `rottay-app-shell*` | `ds-app-shell*` | 19: root, `__skip-link`, `__navigation-{sidebar,logo,body,footer}`, `__navigation-drawer`, `__navigation-drawer-{body,header,logo}`, `__navigation-{close,trigger}`, `__main`, `__header`, `__header-slot`, `__header-slot--center`, `__header-slot--right`, `__content`, `__footer` |
| `rottay-action-dock*` | `ds-action-dock*` | 5: root, `__actions`, `__action`, `__overflow`, `__overflow-trigger` |

Two hardcoded consumers migrated inside the design system in the same lot:
StepWizard's sticky dock (`actionPosture="sticky-bottom"`) now stamps
`ds-action-dock` / `ds-action-dock__actions` (it never carried the `ds-`
twin, so it would have unpainted at this bump), and the collection-workspace
sticky-bar skin selector follows. Consumers overriding either surface
select the same canonical classes.

**Superseded declarations, in this same release.** The minor
`.changeset/fam-11-class-window.md` is deleted unconsumed: its promise ("apps
on pinned versions keep working untouched; their migration lands at their
next DS upgrade") described a window that this major closes in the same
version that would have opened it. The closing line of
`.changeset/fam-11-e-dock-and-switchers.md` ("`rottay-action-dock` is NOT
renamed … stays owed") stated the debt at authoring time; the rename it
deferred ships here. The channel-name window of
`.changeset/fam-11-shell-namespace.md` (`--ds-shell-*` → `--ds-app-shell-*`
read arms, own executable trigger in `shell-superseded-window.test.ts`) is a
different mechanism and is unaffected by this retirement.

**Consumer-impact register** (measured read-only across the consumer
repositories, 2026-10-02; the design system does not edit app repos — these
rows are the deferred obligations, executed by each app's owners):

| App | file:line | Selector / call | What breaks at this bump |
| --- | --- | --- | --- |
| app-bithire | `src/ui/details/surface-shell/mobile-tray/styles.css:20` | `.rottay-action-dock.rt-detail-mobile-action-tray[data-part="root"][data-placement="bottom"][data-mode="fixed"]` | mobile action-tray override stops applying |
| app-bithire | `…/mobile-tray/styles.css:28` | `.rt-detail-mobile-action-tray .rottay-action-dock__actions` | actions-row override stops applying |
| app-bithire | `…/mobile-tray/styles.css:68` | `.rottay-action-dock.rt-detail-mobile-action-tray[…]` (second block) | same as :20 |
| app-bithire | `src/vertical/surface/shell/app-layout/styles/index.css:15` | `:is(.rt-app-shell, .rottay-app-shell__navigation-drawer)` | drawer styling stops applying |
| app-bithire | `…/app-layout/styles/index.css:44` | `> .rottay-app-shell__navigation-sidebar` | sidebar override stops applying |
| app-bithire | `src/vertical/surface/shell/sidebar/styles/index.css:948` | `:is(.rt-app-shell, .rottay-app-shell__navigation-drawer)` | drawer styling stops applying |
| app-evnto | `src/vertical/surface/shell/__tests__/phone-navigation.test.tsx:213,264,308` | `querySelector('.rottay-app-shell[data-part="root"]')` | test null-derefs |
| app-evnto | `…/phone-navigation.test.tsx:222` | `toHaveClass('rottay-app-shell__navigation-trigger')` | assertion fails |
| app-evnto | `…/phone-navigation.test.tsx:223` | `dsDeclarations('.rottay-app-shell__navigation-trigger')` | reads the DS stylesheet by a selector the skin no longer answers |
| app-evnto | `…/phone-navigation.test.tsx:281` | `toHaveClass('rottay-app-shell__main')` | assertion fails |
| app-evnto | `…/phone-navigation.test.tsx:282` | `dsDeclarations('.rottay-app-shell__main')` | reads the DS stylesheet by a selector the skin no longer answers |
| app-platform | — | none measured | none |

app-bithire substitutes `ds-action-dock*` / `ds-app-shell*` at equal
specificity; where a `data-part` exists on the node, preferring it over the
class keeps the selector inside the boundaries ratchet's public-hook
categories. app-evnto substitutes `ds-app-shell*` / `ds-app-shell__main` /
`ds-app-shell__navigation-trigger`; the two `dsDeclarations` assertions
should be re-checked against what they meant, since the skin never selected
the trigger by class.
