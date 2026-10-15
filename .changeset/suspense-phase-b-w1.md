---
"@rottay/design-system": major
---

Engine components hydrate without a factory Suspense boundary, and a new
`@rottay/design-system/server/static-markup` subpath carries the supported
legacy-SSR renderer.

- **Hydration boundary.** A server-rendered or hydrated engine component
  renders without the factory's `<Suspense>`, so the server and hydrating
  trees have the same shape. A fresh client mount, or a change of
  implementation (engine or custom pack), keeps a per-instance boundary, its
  mount and its state.
- **SSR error isolation moves to the nearest ancestor boundary.** A
  suspension or server render error in a server-rendered instance reaches the
  nearest ancestor `<Suspense>`; client render and load errors are still
  caught by the per-instance error boundary.
- **Legacy synchronous SSR (breaking).** `renderToString` /
  `renderToStaticMarkup` of an engine component whose implementation has not
  loaded now throws React's "suspended while responding to synchronous input"
  error. It used to return the empty fallback silently. Use
  `renderResolvedStaticMarkup` from the new subpath, which resolves the
  code-split implementations first and returns the same markup.
- **New subpath (additive).** `./server/static-markup` exports
  `renderResolvedStaticMarkup(node): Promise<string>`. It needs React >= 19
  (`react-dom/static`; on React 18 the subpath fails to load with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`), resolves `React.lazy` payloads only (it is
  not a data-suspense renderer) and renders in two passes. `./server` is
  unchanged. It is the supported legacy-SSR path in the major. Until its
  first consumer is measured it carries controlled adoption: the consumer
  contract lists it as a `lab` door owned by the open receiver WO-CON-09, and
  an application opts in with
  `allowSubpaths: ['./server/static-markup']` for the
  `no-unsanctioned-ds-subpath` lint rule.
- The engine router calls 3 more React hooks per render
  (`useSyncExternalStore` + 2 `useRef`), and a hydrated engine component
  renders once more right after hydration (the hydration latch forces one
  synchronous re-render; the rendered subtree renders again with fresh
  props).

```contract-diff
subpath ./server/static-markup — added; the supported legacy-SSR renderer, kept off ./server because it imports react-dom/server and react-dom/static
export ./server/static-markup#renderResolvedStaticMarkup — added
export ./eslint#PUBLISHED_SUBPATHS — changed; adds the `./server/static-markup` row (lab, owner WO-CON-09)
```
