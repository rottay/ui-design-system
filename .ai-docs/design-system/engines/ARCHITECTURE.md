# Engine Architecture - Rottay Design System

> Last updated: 2026-03-23

## Overview

The engine system is the core architectural layer that enables the Rottay Design System to render every component using one of four interchangeable UI implementations. A single React component tree can switch its entire visual appearance at runtime by changing the active engine.

**Source**: `ui-design-system/packages/core/src/runtime/engines/`

---

## Engine Types

| Engine | Library | Status | Visual Identity |
|--------|---------|--------|-----------------|
| `classic` | Ant Design (`antd`) | Stable | Enterprise, structured, corporate. Visible borders, multi-layer shadows, compact spacing. |
| `modern` | DaisyUI / Tailwind | Stable | Contemporary, rounded, glassmorphism. No visible borders, color-tinted shadows, spring animations. |
| `rustic` | Vanilla HTML/CSS | Stable | Minimal, spacious, understated. Barely-there shadows, maximum whitespace, zero dependencies. |
| `custom` | Pluggable | Experimental | Tenant-specific implementations registered at runtime via pack-scoped registries. |

### Type Definition

```typescript
type EngineName = 'classic' | 'modern' | 'rustic' | 'custom';
```

**Source**: `ui-design-system/packages/core/src/contracts/engine/index.ts`

### Engine Token Differentiation

Each engine defines its own `EngineTokenOverrides` covering five categories:

| Token Category | Classic | Modern | Rustic |
|----------------|---------|--------|--------|
| **borderRadius.md** | `6px` | `12px` | `4px` |
| **shadows.md** | Multi-layer corporate | Color-tinted bold | Barely visible |
| **surface.borderWidth** | `1px` solid | `0` none | `1px` solid |
| **surface.useGradients** | `false` | `true` | `false` |
| **surface.useGlass** | `false` | `true` | `false` |
| **motion.hover** | `150ms ease` | `200ms spring` | `120ms ease` |
| **motion.transform** | `none` | `translateY(-1px)` | `none` |
| **densityScale** | `0.9375` (6% tighter) | `1.0` (baseline) | `1.125` (12% spacious) |

**Source**: `ui-design-system/packages/core/src/hooks/tokens/engine-tokens.ts`

---

## Factory System: `createEngineComponent`

The factory function is the mechanism that creates engine-aware components. Every DS component (Button, Card, Table, etc.) is produced by this factory.

### Signature

```typescript
function createEngineComponent<P extends object>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options?: CreateEngineComponentOptions
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>>;
```

### How It Works

1. **Accepts dynamic import loaders** for each engine:
   ```typescript
   export const Button = createEngineComponent<ButtonProps>('Button', {
     classic: () => import('./engines/classic'),
     modern: () => import('./engines/modern'),
     rustic: () => import('./engines/rustic'),
   });
   ```

2. **Creates `React.lazy` components** for each engine at initialization time (not per-render).

3. **Returns a forwarded-ref router component** (`EngineRouter`) that:
   - Reads the active engine from `EngineProvider` context
   - Checks for a per-component `engine` prop override
   - For `custom` engine: reads `componentPack` from `TenantContext` to resolve pack-scoped lazy components
   - Wraps the resolved component in `<EngineErrorBoundary>` and `<Suspense>`
   - Strips the `engine` prop before passing to the implementation

### Pack-Scoped Lazy Cache

When the active engine is `custom`, the factory maintains a `Map<string, LazyExoticComponent>` cache keyed by pack name. This ensures the same pack always returns the same `React.lazy` instance (required for Suspense stability across re-renders).

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fallback` | `ReactNode` | `null` | Suspense fallback while lazy loading |
| `customEnabled` | `boolean` | `true` | Whether to wrap with custom engine support |
| `fallbackEngine` | `EngineName` | - | Engine to try if primary fails to load |
| `onError` | `(error, errorInfo) => void` | - | Callback for error monitoring |

**Source**: `ui-design-system/packages/core/src/runtime/engines/factory.tsx`

---

## Resolution Chain

Engine selection follows a strict priority chain (highest to lowest):

```
1. Component prop     <Button engine="modern" />
2. EngineProvider     <EngineProvider defaultEngine="modern">
3. DesignSystemProvider  forceEngine="modern"
4. Tenant config      tenantConfig.engine
5. Vertical preset    resolvedVertical.engine
6. System default     'classic'
```

### In Code (DesignSystemProvider)

```typescript
const engine = forceEngine ?? tenantConfig.engine ?? resolvedVertical?.engine ?? 'classic';
```

### Token Resolution Chain (useTokens)

Design tokens layer from lowest to highest priority:

```
Engine base tokens (borderRadius, shadows, surface, motion)
  -> Product profile overrides
    -> Tenant token overrides (highest structural priority)
```

Personality tokens use a four-layer merge:

```
DEFAULT_PERSONALITY
  -> Vertical personality
    -> Product profile personality
      -> Tenant personality (highest priority)
```

---

## EngineProvider

The context provider that holds the active engine state and exposes it to the component tree.

### API

```typescript
interface EngineProviderProps {
  defaultEngine?: EngineName;   // Default: 'classic'
  children: React.ReactNode;
  allowEngineSwitch?: boolean;
}

interface EngineContextValue {
  engine: EngineName;
  setEngine: (engine: EngineName) => void;
  metadata?: EngineMetadata;
}
```

### Key Behaviors

- **Prop sync**: When the parent changes `defaultEngine`, the provider immediately syncs its internal state (no useEffect delay).
- **Validation**: Invalid engine names are rejected with a dev-only warning; the default engine is used instead.
- **Safe defaults**: When no `EngineProvider` is present (SSR, unit tests), `useEngineContext()` returns a default value with `engine: 'classic'` and a no-op `setEngine`. This is intentional so components can render without the full provider tree.
- **`useEngine()` (strict)**: Throws if called outside `EngineProvider`. Use this in application code.
- **`useEngineContext()` (lenient)**: Returns default context outside provider. Used internally by the factory.

**Source**: `ui-design-system/packages/core/src/runtime/engines/EngineProvider.tsx`

---

## ENGINE_REGISTRY

Static registry containing metadata for all engines:

```typescript
const ENGINE_REGISTRY: Record<EngineName, EngineConfig> = {
  classic: { name: 'classic', displayName: 'Classic (Ant Design)',  library: 'antd',   status: 'stable' },
  modern:  { name: 'modern',  displayName: 'Modern (DaisyUI)',     library: 'daisyui', status: 'stable' },
  rustic:  { name: 'rustic',  displayName: 'Rustic (HTML)',        library: 'html',   status: 'stable' },
  custom:  { name: 'custom',  displayName: 'Custom (Pluggable)',   library: 'custom', status: 'experimental' },
};
```

### Utility Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getEngine(name)` | `EngineConfig` | Metadata for a specific engine |
| `getAvailableEngines()` | `EngineName[]` | All engine names including experimental |
| `getStableEngines()` | `EngineName[]` | Only `['classic', 'modern', 'rustic']` |
| `isValidEngine(name)` | `boolean` | Type guard for engine names |
| `getDefaultEngine()` | `'classic'` | The fallback engine |

**Source**: `ui-design-system/packages/core/src/runtime/engines/registry.ts`

---

## Custom Engine Packs

The custom engine enables tenant-specific component implementations via a pack-scoped registry system.

### Architecture

```
packRegistries: Map<string, ComponentRegistry>
  |
  |-- '__default__' -> Map { 'Button' -> MyButton, 'Card' -> MyCard }
  |-- 'acme-pack'   -> Map { 'Button' -> AcmeButton }
  |-- 'globex-pack' -> Map { 'Button' -> GlobexButton, 'Alert' -> GlobexAlert }
```

- **Config is global**: `configureCustomEngine()` sets fallback engine and logging for all packs.
- **Registrations are pack-scoped**: Each pack has its own independent `ComponentRegistry`.
- **Tenant isolation**: Different tenants use different packs in the same runtime without cross-contamination.

### Registration API

```typescript
// Register in default pack
registerCustomComponent('Button', MyButton);

// Register in a tenant-specific pack
registerCustomComponent('Button', AcmeButton, 'acme-pack');

// Batch register
registerCustomComponents({ Button: AcmeButton, Card: AcmeCard }, 'acme-pack');

// Unregister
unregisterCustomComponent('Button', 'acme-pack');

// Clear (specific pack or all)
clearCustomRegistry('acme-pack');
clearCustomRegistry(); // all packs
```

### Configuration

```typescript
configureCustomEngine({
  fallbackEngine: 'rustic',     // Default: 'classic'
  warnOnFallback: true,         // Default: true
  logger: (msg, level) => {},   // Custom logging
});
```

### Resolution Flow (Custom Engine)

When the active engine is `custom`:

1. Factory reads `componentPack` from `TenantContext`
2. `createCustomWrapper(displayName, fallback, pack)` is called
3. If the component is registered in the pack registry, return it
4. Otherwise, warn (if configured) and fall back to the fallback engine loader

### Discovery API

```typescript
const { registeredComponents, componentCount, config, hasComponent, packs } = useCustomStatus('acme-pack');
```

**Source**: `ui-design-system/packages/core/src/runtime/engines/custom.ts`

---

## Error Boundaries

The design system provides three tiers of error boundaries:

### 1. EngineErrorBoundary (Component-Level)

Wraps each engine-routed component inside `createEngineComponent`. Catches errors during lazy loading.

| Feature | Description |
|---------|-------------|
| Fallback UI | Default error message with Retry button |
| Custom render | `fallbackRender={(error, reset) => <CustomUI />}` |
| Error reporting | Reports to centralized `ErrorHandler` with category `ENGINE` |
| Fallback engine | Optional `fallbackEngine` prop to try alternate engine |

**Source**: `ui-design-system/packages/core/src/runtime/engines/boundary.tsx`

### 2. DSErrorBoundary (System-Level)

Wraps the entire `DesignSystemProvider` tree. When the DS crashes during initialization:

- Renders children **without** any DS providers (safe mode)
- Shows a non-intrusive amber warning banner
- Reports error via `onError` callback
- Provides a Retry button

```tsx
<DSErrorBoundary onError={(err) => Sentry.captureException(err)}>
  <DesignSystemProvider>
    <App />
  </DesignSystemProvider>
</DSErrorBoundary>
```

**Source**: `ui-design-system/packages/core/src/runtime/bootstrap/DSErrorBoundary.tsx`

---

## DesignSystemProvider Composition

The root provider composes the full runtime stack in this order (outermost to innermost):

```
TenantProvider
  -> ProductProfileProvider
    -> I18nProvider
      -> EngineProvider
        -> ThemeProvider
          -> FeatureProvider
            -> ResponsiveProvider
              -> SystemCssVariablesBridge
              -> MemoizedChildren
```

### Engine Flow Through the Provider

1. **Vertical resolution**: The provider resolves the vertical preset (from prop, tenant config, or registry).
2. **Engine determination**: `forceEngine ?? tenantConfig.engine ?? resolvedVertical?.engine ?? 'classic'`
3. **Engine injection**: The resolved engine name is passed to `<EngineProvider defaultEngine={engine}>`.
4. **Token bridging**: `SystemCssVariablesBridge` writes resolved personality tokens (which include engine-derived values) to CSS custom properties on `:root`.
5. **Component rendering**: Each component factory reads the engine context and lazy-loads the correct implementation.

### Tenant Config Merge Rules

- Scalar values: last write wins
- `branding`, `tokenOverrides`: shallow-merge by section
- `personality`: replaced wholesale (deep merge happens in `useTokens`)
- `features`: set union (additive)
- `customTranslations`: recursive deep merge

**Source**: `ui-design-system/packages/core/src/runtime/bootstrap/DesignSystemProvider.tsx`

---

## File Reference

| File | Purpose |
|------|---------|
| `runtime/engines/index.ts` | Barrel exports |
| `runtime/engines/factory.tsx` | `createEngineComponent` factory |
| `runtime/engines/registry.ts` | `ENGINE_REGISTRY`, utility functions |
| `runtime/engines/EngineProvider.tsx` | Engine context provider |
| `runtime/engines/custom.ts` | Custom engine pack-scoped registry |
| `runtime/engines/boundary.tsx` | `EngineErrorBoundary` |
| `runtime/engines/binding.ts` | Reserved placeholder (future) |
| `contracts/engine/index.ts` | Type definitions (`EngineName`, `EngineAwareProps`, etc.) |
| `hooks/tokens/engine-tokens.ts` | Per-engine token values |
| `runtime/bootstrap/DesignSystemProvider.tsx` | Root provider composition |
| `runtime/bootstrap/DSErrorBoundary.tsx` | System-level error boundary |
| `runtime/bootstrap/SystemCssVariablesBridge.tsx` | JS tokens to CSS variables bridge |
