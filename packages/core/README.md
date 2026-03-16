# @rottay/design-system

[![npm version](https://img.shields.io/github/package-json/v/rottay/design-system?filename=packages%2Fcore%2Fpackage.json&label=version)](https://github.com/rottay/design-system)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Multi-tenant, multi-engine React component library powering all Rottay applications.

---

## Features

- **89 primitives** across 6 categories (display, inputs, feedback, layout, navigation, overlay)
- **33 patterns** -- engine-agnostic compositions (DataTable, FormBuilder, Charts, KanbanBoard, etc.)
- **35 surfaces** -- declarative page-level configs (ListSurface, DashboardSurface, FormSurface, etc.)
- **3 rendering engines** -- Classic (Ant Design), Modern (DaisyUI/Tailwind), Rustic (Vanilla HTML/CSS)
- **Multi-tenant theming** -- CSS custom properties with 6-level tenant resolution
- **Personality system** -- per-vertical animation, typography, chart, and card tuning
- **i18n** -- 5 locales (en, es, pt, fr, ar) with RTL support
- **Code-split engines** -- only the active engine loads; others lazy-load on demand
- **Dark mode** -- automatic via `prefers-color-scheme` or explicit override

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
| [Getting Started](./GETTING_STARTED.md) | Installation, setup, first component, standalone usage |
| [Architecture](./ARCHITECTURE.md) | System design, engine flow, token resolution, CSS layers |
| [Engine Splitting](./ENGINE_SPLITTING.md) | Code-splitting strategy and bundle entry points |
| [Performance Budget](./PERFORMANCE_BUDGET.md) | CI-enforced size limits and Web Vitals targets |

## Subpath Exports

| Import | Contents |
|--------|----------|
| `@rottay/design-system` | Components, providers, hooks |
| `@rottay/design-system/tokens` | Design token utilities |
| `@rottay/design-system/icons` | Icon system |
| `@rottay/design-system/i18n` | Internationalization utilities |
| `@rottay/design-system/styles.css` | CSS tokens and theme variables |

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

MIT
