# Underutilized Capabilities

## Executive Read

The DS is already successful as a primitive library.

The underutilization is concentrated in the **stateful and page-scale layers**:

- workspace state
- form lifecycle
- search/command/shortcut systems
- config-driven surfaces
- record/detail structures

## Ranked Opportunities

### 1. Collection workspace spine

Why it matters:

- this is the biggest missed leverage across all three apps
- list/search/filter/saved-view/selection/preview behavior is still partly rebuilt in app code

DS proof:

- [collection contract](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/foundation/contracts/collection.ts)
- [useCollectionWorkspace](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/foundation/hooks/useCollectionWorkspace.ts)
- [CollectionWorkspaceSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/workspace/collection-workspace/index.tsx)
- [SavedViewsMenu](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/workspace/saved-views-menu/index.tsx)
- [SearchCommandBar](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/workspace/search-command-bar/index.tsx)

App proof:

- [BitHire use-list-controller](/Users/daniel/Developer/Rottay/app-bithire/src/core/hooks/use-list-controller/index.ts)
- [Evnto use-list-controller](/Users/daniel/Developer/Rottay/app-evnto/src/core/hooks/use-list-controller/index.ts)
- [Platform entity-table-workspace](/Users/daniel/Developer/Rottay/app-platform/src/ui/tables/entity-table-workspace/index.tsx)

### 2. Form lifecycle and guided draft flows

Why it matters:

- long create/edit flows are among the most expensive and most fragile screens
- BitHire in particular has rebuilt this stack locally

DS proof:

- [useAutoSave](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/form/auto-save/index.ts)
- [useDraftSave](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/form/draft-save/index.ts)
- [useFormDiff](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/form/form-diff/index.ts)
- [GuidedDraftFormSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/forms/guided-draft-form/index.tsx)

App proof:

- [BitHire use-auto-save](/Users/daniel/Developer/Rottay/app-bithire/src/core/hooks/use-auto-save/index.ts)
- [BitHire draft recovery banner](/Users/daniel/Developer/Rottay/app-bithire/src/ui/forms/draft-recovery-banner/index.tsx)
- [BitHire form status bar](/Users/daniel/Developer/Rottay/app-bithire/src/ui/forms/form-status-bar/index.tsx)

### 3. Command/search/shortcut infrastructure

Why it matters:

- discoverability and power-user speed should be cross-app, not re-authored app by app

DS proof:

- [search hooks](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/search/index.ts)
- [shortcuts hooks](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/shortcuts/index.ts)
- [PatternCommandPalette](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/navigation/command-palette/index.ts)
- [PatternShortcutsOverlay](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/navigation/shortcuts-overlay/index.ts)

App proof:

- [Platform global-search](/Users/daniel/Developer/Rottay/app-platform/src/ui/global-search/index.tsx)
- [BitHire keyboard shortcuts hook](/Users/daniel/Developer/Rottay/app-bithire/src/core/hooks/use-keyboard-shortcuts/index.tsx)
- [Evnto command palette](/Users/daniel/Developer/Rottay/app-evnto/src/ui/command-palette/index.tsx)

### 4. App-facing export/data hooks

Why it matters:

- low-risk standardization target
- repeated table export plumbing still exists locally

DS proof:

- [useTableExport](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/data/table-export/index.ts)
- [data hooks barrel](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/hooks/data/index.ts)

App proof:

- [Platform local use-table-export](/Users/daniel/Developer/Rottay/app-platform/src/core/hooks/use-table-export/index.ts)

### 5. Config-driven surfaces

Why it matters:

- surfaces are where the DS can remove the most page-level duplication

DS proof:

- [ListSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/data/list/index.tsx)
- [DetailSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/data/detail/index.tsx)
- [FormSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/forms/form/index.tsx)
- [DashboardSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/data/dashboard/index.tsx)

App proof:

- [Evnto staffing list config](/Users/daniel/Developer/Rottay/app-evnto/src/features/venue-operations/staffing/screens/list/config.tsx)
- [Platform permissions list-config](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/permissions/screens/list-config.tsx)
- [BitHire candidates list](/Users/daniel/Developer/Rottay/app-bithire/src/features/candidates/screens/list/index.tsx)

### 6. Header and record structures outside Platform

Why it matters:

- Platform already gets real value from these
- BitHire and Evnto still maintain parallel header/detail systems

DS proof:

- [FormHeader](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/headers/form/index.tsx)
- [DetailHeader](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/headers/detail/index.tsx)
- [FormSections](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/record/form-sections/index.tsx)

### 7. Motion

Why it matters:

- the package has real motion depth, but product usage is sparse and often showroom-led

Proof:

- [motion index](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/motion/index.ts)

### 8. Icons entrypoint

Why it matters:

- Platform in particular appears to use `0 / 19` icon exports from the dedicated DS icons entrypoint
- that usually means visual language is drifting away from the package’s intended icon boundary

Proof:

- [icons entrypoint](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/icons.ts)

## Bottom Line

The DS has already won the primitive battle.

The next quality jump comes from standardizing:

1. workspace state
2. create/edit lifecycle
3. search/command systems
4. page-scale surfaces

Those four areas are where the repo is still spending too much product energy on plumbing.
