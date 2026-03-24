# Hooks Catalog - Rottay Design System

> Last updated: 2026-03-23

## Overview

The Rottay Design System provides 40+ hooks organized into 16 categories. All hooks are exported from `@rottay/design-system` and are client-side (`'use client'`).

**Source**: `ui-design-system/packages/core/src/hooks/`

---

## Engine Hooks

Access and control the active UI rendering engine.

**Source**: `hooks/engine/index.ts`

| Hook | Returns | Throws? | Description |
|------|---------|---------|-------------|
| `useEngine()` | `{ engine: EngineName, setEngine }` | Yes (outside EngineProvider) | Access current engine and switch at runtime. Strict -- requires EngineProvider. |
| `useEngineContext()` | `{ engine: EngineName, setEngine }` | No | Alias for `useEngine` (backward compat). The lenient version lives in `runtime/engines/EngineProvider.tsx` and returns a default context outside providers. |

```tsx
const { engine, setEngine } = useEngine();
setEngine('modern'); // Switch to DaisyUI engine
```

---

## Tenant Hooks

Access tenant configuration, branding, and multi-tenant settings.

**Source**: `hooks/tenant/index.ts`

| Hook | Returns | Throws? | Description |
|------|---------|---------|-------------|
| `useTenant()` | `{ config: TenantConfig, vertical?: VerticalPreset }` | Yes (outside TenantProvider) | Access complete tenant settings, branding, features, plan. Fail-fast design. |
| `useTenantBranding(options)` | `{ tenantConfig, loading }` | No | 2-step branding resolution: instant from session data, then async full config fetch. Eliminates ~200 lines of copypaste per app. |
| `useCreateTenant()` | - | No | React state wrapper for `createTenantConfig()` factory. For dynamic tenant creation flows. |

### useTenantBranding Options

```typescript
interface UseTenantBrandingOptions {
  tenantSlug: string;
  session: TenantBrandingSession | null;
  vertical: VerticalKey;
  brandingEndpoint?: string; // default: '/api/public/tenant-branding'
}
```

### Tenant Utilities (co-located)

| Export | Type | Description |
|--------|------|-------------|
| `resolvePersonalityPreset(preset)` | Function | Maps a personality keyword ('formal', 'neutral', etc.) to full `PersonalityTokens` |
| `createTenantConfig(config)` | Function | Factory for building a complete `TenantConfig` from minimal input |

---

## Theme Hooks

Control light/dark mode and theme variants.

**Source**: `hooks/theme/index.ts` (shim, canonical location: `runtime/theming/useTheme.ts`)

| Hook | Returns | Description |
|------|---------|-------------|
| `useTheme()` | `{ theme, setTheme }` | Access and toggle theme variant (light/dark/base). |
| `useThemeContext()` | Same as useTheme | Full context access (backward compat alias). |

```tsx
const { theme, setTheme } = useTheme();
setTheme(theme === 'light' ? 'dark' : 'light');
```

---

## Token Hooks

Access resolved design tokens with engine differentiation and tenant overrides.

**Source**: `hooks/tokens/index.ts`

| Hook | Returns | Description |
|------|---------|-------------|
| `useTokens()` | `DesignTokens` | Full token object: colors, spacing, typography, borderRadius, shadows, surface, motion, glass, gradients, transitions, overlay, personality. |
| `useOptionalTokens()` | `DesignTokens | null` | Non-throwing variant. Returns `null` outside provider tree. For shared components. |

### Granular Sub-Hooks

Focused hooks that subscribe to specific token slices, avoiding unnecessary re-renders.

**Source**: `hooks/tokens/sub-hooks.ts`

| Hook | Returns (Type) | Description |
|------|---------------|-------------|
| `useColorTokens()` | `ColorTokens` | Primary, secondary, neutral, semantic color scales |
| `useSpacingTokens()` | `SpacingTokens` | Density-scaled spacing array |
| `useMotionTokens()` | `MotionTokenSlice` | Motion tokens + animation personality |
| `useTypographyTokens()` | `TypographyTokenSlice` | Base typography + personality typography |
| `useCardTokens()` | `CardTokens` | Card personality (elevation, hover, padding) |
| `useAccentTokens()` | `AccentTokens` | Accent personality (bar, icon, badge, divider) |

### Token Resolution Pipeline

```
Engine tokens (classic/modern/rustic base)
  -> Product profile overrides
    -> Tenant token overrides

Personality:
  DEFAULT_PERSONALITY -> Vertical -> Product profile -> Tenant
```

---

## Feature Hooks

Tenant-scoped feature flag gating.

**Source**: `runtime/features/` (re-exported from hooks index)

| Hook | Returns | Description |
|------|---------|-------------|
| `useFeatures()` | `string[]` | All enabled features for the current tenant |
| `useHasFeature(name)` | `boolean` | Check if a specific feature is enabled |
| `useFeatureContext()` | Full context | Complete feature context access |

```tsx
const hasExport = useHasFeature('export-pdf');
if (hasExport) return <ExportButton />;
```

---

## Product Profile Hooks

Access the resolved product profile (vertical UX preset).

**Source**: `hooks/product-profile/index.ts`

| Hook | Returns | Description |
|------|---------|-------------|
| `useProductProfile()` | `{ profile: ProductProfile }` | Access the current product profile (engine selection, token overrides, personality defaults). |

---

## Responsive Hooks

Viewport detection and breakpoint-based responsive values.

**Source**: `hooks/responsive/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useMediaQuery(query)` | `boolean` | Subscribe to a CSS media query |
| `useBreakpoints()` | `UseBreakpointsResult` | Check current breakpoint: `{ isMobile, isTablet, isDesktop }` |
| `useResponsiveValue(config)` | `T` | Get responsive values: `{ base: 1, md: 2, lg: 4 }` |

When a `ResponsiveProvider` is in the tree, `useBreakpoints` and `useResponsiveValue` read from shared context (zero extra subscriptions). Without a provider, they fall back to per-component `matchMedia` listeners.

---

## Accessibility Hooks

Keyboard navigation and screen reader support.

**Source**: `hooks/a11y/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useKeyboardNavigation(options)` | `UseKeyboardNavigationResult` | Arrow key navigation for lists, menus, grids |
| `useAriaAnnounce()` | `UseAriaAnnounceResult` | Screen reader announcements via aria-live regions |

---

## Shortcut Hooks

Global keyboard shortcut registration and display.

**Source**: `hooks/shortcuts/`

| Hook/Export | Returns | Description |
|-------------|---------|-------------|
| `useGlobalShortcut(key, handler)` | - | Register a single global keyboard shortcut |
| `useGlobalShortcuts(shortcuts)` | - | Register multiple global keyboard shortcuts |
| `useRegisteredShortcuts()` | `ShortcutDefinition[]` | Get all registered shortcuts (for overlay display) |
| `ShortcutProvider` | Component | Context provider for the shortcut registry |
| `formatShortcutKey(key)` | `string` | Format shortcut key strings for display |

---

## Data Hooks

Fetching, exporting, optimistic updates, PDF generation.

**Source**: `hooks/data/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useSurfaceQuery(options)` | `UseSurfaceQueryReturn` | Data fetching for Surface components with pagination, sorting, filtering |
| `useTableExport(options)` | `UseTableExportReturn` | Export table data to CSV, JSON, or clipboard |
| `useOptimisticUpdate(options)` | `UseOptimisticUpdateReturn` | Optimistic mutations with automatic rollback |
| `usePdfExport(options)` | `UsePdfExportReturn` | PDF-ready content generation (print, structured data, HTML export) |

---

## Form Hooks

Auto-save, draft persistence, change tracking.

**Source**: `hooks/form/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useAutoSave(options)` | `UseAutoSaveReturn` | Debounced auto-save with status tracking (`idle`, `saving`, `saved`, `error`) |
| `useDraftSave(options)` | `UseDraftSaveReturn` | localStorage draft persistence with TTL expiration |
| `useFormDiff(options)` | `UseFormDiffReturn` | Compare original and current form data with deep diffing |

---

## State Hooks

Undo/redo history and persisted layout preferences.

**Source**: `hooks/state/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useUndoRedo(options)` | `UseUndoRedoReturn` | State management with full undo/redo history |
| `useLayoutPreference(options)` | `UseLayoutPreferenceReturn` | Persisted layout preferences (sidebar, columns, density) |

---

## Routing Hooks

URL query parameter synchronization.

**Source**: `hooks/routing/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useRouterState(options)` | `UseRouterStateReturn` | Sync surface state with URL query params. Framework-agnostic. |

---

## Command Registry Hooks

Command palette / action registry.

**Source**: `hooks/commands/`

| Hook/Export | Returns | Description |
|-------------|---------|-------------|
| `CommandRegistryProvider` | Component | Context provider for the command registry |
| `useRegisterCommands(commands)` | - | Register commands (auto-unregister on unmount) |
| `useCommands()` | `UseCommandsReturn` | Get all commands with search and execute capabilities |
| `useExecuteCommand(id)` | - | Execute a specific command by ID |

---

## AI Hooks

Streaming text and chat interfaces.

**Source**: `hooks/ai/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useStreamingText(options)` | `UseStreamingTextReturn` | Streaming text generation with token-by-token updates |
| `useChat(options)` | `UseChatReturn` | Multi-message chat interface with history |

---

## Notification Hooks

Preference matrix management.

**Source**: `hooks/notifications/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useNotificationPreferences(options)` | `UseNotificationPreferencesReturn` | Manage notification preferences matrix (categories x channels) |

---

## Drag and Drop Hooks

HTML5 DnD sortable lists (zero dependencies).

**Source**: `hooks/dnd/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useSortableList(options)` | `UseSortableListReturn` | Generic sortable list via HTML5 DnD API. Returns container and item prop getters. |

---

## Search Hooks

Multi-source search with debounce, grouping, and highlights.

**Source**: `hooks/search/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useGlobalSearch(options)` | `UseGlobalSearchReturn` | Multi-source search with result grouping and highlight segments |

---

## Component-Specific Hooks

**Source**: `hooks/components/`

| Hook | Returns | Description |
|------|---------|-------------|
| `useCollapseTokens(options)` | `UseCollapseTokensResult` | Token resolution specific to the Collapse component |

---

## Import Convention

All hooks are available from the top-level package:

```tsx
import {
  useEngine,
  useTenant,
  useTheme,
  useTokens,
  useFeatures,
  useBreakpoints,
  // ... etc
} from '@rottay/design-system';
```

Engine hooks (`useEngine`, `useEngineContext`) are exported from `runtime/engines/` to avoid circular imports. They are available at the top-level package export but not re-exported through the hooks barrel.

---

## Hook Category File Map

| Category | Source Directory |
|----------|----------------|
| Engine | `hooks/engine/` |
| Tenant | `hooks/tenant/` |
| Tenant Branding | `hooks/tenant/branding/` |
| Theme | `hooks/theme/` (shim -> `runtime/theming/useTheme.ts`) |
| Tokens | `hooks/tokens/` |
| Features | `runtime/features/` |
| Product Profile | `hooks/product-profile/` |
| Responsive | `hooks/responsive/` |
| Accessibility | `hooks/a11y/` |
| Shortcuts | `hooks/shortcuts/` |
| Data | `hooks/data/` |
| Form | `hooks/form/` |
| State | `hooks/state/` |
| Routing | `hooks/routing/` |
| Commands | `hooks/commands/` |
| AI | `hooks/ai/` |
| Notifications | `hooks/notifications/` |
| DnD | `hooks/dnd/` |
| Search | `hooks/search/` |
| Components | `hooks/components/` |
