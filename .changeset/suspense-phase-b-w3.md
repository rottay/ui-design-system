---
"@rottay/design-system": minor
---

The page shells gain DS-owned ancestor `<Suspense>` boundaries for server
render failures inside page content. They ship dark: with the placement off,
rendered output is unchanged.

- **What a placement does once admitted.** A server suspension or render error
  in page content reaches the nearest DS boundary instead of failing the whole
  response; the boundary is client-rendered on hydration. Two placements are
  wired. `content-slot` wraps the content slot of `AppShell` (`main`),
  `PageShellSurface` (`body`) and `WorkspaceShell` (its content box).
  `structure-regions` keeps those slot boundaries and adds one around
  `SurfaceSectionCard` section content, so a failure at a content position
  outside every finer region still lands in a boundary, never in the page.
  The `WorkspaceShell` particle-field `<Suspense>` is unchanged.
- **Fallback shape.** The fallback is the region element itself,
  rendered empty and `aria-busy`, with the same tag, class and `data-part`, so
  the skin rules that size the slot also size the fallback. It drops `id` and
  `tabIndex`. Real-content geometry (held block size) is owed to the joint
  matrix; only the skin-box-rule parity is proven here.
- **Dark by default.** The placement is the internal
  `CONTENT_BOUNDARY_PLACEMENT` (`components/structures/foundation/content-boundary/policy`),
  shipped as `off`; an unknown value also resolves to `off`. Only the joint
  validation matrix ruling changes it. With it off, each shell returns its
  slot element as before: no wrapper, no extra component and no hook.
- No public export, prop or subpath changes.
