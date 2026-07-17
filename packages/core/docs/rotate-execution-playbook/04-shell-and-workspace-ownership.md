# Shell And Workspace Ownership

## Core Problem

The shell is still app-owned.

Evidence:

- [AppLayout](/Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/index.tsx)
- [shell-metrics.ts](/Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/shell-metrics.ts)
- [AppSidebar](/Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/sidebar/index.tsx)
- [AppTopbar](/Users/daniel/Developer/Rottay/app-platform/src/composition/components/_shared/layouts/app-layout/topbar/index.tsx)

## Decision

Create a DS-owned shell contract.

The app should provide:

- navigation tree
- product identity
- account/menu actions
- route context
- optional workspace actions

The DS should own:

- sidebar width and collapsed width
- header height and inset logic
- breadcrumb/title/action layout
- content offset and shell spacing
- shell chrome and surface hierarchy

## Workspace Contract

The DS should also own the macro framing for:

- page header
- workspace header
- command/search bar
- table or board surface
- bottom utility or mode rail

## Implementation Targets

- promote sidebar into a DS shell primitive or structure
- promote topbar into a DS product header primitive or structure
- unify page/workspace padding into DS presets
- remove route-conditional clamp math from app layout where possible

## Acceptance Criteria

- `app-platform` no longer does shell width math directly
- the same shell contract can be consumed by `app-platform`, `app-evnto`, and `app-bithire`
- page chrome reads like one system instead of layered local recipes

