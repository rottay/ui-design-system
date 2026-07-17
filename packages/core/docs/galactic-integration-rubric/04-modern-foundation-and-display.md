# Modern Foundation and Display

## Foundation Verdict

Modern foundation is one of the strongest parts of the system.

Best-in-class primitives:

- `Box`
- `Stack`
- `Grid`
- `Container`

Why they score well:

- spacing is routed through `--ds-spacing-*`
- radius is routed through `--ds-radius-*`
- elevation/shadow is routed through `--ds-elevation-*`
- the renderers avoid collapsing back into Tailwind-only spacing/radius/shadow classes

Key files:

- `ui-design-system/packages/core/src/ui/primitives/layout/Box/engines/modern/index.tsx`
- `ui-design-system/packages/core/src/ui/primitives/layout/Stack/engines/modern/index.tsx`
- `ui-design-system/packages/core/src/ui/primitives/layout/Grid/engines/modern/index.tsx`
- `ui-design-system/packages/core/src/ui/primitives/layout/Container/engines/modern/index.tsx`

## Display Verdict

Modern display is the opposite story: visually usable, contractually uneven.

Biggest gaps:

- `Card`
- `Carousel`
- `Image`
- `Statistic`
- `Descriptions`
- `QRCode`
- `Badge`
- `Typography`

## Display Scorecard

| Primitive | Score | Main issue |
|---|---:|---|
| Card | 4 | Renderer bypasses canonical token/bridge path. |
| Carousel | 4 | Arrows and dots do not use canonical carousel token bridge. |
| Image | 4 | Declared `--ds-image-*` surface is not the real runtime owner. |
| Statistic | 4 | Main render bypasses `--ds-statistic-*`. |
| Descriptions | 4 | Root bridge is present; row/label/content bridge is mostly not. |
| QRCode | 5 | Token namespace is fragmented between component, theme, and renderer. |
| Badge | 6 | Mostly tokenized, still uses parallel inline/engine choices. |
| Typography | 6 | Size/color are decent; editorial metrics are still too local. |

## Core Diagnosis

The common pattern is this:

1. A component token contract exists.
2. `modern/theme.css` also defines a bridge surface.
3. The Modern renderer then emits a third styling path with inline values or local utility classes.

That leaves the system looking functional but not fully governed by its own contracts.

## What To Fix First

### Wave D1 - Bridge/Renderer Alignment

Targets:

- `Card`
- `Carousel`
- `Image`
- `Statistic`
- `Descriptions`
- `QRCode`

Rule:

Each primitive needs one canonical appearance path.

- either emit the bridge classes and let theme CSS own the surface
- or move fully to an inline token path

But do not keep parallel token stories alive.

### Wave D2 - Token Namespace Convergence

Targets:

- `QRCode`
- `Badge`
- `Card`
- `Image`

Rule:

One primitive, one variable surface.

### Wave D3 - Typography Micro-Metrics

Move these onto DS tokens or narrow the contract:

- heading tracking
- heading line-height
- paragraph rhythm
- badge micro-typography

## Area Score

| Domain | Score |
|---|---:|
| Foundation | 8.0 |
| Display | 5.0 |
| Combined | 6.5 |
