# Getting Started with Rottay Design System

This guide covers everything from a 2-minute quick start to full multi-tenant configuration.

> **Note:** `@rottay/design-system` is a **private, internal package** distributed via GitHub Packages.
> It is not available on the public npm registry and is not intended for third-party consumption.
> You must be a member of the `rottay` GitHub organization with a valid `GITHUB_TOKEN` to install it.

---

## Quick Start (2 minutes)

### 1. Install

Within the Rottay monorepo, the package resolves automatically via the workspace protocol. For Rottay apps in separate repositories, configure `.npmrc` authentication first (see "Usage in a Separate Rottay Repository" below).

```bash
pnpm add @rottay/design-system
```

Install peer dependencies (required):

```bash
pnpm add react react-dom antd @ant-design/icons
```

### 2. Wrap and render

```tsx
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
        <Text as="h1">Welcome</Text>
        <Button variant="primary" onClick={() => alert("It works")}>
          Click me
        </Button>
      </Flex>
    </DesignSystemProvider>
  );
}
```

That is all you need. The DS defaults to the `classic` engine (Ant Design), the `rottay` tenant, and the `en` locale. Every component renders immediately with zero additional configuration.

---

## Usage in a Separate Rottay Repository

If you are building a new Rottay application in its own repository (outside the monorepo), follow these steps to access the private package.

### 1. Configure GitHub Packages authentication

The package is published to the GitHub Packages registry under the `@rottay` scope with restricted access. You must be a member of the `rottay` GitHub organization.

Create or update the `.npmrc` file in your project root:

```ini
@rottay:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Set `GITHUB_TOKEN` as an environment variable. The token needs:

- **Scope:** `read:packages`
- **Access:** Must belong to a user/bot with access to the `rottay` organization

For CI/CD pipelines (GitHub Actions), use the built-in `GITHUB_TOKEN` secret or a fine-grained PAT with `packages:read` permission.

### 2. Install the package and all peer dependencies

```bash
pnpm add @rottay/design-system react react-dom antd @ant-design/icons
```

### 3. Import the design-system stylesheet (required)

The design system ships component skins, interaction states, keyframes and CSS custom properties
through its public stylesheets. Import exactly one stylesheet in your application entry point:

```tsx
// app/layout.tsx or index.tsx
import "@rottay/design-system/styles.css";
```

Use the matching `@rottay/design-system/styles/<vertical>` export in a vertical application when
appropriate. `DesignSystemProvider` still injects runtime tenant variables through
`SystemCssVariablesBridge`, but it does not replace the static stylesheet.

### 4. Wrap your application

```tsx
import { DesignSystemProvider } from "@rottay/design-system";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesignSystemProvider>{children}</DesignSystemProvider>;
}
```

### 5. Use components

```tsx
import { Button, Input, Card, Text, Flex, Stack } from "@rottay/design-system";

function LoginForm() {
  return (
    <Card>
      <Stack gap="4">
        <Text as="h2">Sign In</Text>
        <Input placeholder="Email" />
        <Input placeholder="Password" type="password" />
        <Button variant="primary">Log In</Button>
      </Stack>
    </Card>
  );
}
```

### Next.js App Router integration

For Next.js projects, the provider must be rendered in a Client Component:

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Peer Dependencies

The design system declares the following peer dependencies:

| Package             | Version                | Required By          |
| ------------------- | ---------------------- | -------------------- |
| `react`             | `^18.0.0 \|\| ^19.0.0` | All components       |
| `react-dom`         | `^18.0.0 \|\| ^19.0.0` | All components       |
| `antd`              | `^5.21.0`              | Classic engine       |
| `@ant-design/icons` | `^5.5.0`               | Classic engine icons |

If you only use the `modern` or `rustic` engine, `antd` and `@ant-design/icons` are still declared as peers but are not imported at runtime (the classic engine lazy-loads them). You can safely install them without bundle impact, or suppress the peer warning if you are certain you will never use the classic engine.

---

## Add Your First Component

Every primitive (`Button`, `Text`, `Flex`, `Card`, `Input`, etc.) automatically renders using the active engine. No extra configuration is required.

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

---

## Add Your First Surface

Surfaces are page-level shells that handle chrome, loading, filtering, tables, and more. The simplest example is `ListSurface`.

```tsx
import { ListSurface, createListSurfaceConfig } from "@rottay/design-system";

interface UserView {
  id: string;
  name: string;
  email: string;
}

const config = createListSurfaceConfig<UserView>({
  visual: {
    defaultView: "table",
    allowViewSwitch: true,
  },
  presentation: {
    chrome: {
      title: "Users",
      subtitle: "Manage your team members",
    },
  },
  behavior: {
    columns: [
      { fieldId: "name", key: "name", title: "Name" },
      { fieldId: "email", key: "email", title: "Email" },
    ],
    primaryAction: {
      id: "add",
      label: "Add User",
      variant: "primary",
      onClick: () => {},
    },
  },
});

function UsersPage() {
  return <ListSurface config={config} data={users} loading={false} />;
}
```

Builder functions like `createListSurfaceConfig` are identity functions that exist purely for TypeScript inference.

---

## Engine Selection

The design system ships three stable engines and one pluggable engine:

| Engine    | Library              | Character                            |
| --------- | -------------------- | ------------------------------------ |
| `classic` | Ant Design           | Enterprise, structured, corporate    |
| `modern`  | DaisyUI/Tailwind     | Contemporary, rounded, glass effects |
| `rustic`  | Vanilla HTML/CSS     | Minimal, spacious, understated       |
| `custom`  | Pack-scoped registry | Your own implementation              |

### Global switch via provider

```tsx
<DesignSystemProvider forceEngine="modern">
  <App />
</DesignSystemProvider>
```

### Per-component override

Any primitive accepts an `engine` prop that overrides the global setting:

```tsx
<Button engine="rustic" variant="primary">
  Always renders with the rustic engine
</Button>
```

### How engines load

Engines are code-split. Only the active engine downloads when a component first renders. If the user switches engines at runtime, the new engine lazy-loads on demand. See [ENGINE_SPLITTING.md](./ENGINE_SPLITTING.md) for details.

---

## Tenant Configuration

Tenant configuration controls branding, engine selection, locale, features, personality tokens, and token overrides.

### Inline tenant config

```tsx
import { DesignSystemProvider } from "@rottay/design-system";
import type { TenantConfig } from "@rottay/design-system";

const tenant: TenantConfig = {
  slug: "acme",
  name: "ACME Corp",
  engine: "classic",
  theme: "base",
  plan: "enterprise",
  features: ["advanced-analytics", "export"],
  branding: {
    companyName: "ACME",
    primaryColor: "#FF5500",
    secondaryColor: "#1A1A2E",
  },
};

function App() {
  return (
    <DesignSystemProvider tenantConfig={tenant}>
      <YourApplication />
    </DesignSystemProvider>
  );
}
```

### Dynamic tenant resolution

Instead of passing an inline config, pass a `tenantSlug` and the DS resolves it from its registry (memory cache, localStorage, known registry, static files, remote API, then default fallback):

```tsx
<DesignSystemProvider
  tenantSlug="acme"
  onTenantResolved={(cfg) => console.log("Resolved:", cfg.slug)}
  onError={(err) => console.error(err)}
>
  <App />
</DesignSystemProvider>
```

### Runtime overrides

Product teams can tune tenant branding without forking the DS:

```tsx
<DesignSystemProvider
  tenantConfig={baseTenant}
  tenantOverrides={{
    branding: { primaryColor: "#00CC88" },
    features: ["beta-feature"],
  }}
>
  <App />
</DesignSystemProvider>
```

### Product profiles

Product profiles sit between engine defaults and tenant overrides, tuning animation intensity, density, chart style, and more:

```tsx
<DesignSystemProvider tenantConfig={tenant} productProfile="events.organizer">
  <App />
</DesignSystemProvider>
```

Available first-party profiles: `generic.default`, `events.organizer`, `recruiting.operator`, `platform.admin`.

---

## Theming

### Dark mode

Dark mode is controlled through the `theme` field or `forceTheme` prop:

```tsx
<DesignSystemProvider forceTheme="dark">
  <App />
</DesignSystemProvider>
```

Or set it in tenant config:

```tsx
const tenant: TenantConfig = {
  // ...
  theme: "dark",
};
```

The DS generates full dark-mode CSS including inverted backgrounds, text, borders, shadows, and adjusted brand color scales. It also respects `@media (prefers-color-scheme: dark)` when no explicit theme is set.

### CSS custom properties

All design tokens use the `--ds-*` prefix. You can use them in your own stylesheets:

```css
.my-custom-card {
  background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-color-text);
}
```

### Token resolution chain

Tokens resolve through a four-layer pipeline (lowest to highest priority):

1. **Engine defaults** -- Classic uses 4px radii, Modern uses 12px, Rustic uses 2px
2. **Product profile overrides** -- UX preset within a vertical
3. **Tenant overrides** -- customer-specific structural tweaks

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full token and personality merge chains.

---

## Internationalization

The DS supports `en`, `es`, `pt`, `fr`, and `ar` (with RTL) out of the box.

```tsx
<DesignSystemProvider
  locale="es"
  fallbackLocale="en"
  customTranslations={{
    surfaces: { list: { empty: "Sin resultados" } },
  }}
>
  <App />
</DesignSystemProvider>
```

---

## Testing

The DS exports test helpers from `@rottay/design-system`. Wrap components in the provider for tests:

```tsx
import { render, screen } from "@testing-library/react";
import { DesignSystemProvider, Button } from "@rottay/design-system";

test("renders a button", () => {
  render(
    <DesignSystemProvider>
      <Button variant="primary">Submit</Button>
    </DesignSystemProvider>
  );
  expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
});
```

---

## Troubleshooting

### "Cannot find module '@rottay/design-system'"

- Verify the package is installed: `pnpm ls @rottay/design-system`
- In a monorepo, check that your `package.json` uses the workspace protocol:
  ```json
  "@rottay/design-system": "workspace:*"
  ```
- For projects outside the monorepo, verify your `.npmrc` has the correct registry configuration (see "Usage in a Separate Rottay Repository" above)

### Components render as blank / `null`

The `DesignSystemProvider` shows `null` while resolving tenant configuration asynchronously. Check that:

- You have a valid `tenantConfig` or `tenantSlug`
- The `onError` callback is wired so you can see resolution failures
- If using `tenantSlug`, the tenant exists in the registry or is reachable via the remote API

### "useEngineContext must be used within an EngineProvider"

You are using a DS component outside the provider tree. Wrap your app (or test harness) with `<DesignSystemProvider>`.

### Ant Design styles missing (classic engine)

The `classic` engine requires `antd` as a peer dependency. Verify it is installed:

```bash
pnpm ls antd
```

The DS imports Ant components via `createEngineComponent` with lazy loading, so tree-shaking handles unused engines automatically. If styles are still missing, ensure you are not stripping CSS imports in your bundler config.

### TypeScript errors on surface config

Use the builder functions (`createListSurfaceConfig`, `createDashboardSurfaceConfig`, etc.) to get full type inference. They are identity functions with zero runtime cost.

### Bundle size is larger than expected

- Ensure you are not importing from engine subpaths directly unless intentional. Components should be imported from `@rottay/design-system` (the root entry point).
- Verify your bundler supports dynamic `import()` for code splitting.
- Run `pnpm analyze` inside the design system package to check against performance budgets.

### "Module not found: @heroui/react" or other dependency errors

`@heroui/react`, `framer-motion`, `lucide-react`, `d3`, `dayjs`, and `geist` are direct dependencies of the design system and should be installed automatically. If they are missing, run:

```bash
pnpm install
```

### Dark mode not applying

- Check that `forceTheme="dark"` is set on the provider, or that `theme: 'dark'` is in your tenant config
- If relying on system preference, verify `@media (prefers-color-scheme: dark)` works in your browser
- Ensure no parent element overrides the `data-theme` attribute on the root element

### CSS variables not resolving (custom styles showing raw `var()`)

Import the CSS stylesheet in your application entry:

```tsx
import "@rottay/design-system/styles.css";
```

The `SystemCssVariablesBridge` component inside the provider handles runtime personality tokens, but the base token layer (colors, spacing, typography) comes from the CSS file.

---

## Next Steps

| Resource                  | Path                                             |
| ------------------------- | ------------------------------------------------ |
| Architecture guide        | [ARCHITECTURE.md](./ARCHITECTURE.md)             |
| Engine splitting strategy | [ENGINE_SPLITTING.md](./ENGINE_SPLITTING.md)     |
| Performance budget        | [PERFORMANCE_BUDGET.md](./PERFORMANCE_BUDGET.md) |
| Full component catalog    | `/.ai-docs/design-system/COMPONENT_INDEX.md`     |
| Surface reference         | `/.ai-docs/design-system/SURFACES.md`            |
| Theming guide             | `/.ai-docs/design-system/THEMING.md`             |
| Storybook                 | Run `pnpm storybook` locally                     |
