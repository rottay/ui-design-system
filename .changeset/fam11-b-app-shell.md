---
"@rottay/design-system": minor
---

WO-FAM-11 sub-lot B: the `app-shell` family cut, the `--ds-shell-*` split, and
the two renames that MEASURED UNSAFE.

THE DERIVER. `derivation/chrome/app-shell` exports `appShellChromeDeriver`
(family `app-shell`, rank `derived`) producing 56 channels: the four geometry
tracks and the collapse cadence, the shell ground, the skip link's seven, the
navigation region's twenty, the sticky header's twelve, and the unpainted
grounds of main / content / footer. Every produced value is the single chained
fallback its skin reads it with, and the contract suite pins the two texts
equal, so producing a name changes WHO can reach the value and not what it
rests at. Two deliberate exceptions, both stated: the collapse transition
leaves its `220ms cubic-bezier(0.16, 1, 0.3, 1)` TSX literal for
`var(--ds-motion-rearrange, var(--ds-motion-normal)) var(--ds-motion-ease-move)`
— where the sibling `sidebar-surface` family already rests, because a track
change is a rearrangement — and the four geometry tracks leave their
`296 / 96 / 64 / 104` px literals for the tenant's own `--ds-sidebar-*`
channels with the same numbers as the honest literal tail. The DT registers the
deriver in `derivation/index.ts` at integration; until then every channel
resolves through the fallback arm the deriver reproduces.

THE SPLIT. `--ds-shell-*` is not one namespace with one audience, so the
group's `shell/contracts` owner now names the bands: `SHELL_PUBLISHED_CHANNELS` (14
names other owners read — `skin/action-dock`, `skin/chat-surface`,
`engines/modern/skin/layout`, `structures/dashboard/insights`, plus
app-bithire, app-evnto and app-platform) and `SHELL_RESOLVED_CHANNELS` (16
per-instance values resolved from props, posture and the platform's `env()`
readings). The third band is the deriver's. `AppShell.cut.test.tsx` proves the
resolved and derived bands are disjoint, that together with the skin's own
declarations they cover every `--ds-shell-*` name the skin reads, and that
every published name comes from one band or the other.

THE TWO RENAMES ARE NOT IN THIS LOT, AND THE MEASUREMENT IS WHY.

  The class rename `rottay-app-shell` → `ds-app-shell` (19 distinct BEM
  tokens) is refused: app-bithire selects `.rottay-app-shell__navigation-drawer`
  and `.rottay-app-shell__navigation-sidebar` from its own product CSS (two
  files, three rules) and app-evnto's phone-navigation suite queries
  `.rottay-app-shell[data-part="root"]` three times. The rename is safe only
  inside the DS boundary, and the boundary is crossed. `classVocabularies=1`
  and `legacyNamespaceClasses=1` therefore stand at their admitted pins. What
  this lot did instead is remove the class from the PAINT: every rule now
  selects the anatomy the structure stamps, and the vocabulary survives only
  as a stamped compatibility hook for those two consumers.

  The channel rename of the chrome band to `--ds-app-shell-*` is refused on
  the same evidence, which the census could not see: app-bithire AUTHORS 15 of
  the names the census classed as private (`--ds-shell-navigation-border`,
  `-radius`, `-shadow`, `-body-padding`, `-logo-padding`, `-footer-padding`,
  `-header-border`, `--ds-shell-header-background`, `-border`,
  `-border-block-end`, `-radius`, `-shadow`, `-inset-block-start`,
  `-inset-inline`, `-padding-inline`) to project its sidebar/layout anatomy.
  Renaming them drops that chrome silently. The namespace is published in both
  bands; the split is therefore declared, not spelled.

THE ADAPT SLOT. `app-shell` is the cut's only family in
`LAYOUT_SENSITIVE_FAMILIES` and both arms failed. `AppShellProps` now accepts
`adapt?: Adapt<AppShellAdaptation>` over the closed
`navigation: 'sidebar' | 'drawer'` domain, the presentation resolves through
`useAdaptation` with the family's own defaults (phone and tablet drawer), and
`data-posture` is the kernel's token list. No container is observed: the shell
IS the viewport band, so its structure changes with the device class and never
with a box of its own. The private `ShellPosture = 'phone' | 'tablet' |
'desktop'` union retires to an alias of the contract's `ViewportPosture`, so
the second posture vocabulary is gone and the published type name survives.

SHELL_DEFAULTS. Five hardcoded visual values leave TypeScript: the four
geometry numbers and the collapse transition are the deriver's, and the object
keeps only `bottomInset`, which is the platform's own safe-area reading rather
than a decision. A stated `geometry.*` prop now writes its channel on the shell
root, where it outranks both the derived floor and a tenant's
`chrome.sidebar.width` — a deliberate precedence change, and the one the
static-first vertical identity law requires, since a tenant may not override a
vertical's layout geometry. An omitted prop leaves the channel to the theme.
The structure still reads the four tracks through
`SHELL_GEOMETRY_READS`, whose fallback arms restate the derived values
verbatim, because two places the derived value cannot reach have to keep
resolving: a package consumed before the deriver is registered, and the Sheet
portal, which inherits from the document root rather than from the shell.

THE ANATOMY AND THE STATE. Thirteen parts were stamped and painted through
their class; the skin now selects all sixteen through `[data-part]`, and the
drawer surface — the Sheet's own part, which this family never stamps — is
selected by the shell's class alone at the same specificity it carried before.
The navigation trigger, the drawer's close button and the skip link run
`useInteractionState` and stamp `partAttributes`, so the four bare
`:hover` / `:active` / `:focus-visible` rules become paired arms of one
decision. Three channels that stated a different fallback in each structural
arm (`--ds-shell-main-padding-block-start`, `-inline-start`, `-inline-end`)
are now declared per arm on the arm's own element, and the two umbrella border
chains are flattened, so each name has exactly one rest.

THE EVIDENCE. `AppShell.cut.test.tsx` (13 cases) owns the split, the anatomy
and the adapt slot; `AppShell.causality.integration.test.tsx` (10 cases in
Chromium) proves each `consumes` keypath moves the family's own computed paint
against a literal control that holds — the seeded primary reaches the skip
link's ring, the sidebar tone the track's surface, the density dial the header
and navigation-footer room, the elevation ramp the skip link's lift, the focus
decision the ring's weight and the motion dial the collapse cadence. The
deriver's contract suite (12 cases) pins every produced value against the
single fallback its skin states. `spacing.rhythm` is NOT claimed: the probe
measured that the family's room rides the spacing ramp under the density dial
and that the rhythm plane reaches none of its channels, so the keypath left
`consumes` rather than the claim standing unproven.

MEASURED. `readWithoutProducer` 62 → 1, `partsStampedNotConsumed` 13 → 0,
`partsConsumedNotStamped` 1 → 0, `unpairedStatePseudoSelectors` 4 → 0,
`adaptSlot` 2 failing arms → 0. The one surviving unproduced read is named and
drilled: `--ds-shell-navigation-shadow` has two correct rests — a flat fixed
track and a lifted overlay drawer — and app-bithire authors the name on both
elements, so producing either rest silently repaints the other.

ROUTED, NOT FIXED. The navigation region paints a tone-aware SURFACE and no
ink to go with it: `--ds-shell-navigation-background` rests on
`--ds-sidebar-bg`, which an inverse sidebar tone darkens, while slot content
inherits the canvas ink. Three axe `color-contrast` nodes are pinned by
identity for that reason and named in the suite. Giving the region an ink
channel beside its background is a paint decision with a cross-tenant
consequence, so it is routed rather than taken here.

The twelve `skeletonPartsWithoutRole` need entries in
`SKELETON_PART_ROLES`, which is the shared renderer's singleton vocabulary and
outside this lot's write set (FAM-10 sub-lot B is the precedent: one packet
moved 576 → 793 for nineteen families at once). `structures/shell/README.md`
documents the published channel list and now understates it. Both belong to the
DT.
