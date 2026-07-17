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
appropriate. Provider-owned vertical/preview modes can emit runtime variables,
but they do not replace the static stylesheet. A published customer tenant uses
the separate server-compiled artifact flow documented under
[Tenant Configuration](#tenant-configuration).

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

| Package | Version | Reached by |
|---|---|---|
| `react` | `^18.0.0 \|\| ^19.0.0` | React API |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | React DOM/portals |
| `antd` | `^5.21.0` | Classic engine |
| `@ant-design/icons` | `^5.5.0` | Classic engine icons |
| `@phosphor-icons/react` | `>=2.1.10 <3.0.0` | Default semantic icons |
| `lucide-react` | `>=0.545.0 <1.0.0` | Compatibility icon catalog only |
| `@thesvg/react` | `3.2.7` (optional) | Brand/cloud marks |
| `d3` | `^7.9.0` | Chart families |
| `motion` | `12.42.2` | Motion primitives/effects |
| `typescript` | `^5.7.0` (optional) | ESLint/plugin tooling |

Supplier requirements are usage-based. Run
`pnpm exec rottay-ds-supplier-honesty` in the consuming app rather than
guessing from this complete package-level list.

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
| `modern`  | Rottay token skins   | Responsive, expressive, adaptive     |
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

Tenant context carries identity, locale, features, motion and component-pack
information. Visual authority has two distinct classes:

- code-owned vertical baselines (`rottay`, `bithire`, `evnto`) are static-first;
- published customer tenants are DB-owned and arrive as one validated,
  server-compiled SSR artifact.

The hostname selects customer identity only. It never selects a checked-in CSS
file, component branch or engine. A DB-provided engine value is ignored;
rendering ownership stays with the code-owned vertical.

### Published customer tenant (production)

The server loads the published `TenantThemeDocument`, validates its closed
schema and vertical envelope, compiles/caches the immutable artifact and embeds
that exact CSS plus canonical config during SSR. Hydration uses
`visualAuthority="compiled-artifact"`:

```tsx
<style id="tenant-theme-artifact">{compiledTenantCss}</style>
<DesignSystemProvider
  tenantConfig={canonicalTenantConfig}
  visualAuthority="compiled-artifact"
>
  <App />
</DesignSystemProvider>
```

Browser components never query the DB, and the provider emits no competing
tenant variables, personality bridge or chrome stylesheet in this mode.

### Inline tenant config (development/compatibility)

Inline visual fields remain useful in tests, Storybook, local demos and
explicit editors. They are not the production customer write contract:

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

### Dynamic tenant resolution (compatibility/local)

The six-stage resolver (memory cache, localStorage, known registry, static
files, remote API, identity-safe fallback) remains available for local,
preview and compatibility consumers. It is not the productive customer visual
authority chain:

```tsx
<DesignSystemProvider
  tenantSlug="acme"
  onTenantResolved={(cfg) => console.log("Resolved:", cfg.slug)}
  onError={(err) => console.error(err)}
>
  <App />
</DesignSystemProvider>
```

### Runtime overrides (preview/editor only)

Explicit preview tooling can exercise compatibility overrides without forking
the DS. Do not use this path to bypass a published customer artifact:

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

Product profiles are UX posture presets within a vertical. When a canonical
BrandTheme or compiled customer artifact is present, only `surfaceDefaults`
participate; profiles do not override visual identity:

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

Code-owned vertical/provider modes resolve dark-mode CSS including backgrounds,
text, borders, shadows and adjusted brand scales. Published customer output is
compiled on the server from its bounded document and hydrated as the exact
artifact. System preference is respected when no explicit theme is set.

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

Provider-owned compatibility tokens resolve through engine defaults, vertical
overrides and either BrandTheme or legacy profile/tenant inputs. A productive
customer artifact is already compiled and is not re-merged by the client.

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
- If using the compatibility `tenantSlug` resolver, the tenant exists in its
  registry/static/API chain
- In a published customer route, SSR mounted the compiled artifact and passed
  its canonical `tenantConfig` with `visualAuthority="compiled-artifact"`

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

### Supplier dependency errors

Runtime suppliers are capability-specific: Classic controls reach `antd` and
`@ant-design/icons`; the default semantic icon facade reaches
`@phosphor-icons/react`; compatibility icon exports may reach `lucide-react`;
brand marks may reach the optional `@thesvg/react`; charts reach `d3`; and
motion capability reaches `motion`. A consuming app declares only the
suppliers reached by the DS symbols it imports. Motion requires the pinned
`motion@12.42.2` package; `framer-motion` remains an implementation dependency
owned transitively by Motion and must not be declared directly. Run the
packaged honesty gate for the exact declarations required by that app:

```bash
pnpm exec rottay-ds-supplier-honesty
```

`dayjs` remains an internal runtime dependency and is installed with the design system.

### Dark mode not applying

- Check that `forceTheme="dark"` is set on the provider, or that `theme: 'dark'` is in your tenant config
- If relying on system preference, verify `@media (prefers-color-scheme: dark)` works in your browser
- Ensure no parent element overrides the `data-theme` attribute on the root element

### CSS variables not resolving (custom styles showing raw `var()`)

Import the CSS stylesheet in your application entry:

```tsx
import "@rottay/design-system/styles.css";
```

In provider-owned modes, `SystemCssVariablesBridge` handles runtime personality
tokens; the base layer still comes from the CSS file. In
`compiled-artifact` mode the server artifact is authoritative and the provider
does not emit a competing bridge.

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
