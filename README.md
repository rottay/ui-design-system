# @rottay/design-system

Multi-tenant, multi-engine design system for the Rottay ecosystem. Provides a unified component library used across Platform, BitHire, and Evnto with runtime engine switching and premium white-label branding.

## Architecture

```
packages/
  core/        @rottay/design-system    Publishable component library (npm)
  showroom/    @rottay/showroom         Commercial showcase (showroom.rottay.com)
```

### Engine Model

Components render through one of four engines selected at runtime via `createEngineComponent()`:

| Engine      | Backend            | Use Case             |
| ----------- | ------------------ | -------------------- |
| **classic** | Ant Design 5.x     | Enterprise admin UIs |
| **modern**  | Tailwind + DaisyUI | Consumer-facing apps |
| **rustic**  | Vanilla CSS        | Lightweight fallback |
| **custom**  | Pluggable          | White-label tenants  |

Each primitive has engine-specific implementations (`engines/{classic,modern,rustic}/index.tsx`).

### Component Taxonomy (4 Tiers)

```
src/components/
  primitives/     Leaf components with engine switch
    display/        19 components (Avatar, Badge, Card, Table, Typography...)
    inputs/         17 components (Button, Input, Select, DatePicker, Checkbox...)
    feedback/       7 components (Alert, Message, Modal, Notification...)
    layout/         7 components (Box, Flex, Grid, Stack, Divider...)
    navigation/     5 components (Breadcrumb, Menu, Pagination, Steps, Tabs)
    overlay/        4 components (Drawer, Dropdown, Popover, Tooltip)

  patterns/         Task-level compositions, engine-agnostic
    data/           DataTable, DataList, CommandPalette, VirtualList
    forms/          FormBuilder, FormWizard, FilterBuilder
    visualization/  19 chart types (Bar, Line, Area, Pie, Radar, Gantt, Sankey...)
    communication/  Chat, Notification feeds
    workflow/       Kanban, Timeline, StepFlow
    navigation/     CommandBar, TreeNav
    misc/           StatsGrid, CodeBlock

  structures/       Page chrome that wraps patterns
    headers/        CollectionHeader, StatsHeader, RecordHeader
    workspace/      TableToolbar, ColumnMenu, SearchCommandBar, ViewModeSwitcher
    record/         RecordFieldGrid, RecordPanel
    dashboard/      MetricCard, ChartCard
    feedback/       LoadingOverlay, EmptyState, ErrorState

  surfaces/         Declarative page-level recipes
    pages/          ListSurface, DashboardSurface, FormSurface, CollectionWorkspaceSurface
    layout/         PageShell, HeaderLayout, SidebarLayout
```

### Branding Model

```
DS base tokens --> vertical baseline --> BrandTheme --> CSS artifacts
```

- **BrandTheme** (~140 CSS variables): palette, typography, surfaces, motion, charts, chrome
- **First-party brands**: `tokens/ts/brand-themes/{platform,bithire,evnto}.ts`
- **Tenant customization**: `TenantAppearanceAdvanced` with chrome sections (controls, table, card, modal, tabs, sidebar, layout)
- Vertical identity is **static-first** (file-defined), tenant branding is **runtime, bounded** (DB-driven)

### Icon System

109 curated icons via `createIcon()` wrapping lucide-react.

```tsx
import { SearchIcon, PlusIcon, CheckIcon } from "@rottay/design-system/icons";
```

### Chart System

19 D3-backed, engine-agnostic chart types: Bar, Line, Area, Pie, Scatter, Radar, Gauge, Histogram, Funnel, Waterfall, Sankey, Gantt, Sparkline, CalendarHeatMap, HeatMap, TreeMap, NetworkGraph, BulletChart. All theme-aware with personality-driven animations.

## Package Exports

| Export                                  | Description                                                            |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `@rottay/design-system`                 | All components, hooks, utilities                                       |
| `@rottay/design-system/icons`           | 109 curated icons                                                      |
| `@rottay/design-system/server`          | Server-only utilities (branding validation)                            |
| `@rottay/design-system/eslint`          | ESLint rules (no-raw-html, no-hardcoded-colors, no-db-in-components)   |
| `@rottay/design-system/styles`          | Full bundle: component skins, states, keyframes, tokens, all tenants   |
| `@rottay/design-system/styles/platform` | Platform vertical CSS                                                  |
| `@rottay/design-system/styles/bithire`  | BitHire vertical CSS                                                   |
| `@rottay/design-system/styles/evnto`    | Evnto vertical CSS                                                     |
| `@rottay/design-system/styles/modern`   | Supplemental modern-engine CSS only; not a standalone component bundle |

## Usage

```tsx
import { Button, Card, Flex, Text } from "@rottay/design-system";
import { SearchIcon } from "@rottay/design-system/icons";
import "@rottay/design-system/styles";

export default function Example() {
  return (
    <Card>
      <Flex gap="4" align="center">
        <SearchIcon />
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
