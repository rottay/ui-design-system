# Public API

The public boundary: what you may import, what it guarantees, and what stays
unstable. `packages/core/package.json` declares the public subpaths;
`packages/core/docs/consumer-contract/index.md` declares their guarantees.
`packages/core/contracts/package/entrypoints/index.json` classifies governed
entry owners and is not a second exhaustive export map.

## 1. Import policy

Only the subpaths listed in `packages/core/package.json` `exports` are
public. A deep import into `src/**` or into `dist/**` internals (anything not
reachable through one of the entries in §2) carries no stability guarantee and
can change or disappear in a patch release.

```tsx
// Public
import { Button } from "@rottay/design-system";
import { resolveRequestTenant } from "@rottay/design-system/server";

// Not public — do not do this
import { Button } from "@rottay/design-system/src/components/primitives/inputs/button";
```

## 2. Subpath families

Measured from the RET-01-F candidate `package.json` export map (40 keys total):

```bash
node -e "console.log(Object.keys(require('./packages/core/package.json').exports).length)"
```

| Family | Subpaths | Family | Subpaths |
|---|---|---|---|
| `./icons`, `./icons/*` | 7 | `./styles.css`, `./styles/*` | 6 |
| `./patterns/charts` | 1 | `./fonts/*` | 7 |
| `./marks`, `./marks/*` | 3 | `./charts`, `./charts/*` | 4 |
| `./spatial` | 1 | | |

The remainder are single-entry subpaths: `.` (root), `./server`, `./eslint`,
`./motion`, `./pictograms`, `./public-entrypoints-manifest`,
`./supplier-contract`, `./hooks-manifest`, `./supplier-honesty-cli`,
`./dist/*.css`, `./tenant-theme-canary-fixtures`.

## 3. Entry contract

`contracts/package/entrypoints/index.json` tracks 77 entries covering
**159 public symbols: 112 runtime, 47 type-only**. Each entry records its
source file, its compiled output, and a decrease-only source budget
(`maxDirectSources`, `maxReachableModules`, `maxSourceBytes`) — an entry's
budget may shrink, never grow, without an explicit measured review:

```bash
node -e "console.log(require('./packages/core/contracts/package/entrypoints/index.json').coverage)"
```

## 4. Stability policy

Semver applies to every subpath in §2 and to the symbols the entry contract
tracks (§3): a breaking change to any of them is a major version bump.
Nothing else is covered:

| Surface | Stability |
|---|---|
| Subpath exports (§2), tracked entry symbols (§3) | semver — breaking change = major |
| `src/**` deep imports, `dist/**` internals not reached through an export | none — may change in a patch |
| Per-component prop APIs | semver, as part of the primitive/pattern/structure/surface that exports them |
| Generated artifacts (taxonomy, customization controls) | regenerate; do not depend on their exact prose |

## 5. Types and contracts

Public types are exported from the root and the focused capability entries.
The former `./contracts/*` doors were retired with the 3.0 API cleanup;
consumer code must not import private source paths.

## 6. Icons and marks

`./icons` is the governed, supplier-independent `Icon` facade with the
complete role inventory and generated metadata. The redundant `./icons/full`
and `./icons/corpus` doors are retired. The
`./icons/{foundation,identity,intelligence,operations}` entries are generated packs
over the same governed corpus, and `./icons/presets/bithire` is the bounded
application preset. `./marks` aggregates brand and cloud-provider marks;
`./marks/brand` and `./marks/cloud` preserve class-specific resource isolation
without duplicating implementations, including synchronous CommonJS/SSR use.

The RET-01/D07 target major removes the 328 vendor-named glyph exports from
`./icons`; it does not remove any of the 282 semantic roles, metadata, runtime
asset controls, `BaseIcon`, `createIcon` or their existing structural types.
The existing first-party `AlertIcon` wrapper also stays public from its leaf
owner. The private barrel's 329 bindings split into 328 removals and that one
preserved helper; no whole-catalog reexport remains.
The exact removed-symbol inventory is in the
[major migration changeset](../.changeset/ret-01-icons-doors.md).
This breaks existing app-platform named-glyph consumers. The door also has
imports in 52 Showroom files; their named-glyph usages need adaptation after
the DS-first major change and are not migrated here.
Showroom migration remains required before closing RET-01 or certifying it
against this major; unchanged named-glyph consumers are not guaranteed to compile.
The private catalog still supports existing DS component owners. There is no
`./icons/legacy` door and private source imports are not a migration path.

Choose a role by product intent rather than mechanically renaming a supplier
glyph. For example, replace a create-item `PlusIcon` with
`<Icon name="action.add" decorative />` beside an already labeled control, or
`<Icon name="action.add" label="Create item" />` when the icon supplies meaning.
Provide `label`, or `decorative={true}` without a label; one intent is required.
Preserve supported `size`, `color`, `className`, `style`, `id`,
`aria-describedby`, `data-testid` and `data-part` through `IconProps`.
`Icon` is not a drop-in `SVGProps` surface: `title`/`aria-label` become `label`,
`aria-hidden` intent becomes `decorative`, and supplier weight/stroke options,
arbitrary SVG attributes, children and events are not silently forwarded.
Use semantic size tokens or numeric pixels, not arbitrary CSS strings for `size`.
Put events on the owning control. App-owned custom SVGs can use the retained
`BaseIcon`/`SvgIconProps` or `createIcon`/`DSIconProps` structural contracts
without importing a supplier or resurrecting a vendor-named alias.

Never import a supplier package (`@phosphor-icons/react`, `lucide-react`,
`@thesvg/react`, an Ant Design icon) directly in product code — the DS is the
only place a supplier is allowed to change without a consumer-visible
breaking change. The shipped `no-direct-lucide` ESLint rule (§8) enforces
the supplier boundary; it does not restore removed public glyph exports.

## 7. Charts

`./charts` exports the 18 D3-backed chart families; `./charts/spec` is the
server-safe visualization contract (no D3, no browser API); `./charts/access`
is the accessible data-table companion; `./charts/renderers` isolates the
renderer implementations. See the Showroom for a live page per chart type.

## 8. ESLint rules

`./eslint` ships 6 rules:

| Rule | Enforces |
|---|---|
| `no-raw-html` | Disallow raw HTML elements; use DS primitives instead |
| `no-hardcoded-colors` | Disallow hardcoded color values; use DS CSS variables instead |
| `no-db-in-components` | Disallow database/ORM imports in UI component files |
| `no-direct-lucide` | Disallow direct `lucide-react` imports; use DS icons instead |
| `no-motion-literals` | Disallow raw `cubic-bezier()`, keyword easing and duration literals in modern-engine and `graphics/motion` styles; use `--ds-motion-*` tokens |
| `no-size-type-outside-classic` | Restrict the deprecated `SizeType` import to the classic-engine antd bridge |

## 9. Server entry

`./server` contains only code safe in Node.js, Edge Runtime, or middleware —
no React components, nothing marked `'use client'`. It exports tenant
resolution (`resolveRequestTenant`, `resolveRequestTenantAsync`,
`createEdgeConfigDomainLookup`), the known-tenant registry
(`isKnownTenant`, `isBundledTenant`, `getKnownTenantConfig`,
`getKnownTenantSlugs`), locale support (`toSupportedLocale`), and the
font-pack manifest for SSR `<link rel="preload">` emission.

## 10. Deprecations

The RET-01 target-major changeset also retires the unadopted root hooks
`useRouterState` and `useNotificationPreferences`, together with their exclusive
options/return types and notification channel/category types. Applications own
URL routing and notification preferences and pass that state through the DS's
controlled component props; no replacement DS routing or preference authority
is introduced. `useLayoutPreference` remains available and is exercised by the
command-palette's callback and frecency persistence path.

Deprecated symbols are marked inline with a JSDoc `@deprecated` tag; there is
no separate deprecation registry, so `since` and `removal` are not tracked as
structured fields today. One verified example from the public `TenantConfig`
contract (`./contracts/foundation`):

| Symbol | Replacement |
|---|---|
| `TenantConfig.tokenOverrides` (field) | `brandTheme.surfaces` / `brandTheme.chrome.controls` |
| `TenantConfig.personality` (field) | `brandTheme.motion` / `brandTheme.chrome` |

34 files carry `@deprecated` tags today, most on internal (non-public) types.
Find the full, current set — cross-reference each against §2's subpaths to
tell public from internal:

```bash
grep -rl "@deprecated" packages/core/src --include="*.ts" --include="*.tsx" | grep -v "/tests/\|\.test\."
```
