# Shell, Layout, and Navigation

## Score

- `4.4/10`

## Core Problem

The shell is too app-owned and too visually cautious.

## Findings

1. `app-platform` still owns major shell geometry.
   Evidence:
   - `app-platform/src/composition/components/_shared/layouts/app-layout/index.tsx`
   - `app-platform/src/composition/components/_shared/layouts/app-layout/shell-metrics.ts`

2. The sidebar is competent but not iconic.
   Evidence:
   - `app-platform/src/composition/components/_shared/layouts/app-layout/sidebar/index.tsx`
   - `ui-design-system/packages/core/src/ui/primitives/navigation/Menu/engines/modern/index.tsx`

3. The topbar is structurally weak.
   Evidence:
   - `app-platform/src/composition/components/_shared/layouts/app-layout/topbar/index.tsx`

4. The page shell spacing cadence is inconsistent.
   Evidence:
   - route-level `clamp(...)`
   - many bespoke local pixel values in shell/sidebar/dashboard code

## Why Users Feel It

- navigation does not feel like a strong product spine
- topbar feels like scaffolding
- page chrome adds weight without adding clarity
- there is no unmistakable shell identity

## What Must Change

- move more shell ownership into DS structures
- define one shell rhythm system for padding, gutters, topbar, and sidebar
- strengthen active nav states and section hierarchy
- turn the topbar into a real context bar, not a search strip
