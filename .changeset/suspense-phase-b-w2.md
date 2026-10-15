---
"@rottay/design-system": minor
---

Engine components gain a rendered-families warming channel. It ships closed:
the warming behavior is inert until the joint validation matrix rules, and
rendered output is unchanged.

- **What the channel does once opened.** The outermost
  `DesignSystemProvider` collects the engine families a server render reached
  (`displayName@engine`; custom packs are never listed) and emits them after
  its children in one inert
  `<script type="application/json" data-ds-rendered-families>`. Nested
  providers add to the same list and never emit. On the client each engine
  component registers its loaders, and a listed family's own `loader()` is
  called once, fire-and-forget, before hydration needs it. A failed warm never
  blocks the page and never fails the lazy, which loads on its own call
  (measured under webpack; native-ESM loaders are not claimed). A family first
  rendered inside a boundary that suspends on the server is not listed.
- **Closed by default.** With the channel closed no list is collected, no
  script is rendered and nothing is warmed.
- **Hook cost, closed or open.** The engine router calls one more React hook
  per render (`useContext` of the collector), and each `DesignSystemProvider`
  mounts one channel component that calls two (`useContext` + `useState`).
- No public export, prop or subpath changes.
