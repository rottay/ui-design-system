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
Layer 2.5: Page Structure        Page chrome: headers, toolbars, record panels, overlays
Layer 2: Patterns        Engine-agnostic compositions (tables, forms, charts, ...)
Layer 1: Primitives      Engine-switched leaf components across 6 categories
```

> Counts of individual primitives, patterns, page-structure pieces, and surfaces
> are intentionally omitted here. Past iterations of this doc went stale
> almost immediately. The authoritative source is the on-disk tree under
> `packages/core/src/components/`. A generated taxonomy reference is on the
> roadmap (audit 2026-04-08, feature backlog).

Each layer only depends on the layer below it:

- **Primitives** are engine-switched leaf components (Button, Input, Card,
  etc.). Each primitive has four engine implementations (Classic, Modern,
  Rustic, Custom).
- **Patterns** compose primitives into reusable, task-level UI compositions
  (DataTable, FormBuilder, StatsGrid, KanbanBoard, ...). They are
  engine-agnostic and stay generic — they know nothing about tenants,
  candidates, roles, etc.
- **Page Structure** is a middle tier introduced in the 2026-04-08 audit cleanup
  (Checkpoint C). It hosts page-structure families that are too specific to
  live in `patterns/` but too reusable to live in `surfaces/`: detail/edit/
  form headers, table toolbars, record field grids, loading overlays,
  dashboard metric cards, and similar widgets. Page-structure families compose
  patterns and primitives and are normally consumed by surfaces or by
  app-level screens directly.
- **Surfaces** are declarative config objects that describe an entire page
  (ListSurface, DashboardSurface, FormSurface, etc.). Surfaces wire patterns
  and page-structure widgets to data and permissions without owning rendering logic.
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
>   (header, toolbar, record panel, loading shell, metric card) → **page-structure**
> - page-level config object a consumer passes to render a whole screen
>   → **surface**

---

## 2. Engine System

### The Four Engines

| Engine   | Backing Library   | Character                      |
|----------|-------------------|--------------------------------|
| Classic  | Ant Design        | Enterprise, structured, formal |
| Modern   | DaisyUI/Tailwind  | Consumer, playful, rounded     |
| Rustic   | Vanilla HTML/CSS  | Minimal, lightweight, raw      |
| Custom   | Pack-scoped       | White-label, tenant-specific   |

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
3. Resolves the correct lazy-loaded implementation
4. Wraps in `Suspense` + `EngineErrorBoundary`

### Engine Selection Flow

```
DesignSystemProvider
  │
  ├─ forceEngine prop?  ──── YES ─→ use that engine
  │
  ├─ tenantConfig.engine? ── YES ─→ use that engine
  │
  ├─ vertical.engine? ────── YES ─→ use that engine
  │
  └─ fallback ─────────────────────→ 'classic'
          │
          v
    EngineProvider (sets context)
          │
          v
    createEngineComponent reads context
          │
          v
    React.lazy loads the correct implementation
```

### Custom Engine: Pack-Scoped Registry

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

Design tokens flow through a four-layer pipeline. Each layer can provide
partial overrides that spread on top of the layer below.

### Structural Tokens (borderRadius, shadows, surface, motion)

```
┌─────────────────────┐
│  Engine Defaults     │  Classic: 4px radii, layered shadows, 0.9375 density
│  (lowest priority)   │  Modern:  12px radii, bold shadows, 1.0 density
│                      │  Rustic:  2px radii, whisper shadows, 1.0 density
└──────────┬──────────┘
           │ spread
┌──────────v──────────┐
│  Product Profile     │  e.g., events.organizer overrides borderRadius
│  Token Overrides     │
└──────────┬──────────┘
           │ spread
┌──────────v──────────┐
│  Tenant Overrides    │  Customer-specific structural tweaks
│  (highest priority)  │
└─────────────────────┘
```

### Personality Tokens (animation, chart, typography, accent, card)

Personality uses a deeper merge chain because verticals also participate:

```
┌─────────────────────┐
│  DEFAULT_PERSONALITY │  Neutral baseline (low intensity, no spring, no lift)
│  (lowest priority)   │
└──────────┬──────────┘
           │ spread per sub-object
┌──────────v──────────┐
│  Vertical Preset     │  e.g., evnto: bounce entrance, spring physics
│  .personality        │
└──────────┬──────────┘
           │ spread per sub-object
┌──────────v──────────┐
│  Product Profile     │  UX preset within the vertical space
│  .personality        │
└──────────┬──────────┘
           │ spread per sub-object
┌──────────v──────────┐
│  Tenant Config       │  Runtime brand overrides
│  .personality        │  (highest priority)
└─────────────────────┘
```

Each personality sub-object (animation, chart, typography, accent, card) is
spread independently. A tenant that only customizes `animation` does not
accidentally wipe out the vertical's `chart` personality.

### Color Tokens

Colors use CSS custom properties (`var(--ds-color-primary-500)`) rather than
resolved values. Actual color values live in tenant CSS files and can be
swapped at runtime without re-rendering the React tree.

---

## 4. Tenant System

### Resolution Chain

Tenant resolution follows a six-level fallback chain. The DS must render
predictably in every environment (local dev, preview deploys, production, CI).

```
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
  └─ 6. Default config (rottay)     Absolute safety net, never throws
```

### TenantConfig Structure

A TenantConfig carries:

- `slug` -- unique identifier
- `name` -- display name
- `engine` -- preferred rendering engine
- `theme` -- theme variant (base, dark, etc.)
- `plan` -- subscription tier
- `features` -- enabled feature flags
- `branding` -- colors, logo, company name
- `tokenOverrides` -- structural token overrides (borderRadius, shadows, etc.)
- `personality` -- personality token overrides
- `componentPack` -- custom engine pack identifier
- `vertical` -- vertical preset key
- `locale` / `fallbackLocale` -- i18n defaults
- `customTranslations` -- per-tenant translation overrides

### How Branding Flows Through

```
TenantConfig.branding
  │
  ├─→ ThemeProvider          Sets data-tenant attribute on root element
  │                          Loads tenant CSS (or skips if app bundles it)
  │
  ├─→ useTokens()            colors.primary reads branding.primaryColor
  │                          colors.secondary reads branding.secondaryColor
  │
  └─→ CSS cascade            [data-tenant="acme"] selector overrides
                             --ds-color-* variables
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
| `evnto`    | modern  | spacious    | Playful, bounce entrance, spring   |
| `bithire`  | classic | compact     | Formal, fade entrance, data-dense  |
| `platform` | classic | comfortable | Neutral, balanced, operational     |

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

Patterns (engine-agnostic compositions)
  │
  ├─ data-table         DataTable with sort, filter, bulk actions
  ├─ form-builder       Declarative form from FieldDef[]
  ├─ stats-grid         Metric cards with trends and sparklines
  ├─ kanban-board       Drag-and-drop columns
  ├─ calendar-view      Event calendar
  ├─ detail-panel       Entity detail with tabs
  ├─ activity-log       Timeline of events
  ├─ charts             Chart wrappers with personality tokens
  ├─ file-manager       File browser with upload
  ├─ command-palette    Search/command overlay
  ├─ filter-builder     Advanced filter composition
  ├─ notification-center Notification list and preferences
  ├─ step-wizard        Multi-step flows
  ├─ page-shell         Page chrome (title, breadcrumbs, back)
  └─ ...                (see packages/core/src/components/patterns/ for the
                         full directory listing)

Surfaces (page-level config objects)
  │
  ├─ list               ListSurface (table or card grid)
  ├─ dashboard          DashboardSurface (stats + charts + activity)
  ├─ form               FormSurface (create/edit flows)
  ├─ detail             DetailSurface (entity view with tabs)
  ├─ chat               ChatSurface (messaging interface)
  ├─ scheduler          SchedulerSurface (calendar views)
  ├─ kanban             KanbanSurface (board view)
  ├─ settings           SettingsSurface (grouped preferences)
  ├─ billing            BillingSurface (plans, invoices)
  ├─ onboarding         OnboardingSurface (wizard flows)
  └─ ...                (see packages/core/src/components/surfaces/ for the
                         full directory listing)
```

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
that synchronizes JS-resolved personality tokens into CSS custom properties on
`document.documentElement`:

```
useTokens() resolves personality
  → resolvePersonalityCssVariables(tokens)
    → document.documentElement.style.setProperty('--ds-personality-*', value)
```

Variables are cleaned up on unmount for test isolation and tenant switching.

Without this bridge, CSS keyframes, pseudo-elements, and non-React styling
paths would fall out of sync when personality tokens change at runtime.

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

Tenant CSS files only override values that differ from the default theme.
This keeps tenant stylesheets small and maintainable.

---

## 10. Directory Structure

```
packages/core/src/
│
├── bootstrap/              Root provider composition
│   ├── DesignSystemProvider.tsx   Composes all providers
│   └── SystemCssVariablesBridge.tsx  JS tokens → CSS vars sync
│
├── engines/                Multi-engine infrastructure
│   ├── factory.tsx         createEngineComponent (lazy + Suspense)
│   ├── custom.ts           Pack-scoped custom component registry
│   ├── EngineProvider.tsx   Engine context provider
│   └── boundary.tsx        EngineErrorBoundary
│
├── tenancy/                Multi-tenant infrastructure
│   ├── storage/            Resolution chain (cache/registry/static/remote)
│   │   ├── index.ts        getTenantConfig (6-level fallback)
│   │   ├── static.ts       Static file loader
│   │   └── remote.ts       Remote API fetcher
│   ├── registry/           Known tenant configs (bundled)
│   ├── defaults.ts         Default tenant fallback
│   └── TenantProvider.tsx  Tenant context provider
│
├── verticals/              Industry vertical presets
│   ├── types.ts            VerticalPreset, VerticalKey
│   └── registry.ts         Built-in presets (evnto, bithire, platform)
│
├── product-profiles/       UX presets within verticals
│   ├── registry.ts         Profile definitions
│   └── ProductProfileProvider.tsx  Profile context
│
├── personality/            Personality token system
│   ├── defaults.ts         DEFAULT_PERSONALITY baseline
│   └── primitives.ts       resolvePersonalityCssVariables
│
├── hooks/                  Design system hooks
│   └── tokens/             Token resolution pipeline
│       ├── index.ts        useTokens (4-layer merge)
│       ├── engine-tokens.ts  Per-engine token definitions
│       ├── personality-defaults.ts  Re-export of defaults
│       └── sub-hooks.ts    Granular slice hooks
│
├── theming/                Theme management
├── features/               Feature flag provider
├── i18n/                   Internationalization
├── contracts/              TypeScript interfaces and type definitions
├── errors/                 Error types and boundaries
├── icons/                  Icon system
├── motion/                 Animation utilities
├── testing/                Test fixtures and helpers
├── utils/                  Shared utilities
│
├── tokens/                 CSS token system
│   └── css/
│       ├── index.css       Main entry (7 @layer declarations)
│       ├── base/           Foundation tokens (spacing, borders, etc.)
│       ├── themes/         Default theme values
│       ├── components/     Component-scoped CSS variables
│       ├── engines/        Engine-specific theme mappings
│       ├── tenants/        Per-tenant CSS overrides
│       │   ├── rottay/     Rottay brand
│       │   ├── bithire/    BitHire brand
│       │   └── evnto/      Evnto brand
│       ├── animations/     Keyframes and transitions
│       └── responsive/     Web-first media query overrides
│
└── components/
    ├── primitives/         Tier 1: Engine-switched leaf components
    │   ├── display/        Avatar, Badge, Card, Table, Tag, ...
    │   ├── inputs/         Button, Input, Select, DatePicker, Form, ...
    │   ├── feedback/       Alert, Modal, Spinner, Toast, Notification, ...
    │   ├── layout/         Box, Flex, Grid, Stack, Container, ...
    │   ├── navigation/     Tabs, Menu, Breadcrumb, Pagination, Steps, ...
    │   └── overlay/        Dropdown, Popover, Sheet, ContextMenu, ...
    │
    ├── patterns/           Tier 2: Compositions (engine-agnostic)
    │   ├── data-table/     Table with sort, filter, bulk actions
    │   ├── form-builder/   Declarative form from FieldDef[]
    │   ├── stats-grid/     Metric cards with trends
    │   ├── kanban-board/   Drag-and-drop board
    │   ├── charts/         Chart wrappers
    │   ├── detail-panel/   Entity detail view
    │   ├── calendar-view/  Event calendar
    │   └── ...             (see the directory for the full listing)
    │
    └── surfaces/           Tier 3: Page-level config objects
        ├── list/           ListSurface
        ├── dashboard/      DashboardSurface
        ├── form/           FormSurface
        ├── detail/         DetailSurface
        ├── chat/           ChatSurface
        └── ...             (see the directory for the full listing)
```

> Per-directory and per-category counts are intentionally omitted. The
> directory listings under `packages/core/src/components/` are the
> authoritative source. A generated taxonomy reference is on the audit
> roadmap.

---

## Key Design Decisions

1. **Engine as a code-split boundary** -- Each engine implementation is a
   separate dynamic import. Apps only load the engine they use.

2. **CSS variables over JS theming** -- Colors use CSS custom properties so
   tenant switches do not trigger React re-renders. Only structural/personality
   tokens live in JS.

3. **Personality as a runtime merge** -- The four-layer personality chain
   (default, vertical, profile, tenant) is resolved in `useTokens()` and
   bridged to CSS. This keeps personality runtime-dynamic without static
   CSS duplication per tenant.

4. **Six-level tenant resolution** -- The DS renders predictably in every
   environment. Each level adds resilience: bundled registry for CI, static
   files for previews, remote API for production, memory/localStorage caches
   for performance.

5. **Pack-scoped custom engine** -- Custom component registrations are isolated
   per pack so different tenants can use different white-label implementations
   in the same runtime without cross-contamination.

6. **Surface three-section pattern** -- Separating presentation/behavior/visual
   keeps surface configs readable and allows partial overrides. The permission
   system layers on top declaratively.

7. **Web-first responsive** -- CSS responsive layer uses web-first breakpoints
   (not mobile-first), matching the enterprise SaaS use case.
