# Public API

The public boundary: what you may import, what it guarantees, and what stays
unstable. `packages/core/package.json` declares the public subpaths;
`packages/core/docs/consumer-contract/index.md` declares their guarantees.
`packages/core/contracts/package/entrypoints/index.json` is the in-repository
fence for governed entry owners; it is not published and is not a second
export map.

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

Measured from the `package.json` export map (33 keys total):

```bash
node -e "console.log(Object.keys(require('./packages/core/package.json').exports).length)"
```

| Family | Keys | Family | Keys |
|---|---|---|---|
| `./icons`, `./icons/presets/bithire`, `./icons/roles/*` | 3 | `./styles.css`, `./styles/{bithire,evnto,rottay,frozen-engines}` | 5 |
| `./marks`, `./marks/{brand,cloud}` | 3 | `./fonts/<pack>.css` | 7 |
| `./charts`, `./charts/{spec,access,renderers}` | 4 | `./server`, `./server/static-markup` | 2 |

The remainder are single-entry subpaths: `.` (root), `./eslint`, `./motion`,
`./pictograms`, `./spatial`, `./supplier-contract`, `./hooks-manifest`,
`./supplier-honesty-cli`, `./tenant-theme-canary-fixtures`.

`./icons/roles/*` is the only wildcard key. Braces abbreviate explicit keys, and
the seven font packs are `arabic-text`, `editorial-display`, `editorial-text`,
`grotesk-display`, `humanist-text`, `geometric-display` and `plex-mono`.

Most keys resolve to build output under `dist/`. The CSS keys publish named
bundles: `./styles.css` carries every vertical, `./styles/{bithire,evnto,rottay}`
carry one each, and `./styles/frozen-engines` is the supplemental Classic and
Rustic bundle loaded beside one of them. There is no `./dist/*.css` key and no
`./styles/modern` key: a stylesheet is reached through its named key.
`./supplier-contract`, `./hooks-manifest` and `./tenant-theme-canary-fixtures`
resolve instead to versioned JSON contracts under `packages/core/contracts/`,
not to build output.

A published key is not necessarily a sanctioned one: the
[consumer contract](../packages/core/docs/consumer-contract/index.md) §1.2 owns
each key's disposition, and `no-unsanctioned-ds-subpath` (§8) reports every
module import of a key that is not `guaranteed`.

## 3. Entry contract

`contracts/package/entrypoints/index.json` governs subpaths under
`./contracts/*`, `./runtime/*`, `./primitives/*`, `./patterns/*`,
`./structures/*` and `./surfaces/*`. The package publishes none today, so the
manifest has zero entries and is kept as a fence: a subpath under one of those
owners fails `public-entrypoints:check` until it is declared there with its
source file, its compiled output, and a decrease-only source budget
(`maxDirectSources`, `maxReachableModules`, `maxSourceBytes`). The manifest is
a repository file, not a published door:

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

### Modern form control binding

`FormField` binds its visible label to the first direct control child and merges
its active error/help message after the child's `aria-describedby`. A field error
sets `aria-invalid=true`; otherwise caller validation state survives. Explicit
child `aria-labelledby` wins, then child `aria-label`, then the visible field
label. An empty/absent field label leaves standalone component names intact.
Caller IDs are preserved. Generated control, label and message IDs are opaque,
instance-specific and stable across rerenders; do not derive DOM references from
`name` or depend on their spelling. Give caller IDs document-wide uniqueness.

The following public props are forwarded by the Modern engines. Classic and
Rustic remain frozen; this does not extend their behavior guarantees.

| Component | Binding target and public props |
|---|---|
| `Slider` | `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`. Single mode targets the native range input. Range mode puts the ID/name on the group, derives thumb IDs as `{id}-start`/`{id}-end`, and forwards description/invalid state to both native inputs. Thumb names remain the localized minimum/maximum names. |
| `OTPInput` | Existing `id` remains a prefix for `{id}-0`, `{id}-1`, etc. `aria-label`/`aria-labelledby` name the first slot; later slots keep positional names. The first slot retains its default positional `aria-label` unless explicitly overridden, with `aria-labelledby` taking accessible-name precedence. `aria-describedby` is merged after the component's own error reference on every slot. `aria-invalid` reaches every slot; the component's own `error` state takes precedence. |
| `Rate` | Existing `id` and ARIA props reach the radiogroup. FormField supplies `aria-labelledby` referencing the visible label because a radiogroup div cannot receive a native label association. Radio names and interaction are retained. |
| `Upload` / `Upload.Dragger` | `id`, `aria-label`, `aria-labelledby` name the real native file input; the forwarded ref still targets the outer div. `aria-describedby`/`aria-invalid` reach the input and existing trigger/dropzone. Trigger action names are retained. A custom button's own description is merged before field context; its name and handlers survive. Text, picture, picture-card and picture-circle modes retain their selection behavior. Interactive picture-trigger children use a passive container to avoid nested controls. |

```tsx
<FormField label="Budget" name="budget" error="Choose a valid interval.">
  <Slider range defaultValue={[20, 80]} />
</FormField>
<FormField label="Verification code" name="verification" help="Check your device.">
  <OTPInput id="verification-code" length={6} />
</FormField>
```

## 6. Icons and marks

`./icons` is the governed, supplier-independent `Icon` facade with the
complete role inventory and generated metadata. The redundant `./icons/full`
and `./icons/corpus` doors are retired, and so are the
`./icons/{foundation,identity,intelligence,operations}` packs: their rosters
remain as `*_ICON_NAMES` lists on `./icons`, and `Icon` renders every role.
`./icons/presets/bithire` is the bounded application preset; `BitHireIconPreset`
keeps synchronous SSR without loading the complete registry. `./icons/roles/*`
publishes one generated module per semantic role, with the dot of the role name
written as a hyphen: `./icons/roles/action-add` exports `ActionAddIcon`. Its
consumer-contract disposition is `retire-by`, so new code renders `Icon`.
`./marks` aggregates brand and cloud-provider marks;
`./marks/brand` and `./marks/cloud` preserve class-specific resource isolation
without duplicating implementations, including synchronous CommonJS/SSR use.

The RET-01/D07 target major removes the 328 vendor-named glyph exports from
`./icons`; it does not remove any of the 282 semantic roles, metadata, runtime
asset controls, `BaseIcon`, `createIcon` or their existing structural types.
WO-RET-06 then retired the first-party `AlertIcon` wrapper, the last catalog
binding on the door: render `<Icon name="status.warning" decorative />`, or pass
`label` when the icon carries meaning alone. The private barrel's 329 bindings
are therefore all gone from `./icons`; no whole-catalog reexport remains.
The exact removed-symbol inventories are in the
[major migration changeset](../.changeset/ret-01-icons-doors.md) and the
[WO-RET-06 doors changeset](../.changeset/ret-06-w1-doors-and-transfers.md).
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
that boundary for runtime `lucide-react` imports; it does not restore removed
public glyph exports.

## 7. Charts

The package root exports the 18 D3-backed chart families (`AreaChart`,
`BarChart`, … `WaterfallChart`); the former `./patterns/charts` door, which
re-exported the same names, is retired. `./charts` is the supplier-independent
chart experience kernel; `./charts/spec` is the
server-safe visualization contract (no D3, no browser API); `./charts/access`
is the accessible data-table companion; `./charts/renderers` isolates the
renderer implementations. See the Showroom for a live page per chart type.

## 8. ESLint rules

`./eslint` ships 7 rules, each named `@rottay/<rule>`, and two ready configs,
`configs.recommended` and `configs.marketing`:

| Rule | Enforces | `recommended` | `marketing` |
|---|---|---|---|
| `no-raw-html` | Disallow raw HTML elements; use DS primitives instead | error | off |
| `no-hardcoded-colors` | Disallow hardcoded color values; use DS CSS variables instead | error | warn, Tailwind colors allowed |
| `no-db-in-components` | Disallow database/ORM imports in UI component files | error | error |
| `no-direct-lucide` | Disallow direct `lucide-react` imports; use DS icons instead | warn | warn |
| `no-motion-literals` | Disallow `cubic-bezier()`, keyword easing and raw sub-second duration literals in modern-engine and `graphics/motion` style values; use `--ds-motion-*` tokens | error | not set |
| `no-layout-property-animation` | Disallow animating a layout property; move `transform`, `opacity` or `clip-path`, and size through the layout kernel | off | not set |
| `no-unsanctioned-ds-subpath` | Only import the subpaths the consumer contract guarantees | error | error |

`no-layout-property-animation` is enabled by neither config; an app opts in once
it has measured its own debt. `no-unsanctioned-ds-subpath` enforces a mirror of
the consumer contract's disposition tables; its `allowSubpaths` option is the
decrease-only per-app baseline and the explicit opt-in for a `lab` subpath.

## 9. Server entry

`./server` contains only code safe in Node.js, Edge Runtime, or middleware —
no React components, nothing marked `'use client'`. It exports tenant
resolution (`resolveRequestTenant`, `resolveRequestTenantAsync`,
`createEdgeConfigDomainLookup`), the known-tenant registry
(`isKnownTenant`, `isBundledTenant`, `getKnownTenantConfig`,
`getKnownTenantSlugs`), locale support (`toSupportedLocale`), the
font-pack manifest for SSR `<link rel="preload">` emission, the theme compile
and mount door (`compileThemeIntent`, `mountTenantTheme`) and the engine-identity
names; `packages/core/src/entrypoints/server/index.ts` is the complete list.

`./server/static-markup` stays a separate subpath because it imports
`react-dom/server` and `react-dom/static`. `renderResolvedStaticMarkup(node)`
resolves the engines' `React.lazy` payloads and returns the same HTML as
`renderToStaticMarkup`. It requires React >= 19 and does not resolve general
data suspense. Its disposition is `lab`: an app adopts it through
`allowSubpaths` (§8).

## 10. Deprecations

The RET-01 target-major changeset also retires the unadopted root hooks
`useRouterState` and `useNotificationPreferences`, together with their exclusive
options/return types and notification channel/category types. Applications own
URL routing and notification preferences and pass that state through the DS's
controlled component props; no replacement DS routing or preference authority
is introduced. `useLayoutPreference` remains available and is exercised by the
command-palette's callback and frecency persistence path.

Deprecated symbols are marked inline with a JSDoc `@deprecated` tag, and
`packages/core/contracts/package/deprecations/index.json` holds one ledger row
per marker with its replacement, `since`, `removeIn` and receiver work order.
`deprecations:check` fails a marker without a row and a row without a marker.
The ledger is a repository file, not published. Two verified rows from the
public `ButtonProps` contract, exported by the root entry:

| Symbol | Replacement | Removal line |
|---|---|---|
| `ButtonProps['data-part']` | `className` | 4.0 |
| `ButtonProps['data-state']` | `className` | 4.0 |

The ledger is the full, current set. Find its inline markers — cross-reference
each against §2's subpaths to tell public from internal:

```bash
grep -rl "@deprecated" packages/core/src --include="*.ts" --include="*.tsx" | grep -v "/tests/\|\.test\."
```
