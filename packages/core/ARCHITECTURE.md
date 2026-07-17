# Rottay Design System - Architecture Guide

This document describes the high-level architecture, system flows, and key design
decisions of the Rottay Design System (`@rottay/design-system`). It is intended
for developers and AI assistants who need to understand HOW the system works,
not what individual component APIs look like.

---

## 1. System Overview

The Rottay Design System is a **multi-engine, multi-tenant, personality-driven**
React component library. It powers three applications (Evnto, BitHire, Platform)
from a single component tree, adapting visual output based on the active engine,
tenant branding, vertical preset, and product profile.

### The Four Layers

```
Layer 4: App             Config-driven pages composed from surfaces
Layer 3: Surfaces        Page-level config objects (presentation/behavior/visual)
Layer 2.5: Structures        Page chrome: headers, toolbars, record panels, overlays
Layer 2: Patterns        Reusable task compositions (tables, forms, charts, ...)
Layer 1: Primitives      Engine-switched leaf components across 6 categories
```

> Counts of individual primitives, patterns, structures pieces, and surfaces
> are intentionally omitted here. Past iterations of this doc went stale
> almost immediately. The authoritative source is the on-disk tree under
> `packages/core/src/ui/`. The generated inventory lives at
> `packages/core/docs/TAXONOMY.generated.md` and is refreshed with
> `pnpm docs:taxonomy`.

Each layer only depends on the layer below it:

- **Primitives** are engine-switched leaf components (Button, Input, Card,
  etc.). Each primitive may provide up to three physical implementations
  (Classic, Modern, Rustic). `custom` is registry-backed resolution: it uses a
  tenant pack override when one is registered and otherwise falls back to a
  configured physical engine.
- **Patterns** compose primitives into reusable, task-level UI compositions
  (DataTable, FormBuilder, StatsGrid, KanbanBoard, ...). A pattern may be
  engine-backed when its rendering genuinely differs by engine, or engine-free
  when one implementation is sufficient. In either case it stays domain-free:
  it knows nothing about candidates, roles, companies, or events.
- **Structures** is a middle tier introduced in the 2026-04-08 audit
  cleanup. It hosts structural families organized into 6 groups
  (`headers/`, `workspace/`, `record/`, `dashboard/`, `feedback/`, `shell/`) that
  are too specific for `patterns/` but too reusable for `surfaces/`:
  detail/edit/form headers, command bars, record field grids, metric
  cards, loading overlays. Structures families compose patterns and
  primitives and are normally consumed by surfaces or by app-level
  screens directly.
- **Surfaces** are declarative config objects that describe an entire
  page (ListSurface, DashboardSurface, FormSurface, etc.). Surfaces
  are organized by dependency direction into `foundation/` (contracts and
  shared support), `runtime/` (builders, hooks, state, responsive resolution,
  and error handling), `composition/` (page chrome and layout shells), and
  `presentation/` (6 groups of complete page recipes: data, forms, workspace,
  operations, admin, and experience).
  They wire patterns and structures to data and permissions. Contracts and
  state stay declarative; React page renderers live only in `presentation/`.
- **App** is the consuming application layer. Apps pass surface configs and
  domain adapters; the DS handles everything else.

> **Where does X belong?** If another Rottay app could reuse the piece
> without knowing what a tenant, candidate, role, company, interview, or
> event is, it lives in the DS. Inside the DS, use this rule of thumb:
>
> - leaf component with an engine switch → **primitive**
> - reusable composition of primitives that solves a generic task (table,
>   form, chart, kanban) → **pattern**
> - page-scale structural widget that wraps or accompanies a pattern
>   (header, toolbar, record panel, loading shell, metric card) → **structures**
> - page-level config object a consumer passes to render a whole screen
>   → **surface**

---

## 2. Engine System

### Three Physical Engines and Custom Resolution

| Physical engine | Backing library  | Character                      |
|-----------------|------------------|--------------------------------|
| Classic         | Ant Design       | Enterprise, structured, formal |
| Modern          | Rottay token skins (Tailwind/Daisy compatible) | Responsive, expressive, adaptive |
| Rustic          | Vanilla HTML/CSS | Minimal, lightweight, raw      |

`custom` is not a fourth physical implementation tree. It is a pack-scoped
component registry used for exceptional white-label overrides. When the active
pack does not register a component, resolution continues through the configured
`fallbackEngine` (`classic` by default).

### How `createEngineComponent` Works

Every primitive is defined through the engine factory:

```
createEngineComponent<ButtonProps>('Button', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
})
```

The factory returns a `ForwardRefExoticComponent` that:

1. Reads the active engine from `EngineProvider` context
2. Optionally accepts an `engine` prop for per-component override
3. Resolves a pack registration when the selected engine is `custom`
4. Falls back to one of the three physical engine loaders when needed
5. Wraps lazy physical implementations in `Suspense` + `EngineErrorBoundary`

### Primitive Owner Shape

The primitive name is the owner; its main facade is the owner `index`, not a
second `Component/Component.tsx` wrapper or an extra `component/` directory.
Optional branches are added only when the capability exists:

```text
Button/
  index.tsx
  contracts/index.ts
  runtime/<capability>/index.ts
  engines/
    classic/index.tsx
    modern/index.tsx
    rustic/index.tsx
  compound/<Part>/index.tsx
  tests/*.test.tsx
```

The internal direction is `contracts → runtime → engines → compound`; a later
branch may consume an earlier one. A missing physical implementation is handled
by the engine registry/fallback and is not represented by a fake re-exporting
engine file.

Cross-category overlay infrastructure lives once under
`ui/primitives/runtime/overlay/{portal,backdrop,focus-management,dialog-attributes}`.
Responsive primitives form the explicit
`ui/primitives/layout/responsive/{show,hide,slot}` family. Page-scale
composites do not remain in primitives: `ActionDock`, `BottomTabBar` and
`MobileHeader` belong to structures, while `AdaptiveOverlay` belongs to
patterns/feedback.

### Engine Selection Flow

```
DesignSystemProvider
  │
  ├─ forceEngine prop?  ──── YES ─→ use that engine
  │
  ├─ vertical.engine? ────── YES ─→ use that engine
  │
  ├─ bundled tenant engine?  YES ─→ use the first-party pin
  │
  └─ fallback ─────────────────────→ 'classic'
          │
          v
    EngineProvider (sets context)
          │
          v
    createEngineComponent reads context
          │
          ├─ custom + registered component ─→ render pack component
          │
          └─ physical or custom fallback ───→ React.lazy loads
                                               classic / modern / rustic
```

An engine value arriving from a DB-managed tenant is intentionally ignored.
Vertical identity is static-first; tenants can change branding, tokens and
bounded appearance without changing which product engine owns rendering.

### Custom Resolution: Pack-Scoped Registry

The Custom engine supports **pack-scoped component registration** for
multi-tenant white-label scenarios:

```
Pack Registries (Map<string, ComponentRegistry>)
  ├─ '__default__'   → { Button: DefaultBtn, Card: DefaultCard }
  ├─ 'acme-pack'     → { Button: AcmeBtn }
  └─ 'globex-pack'   → { Button: GlobexBtn, Card: GlobexCard }
```

- `registerCustomComponent('Button', AcmeBtn, 'acme-pack')` adds to a pack
- TenantConfig carries a `componentPack` field
- The factory reads `componentPack` from TenantProvider context
- Each pack resolves independently; missing components fall back to the
  configured `fallbackEngine` (default: classic)
- Config is global (`configureCustomEngine`), registrations are pack-scoped

---

## 3. Token Resolution Chain

Design tokens flow through a multi-layer pipeline. The chain depends on
whether the tenant has a `brandTheme` (the canonical premium model) or
uses the legacy scattered fields.

The chains below describe provider-owned code verticals and compatibility
inputs. A published customer tenant instead arrives as one validated,
server-compiled artifact; `visualAuthority="compiled-artifact"` prevents the
provider from recomputing or emitting a competing visual layer.

### BrandTheme Path (code-owned verticals)

When `config.brandTheme` exists, the merge chain is:

```
Structural:  Engine -> Vertical.tokenOverrides -> BrandTheme.surfaces -> Tenant.tokenOverrides
Personality: DEFAULT -> Vertical.personality -> BrandTheme (motion/charts/chrome) -> Tenant.personality
Branding:    BrandTheme.palette -> color scale generation -> CSS variables
```

Product profile personality and tokenOverrides are **skipped** — only
`surfaceDefaults` (UX posture: listView, density, schedulerView) survives.

### Legacy Path (backward compatible)

When `config.brandTheme` is absent, the merge chain is:

```
Structural:  Engine -> Vertical.tokenOverrides -> Profile.tokenOverrides -> Tenant.tokenOverrides
Personality: DEFAULT -> Vertical.personality -> Profile.personality -> Tenant.personality
Branding:    Tenant.branding -> color scale generation -> CSS variables
```

### Merge Rules

- Each layer provides partial overrides that spread on top of the previous.
- Personality sub-objects (animation, chart, typography, accent, card) merge
  independently — overriding `animation` does not wipe `chart`.
- Tenant overrides are always the highest-priority layer in both paths.
- The static CSS generator (`generateTenantCss`) follows the same chain.

Each personality sub-object (animation, chart, typography, accent, card) is
spread independently. A tenant that only customizes `animation` does not
accidentally wipe out the vertical's `chart` personality.

### Color Tokens

Colors use CSS custom properties (`var(--ds-color-primary-500)`) rather than
resolved values. Code-owned vertical values ship in generated artifacts;
published customer values come from a bounded server-compiled DB artifact.
Both paths expose the same variable contract to components.

---

## 4. Tenant System

### Compatibility Resolution Chain

The legacy/config resolver follows a six-level fallback chain so the DS can
render predictably in local development, previews and compatibility consumers.
This is an identity/config lookup chain, not the productive source of visual
authority for a published customer tenant.

```text
getTenantConfig(slug)
  │
  ├─ 1. Memory cache (Map)          Instant, populated by prior calls
  │
  ├─ 2. localStorage cache          Survives page reloads, 1-hour TTL
  │
  ├─ 3. Known registry              Bundled first-party configs (zero network)
  │     (rottay, bithire, evnto)
  │
  ├─ 4. Static files                /.designsystem/tenants/<slug>/config.json
  │
  ├─ 5. Remote API                  Platform-managed tenants in the database
  │
  └─ 6. Identity-safe generic config for the requested slug
                                      Absolute safety net, never aliases a brand
```

Published customer tenants use a separate productive path:

```text
hostname -> tenant identity -> canonical tenancy DB publication
  -> validate TenantThemeDocument + vertical envelope
  -> server compile/cache immutable artifact
  -> SSR embeds exact CSS and canonical config
  -> hydration uses visualAuthority="compiled-artifact"
```

Browser components never query the DB. A cache/fetch failure preserves the
requested identity and fails closed; it must not fall through to another
brand. `docs/TENANT_MODEL.md` is authoritative for this split.

### TenantConfig Structure

A TenantConfig carries:

- `slug` -- unique identifier
- `name` -- display name
- `engine` -- optional first-party/bundled pin; ignored for DB-managed tenants
- `theme` -- theme variant (base, dark, etc.)
- `plan` -- subscription tier
- `features` -- enabled feature flags
- `brandTheme` -- code-owned/compat premium theme
- `branding`, `appearance`, `tokenOverrides`, `personality` -- legacy visual
  compatibility fields, not the customer DB write contract
- `componentPack` -- custom engine pack identifier
- `vertical` -- vertical preset key
- `locale` / `fallbackLocale` -- i18n defaults
- `customTranslations` -- per-tenant translation overrides

Published customer writes use `TenantThemeDocument`; the server normalizes its
allowlisted fields into the runtime config plus compiled CSS artifact.

### How Branding Flows Through

```text
Code-owned vertical:
  BrandTheme source -> compiler/build -> checked-in generated artifact
    -> provider/bundle mounts the vertical CSS contract

Published customer tenant:
  TenantThemeDocument in DB -> server compiler/cache -> SSR style artifact
    -> DesignSystemProvider visualAuthority="compiled-artifact"
    -> provider supplies context but emits no competing visual CSS
```

### Tenant Override Merging

When `tenantOverrides` are provided to `DesignSystemProvider`:
- Scalar values: last write wins
- Branding/token objects: shallow-merge by section
- Features: set union (apps can enable extras without dropping tenant defaults)
- Personality: replace (not deep-merged at provider level; token resolution
  handles the deep merge later)
- Translations: recursive deep merge to allow surgical per-key overrides

---

## 5. Vertical Presets

Verticals represent **industry-specific configurations** that bundle together an
engine preference, personality tokens, density, surface defaults, and feature
flags into a single preset.

### Built-in Verticals

| Vertical   | Engine  | Density     | Character                          |
|------------|---------|-------------|------------------------------------|
| `evnto`    | modern | comfortable | Playful, bounce entrance, spring   |
| `bithire`  | modern | comfortable | Editorial, calm, people-first      |
| `platform` | modern | compact     | Neutral, balanced, operational     |

### How Verticals Participate

```
DesignSystemProvider
  │
  ├─ vertical prop (explicit) OR tenantConfig.vertical (runtime)
  │
  └─→ Resolved to a VerticalPreset
       │
       ├─→ engine           Default engine (unless forceEngine overrides)
       ├─→ personality      Merged into personality chain (layer 2 of 4)
       ├─→ tokenOverrides   e.g., evnto uses densityScale 1.125, rounded radii
       ├─→ features         Feature flags enabled by default
       ├─→ surfaceDefaults  listView, density, schedulerView
       └─→ defaultProductProfile  Used when no explicit profile is given
```

Verticals answer "which kind of product is this?" while product profiles
answer "which UX preset should we apply within that product space?"

The registry is intentionally open-ended (`VerticalKey = 'evnto' | ... | (string & {})`)
so product teams can register custom verticals without waiting for a DS release.

---

## 6. Component Architecture

### Tier Structure

```
Primitives (engine-switched leaf components)
  │
  ├─ display/       Avatar, Badge, Calendar, Card, Carousel, Empty,
  │                 Image, Kbd, List, QRCode, Statistic, Table, Tag,
  │                 Timeline, Tooltip, Tree, Typography, ...
  │
  ├─ inputs/        Button, Input, Select, Checkbox, Radio, Switch,
  │                 DatePicker, Slider, Upload, Transfer, OTPInput, ...
  │
  ├─ feedback/      Alert, Modal, Drawer, Progress, Skeleton, Spinner,
  │                 Toast, Notification, Result, Rate, Message, ...
  │
  ├─ layout/        Box, Flex, Grid, Stack, Container, Divider,
  │                 Collapse, ScrollArea, Splitter, Layout, ...
  │
  ├─ navigation/    Tabs, Menu, Breadcrumb, Pagination, Steps,
  │                 Stepper, Segmented, Link, Anchor, FloatButton, ...
  │
  └─ overlay/       Modal, Dropdown, Popover, Sheet, ContextMenu,
                    AlertDialog, ConfirmDialog, HoverCard, Tour, ...

Patterns (reusable task compositions; engine-backed where needed)
  │
  ├─ product groups/    commerce, commercial, communication, customization,
  │                     data, feedback, forms, identity, navigation, shell,
  │                     visualization, workflow
  └─ support owners/    foundation, runtime, tooling

Structures (page chrome and structural families)
  │
  ├─ headers/           collection, dashboard, detail, edit, form, mobile-header
  ├─ workspace/         search, filters, toolbars, palette and view controls
  ├─ record/            content, edit-fields, form-sections
  ├─ dashboard/         insights, stats-header, data-terminal-card
  ├─ feedback/          loading-overlay
  └─ shell/             reusable application-shell structures

Surfaces (page-level config objects)
  │
  ├─ foundation/        Contracts and shared support
  ├─ runtime/           Builders, helpers, hooks, state, responsive defaults, error boundary
  ├─ composition/layout/ Page shells, headers, sidebars
  └─ presentation/pages/
      ├─ data/           list, dashboard, detail, compare, report, search, visualization
      ├─ forms/          form, detail-form, guided-draft-form, wizard
      ├─ workspace/      collection-workspace, record-workbench, command-center, decision-inbox
      ├─ operations/     activity, kanban, scheduler, operational
      ├─ admin/          settings, audit, billing, profile, team, integration, import-export, file-browser
      └─ experience/     auth, marketing, onboarding, chat, notification, pricing, empty-state, media, editor
```

### Chart Owner Shape

The 18 chart implementations live under
`ui/patterns/visualization/charts/families/`. Cross-family chart capability is
layered explicitly:

```text
charts/
  contracts/compactness/
  families/<chart>/
  foundation/{geometry,palettes}/
  presentation/{crosshair,scaffold,tooltip}/
  runtime/
    chart-engine/{foundation,runtime,presentation}/
    exporting/{foundation,composition}/
    foundation/css-color-resolution/
    interaction/{brush,tooltip-state}/
    responsive/compact-mode/
    theming/{composition,presentation}/
```

Package subpaths such as `./charts/spec`, `./charts/access` and
`./charts/renderers` forward through `src/entrypoints/charts/`; they do not
create peer implementation trees.

---

## 7. Surface Config Model

Every surface config follows a **three-section pattern** plus optional
permissions:

```
SurfaceConfig<TRaw, TView> {
  │
  ├─ presentation {          What the user sees
  │    title, subtitle,
  │    breadcrumbs,
  │    columns, fields,
  │    renderers, slots
  │  }
  │
  ├─ behavior {              What the surface does
  │    data source,
  │    actions, callbacks,
  │    pagination, sorting,
  │    entity adapter
  │  }
  │
  ├─ visual {                How it looks
  │    layout variant,
  │    responsive hints,
  │    maxWidth, density
  │  }
  │
  └─ permissions? {          Who can see/do what
       fields: { [fieldId]: { permission: string } }
       actions: { [actionId]: { permission: string } }
       tabs: { [tabId]: { permission: string } }
       granted: string[]
       isAllowed?: (ctx) => boolean
     }
}
```

### Permission System

Permissions are resolved through `resolveSurfacePermission()`:

1. If no `permissions` config exists, everything is visible
2. If `isAllowed` callback exists, it decides (receives kind, id, permission)
3. Otherwise, check if `permission` string is present in `granted[]` array
4. If no permission rule is declared for a field/action/tab, it is visible

Filtering functions apply this logic consistently:
- `filterSurfaceColumns()` -- gates table columns
- `filterSurfaceActions()` -- gates action bars (also checks `visible()`)
- `filterSurfaceFields()` -- gates form fields
- `filterSurfaceTabbedViews()` -- gates tab navigation
- `filterDetailSurfaceTabs()` -- gates detail tabs per-item

### EntityAdapter Boundary

Surfaces decouple domain data from view data through `EntityAdapter<TRaw, TView>`:

```
Raw domain entity (from API)
  │
  └─→ adapter.map(raw) ─→ View model (consumed by patterns)
```

The adapter also declares `fields: EntityFieldMeta[]` which provides stable
`fieldId` identifiers that permissions, column configs, and surface configs
all reference.

---

## 8. Personality System

### The Five Dimensions

| Dimension    | Controls                                          |
|-------------|---------------------------------------------------|
| `animation`  | Entrance type, stagger, hover lift/scale, spring  |
| `chart`      | Mount animation, line style, gradient fill, dots  |
| `typography` | Heading weight bias, letter spacing, label casing |
| `accent`     | Bar position/thickness, icon shape, badge shape   |
| `card`       | Elevation, hover behavior, border, padding        |

### Merge Chain

```
DEFAULT_PERSONALITY (neutral baseline)
  → vertical.personality (industry mood)
    → productProfile.personality (UX preset)
      → tenant.personality (brand override)
```

### CSS Cascade via `personality.css`

Personality CSS lives in the `rottay-personality` layer (layer 5 of 7),
higher than tenant overrides so runtime-resolved personality wins over
static tenant CSS.

The CSS rules target all three engines simultaneously:

```css
/* Example: card personality applies to Classic, Modern, and Rustic */
.ant-card,
.card:where(:not(.card-compact)),
[data-engine] .ds-card {
  box-shadow: var(--ds-card-shadow);
}
```

### SystemCssVariablesBridge

The bridge is a zero-visual React component rendered inside `DesignSystemProvider`
that synchronizes provider-owned JS personality tokens into CSS custom properties
on `document.documentElement`:

```
useTokens() resolves personality
  → resolvePersonalityCssVariables(tokens)
    → document.documentElement.style.setProperty('--ds-personality-*', value)
```

Variables are cleaned up on unmount for test isolation and tenant switching.

Without this bridge, provider-owned CSS keyframes, pseudo-elements, and
non-React styling paths would fall out of sync when personality tokens change
at runtime. In productive `compiled-artifact` mode, the server artifact is the
visual authority and the provider does not emit a competing personality layer.

---

## 9. CSS Architecture

### Layer Organization

The DS uses 7 CSS layers with explicit cascade priority:

```
@layer rottay-reset,        0 - Ant Design base styles
       rottay-tokens,       1 - Semantic foundation + default theme
       rottay-components,   2 - Component-level CSS variables
       rottay-engines,      3 - Engine themes (Ant/.btn/.ds-* mappings)
       rottay-tenants,      4 - Tenant overrides via [data-tenant="x"]
       rottay-personality,  5 - Runtime personality-driven overrides
       rottay-responsive;   6 - Media query overrides (web-first)

Animations are unlayered so @keyframes are always reachable.
```

### CSS Custom Property Naming Convention

All design system tokens use the `--ds-*` prefix:

```
--ds-color-primary-500       Color scale values
--ds-color-success           Semantic color shortcuts
--ds-glass-blur              Glass morphism tokens
--ds-gradient-primary        Gradient presets
--ds-transition-fast         Transition presets
--ds-overlay-medium          Overlay opacity presets
--ds-card-shadow             Personality-driven component tokens
--ds-personality-animation-* Personality CSS variables (bridge-injected)
```

### How Tenant Theming Works at CSS Level

```
1. ThemeProvider sets data-tenant="acme" on a root element

2. Tenant CSS uses attribute selectors:
   html[data-tenant='acme']:not([data-theme='dark']) {
     --ds-color-primary-500: #FF5500;
     --ds-color-primary-600: #CC4400;
     ...
   }

3. Components reference CSS variables:
   color: var(--ds-color-primary-500);

4. Tenant switches only require changing the data attribute
   and updating CSS variable values -- zero React re-renders
   for color changes.
```

First-party artifacts combine compiled BrandTheme variables with an explicitly
delimited, mechanically scoped extension. DB-managed tenants use the bounded
server compiler; they do not receive arbitrary selector authority.

---

## 10. Directory Structure

The canonical macro tree is ownership-based. Implementation code belongs to
one of five architecture roots. `entrypoints/` is a classified package-boundary
support root, not a sixth tier; `src/index.ts` is the only loose source-root
file.

```
packages/core/src/
├── foundation/
│   ├── behavior/           Headless behavior kernels and narrow React adapters
│   ├── contracts/          Public and internal TypeScript contracts
│   ├── i18n/               React-free catalogs, formatting and resolution
│   ├── kernel/             Supplier-neutral shared kernels
│   ├── presets/            Code-owned vertical and product-profile presets
│   └── tokens/             TS tokens and authored/generated CSS
│
├── infrastructure/
│   ├── compilers/          Brand, appearance and tenant artifact compilers
│   └── runtime/
│       ├── adapters/       Framework/presentation integration adapters
│       ├── bootstrap/      Root provider composition
│       ├── engines/        Provider, resolution and component factory
│       │   └── runtime/customization/component-registry/
│       │                    Pack-scoped custom registry and fallback
│       ├── features/       Feature flag runtime
│       ├── i18n/           React provider and consumer hooks
│       ├── motion/         Runtime motion policy/provider
│       ├── personality/    Personality resolution
│       ├── product-profiles/
│       ├── responsive/
│       ├── spatial/
│       ├── tenant/         Tenant resolution and storage
│       ├── theming/
│       └── verticals/
│
├── graphics/
│   ├── brand-marks/
│   ├── icons/
│   ├── motion/
│   └── pictograms/
│
├── ui/
│   ├── primitives/         Tier 1: engine-switched leaf components
│   ├── patterns/           Tier 2: reusable task-level compositions
│   ├── structures/         Tier 2.5: page chrome and structural families
│   └── surfaces/           Tier 3: page-level recipes
│
├── tooling/
│   ├── declarations/
│   ├── eslint/
│   ├── examples/
│   └── testing/
│
├── entrypoints/            Package-boundary support (folder/index only)
│   ├── charts/{access,renderers,spec}/
│   ├── graphics/{effects,marks,motion,pictograms,spatial}/
│   ├── icons/{bithire,corpus,foundation,identity,intelligence,operations}/
│   ├── commercial/
│   ├── eslint/
│   └── server/
│
└── index.ts                Root public facade; only loose src file
```

The physical engine implementations live below component owners as
`engines/{classic,modern,rustic}/`. The `custom` path lives in the infrastructure
registry shown above; it does not add `engines/custom/` copies across the UI.

> See `docs/TAXONOMY.generated.md` (run `pnpm docs:taxonomy`) for the
> authoritative, auto-generated inventory of every tier, group, and family.

---

## Key Design Decisions

1. **Physical engine as a code-split boundary** -- Classic, modern and rustic
   implementations are separate dynamic imports. `custom` resolves a registered
   pack component or delegates to its configured physical fallback.

2. **CSS variables over JS theming** -- Colors use CSS custom properties so
   tenant switches do not trigger React re-renders. Only structural/personality
   tokens live in JS.

3. **Personality as a runtime merge** -- The four-layer personality chain
   (default, vertical, profile, tenant) is resolved in `useTokens()` and
   bridged to CSS. This keeps personality runtime-dynamic without static
   CSS duplication per tenant.

4. **Resolver compatibility is separate from visual authority** -- The
   six-level resolver keeps local/preview/legacy config lookup resilient.
   Published customer visuals remain DB-owned, server-compiled and hydrated as
   one immutable artifact; the compatibility fallback chain never selects a
   different customer's styling.

5. **Pack-scoped custom registry** -- Custom component registrations are
   isolated per pack so different tenants can use different white-label
   implementations in the same runtime without cross-contamination; missing
   registrations delegate to a physical fallback engine.

6. **Surface three-section pattern** -- Separating presentation/behavior/visual
   keeps surface configs readable and allows partial overrides. The permission
   system layers on top declaratively.

7. **Web-first responsive** -- CSS responsive layer uses web-first breakpoints
   (not mobile-first), matching the enterprise SaaS use case.
