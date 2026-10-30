# Guide — the P-88 caller-anatomy break and the sync-SSR break (next major)

Cross-app guide (release-reconciliation lot, 2026-10-15).
The per-family inventory is complete for the P-88 strips integrated on `main`
at `1e4c40c62`. The major-line cold-lazy sync-SSR behavior is implemented;
current migration guidance is linked in the sync-SSR section below. The release
declarations are the `major` changesets named in each section. Authority:
`roadmap/owner-decisions-2026-10-15.md` rulings 1 and 6.

These breaks ship directly in the major, by the owner's express exception to
the one-minor overlap rule of `docs/releasing.md`. That exception covers only
the breaks this guide inventories.

The version number of "the next major" is an open owner question. The pending
set also holds `major-canonical-tree.md` (3.0.0), so `changeset version`
computes 3.0.0, while the deprecations ledger and WO-RET-07 name a 4.0 line.
This guide says "the next major" until the owner resolves that.

## What changed

The published 2.19.37 declared that every `data-*`, a caller `data-part`
included, "MUST reach the root" (P-79). P-88 replaces that law (owner,
2026-10-06). A component that paints its own anatomy keeps its own
`data-part` / `data-state`. A caller `data-part` never replaces it, and a
caller `data-state` is not forwarded. Only a structural component with no part
of its own (Box, Flex, Space and Container on Classic and Rustic, and Stack on
Classic and Rustic) still forwards both. `id`, `aria-*`, every other `data-*` and `className` still
reach the root.

### Per family

The break is measured against the installed 2.19.37 `dist` where the
"measured" column says so. "part" means a caller `data-part` stopped winning or
stopped rendering; "state" means a caller `data-state` stopped rendering.

| Family | Engines | Breaks (vs 2.19.37) | Measured | Changeset |
|---|---|---|---|---|
| Button | modern | part (caller won over `trigger`), state | yes | `arc12-step2-modern-engine-strips` |
| Button | rustic | state, at rest only (2.19.37 stamped its own `trigger` part last, so a caller part never won) | yes | `arc12-step2-modern-engine-strips` |
| Button | classic | state (part already fixed to `trigger`) | yes | `arc12-step3-classic-strips` |
| Input | modern | part (caller won over `root`); the engine stamps its own state | yes | `arc12-step2-modern-engine-strips` |
| Select | modern | part, state | no | `arc12-step2-modern-engine-strips` |
| Link | modern | part, state | no | `arc12-step2-modern-engine-strips` |
| Link | rustic | part (the caller rest followed the own `root`, so the caller part won), state | yes | `arc12-step2-modern-engine-strips` |
| Badge | modern | part (caller won), state | part only | `arc12-step2-modern-engine-strips` |
| Avatar | modern | part (caller won); the engine stamps its own state | part only | `arc12-step2-modern-engine-strips` |
| Tag, Tag.Group | modern | part, state | no | `arc12-step2-modern-engine-strips` |
| Tag | rustic | part (the caller rest followed the own `root`, so the caller part won), state | yes | `arc12-step2-modern-engine-strips` |
| Tag, Select, Textarea, Divider, Link | classic | part, state | yes | `arc12-step3-classic-strips` |
| Card | classic | state | yes | `arc12-step3-classic-strips` |
| Card | modern / rustic | state | rustic only | `arc12-o3-o4-strips` |
| Card.Body/Footer/Header/Image | all | part, state | no | `arc12-o3-o4-strips` |
| Typography (Heading, Text, Paragraph, Link) | modern | part (caller won), state | yes | `e8b-typography-engine-strip` |
| Typography | rustic | state only (2.19.37 stamped `root` after the caller rest; the part half restores nothing released) | yes | `e8b-typography-engine-strip` |
| Typography | classic | state | yes | `arc12-step3-classic-strips` |
| Skeleton | modern | part (caller won) | yes | `arc12-o3-o4-strips` |
| AspectRatio, Empty, QRCode, Timeline, Segmented | modern | part (caller won), state | part only | `arc12-o3-o4-strips` |
| VoiceInputButton | all | part, state | no | `arc12-o3-o4-strips` |
| Spinner, LoadingIndicator, Image, List, Menu, Stepper, Textarea, Descriptions, Rate, Toggle, Tooltip, SemanticSurfaceSupport | per changeset | part, state | no | `arc-12-caller-anatomy-contract-diff-reconciliation` |
| Container, Space, grid item, notifier stack | modern | state | yes | `arc12-modern-carriers-m1` |
| Grid, Grid.Item | modern; Grid.Item all | part, state | Grid yes | `arc12-modern-carriers-mc2` |
| Stack | modern | part, state; a caller `divider` element keeps its own part and takes the class `rottay-stack-divider` instead of `data-part="divider"` | no | `arc12-carriers-mp2-stack-strip` |

The law text itself: `w25-p88-passthrough-law`. The runtime break above
changes no type: the affected props stay typed and `@deprecated` until
WO-RET-07 removes them. That removal's timing follows the owner's open
version decision.

## Who is affected

Consumer census of 2026-10-15 over the `src/` trees of the three applications.
It counts `*.tsx` call sites (tests and stories excluded) that pass `data-part`
or `data-state` to a DS component.

| Application | Sites | Live styling that stops matching |
|---|---|---|
| app-bithire (forces `modern`) | `Button` `data-state`: `ui/details/inline-editor/index.tsx:611`, `ui/upgrade/modal/index.tsx:297`, `:334` | `.rt-upgrade-modal__cta[data-state="current"\|"included"]`, `.rt-detail-more-fields-toggle__button[data-state="expanded"]` |
| app-bithire | `Text` `data-state`: `features/applications/surface/components/detail/journey-ribbon/index.tsx:107`, `features/candidates/surface/screens/record/create/view/sections/readiness/index.tsx:197` | `.rt-app-journey__label[data-state="current"\|"future"]`, `.rt-candidate-create-readiness-percent[data-state="complete"]` |
| app-bithire | `Stack` `data-state`: `features/jobs/surface/screens/record/listing/index.tsx:1226` (Modern Stack strip) | `.bh-jobs-listing__empty-state[data-state="error"]` (`styles/index.css:62`, `:92`) |
| app-evnto | none | none |
| app-platform | none | none |

The census also found 54 app-bithire sites on `Box`, `Flex` and `Stack`. Box and
Flex are structural carriers and are not stripped. The Modern `Stack` is
stripped since `arc12-carriers-mp2-stack-strip`; the re-run of 2026-10-16 finds
the one `Stack` site listed above, and no application passes a `divider` to a
`Stack`. The census
pattern reads at most 400 characters between the tag and the attribute, so
re-run it per app at adoption time:

```bash
rg -U --multiline-dotall --glob '*.tsx' --glob '!**/tests/**' \
  '<[A-Z][A-Za-z.]*\b[^<>]*?\bdata-(part|state)=' src
```

## Replacement: the className path

Carry the state on a modifier class the application owns, and key the rule on
that class:

```tsx
// before (2.19.37)
<Button className="rt-upgrade-modal__cta" data-state="current" />
// after
<Button className="rt-upgrade-modal__cta rt-upgrade-modal__cta--current" />
```

```css
/* before */ .rt-upgrade-modal__cta[data-state="current"] { opacity: 0.6; }
/* after  */ .rt-upgrade-modal__cta--current { opacity: 0.6; }
```

Never select a DS-owned part or state to restyle a DS primitive's internals:
use the documented class hooks and tenant channels. The design system edits no
application. Each packet (`../app-bithire/index.md`) carries its own work.

## Legacy sync SSR (`renderToString` / `renderToStaticMarkup`)

In the major line, synchronous `renderToString` / `renderToStaticMarkup` over a
cold lazy engine family raises React's own "suspended while responding to
synchronous input" error when no ancestor Suspense boundary catches it (owner
ruling 6). This behavior is implemented and declared by the `major` changeset
`suspense-phase-b-w1`.

See the [legacy sync-SSR migration guide](../legacy-sync-ssr/index.md) for the
public async helper, intended `allowSubpaths` opt-in and registered nine-file
application test census. The DS reports those app targets and edits no application.

## Verification

- The census above reports zero sites, or every site carries a modifier class
  and no rule selects `[data-state]` / `[data-part]` on a DS component the app
  does not own.
- The app's visual and unit suites are green against the major prerelease
  (non-stable dist-tag; `latest` is never moved for validation).
