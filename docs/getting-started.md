# Getting started

Install, wrap, render, and switch engines. This document is code, not concepts —
for the system's shape, see [architecture.md](architecture/index.md); for theming, see
[customization.md](customization.md).

The repository is public open source (MIT). The npm package publication remains
private and controlled via GitHub Packages under the `@rottay` scope.

## 1. Requirements

Node.js `>=20`. Declared peer dependencies (`packages/core/package.json`):

| Package | Version | Optional | Reached by |
|---|---|---|---|
| `react` | `^18.0.0 \|\| ^19.0.0` | no | React API |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | no | React DOM/portals |
| `antd` | `^5.21.0` | no | Classic engine |
| `@ant-design/icons` | `^5.5.0` | no | Classic engine icons |
| `@phosphor-icons/react` | `>=2.1.10 <3.0.0` | no | Default semantic icons |
| `d3` | `^7.9.0` | no | Chart families |
| `motion` | `12.42.2` | no | Motion primitives/effects |
| `@thesvg/react` | `3.2.7` | yes | Brand/cloud marks |
| `typescript` | `^5.7.0` | yes | ESLint/plugin tooling |

Peer requirements are declared at the package level but consumed by feature.
An app that renders no chart does not need `d3` at runtime even though it is
a declared peer. Run the packaged honesty gate in the consuming app for the
exact set your imports actually reach:

```bash
pnpm exec rottay-ds-supplier-honesty
```

## 2. Install

### Build from source

Anyone can clone and build the public repository:

```bash
git clone https://github.com/rottay/ui-design-system.git
cd ui-design-system
pnpm install
pnpm --filter @rottay/design-system build
```

This builds `packages/core` (`dist/**`, `dist/styles.css`, and the vertical CSS
bundles). Consume the built package from a sibling project with a `workspace:*`
or local `file:` reference, or study the source directly — package publication
is not public (see below).

### Rottay org members (published package)

The published package is distributed privately via GitHub Packages under the
`@rottay` scope, restricted to the `rottay` GitHub organization. Configure
`.npmrc` in your project root:

```ini
@rottay:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs `read:packages` scope and must belong to a user or bot
with access to the `rottay` organization. In CI, use the built-in
`GITHUB_TOKEN` secret or a fine-grained PAT with `packages:read`.

Then install the package and its non-optional peers:

```bash
pnpm add @rottay/design-system react react-dom antd @ant-design/icons @phosphor-icons/react d3 motion
```

Within the Rottay monorepo, the package resolves automatically via the
workspace protocol (`"@rottay/design-system": "workspace:*"`) — no registry
configuration needed.

## 3. Import the stylesheet

Component skins, interaction states, keyframes and CSS custom properties ship
through the stylesheet. Import exactly one entry point in your application:

```tsx
// app/layout.tsx or index.tsx
import "@rottay/design-system/styles.css";
```

Use the matching `@rottay/design-system/styles/<vertical>` export instead in a
vertical application when appropriate.

## 4. Wrap your application

```tsx
import { DesignSystemProvider } from "@rottay/design-system";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <DesignSystemProvider>{children}</DesignSystemProvider>;
}
```

With no props, the provider defaults to the `classic` engine, the `rottay`
tenant, and the `en` locale.

## 5. Render your first component

```tsx
import { Button, Text, Flex } from "@rottay/design-system";

function Welcome() {
  return (
    <Flex gap="4" align="center">
      <Text as="h1">Welcome</Text>
      <Button variant="primary" onClick={() => alert("It works")}>
        Click me
      </Button>
    </Flex>
  );
}
```

## 6. Next.js App Router

The provider must render inside a Client Component:

```tsx
// components/providers.tsx
"use client";
import { DesignSystemProvider } from "@rottay/design-system";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DesignSystemProvider>{children}</DesignSystemProvider>;
}
```

```tsx
// app/layout.tsx
import { Providers } from "@/components/providers";
import "@rottay/design-system/styles.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 7. Choose an engine

Every primitive renders through one of three physical engines, plus a
pack-scoped `custom` registry. Set it globally on the provider or per
component with the `engine` prop:

```tsx
<DesignSystemProvider forceEngine="modern">
  <App />
</DesignSystemProvider>
```

See [architecture.md](architecture/index.md) for the full engine model and how
resolution and code-splitting work.

## 8. Set a tenant

Tenant context carries identity, locale, features, motion and component-pack
information:

```tsx
<DesignSystemProvider tenantSlug="acme">
  <App />
</DesignSystemProvider>
```

See [customization.md](customization.md) for the full theming model —
what a tenant may change, and how a theme compiles to CSS.

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module '@rottay/design-system'` | Package not installed, or workspace protocol not resolving | Verify with `pnpm ls @rottay/design-system`; in a monorepo confirm `"@rottay/design-system": "workspace:*"` in `package.json` |
| Components render as blank / `null` | Provider is resolving tenant configuration asynchronously | Confirm `tenantConfig` or `tenantSlug` is set; wire `onError` to see resolution failures |
| `useEngineContext must be used within an EngineProvider` | A DS component rendered outside the provider tree | Wrap the app (or test harness) in `<DesignSystemProvider>` |
| Ant Design styles missing (classic engine) | `antd` peer not installed | Verify with `pnpm ls antd`; ensure your bundler is not stripping CSS imports |
| CSS variables show as raw `var(...)` | Stylesheet not imported | Import `@rottay/design-system/styles.css` in your application entry point |
| Bundle larger than expected | Deep-importing engine subpaths instead of the root entry | Import components from `@rottay/design-system`; run `pnpm analyze` in the package to check against budgets |

## 10. Where to go next

- [architecture.md](architecture/index.md) — system shape, engine model, runtime resolution
- [customization.md](customization.md) — tokens, themes, the tenant cascade
- [api.md](api.md) — the public import boundary and stability policy
