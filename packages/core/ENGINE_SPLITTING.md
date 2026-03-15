# Engine Code-Splitting Strategy

## Current State

All 3 engines (classic/Ant Design, modern/DaisyUI, rustic/Vanilla) bundle into a single `index.js` entry point. Even if an application only uses the `classic` engine, all code for `modern` and `rustic` ships in the bundle. This creates unnecessary bloat and slower initial load times for every consumer.

## Proposed Solution

Create separate entry points per engine so consumers only pay for what they use:

- `@rottay/design-system` -- Main entry point. Includes engine routing, providers, hooks, tokens, and the component factory, but no engine implementation code.
- `@rottay/design-system/engines/classic` -- Ant Design engine implementations.
- `@rottay/design-system/engines/modern` -- DaisyUI/Tailwind engine implementations.
- `@rottay/design-system/engines/rustic` -- Vanilla/lightweight engine implementations.

## How It Works

1. `createEngineComponent` already uses dynamic `import()` to load engine implementations at runtime.
2. Engine loaders (the functions passed to `createEngineComponent`) would be updated to point at the new dedicated entry points instead of importing from the monolithic bundle.
3. Only the active engine's code downloads when the component first renders.
4. Fallback engines lazy-load on demand if the user switches engines at runtime.

### Resolution Flow

```
App renders <Button>
  --> createEngineComponent resolves active engine (e.g. "classic")
  --> dynamic import("@rottay/design-system/engines/classic")
  --> only classic Button implementation loads
  --> fallback engine stays unloaded until needed
```

## Migration Path

### Phase 1: Add exports to package.json (non-breaking)

Add the three engine subpath exports to `package.json`. These initially point to placeholder/empty modules. No consumer changes required -- existing imports continue to work via the main entry point.

### Phase 2: Move engine implementations to separate bundles

Refactor internal build (Vite library mode) to produce separate output chunks for each engine. The main entry keeps only the engine routing infrastructure. Each engine entry exports all component implementations for that engine.

### Phase 3: Update createEngineComponent to use new paths

Modify the engine loader functions to `import()` from the new subpath exports instead of from the main bundle. This is the actual split -- after this point, unused engines no longer ship.

### Phase 4: Deprecate bundled engines in main entry

Remove engine implementation code from the main entry point entirely. Add deprecation warnings if any consumer still imports engine components from the root path.

## Estimated Bundle Impact

| Scenario | Size |
|----------|------|
| Current (all engines in one bundle) | ~400KB total |
| After split: main entry only | ~120KB |
| After split: main + one active engine | ~220KB |
| **Total reduction** | **~45%** |

These are approximate gzipped sizes. Actual savings depend on tree-shaking effectiveness and shared dependencies between engines.

## Prerequisites

- **Vite library mode** supports multiple entry points via `build.lib.entry` (object form).
- **package.json exports** already uses the subpath pattern for `./tokens`, `./i18n`, `./icons`.
- **Dynamic `import()`** is already the loading mechanism in `createEngineComponent`.
- **No breaking API changes** -- components continue to be imported from `@rottay/design-system`. The engine loading is an internal implementation detail.

## File Structure After Split

```
src/
  index.ts              # Main entry (providers, hooks, factory, tokens)
  engines/
    classic/
      index.ts          # All Ant Design component implementations
      Button.tsx
      Input.tsx
      ...
    modern/
      index.ts          # All DaisyUI component implementations
      Button.tsx
      Input.tsx
      ...
    rustic/
      index.ts          # All Vanilla component implementations
      Button.tsx
      Input.tsx
      ...
dist/
  index.js              # Main bundle (~120KB)
  engines/
    classic.js           # Classic engine (~100KB)
    classic.d.ts
    modern.js            # Modern engine (~100KB)
    modern.d.ts
    rustic.js             # Rustic engine (~80KB)
    rustic.d.ts
```

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Circular dependencies between main and engine entries | Engine entries import only types from main; runtime deps flow one-way (main --> engine) |
| SSR hydration mismatch from async loading | Engine loader already handles SSR via synchronous fallback; no change needed |
| Type inference breaks for engine-specific props | Each engine entry re-exports the same component interface types |
| Consumer confusion about which import to use | Consumers always import from `@rottay/design-system` -- engine loading is internal |
