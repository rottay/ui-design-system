# Engine Loading and Module Boundaries

This document describes the current build and loading contract for
`@rottay/design-system`.

## Public contract

Consumers import components from `@rottay/design-system`. There are no public
`@rottay/design-system/engines/*` subpaths. Engine implementation paths are an
internal detail and must not appear in application imports.

The package exposes focused boundaries for server utilities, icon packs,
marks, pictograms, charts, motion, effects, spatial capability, ESLint rules,
commercial tooling and CSS. Their source boundaries live under
`src/entrypoints/`; canonical implementation code stays under
`foundation/`, `infrastructure/`, `graphics/`, `ui/` or `tooling/`.

## Component-level engine loading

An engine-backed component registers up to three physical loaders:

```tsx
createEngineComponent<ButtonProps>('Button', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
```

`createEngineComponent` resolves the active engine and lazy-loads that physical
implementation. A component does not create a fake forwarding loader for an
implementation it does not have.

`custom` is not a fourth physical bundle. It resolves a pack-scoped component
registration and delegates missing registrations to the configured physical
fallback (`classic` by default).

## Build shape

Vite library mode declares only real package subpaths as top-level entries and
uses Rollup `preserveModules` for ESM and CJS output. This retains source-module
boundaries for tree-shaking without inventing public engine entrypoints.

```text
src/
  index.ts
  entrypoints/
    charts/{access,renderers,spec}/
    graphics/{effects,marks,motion,pictograms,spatial}/
    icons/{bithire,corpus,foundation,identity,intelligence,operations}/
    commercial/
    eslint/
    server/
  ui/<tier>/<group>/<owner>/engines/{classic,modern,rustic}/index.tsx
```

CSS is built separately into full, vertical and supplemental modern-engine
exports. An app imports exactly one full or vertical bundle; `styles/modern`
is supplemental and is not a standalone component stylesheet.

## Supplier boundaries

React, Ant Design, marks, charts, motion and compatibility suppliers remain
external according to `vite.config.ts`. The focused semantic icon entry embeds
its pinned Phosphor SSR glyph corpus to avoid leaking the supplier's packaging
defect to consumers. The package-root entry cannot reach the focused icon
entrypoint.

Use `rottay-ds-supplier-honesty` in a consuming app to determine the exact peer
suppliers reached by its imported DS symbols.

## Runtime flow

```text
App renders a DS component
  -> component facade reads the active engine
  -> custom registration resolves, or a physical loader is selected
  -> React.lazy imports that component's engine implementation
  -> error boundary/fallback policy handles a failed loader
```

Switching engines can load another component implementation on demand. The
public component type and import remain stable.

## Validation

The authoritative entry list is `vite.config.ts` plus `package.json.exports`.
Release validation must prove that each declared subpath exists in the packed
artifact and that no undocumented engine subpath is advertised. Bundle-size
claims come from the current analyzer output and performance budget, not from
hard-coded estimates in documentation.
