# Getting Started with Rottay Design System

Setup in 3 minutes. This guide takes you from zero to a working multi-engine, multi-tenant UI.

---

## 1. Install

```bash
pnpm add @rottay/design-system
```

Peer dependencies (required for the `classic` engine):

```bash
pnpm add react react-dom antd @ant-design/icons
```

---

## 2. Minimal Provider Setup

Wrap your application in `DesignSystemProvider` with zero props. The DS will resolve the default tenant (`rottay`), default engine (`classic`), and default locale (`en`) automatically.

```tsx
import { DesignSystemProvider } from '@rottay/design-system';

function App() {
  return (
    <DesignSystemProvider>
      <YourApplication />
    </DesignSystemProvider>
  );
}
```

That is all you need to start rendering components.

---

## 3. Add Your First Component

```tsx
import { Button, Text, Flex } from '@rottay/design-system';

function Welcome() {
  return (
    <Flex gap="4" align="center">
      <Text as="h1">Welcome</Text>
      <Button variant="primary" onClick={() => alert('It works')}>
        Click me
      </Button>
    </Flex>
  );
}
```

Every primitive (`Button`, `Text`, `Flex`, etc.) automatically renders using the active engine. No extra configuration is required.

---

## 4. Add Your First Surface

Surfaces are page-level shells that handle chrome, loading, filtering, tables, and more. The simplest example is `ListSurface`.

```tsx
import {
  ListSurface,
  createListSurfaceConfig,
} from '@rottay/design-system';

interface UserView {
  id: string;
  name: string;
  email: string;
}

const config = createListSurfaceConfig<UserView>({
  visual: {
    defaultView: 'table',
    allowViewSwitch: true,
  },
  presentation: {
    chrome: {
      title: 'Users',
      subtitle: 'Manage your team members',
    },
  },
  behavior: {
    columns: [
      { fieldId: 'name', key: 'name', title: 'Name' },
      { fieldId: 'email', key: 'email', title: 'Email' },
    ],
    primaryAction: {
      id: 'add',
      label: 'Add User',
      variant: 'primary',
      onClick: () => console.log('add user'),
    },
  },
});

function UsersPage() {
  return <ListSurface config={config} data={users} loading={false} />;
}
```

Builder functions like `createListSurfaceConfig` are identity functions that exist purely for TypeScript inference.

---

## 5. Switch Engines

The design system ships three stable engines and one experimental engine:

| Engine | Library | Character |
|--------|---------|-----------|
| `classic` | Ant Design | Enterprise, structured, corporate |
| `modern` | DaisyUI/Tailwind | Contemporary, rounded, glass effects |
| `rustic` | Vanilla HTML/CSS | Minimal, spacious, understated |
| `athena` | Custom (pluggable) | Your own implementation |

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

---

## 6. Set Up a Tenant

Tenant configuration controls branding, engine selection, locale, features, personality tokens, and token overrides.

```tsx
import { DesignSystemProvider } from '@rottay/design-system';
import type { TenantConfig } from '@rottay/design-system';

const tenant: TenantConfig = {
  slug: 'acme',
  name: 'ACME Corp',
  engine: 'classic',
  theme: 'base',
  plan: 'enterprise',
  features: ['advanced-analytics', 'export'],
  branding: {
    companyName: 'ACME',
    primaryColor: '#FF5500',
    secondaryColor: '#1A1A2E',
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

### Resolve tenants dynamically

Instead of passing an inline config, pass a `tenantSlug` and the DS resolves it from its registry (memory cache, localStorage, known registry, static files, remote API, then default fallback):

```tsx
<DesignSystemProvider
  tenantSlug="acme"
  onTenantResolved={(cfg) => console.log('Resolved:', cfg.slug)}
  onError={(err) => console.error(err)}
>
  <App />
</DesignSystemProvider>
```

### Apply runtime overrides

Product teams can tune tenant branding without forking the DS:

```tsx
<DesignSystemProvider
  tenantConfig={baseTenant}
  tenantOverrides={{
    branding: { primaryColor: '#00CC88' },
    features: ['beta-feature'],
  }}
>
  <App />
</DesignSystemProvider>
```

### Add a product profile

Product profiles sit between engine defaults and tenant overrides, tuning animation intensity, density, chart style, and more:

```tsx
<DesignSystemProvider
  tenantConfig={tenant}
  productProfile="events.organizer"
>
  <App />
</DesignSystemProvider>
```

Available first-party profiles: `generic.default`, `events.organizer`, `recruiting.operator`, `platform.admin`.

---

## 7. Dark Mode

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
  theme: 'dark',
};
```

The DS generates full dark-mode CSS including inverted backgrounds, text, borders, shadows, and adjusted brand color scales. It also respects `@media (prefers-color-scheme: dark)` when no explicit theme is set.

---

## 8. Internationalization

The DS supports `en`, `es`, `pt`, `fr`, and `ar` (with RTL) out of the box.

```tsx
<DesignSystemProvider
  locale="es"
  fallbackLocale="en"
  customTranslations={{
    surfaces: { list: { empty: 'Sin resultados' } },
  }}
>
  <App />
</DesignSystemProvider>
```

---

## Common Errors and Fixes

### "Cannot find module '@rottay/design-system'"

Make sure you installed the package and that your project resolves the `@rottay` scope correctly. In a monorepo, verify the workspace protocol in `package.json`:

```json
"@rottay/design-system": "workspace:*"
```

### Components render as blank / `null`

The `DesignSystemProvider` shows `null` while resolving tenant configuration asynchronously. If you see a blank screen, check that:
- You have a valid `tenantConfig` or `tenantSlug`.
- The `onError` callback is wired so you can see resolution failures.

### "useEngineContext must be used within an EngineProvider"

You are using a DS component outside the provider tree. Wrap your app (or test harness) with `<DesignSystemProvider>`.

### Ant Design styles missing (classic engine)

The `classic` engine requires `antd` as a peer dependency. Make sure it is installed and that its CSS is loaded. The DS imports Ant components via `createEngineComponent` with lazy loading, so tree-shaking should handle unused engines automatically.

### TypeScript errors on surface config

Use the builder functions (`createListSurfaceConfig`, `createDashboardSurfaceConfig`, etc.) to get full type inference. They are identity functions with zero runtime cost.

---

## Next Steps

| Resource | Path |
|----------|------|
| Full component catalog | `/.ai-docs/design-system/COMPONENT_INDEX.md` |
| Surface reference | `/.ai-docs/design-system/SURFACES.md` |
| Engine reference | `/.ai-docs/design-system/ENGINES.md` |
| Theming guide | `/.ai-docs/design-system/THEMING.md` |
| Pattern reference | `/.ai-docs/design-system/PATTERNS.md` |
| Storybook | `packages/core/storybook-static/` (run locally) |
