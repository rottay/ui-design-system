# Public API

The public boundary: what you may import, what it guarantees, and what stays
unstable. Source of truth for the entry contract is
`packages/core/contracts/package/entrypoints/index.json` (`schemaVersion: 2`).

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

Regenerated from `package.json` `exports` (121 keys total):

```bash
node -e "console.log(Object.keys(require('./packages/core/package.json').exports).length)"
```

| Family | Subpaths | Family | Subpaths |
|---|---|---|---|
| `./primitives/*` | 39 | `./styles`, `./styles.css`, `./styles/*` | 7 |
| `./patterns/*` | 13 | `./fonts/*` | 6 |
| `./runtime/*` | 11 | `./structures/*` | 5 |
| `./icons`, `./icons/*` | 10 | `./charts`, `./charts/*` | 4 |
| `./contracts/*` | 7 | `./surfaces/*` | 2 |
| | | `./marks`, `./marks/*` | 3 |
| | | `./spatial`, `./spatial/*` | 2 |

The remainder are single-entry subpaths: `.` (root), `./server`, `./eslint`,
`./motion`, `./effects`, `./pictograms`, `./public-entrypoints-manifest`,
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

`./contracts/*` exports 7 subpaths of type-only surface, one per tier plus
runtime and i18n: `foundation`, `patterns`, `i18n`, `runtime`, `primitives`,
`structures`, `surfaces`. Import types from the matching contract subpath
rather than from a component's own module path.

## 6. Icons and marks

`./icons` is the governed, supplier-independent `Icon` facade (semantic
names and roles); `./icons/full`, `./icons/corpus`, and
`./icons/{foundation,bithire,identity,intelligence,operations}` are generated
packs over the same governed corpus. `./marks` (plus `./marks/brand`,
`./marks/cloud`) is the equivalent facade for brand and cloud-provider marks.

Never import a supplier package (`@phosphor-icons/react`, `lucide-react`,
`@thesvg/react`, an Ant Design icon) directly in product code — the DS is the
only place a supplier is allowed to change without a consumer-visible
breaking change. The shipped `no-direct-lucide` ESLint rule (§8) enforces
this for the compatibility catalog.

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
| `no-motion-literals` | Disallow raw `cubic-bezier()`/duration literals in modern-engine styles; use `--ds-motion-*` tokens |
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
