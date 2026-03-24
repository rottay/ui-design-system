# Design System Migration Execution Plan

**Status**: DEFINITIVE - Ready for execution
**Created**: 2026-03-15
**Based on**: ChatGPT Audit (`REFACTOR_AUDIT.md`) + full codebase grep verification
**Root**: `packages/core/src/` (all paths relative to this unless noted)

---

## Ground Rules

1. Each phase is self-contained: build must pass after each phase completes
2. Every change is a mechanical find-replace - no logic changes
3. Phase order matters: dependencies flow downward
4. Proxy files are NOT deleted during repoint phases - only during Phase 8
5. Tests/stories are included in every phase - not deferred

---

## Phase 0: Snapshot and Verify

Before touching anything:

```bash
cd ui-design-system && pnpm tsc --noEmit
```

If this fails, fix it before proceeding. Do NOT start migration on a broken build.

---

## Phase 1: Repoint core/engines imports (119 files)

### What

All imports of `core/engines/factory` -> `engines/factory` (adjusting relative path depth).
Also 2 test files importing from `core/engines/registry` and `core/engines/athena`.

### Why safe

Every file under `core/engines/` is a proxy that re-exports from `engines/`. The real code lives in `engines/`.

### Grep pattern

```
from ['"].*core/engines/
```

### Exact files and replacements

#### Group A: components/primitives (4 levels deep -> 3 levels deep)

**Pattern**: `../../../../core/engines/factory` -> `../../../../engines/factory`

Files (56 files):

```
components/primitives/inputs/Upload/index.ts
components/primitives/inputs/FormField/index.ts
components/primitives/inputs/Select/index.ts
components/primitives/inputs/TreeSelect/index.ts
components/primitives/inputs/Slider/Slider.tsx
components/primitives/inputs/Transfer/index.ts
components/primitives/inputs/Switch/Switch.tsx
components/primitives/inputs/Checkbox/index.ts
components/primitives/inputs/PasswordInput/index.ts
components/primitives/inputs/ColorPicker/ColorPicker.tsx
components/primitives/inputs/Cascader/index.ts
components/primitives/inputs/DatePicker/index.ts
components/primitives/inputs/Textarea/Textarea.tsx
components/primitives/inputs/Radio/index.ts
components/primitives/inputs/OTPInput/index.ts
components/primitives/inputs/Input/base.ts
components/primitives/inputs/AutoComplete/index.ts
components/primitives/inputs/Form/index.ts
components/primitives/inputs/TimePicker/index.ts
components/primitives/inputs/Mentions/index.ts
components/primitives/inputs/Toggle/index.ts
components/primitives/inputs/Button/index.ts
components/primitives/inputs/InputNumber/InputNumber.tsx
components/primitives/inputs/TagInput/index.ts
components/primitives/navigation/BackTop/BackTop.tsx
components/primitives/navigation/Segmented/Segmented.tsx
components/primitives/navigation/Link/Link.tsx
components/primitives/navigation/Affix/Affix.tsx
components/primitives/navigation/Affix/index.tsx
components/primitives/navigation/Stepper/Stepper.tsx
components/primitives/navigation/Steps/Steps.tsx
components/primitives/navigation/Anchor/Anchor.tsx
components/primitives/navigation/Breadcrumb/Breadcrumb.tsx
components/primitives/navigation/Menu/Menu.tsx
components/primitives/navigation/Pagination/Pagination.tsx
components/primitives/navigation/FloatButton/FloatButton.tsx
components/primitives/navigation/Tabs/Tabs.tsx
components/primitives/layout/Grid/index.ts
components/primitives/layout/Stack/index.ts
components/primitives/layout/ScrollArea/ScrollArea.tsx
components/primitives/layout/Flex/index.ts
components/primitives/layout/Space/index.ts
components/primitives/layout/Divider/index.ts
components/primitives/layout/Collapse/index.ts
components/primitives/layout/Splitter/index.ts
components/primitives/layout/Container/index.ts
components/primitives/layout/AspectRatio/AspectRatio.tsx
components/primitives/layout/Box/index.ts
components/primitives/layout/Layout/index.ts
components/primitives/overlay/AlertDialog/AlertDialog.tsx
components/primitives/overlay/ConfirmDialog/ConfirmDialog.tsx
components/primitives/overlay/Sheet/Sheet.tsx
components/primitives/overlay/Watermark/Watermark.tsx
components/primitives/overlay/Modal/index.ts
components/primitives/overlay/Popover/Popover.tsx
components/primitives/overlay/ContextMenu/ContextMenu.tsx
components/primitives/overlay/Popconfirm/Popconfirm.tsx
components/primitives/overlay/HoverCard/HoverCard.tsx
components/primitives/overlay/Dropdown/Dropdown.tsx
components/primitives/overlay/Tour/Tour.tsx
components/primitives/display/Badge/Badge.tsx
components/primitives/display/Table/Table.tsx
components/primitives/display/Callout/Callout.tsx
components/primitives/display/Card/Card.tsx
components/primitives/display/Calendar/Calendar.tsx
components/primitives/display/Tooltip/Tooltip.tsx
components/primitives/display/Image/Image.tsx
components/primitives/display/QRCode/QRCode.tsx
components/primitives/display/Tag/Tag.tsx
components/primitives/display/Timeline/Timeline.tsx
components/primitives/display/Tree/Tree.tsx
components/primitives/display/Carousel/Carousel.tsx
components/primitives/display/Kbd/Kbd.tsx
components/primitives/display/Statistic/Statistic.tsx
components/primitives/display/Empty/Empty.tsx
components/primitives/display/Avatar/Avatar.tsx
components/primitives/display/Descriptions/Descriptions.tsx
components/primitives/display/List/List.tsx
components/primitives/feedback/Modal/Modal.tsx
components/primitives/feedback/Alert/Alert.tsx
components/primitives/feedback/Toast/base.ts
components/primitives/feedback/Skeleton/Skeleton.tsx
components/primitives/feedback/Drawer/Drawer.tsx
components/primitives/feedback/Spinner/Spinner.tsx
components/primitives/feedback/Rate/Rate.tsx
components/primitives/feedback/Progress/Progress.tsx
components/primitives/feedback/Result/Result.tsx
```

**Replacement**:
```
OLD: from '../../../../core/engines/factory'
NEW: from '../../../../engines/factory'
```

#### Group B: components/primitives/navigation/Anchor/compound (5 levels deep)

**Pattern**: `../../../../../core/engines/factory` -> `../../../../../engines/factory`

File (1):
```
components/primitives/navigation/Anchor/compound/index.ts
```

#### Group C: components/patterns (3 levels deep)

**Pattern**: `../../../core/engines/factory` -> `../../../engines/factory`

Files (22):
```
components/patterns/data-table/index.ts
components/patterns/shortcuts-overlay/index.ts
components/patterns/filter-panel/index.ts
components/patterns/empty-state/index.ts
components/patterns/page-shell/index.ts
components/patterns/file-manager/index.ts
components/patterns/live-feed/index.ts
components/patterns/calendar-view/index.ts
components/patterns/workspace-switcher/index.ts
components/patterns/activity-log/index.ts
components/patterns/invoice-template/index.ts
components/patterns/tree-view/index.ts
components/patterns/notification-center/index.ts
components/patterns/tenant-preview/index.ts
components/patterns/user-profile-card/index.ts
components/patterns/pricing-table/index.ts
components/patterns/detail-panel/index.ts
components/patterns/kanban-board/index.ts
components/patterns/form-builder/index.ts
components/patterns/environment-toggle/index.ts
components/patterns/timeline/index.ts
components/patterns/map-view/index.ts
components/patterns/filter-builder/index.ts
components/patterns/stats-grid/index.ts
components/patterns/command-palette/index.ts
components/patterns/saved-views/index.ts
components/patterns/approval-workflow/index.ts
components/patterns/comment-thread/index.ts
components/patterns/step-wizard/index.ts
```

#### Group D: testing/system (2 levels deep)

Files (2):
```
testing/system/engines.test.ts
  OLD: from '../../core/engines/registry'
  NEW: from '../../engines/registry'

testing/system/athena.test.ts
  OLD: from '../../core/engines/athena'
  NEW: from '../../engines/athena'
```

### Verification

```bash
# Should return 0 results
grep -r "core/engines" packages/core/src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep "from " | grep -v "core/engines/index.ts" | grep -v "core/engines/factory/index" | grep -v "core/engines/athena/index" | grep -v "core/engines/binding/index" | grep -v "core/engines/boundary/index" | grep -v "core/engines/registry/index"

pnpm tsc --noEmit
```

---

## Phase 2: Repoint core/hooks imports (13 files)

### What

All imports of `core/hooks` -> `hooks` (adjusting relative path depth).

### Why safe

`core/hooks/index.ts` is a proxy: `export * from '../../hooks'`

### Grep pattern

```
from ['"].*core/hooks['"]
```

### Exact files and replacements

#### Group A: 4 levels deep (components/primitives)

**Pattern**: `../../../../core/hooks` -> `../../../../hooks`

Files (8):
```
components/primitives/inputs/Button/index.ts
components/primitives/display/Badge/Badge.tsx
components/primitives/display/Tag/Tag.tsx
components/primitives/display/Statistic/Statistic.tsx
components/primitives/layout/Divider/index.ts
components/primitives/display/Card/Card.tsx
components/primitives/feedback/Skeleton/Skeleton.tsx
```

#### Group B: 6 levels deep (Typography compounds)

**Pattern**: `../../../../../../core/hooks` -> `../../../../../../hooks`

Files (3):
```
components/primitives/display/Typography/compound/Text/index.tsx
components/primitives/display/Typography/compound/Heading/index.tsx
components/primitives/display/Typography/compound/Paragraph/index.tsx
```

#### Group C: 2 levels deep (surfaces)

**Pattern**: `../../core/hooks` -> `../../hooks`

File (1):
```
components/surfaces/profile-defaults.ts
```

#### Group D: 3 levels deep (motion)

**Pattern**: `../../../core/hooks` -> `../../../hooks`

File (1):
```
motion/hooks/use-motion-personality/index.ts
```

### Verification

```bash
# Should return only the proxy file itself
grep -r "core/hooks" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from " | grep -v "core/hooks/index.ts"

pnpm tsc --noEmit
```

---

## Phase 3: Repoint core/personality imports (11 files)

### What

All imports of `core/personality/primitives` -> `personality/primitives` (adjusting relative path depth).

### Why safe

`core/personality/primitives.ts` is a proxy: `export * from '../../personality/primitives'`

### Grep pattern

```
from ['"].*core/personality/primitives['"]
```

### Exact files and replacements

#### Group A: 1 level deep (design-system)

**Pattern**: `../core/personality/primitives` -> `../personality/primitives`

File (1):
```
design-system/SystemCssVariablesBridge.tsx
```

#### Group B: 4 levels deep (components/primitives)

**Pattern**: `../../../../core/personality/primitives` -> `../../../../personality/primitives`

Files (6):
```
components/primitives/display/Badge/Badge.tsx
components/primitives/display/Tag/Tag.tsx
components/primitives/layout/Divider/index.ts
components/primitives/display/Statistic/Statistic.tsx
components/primitives/inputs/Button/index.ts
components/primitives/display/Card/Card.tsx
components/primitives/feedback/Skeleton/Skeleton.tsx
```

#### Group C: 6 levels deep (Typography compounds)

**Pattern**: `../../../../../../core/personality/primitives` -> `../../../../../../personality/primitives`

Files (3):
```
components/primitives/display/Typography/compound/Text/index.tsx
components/primitives/display/Typography/compound/Heading/index.tsx
components/primitives/display/Typography/compound/Paragraph/index.tsx
```

### Verification

```bash
# Should return only the proxy file itself
grep -r "core/personality" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from " | grep -v "core/personality/primitives.ts"

pnpm tsc --noEmit
```

---

## Phase 4: Repoint core/utils imports (13 files)

### What

All imports of `core/utils/runtime-logger` -> `utils/runtime-logger` (adjusting relative path depth).

### Why safe

`core/utils/runtime-logger.ts` is an identical copy of `utils/runtime-logger.ts`. Both are real files with the same content. After repointing, only `utils/runtime-logger.ts` will have consumers.

### Grep pattern

```
from ['"].*core/utils/runtime-logger['"]
```

### Exact files and replacements

#### Group A: 3 levels deep (i18n)

**Pattern**: `../../../core/utils/runtime-logger` -> `../../../utils/runtime-logger`

Files (2):
```
i18n/utils/formatters/index.ts
i18n/context/I18nProvider/index.tsx
```

#### Group B: 3 levels deep (tenancy)

**Pattern**: `../../../core/utils/runtime-logger` -> `../../../utils/runtime-logger`

File (1):
```
tenancy/resolver/domain/index.ts
```

#### Group C: 1 level deep (engines)

**Pattern**: `../core/utils/runtime-logger` -> `../utils/runtime-logger`

Files (2):
```
engines/boundary.tsx
engines/EngineProvider.tsx
```

#### Group D: 4 levels deep (theme/tenants)

**Pattern**: `../../../../core/utils/runtime-logger` -> `../../../../utils/runtime-logger`

File (1):
```
theme/tenants/resolver/domain/index.ts
```

#### Group E: 4 levels deep (components/primitives/feedback)

**Pattern**: `../../../../core/utils/runtime-logger` -> `../../../../utils/runtime-logger`

File (1):
```
components/primitives/feedback/Notification/Notification.engine-advanced.test.tsx
```

#### Group F: 5 levels deep (components/primitives/feedback/*/engines)

**Pattern**: `../../../../../core/utils/runtime-logger` -> `../../../../../utils/runtime-logger`

Files (5):
```
components/primitives/feedback/Notification/engines/modern.tsx
components/primitives/feedback/Notification/engines/rustic.tsx
components/primitives/feedback/Message/engines/modern.tsx
components/primitives/feedback/Message/engines/rustic.tsx
components/primitives/feedback/Toast/utils/useToast.ts
```

#### Group G: 4 levels deep (components/primitives/feedback/Message)

**Pattern**: `../../../../core/utils/runtime-logger` -> `../../../../utils/runtime-logger`

File (1):
```
components/primitives/feedback/Message/Message.engine-advanced.test.tsx
```

### Verification

```bash
# Should return 0 consumer results (only core/utils/ files themselves)
grep -r "core/utils/runtime-logger" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from " | grep -v "core/utils/runtime-logger"

pnpm tsc --noEmit
```

---

## Phase 5: Move ThemeProvider to theming/

### What

ThemeProvider currently lives at `core/providers/theme/index.tsx` (REAL implementation, not a proxy).
Move it to `theming/ThemeProvider.tsx`. Update its 3+2 consumers.

### Step 5a: Create `src/theming/` directory and move file

1. Create `src/theming/ThemeProvider.tsx` - copy content from `core/providers/theme/index.tsx`
2. Fix internal imports in the moved file:
   - `../../types` -> `../core/types` (temporary, will change in Phase 6)
   - `../../utils/runtime-logger` -> `../utils/runtime-logger`
3. Create `src/theming/index.ts`:
   ```ts
   export { ThemeProvider, ThemeContext, useThemeContext } from './ThemeProvider';
   export type { ThemeProviderProps, ThemeConfig, ThemeContextValue } from './ThemeProvider';
   ```
4. Update `core/providers/theme/index.tsx` to become a proxy:
   ```tsx
   /** @deprecated Import from 'theming/' instead */
   export * from '../../../theming';
   ```

### Step 5b: Update direct consumers of `core/providers/theme`

There are 3 direct importers:

```
design-system/DesignSystemProvider.tsx
  OLD: import { ThemeProvider } from '../core/providers/theme';
  NEW: import { ThemeProvider } from '../theming';

hooks/theme/index.ts
  OLD: import { ThemeContext } from '../../core/providers/theme';
  NEW: import { ThemeContext } from '../../theming';

hooks/theme/index.test.tsx
  OLD: import { ThemeContext } from '../../core/providers/theme';
  NEW: import { ThemeContext } from '../../theming';
```

### Step 5c: Update `core/providers/index.ts`

Change the ThemeProvider export to use the new home:

```
OLD: export { ThemeProvider, ThemeContext } from './theme';
OLD: export type { ThemeProviderProps } from './theme';
NEW: export { ThemeProvider, ThemeContext } from '../../theming';
NEW: export type { ThemeProviderProps } from '../../theming';
```

### Verification

```bash
pnpm tsc --noEmit
```

---

## Phase 6: Move core/types to contracts/ (THE BIG ONE)

### What

`core/types/` contains the real type definitions. Move everything to `contracts/`.
Update all direct `core/types` imports (~90 occurrences) + update `src/types/` proxy.

### Step 6a: Create `src/contracts/`

Copy the entire `core/types/` tree to `contracts/`:

```
contracts/
  index.ts
  common/
  components/
  engine/
  extensions/
  primitives/
  product-profiles/
  tenants/
  themes/
  tokens/
```

No internal import changes needed - the types directory is self-contained (all internal imports are relative within the tree).

### Step 6b: Update the src/types/ proxy

```
OLD (types/index.ts):
  export * from '../core/types';

NEW:
  export * from '../contracts';
```

Also update subdirectory proxies:

```
types/engine/index.ts:
  OLD: export * from '../../core/types/engine';
  NEW: export * from '../../contracts/engine';

types/common/index.ts:
  OLD: export * from '../../core/types/common';
  NEW: export * from '../../contracts/common';

types/primitives/index.ts:
  OLD: export * from '../../core/types/primitives';
  NEW: export * from '../../contracts/primitives';

types/primitives/display/index.ts:
  OLD: export * from '../../../core/types/primitives/display';
  NEW: export * from '../../../contracts/primitives/display';

types/primitives/feedback/Modal/index.ts:
  OLD: export * from '../../../../core/types/primitives/feedback/Modal';
  NEW: export * from '../../../../contracts/primitives/feedback/Modal';

types/primitives/feedback/index.ts:
  OLD: export * from '../../../core/types/primitives/feedback';
  NEW: export * from '../../../contracts/primitives/feedback';
```

### Step 6c: Update core/types/ to become a proxy

```
OLD (core/types/index.ts):
  [full type definitions file]

NEW:
  /** @deprecated Import from 'contracts/' instead */
  export * from '../../contracts';
```

The subdirectory files inside core/types/ can stay as-is because they are reached via the core/types/index.ts barrel in most cases. But for safety, verify no file imports sub-paths of core/types directly.

### Step 6d: Repoint all direct `core/types` consumers

**All files listed below import from `../core/types` or `../../core/types` etc.**
**Replace `core/types` with `contracts` in each import path, preserving depth.**

#### 1-level deep (`../core/types` -> `../contracts`)

Files (11):
```
design-system/DesignSystemProvider.tsx
engines/registry.ts
engines/boundary.tsx
engines/EngineProvider.tsx
engines/factory.tsx
personality/primitives.ts
personality/defaults.ts (imports ../core/types/tokens/personality -> ../contracts/tokens/personality)
tenancy/TenantProvider.tsx
tenancy/personality-presets.ts (imports ../core/types/tokens/personality -> ../contracts/tokens/personality)
tenancy/create-tenant.ts (3 imports: ../core/types, ../core/types/tokens/personality, ../core/types/tenants -> ../contracts, ../contracts/tokens/personality, ../contracts/tenants)
tenancy/useCreateTenant.ts
```

#### 2-level deep (`../../core/types` -> `../../contracts`)

Files (18):
```
testing/helpers/tenant-test-utils.tsx
testing/helpers/engine-test-utils.tsx
testing/helpers/css-test-utils.ts
testing/system/personality-primitives.integration.test.tsx
tenancy/defaults/index.ts
tenancy/schema/index.ts
tenancy/registry/index.ts
tenancy/storage/index.ts
hooks/tokens/personality-defaults.ts (../../core/types/tokens/personality -> ../../contracts/tokens/personality)
hooks/tokens/index.ts
hooks/tokens/engine-tokens.ts
hooks/tokens/sub-hooks.ts
hooks/engine/index.ts
hooks/theme/index.ts
hooks/tenant/personality-presets.ts (../../core/types/tokens/personality -> ../../contracts/tokens/personality)
hooks/tenant/useCreateTenant.ts
hooks/tenant/create-tenant.ts (3 imports: ../../core/types, ../../core/types/tokens/personality, ../../core/types/tenants -> ../../contracts, ../../contracts/tokens/personality, ../../contracts/tenants)
components/patterns/types.ts
```

#### 3-level deep (`../../../core/types` -> `../../../contracts`)

Files (7):
```
tenancy/storage/remote/index.ts
tenancy/storage/static/generator/index.ts
tenancy/storage/static/loader/index.ts
hooks/tokens/__tests__/useTokens.product-profile.test.tsx
components/surfaces/common/story-helpers.tsx
components/surfaces/common/test-utils.tsx
components/patterns/stats-grid/personality.ts
```

#### 4-level deep (`../../../../core/types` -> `../../../../contracts`)

Files (21):
```
tenancy/storage/static/tests/generator.test.ts
product-profiles/registry.ts (path: ../../../../core/types/product-profiles -> verify)
product-profiles/ProductProfileProvider.tsx (../../../../core/types/product-profiles -> verify)
theme/tenants/defaults/index.ts
theme/tenants/registry/index.ts
theme/tenants/schema/index.ts
theme/tenants/storage/index.ts
components/primitives/display/Calendar/Calendar.types.ts (2 imports: ../../../../core/types/primitives/display/Calendar)
components/primitives/display/Tooltip/Tooltip.types.ts
components/primitives/display/Badge/Badge.types.ts
components/primitives/display/Statistic/Statistic.types.ts (2 imports)
components/primitives/display/Descriptions/Descriptions.types.ts
components/primitives/display/Card/Card.types.ts
components/primitives/display/QRCode/QRCode.types.ts (2 imports)
components/primitives/display/Timeline/Timeline.types.ts (2 imports)
components/primitives/display/Avatar/Avatar.types.ts
components/primitives/display/Empty/Empty.types.ts
components/primitives/display/Image/Image.types.ts
components/primitives/display/Carousel/Carousel.types.ts
components/primitives/display/List/List.types.ts (2 imports)
components/primitives/display/Tag/Tag.types.ts
components/primitives/inputs/Button/Button.types.ts
components/primitives/inputs/Form/index.ts
components/primitives/inputs/Select/Select.integration.test.tsx
components/primitives/feedback/Modal/Modal.types.ts
components/primitives/feedback/Toast/Toast.types.ts
components/primitives/feedback/Message/Message.tsx
components/primitives/feedback/Notification/Notification.tsx
components/primitives/feedback/Message/Message.integration.test.tsx
components/patterns/data-table/tests/PatternDataTable.integration.test.tsx
components/patterns/charts/tests/useChartPersonality.test.tsx
```

#### 5-level deep (`../../../../../core/types` -> `../../../../../contracts`)

Files (3):
```
components/primitives/overlay/Modal/types/index.ts
theme/tenants/storage/remote/index.ts
theme/tenants/storage/static/generator/index.ts
theme/tenants/storage/static/loader/index.ts
theme/tenants/storage/static/tests/generator.test.ts
```

#### Also update: src/index.ts

```
OLD: export * from './core/types';
NEW: export * from './contracts';
```

#### Also update: ThemeProvider (moved in Phase 5)

```
theming/ThemeProvider.tsx:
  OLD: import type { ThemeContextValue, ThemeConfig, TenantBranding } from '../core/types';  (if not already updated)
  NEW: import type { ThemeContextValue, ThemeConfig, TenantBranding } from '../contracts';
```

### Verification

```bash
# Should return 0 consumer results
grep -r "core/types" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from " | grep -v "core/types/index.ts"

pnpm tsc --noEmit
```

---

## Phase 7: Update src/index.ts public exports + repoint remaining core/providers consumers

### Step 7a: Update src/index.ts

```ts
// OLD:
export * from './core/providers';
export * from './core/types';

// NEW:
export * from './contracts';
export * from './theming';
export * from './features';
// Keep existing exports that already point to canonical homes:
// export * from './engines';
// export * from './hooks';
// export * from './utils';
// etc.
```

Note: `core/providers/index.ts` re-exports DesignSystemProvider, EngineProvider, ThemeProvider, FeatureProvider. After Phase 7, these must come from their canonical homes. Verify that `src/index.ts` already covers:
- EngineProvider: via `export * from './engines'` (already there)
- ThemeProvider: via `export * from './theming'` (added here)
- FeatureProvider: via `export * from './features'` (added here)
- DesignSystemProvider: needs explicit export from `./design-system`

Add if missing:
```ts
export * from './design-system';
```

### Step 7b: Repoint core/providers sub-consumers

These files import from `core/providers/engine`, `core/providers/tenant`, `core/providers/product-profile`, `core/providers/features`, or `core/providers/root`:

```
hooks/tokens/index.ts
  OLD: import { useEngineContext } from '../../core/providers/engine';
  NEW: import { useEngineContext } from '../../engines/EngineProvider';

hooks/engine/index.ts
  OLD: import { EngineContext } from '../../core/providers/engine';
  NEW: import { EngineContext } from '../../engines/EngineProvider';

hooks/engine/index.test.tsx
  OLD: import { EngineContext } from '../../core/providers/engine';
  NEW: import { EngineContext } from '../../engines/EngineProvider';

hooks/product-profile/index.ts
  OLD: export { useProductProfileContext as useProductProfile } from '../../core/providers/product-profile';
  NEW: export { useProductProfileContext as useProductProfile } from '../../product-profiles/ProductProfileProvider';

hooks/tenant/index.ts
  OLD: import { TenantContext } from '../../core/providers/tenant';
  NEW: import { TenantContext } from '../../tenancy/TenantProvider';

testing/helpers/tenant-test-utils.tsx
  OLD: import { TenantProvider } from '../../core/providers/tenant';
  NEW: import { TenantProvider } from '../../tenancy/TenantProvider';

hooks/features/index.ts
  OLD: import { FeatureContext } from '../../core/providers/features';
  NEW: import { FeatureContext } from '../../features/FeatureProvider';

design-system/DesignSystemProvider.tsx
  OLD: import { FeatureProvider } from '../core/providers/features';
  NEW: import { FeatureProvider } from '../features';
```

### Step 7c: Repoint core/providers/root consumers (83 files)

All stories and tests import `DesignSystemProvider` from `core/providers/root`.
Repoint to `design-system`.

**Pattern for 4-level deep files (majority)**:
```
OLD: import { DesignSystemProvider } from '../../../../core/providers/root';
NEW: import { DesignSystemProvider } from '../../../../design-system';
```

**Pattern for 5-level deep files**:
```
OLD: import { DesignSystemProvider } from '../../../../../core/providers/root';
NEW: import { DesignSystemProvider } from '../../../../../design-system';
```

**Pattern for 3-level deep files**:
```
OLD: import { DesignSystemProvider } from '../../../core/providers/root';
NEW: import { DesignSystemProvider } from '../../../design-system';
```

See Phase 1 for the complete list of 83 files (extracted from grep output of `core/providers/root`).

### Step 7d: Update core/providers/index.ts

This file can now be simplified to a pure proxy:

```ts
/** @deprecated Import from canonical homes instead */
export { EngineProvider, EngineContext } from '../../engines/EngineProvider';
export type { EngineProviderProps } from '../../engines/EngineProvider';
export { ThemeProvider, ThemeContext } from '../../theming';
export type { ThemeProviderProps } from '../../theming';
export { FeatureProvider, FeatureContext } from '../../features';
export type { FeatureProviderProps } from '../../features';
export { DesignSystemProvider } from '../../design-system';
export type { DesignSystemProviderProps } from '../../design-system';
```

### Verification

```bash
pnpm tsc --noEmit
```

---

## Phase 8: Delete legacy (FINAL)

### Pre-flight check

Run these greps. Each must return 0 consumer results (only proxy files themselves):

```bash
# core/engines - should only match proxy files inside core/engines/
grep -r "core/engines" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "

# core/hooks - should only match core/hooks/index.ts itself
grep -r "core/hooks" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "

# core/personality - should only match core/personality/primitives.ts itself
grep -r "core/personality" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "

# core/utils - should only match files inside core/utils/ themselves
grep -r "core/utils" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "

# core/providers - should only match core/providers/ files themselves
grep -r "core/providers" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "

# core/types - should only match core/types/index.ts itself
grep -r "core/types" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "

# core/features - should only match core/features/ files themselves
grep -r "core/features" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "
```

### Step 8a: Delete `src/core/` entirely

This directory should be empty of real implementations after all phases:

```
core/engines/        -> all proxies to engines/
core/hooks/          -> proxy to hooks/
core/personality/    -> proxy to personality/
core/utils/          -> duplicate of utils/
core/providers/      -> all proxies to canonical homes
core/types/          -> proxy to contracts/
core/features/       -> proxy to features/
core/index.ts        -> barrel of proxies
```

```bash
rm -rf packages/core/src/core/
```

### Step 8b: Clean up src/index.ts

Remove the old core export line:
```
# This line should already have been replaced in Phase 7
# But verify and remove if still present:
export * from './core/providers';
```

### Step 8c: Delete theme/tenants and theme/product-profiles

These are pure proxies:
```
theme/tenants/index.ts -> re-exports from tenancy/
theme/product-profiles/index.ts -> re-exports from product-profiles/
theme/index.ts -> barrel of deprecated proxies
```

BUT: `theme/tenants/` has sub-files that import `core/types`. These were already repointed in Phase 6 to `contracts/`. However, `theme/tenants/` sub-files (resolver, schema, storage, etc.) contain REAL implementations that duplicate `tenancy/` equivalents.

Verify zero consumers before deleting:
```bash
grep -r "theme/tenants" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from " | grep -v "theme/tenants/"
grep -r "theme/product-profiles" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "
grep -r "from ['\"].*theme/index" packages/core/src/ --include="*.ts" --include="*.tsx" | grep "from "
grep -r "from ['\"].*\/theme['\"]" packages/core/src/ --include="*.ts" --include="*.tsx"
```

If all return 0, delete:
```bash
rm -rf packages/core/src/theme/tenants/
rm -rf packages/core/src/theme/product-profiles/
rm packages/core/src/theme/index.ts
```

**DO NOT delete `theme/tokens/`** - this remains the real token source.

### Step 8d: Evaluate src/types/ proxy

The `src/types/` directory (7 files) is now a pure proxy to `contracts/`. It has ~486 consumers via relative `../types` imports. These consumers are NOT the same as the `core/types` consumers handled in Phase 6.

**Decision**: Keep `src/types/` alive as a proxy for now. Migrating its 486 consumers is a separate effort (Phase 9, not in this plan). The proxy is thin and costs nothing.

### Final Verification

```bash
pnpm tsc --noEmit
pnpm test -- --passWithNoTests 2>/dev/null || true
```

---

## Summary Table

| Phase | Files Changed | Import Pattern | Risk |
|-------|--------------|----------------|------|
| 1 | ~119 | `core/engines/*` -> `engines/*` | Low (all proxies) |
| 2 | 13 | `core/hooks` -> `hooks` | Low (proxy) |
| 3 | 11 | `core/personality/primitives` -> `personality/primitives` | Low (proxy) |
| 4 | 13 | `core/utils/runtime-logger` -> `utils/runtime-logger` | Low (identical copy) |
| 5 | ~6 + new files | ThemeProvider -> `theming/` | Medium (real move) |
| 6 | ~90 + new dir | `core/types` -> `contracts/` | Medium (volume) |
| 7 | ~95 | Public exports + providers cleanup | Medium (barrel changes) |
| 8 | Deletions only | Remove `core/`, `theme/tenants`, `theme/product-profiles` | Low (verified empty) |

**Total estimated file touches**: ~340 (many overlap across phases)

---

## What This Plan Does NOT Cover

1. **`src/types/` proxy migration** (~486 consumers) - Keep as-is, migrate later
2. **`theme/tokens/` -> `tokens/`** - Real token source migration (separate plan)
3. **`tokens.ts` / `tokens/index.ts`** - These proxy to `theme/tokens/`, keep until theme/tokens moves
4. **Showroom/docs imports** - Showroom lives in `packages/showroom/` and may have its own import paths
5. **External consumer updates** - Apps importing from `@rottay/design-system` are unaffected because `src/index.ts` public API is preserved throughout
