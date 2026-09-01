# Vertical Manifest Contract

This file defines the extra typed contract that should exist in every app.

## Required files

```text
src/vertical/
  index.ts
  manifest.ts
  profile/
  recipes/
    shell.ts
    page-chrome.ts
    workspace.ts
    dashboard.ts
    settings.ts
  content/
    index.ts
  iconography/
    index.ts
```

## `manifest.ts`

This should answer:

- `id`
- `name`
- `tone`
- `shapeProfile`
- `motionProfile`
- `densityProfile`
- `shellMode`
- `workspaceMode`
- `dashboardMode`
- `settingsMode`
- `copyMode`
- `iconographyMode`

## Example conceptual shape

```ts
export interface VerticalManifest {
  id: 'platform' | 'evnto' | 'bithire';
  tone: 'control-room' | 'editorial-network' | 'lively-venue';
  shapeProfile: 'sharp' | 'balanced' | 'rounded';
  motionProfile: 'precise' | 'calm' | 'expressive';
  densityProfile: 'compact' | 'comfortable' | 'airy';
  shellMode: 'ops' | 'professional' | 'hospitality';
  workspaceMode: 'operational' | 'profile-first' | 'roster-live';
  dashboardMode: 'signal-board' | 'talent-intelligence' | 'event-pulse';
  settingsMode: 'admin-console' | 'business-panel' | 'operator-panel';
  copyMode: 'technical' | 'professional' | 'lively';
  iconographyMode: 'system-sharp' | 'business-clean' | 'playful-rounded';
}
```

## Recipe contracts

Recipes should not be arbitrary objects.

They should expose typed, bounded decisions.

## `recipes/shell.ts`

Should define:

- sidebar emphasis
- topbar density
- command/search placement
- header action layout
- mobile shell behavior hooks into DS shell contract

## `recipes/page-chrome.ts`

Should define:

- header type
- subtitle treatment
- breadcrumb density
- action rail position

## `recipes/workspace.ts`

Should define:

- search placement
- filter rail position
- bulk action posture
- preview rail posture
- identity-column emphasis
- row action style

## `recipes/dashboard.ts`

Should define:

- hero style
- metric emphasis
- widget framing
- board density
- alert/live rail posture

## `recipes/settings.ts`

Should define:

- admin density
- section grouping
- explanatory copy posture
- advanced override exposure posture

## Feature route metadata

Every feature should expose route metadata that vertical recipes can consume.

Example:

```ts
export interface FeatureRouteMeta {
  section: string;
  pageIntent: 'workspace' | 'detail' | 'dashboard' | 'settings' | 'auth';
  headerMode?: 'command' | 'editorial' | 'operator';
  workspaceKind?: 'table' | 'board' | 'profile-list';
  emptyStateKind?: 'technical' | 'professional' | 'lively';
}
```

## Why this matters

Without this contract:

- identity stays vague
- files improvise
- apps drift visually

With this contract:

- identity is deliberate
- behavior stays centralized
- customization stays bounded

