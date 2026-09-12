---
"@rottay/design-system": major
---

WO-INV-04 (audit F-46, F-35 in part). One responsive mechanism: a
`ResponsiveValue` declared on one ladder, projected to governed CSS channels,
resolved by one hook over one external store.

**The defect.** `useBreakpoints` and `useResponsiveValue` called their
provider-less fallback — itself a hook — only when no `ResponsiveProvider` was
present, so mounting a provider around a live consumer changed that consumer's
hook order: a Rules-of-Hooks violation at the centre of the responsive runtime.
`useResponsive()` without a provider returned a frozen phone constant forever.
Six owners derived the viewport independently (the runtime itself, the chrome
layout helpers, the adaptive-posture hook, the workspace state hook, the surface
builders' defaults and SearchCommandBar's own `matchMedia(959px)`), and two
incompatible `ResponsiveValue` contracts existed side by side. Every responsive
primitive rendered a `<style dangerouslySetInnerHTML>` per instance — eleven of
them under `primitives/inputs`, none with a `nonce`, so a strict CSP dropped the
responsive size of every input, button and select on the page.

**What replaces it.** `ResponsiveValue` is one type with one pure resolution
(`resolveResponsiveValue`), so a viewport consumer and a container-measured one
share a cascade. `generateResponsiveCSS` returns CHANNELS — one `--_ds-rsp-*`
custom property per declared breakpoint plus a `data-ds-responsive` token list —
and one static sheet under `foundation/responsive/channels` owns every `@media`
prelude. `Show`, `Hide` and `ResponsiveSlot` stamp one attribute against a second
static sheet instead of injecting a `useId`-scoped stylesheet each. Every hook is
a projection of `useResponsive()`, which reads the shared `useSyncExternalStore`
snapshot, so a provider-less consumer reports the real viewport and the store
attaches its seven `matchMedia` listeners once for the process rather than once
per subscriber.

`react-hooks/rules-of-hooks` is now `error` across `src/**` and measures zero;
`100vh`/`100vw` are gone in favour of `dvh`/`dvw`; 31 of the 32 unnamed
`@container` queries now name their container, and the one that remains is
documented in place as meaning "the nearest ancestor container".

**Breaking.** `AdaptiveConfig` and `useAdaptivePosture` are removed rather than
kept beside the new mechanism. A posture is declared as
`SurfaceAdaptivePosture` — a `ResponsiveValue` whose steps merge MOBILE-FIRST —
and resolved by the pure `resolveSurfacePosture(declaration, breakpoint)`. A
config written as `{ desktop, tablet, phone }` keeps its key names (they are
aliases on the same ladder) but its cascade direction inverts: restate at the
step you mean rather than relying on desktop to fall through.
`useResponsiveValue` takes `ResponsiveValue<T>` and answers `T | undefined`.
`WorkspaceResponsiveConfig.mobileBreakpoint` is a ladder step, not a pixel count.

```contract-diff
export .#useResponsiveValue — changed; takes ResponsiveValue<T>, returns T | undefined
export .#ResponsiveValueConfig — removed; collapsed into the one ResponsiveValue contract
export .#usePhoneBreakpoint — added; the phone projection of the one snapshot
export ./contracts/surfaces#AdaptiveConfig — removed; superseded by SurfaceAdaptivePosture
export ./contracts/surfaces#SurfaceAdaptivePosture — added; a posture per breakpoint on the one ladder
export .#AdaptiveConfig — removed; superseded by SurfaceAdaptivePosture
export .#SurfaceAdaptivePosture — added; a posture per breakpoint on the one ladder
export .#useAdaptivePosture — removed; resolution is pure, the caller supplies the step
export .#UseAdaptivePostureResult — removed; with the hook
export .#resolvePosture — removed; superseded by resolveSurfacePosture
export .#resolveSurfacePosture — added; pure posture resolution at one breakpoint
export .#toBreakpoint — removed; deviceAliasForBreakpoint answers the same question on the one ladder
export .#Breakpoint — removed; the three device bands are ResponsiveDeviceAlias
export .#surfaceStackingValue — added; the stacking ladder a split layout declares
export .#surfaceColumnsValue — added; the column ladder a grid layout declares
export .#SurfaceResponsiveVisualConfig — added; stackOnMobile/stackOnTablet, moved down to the chrome tier
export .#ResponsiveValue — changed; one contract: scalar or breakpoint object, `xs`/`base` and the device aliases on one ladder
export .#WorkspaceResponsiveConfig — changed; `mobileBreakpoint` is a ladder step, not a pixel count
export .#CollectionWorkspaceProps — changed; `adaptive` takes SurfaceAdaptivePosture
export .#GuidedDraftFormSurfaceProps — changed; `adaptive` takes SurfaceAdaptivePosture
export .#DataTablePatternProps — changed; `mobileBreakpoint` documents the CONTAINER width, and the viewport fallback reads the one snapshot
export ./contracts/surfaces#SurfaceAdaptivePosture — added; the ./contracts/surfaces subpath publishes the new name in place of AdaptiveConfig
```
