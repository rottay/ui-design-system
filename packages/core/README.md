# @rottay/design-system

[![npm version](https://img.shields.io/github/package-json/v/rottay/design-system?filename=packages%2Fcore%2Fpackage.json&label=version)](https://github.com/rottay/design-system)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)](https://react.dev/)

Internal multi-tenant, multi-engine React component library powering all Rottay applications (Evnto, BitHire, Platform).

---

## Features

- **Primitives** -- engine-switched leaf components across 6 categories (display, inputs, feedback, layout, navigation, overlay)
- **Patterns** -- engine-agnostic task-level compositions (DataTable, FormBuilder, Charts, KanbanBoard, etc.)
- **Page Structure** -- page-structure families that sit between patterns and surfaces (detail/edit/form headers, table toolbars, record panels, metric cards, loading overlays, ...)
- **Surfaces** -- declarative page-level configs (ListSurface, DashboardSurface, FormSurface, etc.)
- **Engines** -- Classic (Ant Design), Modern (DaisyUI/Tailwind), Rustic (Vanilla HTML/CSS), and Custom (white-label pack-scoped)
- **Multi-tenant theming** -- CSS custom properties with 6-level tenant resolution
- **Personality system** -- per-vertical animation, typography, chart, and card tuning
- **i18n** -- 5 locales (en, es, pt, fr, ar) with RTL support
- **Code-split engines** -- only the active engine loads; others lazy-load on demand
- **Dark mode** -- automatic via `prefers-color-scheme` or explicit override

## Distribution

`@rottay/design-system` is distributed as a **private package** via [GitHub Packages](https://github.com/features/packages).
It is intended exclusively for internal use across Rottay products (Evnto, BitHire, Platform).

**Within the monorepo**, the package is available via the workspace protocol -- no extra configuration needed:

```json
"@rottay/design-system": "workspace:*"
```

**Outside the monorepo** (e.g., a new Rottay app in a separate repository), configure your `.npmrc` to authenticate with GitHub Packages:

```ini
@rottay:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` must have `read:packages` scope and belong to a user with access to the `rottay` organization.

See [Getting Started](./GETTING_STARTED.md) for full setup instructions.

---

## Quick Start

```bash
pnpm add @rottay/design-system react react-dom antd @ant-design/icons
```

```tsx
import { DesignSystemProvider, Button, Text, Flex } from '@rottay/design-system';

function App() {
  return (
    <DesignSystemProvider>
      <Flex gap="4" align="center">
        <Text as="h1">Hello</Text>
        <Button variant="primary" onClick={() => alert('Works')}>
          Click me
        </Button>
      </Flex>
    </DesignSystemProvider>
  );
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./GETTING_STARTED.md) | Installation, registry setup, first component, separate-repo usage |
| [Architecture](./ARCHITECTURE.md) | System design, engine flow, token resolution, CSS layers |
| [Page Structure](./docs/page-structure-tier.md) | What page-structure is, decision guide, family catalog |
| [Taxonomy Reference](./docs/TAXONOMY.generated.md) | Auto-generated inventory of every tier and family (run `pnpm docs:taxonomy` to refresh) |
| [Engine Splitting](./ENGINE_SPLITTING.md) | Code-splitting strategy and bundle entry points |
| [Performance Budget](./PERFORMANCE_BUDGET.md) | CI-enforced size limits and Web Vitals targets |

## Subpath Exports

| Import | Contents |
|--------|----------|
| `@rottay/design-system` | Components, providers, hooks |
| `@rottay/design-system/server` | Server-side utilities |
| `@rottay/design-system/icons` | Icon system |
| `@rottay/design-system/styles.css` | Full CSS bundle (all tenants, for dev/Storybook) |
| `@rottay/design-system/styles/platform` | CSS bundle for Platform app (rottay tenant) |
| `@rottay/design-system/styles/bithire` | CSS bundle for BitHire app |
| `@rottay/design-system/styles/evnto` | CSS bundle for Evnto app |

## Scripts

```bash
pnpm dev              # Watch mode
pnpm build            # TypeScript check + Vite build
pnpm storybook        # Storybook on port 6006
pnpm test             # Vitest
pnpm test:coverage    # Coverage report
pnpm analyze          # Build + bundle size check against budget
```

## License

Proprietary -- `@rottay/design-system` is private, closed-source software owned by Rottay. Distribution is restricted to the `rottay` GitHub organization via GitHub Packages (`"access": "restricted"`). It is not licensed for use outside Rottay products.
