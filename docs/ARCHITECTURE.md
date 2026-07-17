# Rottay Design System Architecture

This is the current architecture reference for `@rottay/design-system`.
Component counts and family names are generated in
[`packages/core/docs/TAXONOMY.generated.md`](../packages/core/docs/TAXONOMY.generated.md);
the operative work queue lives in [`roadmap/`](../roadmap/). The original 0.5.0
migration ledger is preserved as
[`docs/history/ARCHITECTURE-0.5.0.md`](history/ARCHITECTURE-0.5.0.md) and is not
a current source-path reference.

## Source ownership

`packages/core/src` is a dependency and ownership tree, not a flat catalog.

```text
src/
  foundation/       Contracts, kernels, presets, i18n and tokens
  infrastructure/   Compilers and browser/React runtime orchestration
  graphics/         Icons, brand marks, pictograms and motion
  ui/               Primitives -> patterns -> structures -> surfaces
  tooling/          Declarations, ESLint, examples and test support
  entrypoints/       Classified package-subpath boundaries
  index.ts           Package-root facade; the only loose source-root file
```

The first five directories are the canonical architectural roots.
`entrypoints/` is package-boundary support, not a sixth tier. Each subpath is a
`folder/index.ts` owner that forwards to canonical implementation code.

At the macro level, dependencies flow toward the product edge:

```text
foundation -> infrastructure/compilers -> infrastructure/runtime
foundation + infrastructure + graphics -> ui
primitives -> patterns -> structures -> surfaces -> consuming app
```

Within a capability, lower branches precede higher branches:

```text
foundation|kernel|contracts|policy|quality|spec|validation
  -> runtime
  -> composition|react
  -> presentation
  -> facade|public
```

## Physical tree rules

- Authored production units use `folder/index.ts` or `folder/index.tsx`.
- `packages/core/src/index.ts` is the only loose file at the source root.
- Two or more related units gain a named family directory.
- A barrel may aggregate child owners but does not share its level with loose
  authored peers.
- Tests live in the owning unit's `tests/` branch; cross-owner tests live under
  explicit `integration/` or `architecture/` owners.
- Generated files, declarations, fixtures, examples, stories and registered
  package entrypoints are classified exceptions, not patterns for product code.
- Generic ownership segments such as `_internal`, `internal`, `misc`, `shared`,
  `utils` and `hooks` are forbidden. Name the capability instead.
- Physical moves preserve public exports and package subpaths; private
  compatibility shims are not left behind.

The executable law is:

```bash
pnpm --filter @rottay/design-system structure:check
```

The structure baseline is decrease-only. Never absorb a new finding merely to
make the gate pass.

## UI composition stack

The four `ui/` tiers have one dependency direction:

1. `primitives/` — engine-switched leaf components.
2. `patterns/` — reusable task compositions; engine-backed only when rendering
   genuinely differs by engine.
3. `structures/` — page chrome and structural families that wrap or accompany
   patterns.
4. `surfaces/` — declarative, page-level recipes consumed by applications.

Primitives are grouped into `display`, `feedback`, `inputs`, `layout`,
`navigation` and `overlay`; tier-wide runtime support remains under the
explicit `primitives/runtime/` owner.

Patterns use product-facing groups such as `data`, `forms`, `visualization`,
`communication`, `workflow`, `navigation`, `customization`, `identity`,
`commerce`, `commercial`, `feedback` and `shell`. Cross-pattern support lives
under the explicit `foundation`, `runtime` and `tooling` owners.

Structures are grouped into `dashboard`, `feedback`, `headers`, `record`,
`shell` and `workspace`. Surfaces expose `foundation`, `runtime`,
`composition/layout` and `presentation/pages` in dependency order.

If a piece requires candidate, company, role, tenant, event or other product
semantics, it belongs to the consuming application. The DS owns reusable,
domain-agnostic behavior and presentation contracts.

## Engine model

There are three physical engines:

| Engine | Physical implementation |
|---|---|
| `classic` | Ant Design-backed enterprise presentation |
| `modern` | Rottay-native token/skin presentation |
| `rustic` | Vanilla React/CSS fallback |

`custom` is a pack-scoped registry identity, not a fourth implementation tree.
It renders a registered component when available and otherwise delegates to a
configured physical fallback.

An engine-backed component keeps its stable facade at the component owner and
may add only the branches it needs:

```text
Component/
  index.tsx
  contracts/index.ts
  runtime/<capability>/index.ts
  engines/{classic,modern,rustic}/index.tsx
  compound/<Part>/index.tsx
  tests/*.test.tsx
```

## Tenant and white-label authority

There are two authority classes:

- Code-owned vertical baselines (`rottay`, `bithire`, `evnto`) are static-first.
  Their TypeScript `BrandTheme` sources compile into generated CSS artifacts.
- Published customer tenants are DB-owned. A hostname chooses tenant identity,
  never a checked-in CSS file or component branch.

The productive customer path is:

```text
hostname -> canonical tenant identity -> published TenantThemeDocument in DB
  -> schema/envelope validation -> server compiler/cache
  -> exact artifact embedded by SSR
  -> hydration with visualAuthority="compiled-artifact"
```

Browser components never query the DB. The provider supplies tenant, locale,
features, motion and component context but emits no competing visual layer in
`compiled-artifact` mode. The six-stage memory/localStorage/registry/static/API
resolver remains a compatibility and development config chain; it is not the
productive visual-authority chain.

The full contract and failure rules live in
[`packages/core/docs/TENANT_MODEL.md`](../packages/core/docs/TENANT_MODEL.md).

## Icons and brand assets

Functional icons are supplier-independent. Phosphor is the pinned default
supplier behind the adapter/generator boundary; Lucide is not the default and
vendor-shaped exports are compatibility-only.

Two counts describe distinct contracts:

- the stable `Icon` facade accepts 50 governed compatibility roles;
- generated semantic packs contain 263 roles across the complete corpus.

Brand and cloud-provider identity uses the separate `marks` API. Pictograms are
also a distinct asset class. Tenants may provide an approved company logo, but
cannot replace functional glyph semantics or select an arbitrary supplier.

## Charts and responsive behavior

The chart catalog contains 18 D3-backed families. They are token-aware,
personality-driven and accessible; chart semantics, renderer choice and
provenance remain code-owned. Customer tenants may change the bounded category
palette but not the renderer or data meaning.

Responsive behavior is adaptive, not a request to squeeze the desktop view
onto a small screen. CSS handles continuous layout changes; responsive runtime
contracts select a reduced mobile information hierarchy when content or
interaction must change.

## Public boundaries

The package root exports the primary component/runtime API. Classified
subpaths expose server utilities, functional icon packs, marks, pictograms,
charts, motion, effects, spatial contracts, ESLint rules, commercial tooling
and CSS bundles. Implementation code remains at its canonical owner; subpath
entrypoints only forward it.

Applications import exactly one full or vertical CSS bundle. A productive
DB-backed customer additionally mounts the exact server-compiled artifact and
uses `visualAuthority="compiled-artifact"`.

## Documentation workflow

After a physical UI move, regenerate the inventory only after paths stabilize:

```bash
pnpm --filter @rottay/design-system docs:taxonomy
```

Historical audits remain snapshots. Reconcile their findings in current
roadmaps or canonical docs; do not rewrite the evidence as if it had always
described the latest tree.
