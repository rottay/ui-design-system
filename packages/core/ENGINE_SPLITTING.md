# Engine Code-Splitting Strategy

## Current State

The build produces separate engine entry points via Vite library mode. Engine implementations
are loaded dynamically through `createEngineComponent` using `import()`. The `package.json`
already declares subpath exports for `./engines/classic`, `./engines/modern`, and
`./engines/rustic`. A fourth engine (`custom`) supports pack-scoped component registration
for white-label scenarios.

## Entry Points

Consumers only pay for the engine they use:

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

## Migration Status

### Phase 1: Add exports to package.json -- DONE

Engine subpath exports (`./engines/classic`, `./engines/modern`, `./engines/rustic`) are declared
in `package.json` and point to built output in `dist/engines/`.

### Phase 2: Move engine implementations to separate bundles -- DONE

Vite library mode produces separate output chunks for each engine. The main entry keeps only
the engine routing infrastructure.

### Phase 3: Update createEngineComponent to use new paths -- DONE

Engine loader functions use `import()` from the subpath exports. Unused engines do not ship.

### Phase 4: Deprecate bundled engines in main entry -- PENDING

Remove any residual engine implementation code from the main entry point. Add deprecation
warnings if any consumer still imports engine components from the root path.

## Bundle Size Reference

| Scenario | Approximate Size (gzipped) |
|----------|---------------------------|
| Main entry only (no engine loaded) | ~120 KB |
| Main + one active engine | ~220 KB |
| All engines loaded | ~400 KB |

Actual sizes depend on tree-shaking effectiveness and shared dependencies between engines.
See `PERFORMANCE_BUDGET.md` for enforced CI limits.

## Build Infrastructure

- **Vite library mode** uses multiple entry points via `build.lib.entry` (object form) in `vite.config.ts`.
- **package.json exports** declares subpath exports for `./tokens`, `./i18n`, `./icons`, and all three engine paths.
- **Dynamic `import()`** is the loading mechanism in `createEngineComponent`.
- **No breaking API changes** -- components are always imported from `@rottay/design-system`. Engine loading is an internal detail.

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
