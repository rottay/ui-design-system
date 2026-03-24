# Engine System Reference

The Rottay Design System uses a multi-engine architecture where every primitive component has three (optionally four) independent implementations. The engine system enables the same React component API to render using entirely different UI libraries.

Source: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/core/engines/`

---

## Engine Registry

| Engine Name | Backing Library | Status | Character |
|-------------|----------------|--------|-----------|
| `classic` | Ant Design (`antd`) | Stable | Enterprise, structured, corporate, bordered |
| `modern` | DaisyUI / Tailwind CSS | Stable | Contemporary, rounded, glass effects, gradients |
| `rustic` | Vanilla HTML/CSS | Stable | Minimal, spacious, understated, lightweight |
| `athena` | Custom (pluggable) | Experimental | Developer-defined implementations |

The registry is defined in `src/core/engines/registry/index.ts`:

```ts
const ENGINE_REGISTRY: Record<EngineName, EngineConfig> = {
  classic: { name: 'classic', displayName: 'Classic (Ant Design)', library: 'antd', status: 'stable' },
  modern:  { name: 'modern',  displayName: 'Modern (DaisyUI)',    library: 'daisyui', status: 'stable' },
  rustic:  { name: 'rustic',  displayName: 'Rustic (HTML)',       library: 'html',    status: 'stable' },
  athena:  { name: 'athena',  displayName: 'Athena (Pluggable)',  library: 'custom',  status: 'experimental' },
};
```

### Registry Utilities

| Function | Description |
|----------|-------------|
| `getEngine(name)` | Get engine config by name |
| `getAvailableEngines()` | All engine names (including experimental) |
| `getStableEngines()` | Only stable engine names |
| `isValidEngine(name)` | Type guard for engine name validation |
| `getDefaultEngine()` | Returns `'classic'` |

---

## How Engines Work

### The `createEngineComponent` Factory

Every primitive is created using the `createEngineComponent` factory. This function takes a component name and an object of lazy loaders (one per engine), and returns a single React component that dynamically loads the correct implementation at runtime.

```ts
// Example: Button component definition
export const Button = createEngineComponent<ButtonProps>('Button', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
```

Internally, the factory:

1. Creates `React.lazy()` wrappers for each engine loader
2. Returns a `forwardRef` component (the "EngineRouter") that:
   - Reads the active engine from `useEngineContext()`
   - Checks for a per-component `engine` prop override
   - Renders the matching lazy component inside a `Suspense` boundary
   - Wraps everything in an `EngineErrorBoundary`

### Component File Structure

Each primitive follows this directory structure:

```
primitives/inputs/Button/
  index.ts           # Public export (createEngineComponent call)
  types/             # Shared ButtonProps type
  engines/
    classic/         # Ant Design implementation
    modern/          # DaisyUI/Tailwind implementation
    rustic/          # Vanilla HTML/CSS implementation
  compound/          # Compound sub-components (Button.Group, etc.)
  stories/           # Storybook stories
  tests/             # Unit/integration tests
```

### Code Splitting

Engine implementations are code-split via dynamic `import()`. Only the active engine's code is loaded at runtime. If a user never switches to `modern`, the DaisyUI implementation is never downloaded.

---

## How to Switch Engines

### 1. Global: via `DesignSystemProvider`

Set the engine for the entire application:

```tsx
<DesignSystemProvider forceEngine="modern">
  <App />
</DesignSystemProvider>
```

### 2. Global: via Tenant Config

The tenant's `engine` field determines the default engine:

```ts
const tenant: TenantConfig = {
  slug: 'acme',
  engine: 'modern',  // All components use modern by default
  // ...
};
```

Resolution order: `forceEngine` prop > `tenantConfig.engine` > `'classic'` (default).

### 3. Subtree: via `EngineProvider`

Nest an `EngineProvider` to override the engine for a section of the tree:

```tsx
import { EngineProvider } from '@rottay/design-system';

<DesignSystemProvider forceEngine="classic">
  <Sidebar />  {/* classic */}
  <EngineProvider defaultEngine="modern">
    <MainContent />  {/* modern */}
  </EngineProvider>
</DesignSystemProvider>
```

### 4. Per-component: via `engine` prop

Any primitive accepts an `engine` prop:

```tsx
<Button engine="rustic" variant="primary">
  Always rustic, regardless of context
</Button>
```

---

## Engine Token Resolution

Tokens are resolved in a 4-layer cascade:

```
Engine Defaults -> Product Profile -> Tenant Config -> Component Props
```

Each engine provides its own base values for:

| Token Category | Classic | Modern | Rustic |
|---------------|---------|--------|--------|
| `borderRadius.sm` | `4px` | `8px` | `2px` |
| `borderRadius.lg` | `8px` | `16px` | `4px` |
| `shadows.md` | Corporate multi-layer | Bold single shadow | Whisper shadow |
| `surface.borderWidth` | `1px` | `0` | `1px` |
| `surface.useGradients` | `false` | `true` | `false` |
| `surface.useGlass` | `false` | `true` | `false` |
| `motion.hover` | `150ms ease` | `200ms cubic-bezier` | `100ms ease` |
| `motion.transform` | `none` | `translateY(-1px)` | `none` |
| `densityScale` | `1.0` | `1.05` | `1.0` |

These are defined in `src/core/hooks/tokens/engine-tokens.ts` and resolved by the `useTokens()` hook.

Product profiles can override any token, and tenant configs override product profiles. The `useTokens()` hook merges them all.

---

## CSS File Locations

### Engine-specific CSS

Each engine's CSS lives alongside its component implementations:

```
primitives/inputs/Button/engines/classic/   # Ant Design CSS (from antd)
primitives/inputs/Button/engines/modern/    # Tailwind/DaisyUI CSS
primitives/inputs/Button/engines/rustic/    # Vanilla CSS
```

### Foundation CSS

The foundation CSS variables (colors, spacing, typography) are engine-agnostic:

```
src/theme/tokens/             # Token definitions
src/theme/tenants/            # Tenant-specific CSS generation
src/core/personality/         # Personality CSS variable bridge
```

### Tenant CSS

Tenant CSS is generated by the CSS generator at:
`src/theme/tenants/storage/static/generator/index.ts`

Output selector: `html[data-tenant='<slug>']`

Dark mode selectors:
- `html[data-tenant='<slug>'][data-theme='dark']`
- `html[data-tenant='<slug>'].dark`
- `@media (prefers-color-scheme: dark)` (when no explicit theme)

---

## Athena Engine (Custom Implementations)

The `athena` engine allows registering custom component implementations at runtime.

### Registering a custom component

```ts
import { registerAthenaComponent } from '@rottay/design-system';

registerAthenaComponent('Button', MyCustomButton);
```

### How it works

1. `createEngineComponent` wraps each component with an Athena check
2. When `engine === 'athena'`, the factory checks the Athena registry for a registered component
3. If found, renders the custom component; if not, falls back to the `rustic` engine implementation

### When to use Athena

- Internal design system experiments
- Gradual migration from another component library
- Third-party engine integration testing
- Component-level A/B testing

---

## When to Use Which Engine

| Scenario | Recommended Engine |
|----------|-------------------|
| Enterprise SaaS, admin panels, data-heavy apps | `classic` |
| Consumer-facing apps, modern aesthetics, media-heavy | `modern` |
| Lightweight apps, performance-critical, minimal JS | `rustic` |
| Internal experimentation, custom libraries | `athena` |
| Unsure / getting started | `classic` (default) |

### Engine Characteristics

**Classic (Ant Design)**
- Most complete feature set (Ant Design has 60+ components)
- Best accessibility defaults
- Heavier bundle size
- Structured, bordered, corporate feel
- Best for information-dense interfaces

**Modern (DaisyUI/Tailwind)**
- Utility-first CSS, smaller JS footprint
- Glass effects, gradients, rounded corners
- Contemporary visual feel
- Good for consumer-facing products
- Requires Tailwind CSS setup

**Rustic (Vanilla)**
- Zero external UI library dependency
- Smallest bundle size
- Minimal visual decoration
- Good for embed contexts or performance-sensitive scenarios
- May have fewer advanced features per component

---

## Error Handling

Every engine component is wrapped in `EngineErrorBoundary`:

- If a specific engine fails to load, the boundary catches the error
- If `fallbackEngine` is configured, it tries that engine instead
- The `onError` callback is invoked for logging/monitoring
- The boundary prevents a single broken component from crashing the page

```ts
createEngineComponent<ButtonProps>('Button', loaders, {
  fallbackEngine: 'rustic',
  onError: (error) => errorTracker.capture(error),
});
```
