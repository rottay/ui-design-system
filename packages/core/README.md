# @rottay/design-system

[![npm version](https://img.shields.io/github/package-json/v/rottay/ui-design-system?filename=packages%2Fcore%2Fpackage.json&label=version)](https://github.com/rottay/ui-design-system)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)](https://react.dev/)

Multi-tenant, multi-engine React component library with token-driven skins and white-label runtime theming.

---

## Before you build

Read [Architecture](../../docs/architecture/index.md) for the system's shape and
engine model, and [Public API](../../docs/api.md) for what you may import and
its stability policy.

---

## Features

- **Primitives** -- engine-switched leaf components across 6 categories (display, inputs, feedback, layout, navigation, overlay)
- **Patterns** -- reusable task-level compositions, engine-backed only when rendering genuinely differs (DataTable, FormBuilder, Charts, KanbanBoard, etc.)
- **Structures** -- structures families that sit between patterns and surfaces (detail/edit/form headers, table toolbars, record panels, metric cards, loading overlays, ...)
- **Surfaces** -- declarative page-level configs (ListSurface, DashboardSurface, FormSurface, etc.)
- **Engines** -- three physical engines: Classic (Ant Design), Modern (Rottay token skins), Rustic (Vanilla HTML/CSS); Custom is a pack-scoped registry identity
- **Multi-tenant theming** -- static-first code verticals plus DB-owned, server-compiled customer artifacts
- **Personality system** -- per-vertical animation, typography, chart, and card tuning
- **i18n** -- 5 locales (en, es, pt, fr, ar) with RTL support
- **Code-split engines** -- only the active engine loads; others lazy-load on demand
- **Dark mode** -- automatic via `prefers-color-scheme` or explicit override

## Distribution

The repository is public and MIT-licensed (root [`LICENSE`](../../LICENSE));
the package is distributed as a private package via GitHub Packages under the
`@rottay` scope with restricted access. Public npm publication is not
currently offered.

**Within the monorepo**, the package is available via the workspace protocol -- no extra configuration needed:

```json
"@rottay/design-system": "workspace:*"
```

**Rottay org members**, installing outside the monorepo, configure `.npmrc` to authenticate with GitHub Packages:

```ini
@rottay:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` must have `read:packages` scope and belong to a user with access to the `rottay` organization.

Anyone else can build the package from source — see
[Getting Started](../../docs/getting-started.md) for the build-from-source
path and full peer-dependency setup.

---

## Quick Start

```bash
pnpm add @rottay/design-system react react-dom antd @ant-design/icons @phosphor-icons/react d3 motion
```

```tsx
import "@rottay/design-system/styles.css";
import {
  DesignSystemProvider,
  Button,
  Text,
  Flex,
} from "@rottay/design-system";

function App() {
  return (
    <DesignSystemProvider>
      <Flex gap="4" align="center">
        <Text as="h1">Hello</Text>
        <Button variant="primary" onClick={() => alert("Works")}>
          Click me
        </Button>
      </Flex>
    </DesignSystemProvider>
  );
}
```

Import exactly one public stylesheet entrypoint before rendering components. Applications may use
the full `styles.css` bundle shown above or the matching `styles/<vertical>` export. Provider-owned
vertical/preview modes may emit runtime variables; a published customer tenant instead mounts the
exact server-compiled artifact and hydrates with `visualAuthority="compiled-artifact"`.
Component skins, interaction states and keyframes live in the stylesheet.

## Documentation

| Document                                           | Description                                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Getting Started](../../docs/getting-started.md)            | Installation, registry setup, first component, separate-repo usage                      |
| [Architecture](../../docs/architecture/index.md)         | Canonical ownership, dependency and package architecture                                |
| [Package docs](./docs/index.md)                    | Active operating guides, generated references and historical snapshots                  |
| [Structures](./docs/architecture/ui-tiers/structures/index.md) | What structures is, decision guide, family catalog                         |
| [Taxonomy Reference](./docs/generated/component-taxonomy/index.md) | Auto-generated inventory (run `pnpm docs:taxonomy` to refresh)        |
| [Engine Splitting](./docs/architecture/engine-splitting/index.md)          | Code-splitting strategy and bundle entry points                                         |
| [Performance Budget](./docs/quality/performance-budget/index.md)      | CI-enforced size limits and Web Vitals targets                                          |

## Subpath Exports

| Import                                  | Contents                                         |
| --------------------------------------- | ------------------------------------------------ |
| `@rottay/design-system`                 | Components, providers, hooks                     |
| `@rottay/design-system/server`          | Server-side utilities                            |
| `@rottay/design-system/icons`           | Governed 282-name semantic facade + compatibility |
| `@rottay/design-system/icons/{foundation,bithire,identity,intelligence,operations}` | Generated packs (282 names total) |
| `@rottay/design-system/marks`           | Governed brand and cloud-provider marks          |
| `@rottay/design-system/charts`          | Focused chart components                         |
| `@rottay/design-system/charts/spec`     | Server-safe visualization contracts              |
| `@rottay/design-system/charts/access`   | Accessible chart data companion                  |
| `@rottay/design-system/charts/renderers`| Isolated chart renderer family                    |
| `@rottay/design-system/motion`          | Semantic motion policy and recipes               |
| `@rottay/design-system/effects`         | Supplier-neutral effect governance               |
| `@rottay/design-system/spatial`         | Optional React spatial lifecycle host            |
| `@rottay/design-system/spatial/spec`    | Server-safe spatial policy and module contract   |
| `@rottay/design-system/styles.css`      | Full CSS bundle (code-owned verticals/dev)       |
| `@rottay/design-system/styles/rottay`   | CSS bundle for the Rottay vertical               |
| `@rottay/design-system/styles/bithire`  | CSS bundle for BitHire app                       |
| `@rottay/design-system/styles/evnto`    | CSS bundle for Evnto app                         |

Spatial scenes stay app-owned and lazy. The host owns SSR fallback, device and
motion admission, WebGL2 capability, one-context leasing, suspension, quality,
Canvas failure and telemetry; it never puts Three/R3F in the root package graph.

```tsx
import { SpatialExperience } from "@rottay/design-system/spatial";

<SpatialExperience
  id="service-map"
  label="Service relationship map"
  purpose="explanation"
  description="How requests move through the service layers."
  poster={<StaticServiceMap />}
  reduced={<StaticServiceMap />}
  loadScene={() => import("./service-map-scene").then(({ ServiceMapScene }) => ({
    version: 1,
    backend: "webgl2",
    Scene: ServiceMapScene,
  }))}
/>
```

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

The repository is public and MIT-licensed — see the root [`LICENSE`](../../LICENSE).
The package itself is distributed as a private package via GitHub Packages
under the `@rottay` scope with restricted access (`"access": "restricted"`);
public npm publication is not currently offered.
