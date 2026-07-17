# @rottay/design-system

Multi-tenant, multi-engine design system for the Rottay ecosystem. Provides a unified component library used across Platform, BitHire, and Evnto with runtime engine switching and premium white-label branding.

## Architecture

```
packages/
  core/        @rottay/design-system    Publishable component library (npm)
  showroom/    @rottay/showroom         Commercial showcase (showroom.rottay.com)
```

### Engine Model

Components ship three physical engines selected at runtime via `createEngineComponent()`. A
fourth `custom` identity is resolved through the runtime component-pack registry; it is not a
fourth implementation copied into every primitive:

| Engine      | Backend            | Use Case             |
| ----------- | ------------------ | -------------------- |
| **classic** | Ant Design 5.x     | Enterprise admin UIs |
| **modern**  | Rottay token skins | Responsive premium UI |
| **rustic**  | Vanilla CSS        | Lightweight fallback |
| **custom**  | Pluggable          | White-label tenants  |

Each engine-backed primitive has physical implementations under
`engines/{classic,modern,rustic}/index.tsx`. `custom` resolves a registered
component pack and otherwise delegates to its configured physical fallback.

### Source Ownership

`packages/core/src` is an ownership tree:

```text
src/
  foundation/       Contracts, kernels, presets, i18n and tokens
  infrastructure/   Compilers and browser/React runtime orchestration
  graphics/         Icons, marks, pictograms and motion
  ui/               Primitives -> patterns -> structures -> surfaces
  tooling/          ESLint, declarations, examples and test support
  entrypoints/       Classified package-subpath boundaries
  index.ts           The only loose source-root file; package-root facade
```

`entrypoints/` supports package boundaries; it is not a sixth architecture
tier. Authored production units use `folder/index.ts(x)`, and related units
gain an explicit family level instead of becoming loose peer files.

### Component Taxonomy (4 Tiers)

```
src/ui/
  primitives/     Leaf components with engine switch
    display/        Avatar, Badge, Card, Table, Typography...
    inputs/         Button, Input, Select, DatePicker, Checkbox...
    feedback/       Alert, Message, Modal, Notification...
    layout/         Box, Flex, Grid, Stack, Divider...
    navigation/     Breadcrumb, Menu, Pagination, Steps, Tabs...
    overlay/        Drawer, Dropdown, Popover, Tooltip...

  patterns/         Reusable task-level compositions; engine-backed where needed
    data/           DataTable, list tooling, grid/gallery views
    forms/          FormBuilder, FormWizard, FilterBuilder
    visualization/  Charts, calendar, kanban, map, timeline, tree
    communication/  Chat, Notification feeds
    workflow/       Approval workflows, moderation, operational ledger
    navigation/     Command palette, shortcuts, locale/workspace switchers
    customization/  Brand studio, tenant preview, token inspection
    shell/          Generic page/workbench shell patterns
    foundation/     Pattern contracts and recipes
    runtime/        Shared filtering, forms, kanban and pulse behavior

  structures/       Page chrome that wraps patterns
    headers/        Collection, dashboard, detail, edit, form and mobile headers
    workspace/      Toolbars, filters, command palette, view controls
    record/         Record content, edit fields and form sections
    dashboard/      Insights, stats header and data terminal card
    feedback/       LoadingOverlay
    shell/          Reusable application-shell structures

  surfaces/         Declarative page-level recipes
    foundation/     Contracts and shared support
    runtime/        Builders, state and adaptive behavior
    composition/    Layout shells
    presentation/   Complete page recipes
```

The generated, on-disk inventory is
[`packages/core/docs/TAXONOMY.generated.md`](packages/core/docs/TAXONOMY.generated.md).

### Branding Model

```
DS base tokens --> vertical baseline --> BrandTheme --> CSS artifacts
```

- **BrandTheme** (~140 CSS variables): palette, typography, surfaces, motion, charts, chrome
- **First-party brands**: `foundation/tokens/ts/presentation/brand-themes/{platform,bithire,evnto}/index.ts`
- **Tenant customization**: bounded `TenantThemeDocument` publication; the
  compiler normalizes allowlisted chrome sections (controls, table, card,
  modal, tabs, sidebar, layout)
- Vertical identity is **static-first** (file-defined). Published customer
  tenant branding is **bounded and DB-owned**, then server-compiled into the
  exact SSR/hydration artifact.

Runtime visual ownership is explicit and mutually exclusive. The productive
customer path is `compiled-artifact`; `provider` remains useful for bundled
verticals, previews and compatibility:

- `visualAuthority="provider"` (default) preserves bundled/runtime behavior: the provider may load tenant CSS and emit branding, token, appearance, and generated chrome variables.
- `visualAuthority="compiled-artifact"` is for applications that already mounted the canonical compiled artifact during SSR. Tenant config still powers tenant, locale, theme, motion, feature, and component context, while the provider emits no competing tenant CSS variables, personality bridge, or chrome stylesheet.

```tsx
<style id="tenant-theme-artifact">{/* exact server-compiled CSS */}</style>
<DesignSystemProvider
  tenantConfig={canonicalTenantConfig}
  visualAuthority="compiled-artifact"
>
  <App />
</DesignSystemProvider>
```

Do not select `compiled-artifact` without mounting the artifact first: the mode intentionally has no provider-owned visual fallback.

### Icon System

The default supplier is Phosphor behind a supplier-independent boundary;
Lucide is compatibility-only, not the default. Two current counts describe two
different contracts:

- the stable `Icon` facade accepts 50 governed compatibility roles;
- generated semantic packs contain 263 roles across foundation, BitHire,
  identity, intelligence and operations.

Product code must not import a functional icon vendor directly.

```tsx
import { Icon } from "@rottay/design-system/icons";

<Icon name="action.search" label="Search" />;
<Icon name="action.add" label="Add" />;
<Icon name="status.success" label="Success" />;
```

### Chart System

18 D3-backed chart families live under
`ui/patterns/visualization/charts/families/`: Bar, Line, Area, Pie, Scatter,
Radar, Gauge, Histogram, Funnel, Waterfall, Sankey, Gantt, Sparkline,
CalendarHeatMap, HeatMap, TreeMap, NetworkGraph and BulletChart. They are
engine-agnostic, theme-aware and personality-driven.

## Package Exports

| Export                                  | Description                                                            |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `@rottay/design-system`                 | All components, hooks, utilities                                       |
| `@rottay/design-system/icons`           | Canonical 263-role `Icon` facade plus compatibility/catalog exports    |
| `@rottay/design-system/icons/{foundation,bithire,identity,intelligence,operations}` | Generated packs; 263 governed roles in total |
| `@rottay/design-system/marks`           | Governed brand and cloud-provider marks                                |
| `@rottay/design-system/server`          | Server-only utilities (branding validation)                            |
| `@rottay/design-system/eslint`          | ESLint rules (no-raw-html, no-hardcoded-colors, no-db-in-components)   |
| `@rottay/design-system/styles`          | Full bundle: skins, states, keyframes, tokens, code-owned verticals    |
| `@rottay/design-system/styles/platform` | Platform vertical CSS                                                  |
| `@rottay/design-system/styles/bithire`  | BitHire vertical CSS                                                   |
| `@rottay/design-system/styles/evnto`    | Evnto vertical CSS                                                     |
| `@rottay/design-system/styles/modern`   | Supplemental modern-engine CSS only; not a standalone component bundle |

## Usage

```tsx
import { Button, Card, Flex, Text } from "@rottay/design-system";
import { Icon } from "@rottay/design-system/icons";
import "@rottay/design-system/styles";

export default function Example() {
  return (
    <Card>
      <Flex gap="4" align="center">
        <Icon name="action.search" decorative />
        <Text>Search results</Text>
        <Button type="primary">Action</Button>
      </Flex>
    </Card>
  );
}
```

Import exactly one full or vertical stylesheet at the application entry. Production applications
should prefer their `styles/<vertical>` export. The `styles/modern` export is supplemental and does
not contain the base component skins or Toast keyframes.

## Development

```bash
# Install
pnpm install

# Core library dev (watch mode)
pnpm --filter @rottay/design-system dev

# Showroom dev
pnpm --filter @rottay/showroom dev           # http://localhost:7001

# Build
pnpm --filter @rottay/design-system build

# Tests
pnpm --filter @rottay/design-system test
pnpm --filter @rottay/design-system test:coverage

# Storybook
pnpm --filter @rottay/design-system storybook  # http://localhost:6006

# Typecheck
pnpm --filter @rottay/design-system typecheck
pnpm --filter @rottay/showroom typecheck

# Lint
pnpm --filter @rottay/design-system lint:folders
pnpm --filter @rottay/design-system lint:integration
```

## Tech Stack

- **Build**: Vite + vite-plugin-dts + PostCSS
- **Test**: Vitest + Testing Library + happy-dom
- **Storybook**: v9 with React + Vite
- **Styles**: CSS variables + Tailwind 4 (modern engine) + PostCSS
- **Charts**: D3.js v7
- **Animation**: Motion for React v12 (`motion/react`)
- **Types**: TypeScript 5.9

## Peer Dependencies

Apps consuming DS symbols must declare the runtime suppliers those symbols
reach. For example, an app using Ant-backed controls and motion primitives
declares:

```json
{
  "antd": "^5.21.0",
  "@ant-design/icons": "^5.5.0",
  "motion": "12.42.2"
}
```

The packaged `rottay-ds-supplier-honesty` command reports the exact suppliers
required by each app. Motion is governed as `motion@12.42.2`; its internal
`framer-motion` package is transitively owned and must not be declared directly.
