/**
 * @fileoverview Public React Hooks Facade - Rottay Design System
 * @description Stable package facade for React hooks owned by the design
 * system's runtime capabilities and UI component owners.
 *
 * ## Ownership model (frozen decision 4, updated Wave X3)
 *
 * This barrel is the **public hook surface** of the design system. It
 * contains two categories of hooks:
 *
 * 1. **Core-integrated hooks** (used by DS components internally):
 *    `useTokens`/`useColorTokens`/etc. (token pipeline), `useBreakpoints`/
 *    `useMediaQuery`/`useResponsiveValue` (responsive). These hooks are real
 *    infrastructure consumed by DS primitives, patterns, and structures.
 *
 * 2. **App-facing utilities** (exported for app consumption, zero DS-internal
 *    consumers): a11y, dnd, state, form, search, routing, data, ai,
 *    commands, notifications. These are domain-agnostic utilities that apps
 *    wire into their own state management. Surfaces receive data as props,
 *    they do NOT call data hooks internally.
 *
 * New code should import from the package root (`@rottay/design-system`).
 *
 * @remarks
 * The Rottay Design System provides several categories of hooks:
 *
 * **Engine Hooks:**
 * - `useEngineContext` - Access the current UI rendering engine
 *
 * **Theme Hooks:**
 * - `useTheme` / `useThemeContext` - Access and control theme variants
 *
 * **Tenant Hooks:**
 * - `useTenant` / `useTenantContext` - Access tenant configuration
 *
 * **Feature Hooks:**
 * - `useFeatures` - Get all enabled features
 * - `useHasFeature` - Check if specific feature is enabled
 * - `useFeatureContext` - Full feature context access
 *
 * **Token Hooks:**
 * - `useTokens` - Access design tokens (colors, spacing, etc.)
 *
 * **Responsive Hooks:**
 * - `useMediaQuery` - Subscribe to CSS media queries
 * - `useBreakpoints` - Check current breakpoint (mobile, tablet, desktop)
 * - `useResponsiveValue` - Get responsive values based on breakpoint
 *
 * **Accessibility Hooks:**
 * - `useKeyboardNavigation` - Arrow key navigation for lists, menus, grids
 * - `useAriaAnnounce` - Screen reader announcements via aria-live regions
 *
 * **Shortcut Hooks:**
 * - `useGlobalShortcut` - Register a single global keyboard shortcut
 * - `useGlobalShortcuts` - Register multiple global keyboard shortcuts
 * - `useRegisteredShortcuts` - Get all registered shortcuts (for overlay display)
 * - `ShortcutProvider` - Context provider for the shortcut registry
 * - `formatShortcutKey` - Format shortcut key strings for display
 *
 * **Notification Hooks:**
 * - `useNotificationPreferences` - Manage notification preferences matrix (categories x channels)
 *
 * **State Hooks:**
 * - `useUndoRedo` - State management with full undo/redo history
 * - `useLayoutPreference` - Persisted layout preferences (sidebar, columns, density)
 * - `useCrossTabSync` - Cross-tab synchronization via BroadcastChannel
 *
 * **Routing Hooks:**
 * - `useRouterState` - Sync surface state with URL query params (framework-agnostic)
 *
 * **Data Hooks:**
 * - `useSurfaceQuery` - Data fetching for Surface components
 * - `useTableExport` - Export table data to CSV, JSON, or clipboard
 * - `useOptimisticUpdate` - Optimistic mutations with automatic rollback
 * - `useOptimisticList` - Optimistic row/list reconciliation over useOptimisticUpdate
 * - `useDeferredPending` - Deferred busy-state gating (spinner after a delay, skeleton after a longer threshold)
 * - `usePdfExport` - PDF-ready content generation (print, structured data, HTML export)
 *
 * **Form Hooks:**
 * - `useAutoSave` - Debounced auto-save with status tracking
 * - `useDraftSave` - localStorage draft persistence with TTL expiration
 * - `useFormDiff` - Compare original and current form data with deep diffing
 *
 * **Command Registry Hooks:**
 * - `CommandRegistryProvider` - Context provider for the command registry
 * - `useRegisterCommands` - Register commands (auto-unregister on unmount)
 * - `useCommands` - Get all commands with search and execute capabilities
 * - `useExecuteCommand` - Execute a specific command by ID
 *
 * **Drag and Drop Hooks:**
 * - `useSortableList` - Generic sortable list via HTML5 DnD API (no deps)
 *
 * **Search Hooks:**
 * - `useGlobalSearch` - Multi-source search with debounce, grouping, and highlights
 *
 * @example Engine selection
 * ```tsx
 * const { engine, setEngine } = useEngineContext();
 * setEngine('modern'); // Switch to DaisyUI engine
 * ```
 *
 * @example Theme control
 * ```tsx
 * const { theme, setTheme } = useTheme();
 * setTheme(theme === 'light' ? 'dark' : 'light');
 * ```
 *
 * @example Feature gating
 * ```tsx
 * const hasExport = useHasFeature('export-pdf');
 * if (hasExport) return <ExportButton />;
 * ```
 *
 * @example Responsive design
 * ```tsx
 * const { isMobile, isTablet, isDesktop } = useBreakpoints();
 * const columns = useResponsiveValue({ base: 1, md: 2, lg: 4 });
 * ```
 *
 * @see {@link useEngineContext} - Engine hook
 * @see {@link useTheme} - Theme hook
 * @see {@link useBreakpoints} - Responsive hook
 * @module Infrastructure/Runtime/Facade/ReactHooks
 * @category System
 * @package @rottay/design-system
 */

// ============================================================================
// Engine hooks
// ============================================================================
// Exported from src/infrastructure/runtime/engines via the package root
// barrel (src/index.ts). Not re-exported here to avoid circular imports
// between hooks/ and runtime/.
// Consumers use: import { useEngineContext } from '@rottay/design-system';

// ============================================================================
// Theme hooks -- light/dark mode toggling and theme context access
// ============================================================================
export { useTheme, useThemeContext } from '../../theming/composition/react/provider/theme';

// Tenant hooks -- exported from runtime/tenant/, not re-exported here (avoids circular deps)
// Product profile hooks -- exported from runtime/product-profiles/, same reason

// ============================================================================
// Token hooks -- access resolved design tokens from the nearest TokenProvider
// ============================================================================
// useTokens: full token object. useOptionalTokens: returns undefined outside provider.
export { useTokens, useOptionalTokens } from '../../theming/composition/react/tokens';

// Granular token sub-hooks subscribe to specific slices only, avoiding
// unnecessary re-renders when unrelated tokens change. Prefer these over
// useTokens when a component only needs one token category.
export {
  useColorTokens,
  useSpacingTokens,
  useMotionTokens,
  useTypographyTokens,
  useCardTokens,
  useAccentTokens,
} from '../../theming/composition/react/tokens';
export type {
  ColorTokens,
  SpacingTokens,
  MotionTokenSlice,
  TypographyTokenSlice,
  CardTokens,
  AccentTokens,
} from '../../theming/composition/react/tokens';

// ============================================================================
// Feature hooks -- tenant-scoped feature flag gating
// ============================================================================
export { useFeatures, useHasFeature, useFeatureContext } from '../../features';

// ============================================================================
// Responsive hooks -- viewport detection and breakpoint-based values
// When a ResponsiveProvider is in the tree, useBreakpoints and
// useResponsiveValue read from shared context (zero extra subscriptions).
// Without a provider they fall back to per-component matchMedia listeners.
// ============================================================================
export {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from '../../responsive';
export type {
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from '../../responsive';

// ============================================================================
// Accessibility hooks -- keyboard navigation and screen reader support
// ============================================================================
export { useKeyboardNavigation, useAriaAnnounce, useRovingTabindex } from '../../application/accessibility';
export type {
  UseKeyboardNavigationOptions,
  UseKeyboardNavigationResult,
  UseAriaAnnounceResult,
  UseRovingTabindexOptions,
  UseRovingTabindexResult,
} from '../../application/accessibility';

// ============================================================================
// Shortcut hooks -- global keyboard shortcut registration, scoping, and display
// ============================================================================
export {
  useGlobalShortcut,
  useGlobalShortcuts,
  useRegisteredShortcuts,
  useHasShortcutProvider,
  useShortcutScope,
  ShortcutProvider,
  ShortcutScope,
  formatShortcutKey,
} from '../../application/interaction/shortcuts';
export type {
  ShortcutDefinition,
  ShortcutProviderProps,
  ShortcutScopeProps,
} from '../../application/interaction/shortcuts';

// ============================================================================
// Data hooks -- fetching, exporting, optimistic updates, PDF generation
// ============================================================================
export {
  useSurfaceQuery,
  useTableExport,
  useOptimisticUpdate,
  useOptimisticList,
  useDeferredPending,
  usePdfExport,
} from '../../application/data';
export type {
  SurfaceQueryParams,
  SurfaceQueryResult,
  UseSurfaceQueryOptions,
  UseSurfaceQueryReturn,
  TableExportColumn,
  UseTableExportOptions,
  UseTableExportReturn,
  UseOptimisticUpdateOptions,
  UseOptimisticUpdateReturn,
  UseOptimisticListOptions,
  UseOptimisticListReturn,
  UseDeferredPendingOptions,
  UseDeferredPendingResult,
  PdfMargins,
  PdfExportOptions,
  PdfTableData,
  PdfExportColumn,
  UsePdfExportReturn,
} from '../../application/data';

// ============================================================================
// Form hooks -- auto-save, draft persistence, change tracking
// ============================================================================
export {
  useAutoSave,
  useDraftSave,
  useFormDiff,
  UNSAVED_CHANGES_GUARD_CONTRACT,
  useUnsavedChangesGuard,
} from '../../application/forms';
export type {
  AutoSaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
  UseDraftSaveOptions,
  UseDraftSaveReturn,
  FormDiffEntry,
  UseFormDiffOptions,
  UseFormDiffReturn,
  UnsavedChangeGuardReason,
  UseUnsavedChangesGuardOptions,
  UseUnsavedChangesGuardReturn,
} from '../../application/forms';

// ============================================================================
// Command registry hooks -- command palette / action registry
// ============================================================================
export {
  CommandRegistryProvider,
  useRegisterCommands,
  useCommands,
  useExecuteCommand,
} from '../../application/commands';
export type {
  Command,
  UseCommandsReturn,
  CommandRegistryProviderProps,
} from '../../application/commands';

// ============================================================================
// Routing hooks -- URL query param synchronization
// ============================================================================
export { useRouterState } from '../../application/navigation/routing';
export type {
  UseRouterStateOptions,
  UseRouterStateReturn,
} from '../../application/navigation/routing';

// ============================================================================
// AI hooks -- streaming text and chat interfaces
// ============================================================================
export { useStreamingText, useChat } from '../../application/automation/assistant';
export type {
  UseStreamingTextOptions,
  UseStreamingTextReturn,
  ChatMessage,
  UseChatOptions,
  UseChatReturn,
} from '../../application/automation/assistant';

// ============================================================================
// Voice hooks -- Web Speech API wrapper for voice input / dictation
// ============================================================================
export { useVoiceInput } from '../../application/automation/voice';
export type { UseVoiceInputOptions, UseVoiceInputResult } from '../../application/automation/voice';

// ============================================================================
// Notification hooks -- preference matrix management (categories x channels)
// ============================================================================
export { useNotificationPreferences } from '../../application/notifications';
export type {
  NotificationChannel,
  NotificationCategory,
  UseNotificationPreferencesOptions,
  UseNotificationPreferencesReturn,
} from '../../application/notifications';

// ============================================================================
// State hooks -- undo/redo history, persisted layout preferences, cross-tab sync
// ============================================================================
export { useUndoRedo, useLayoutPreference, useCrossTabSync } from '../../application/state';
export type {
  UseUndoRedoOptions,
  UseUndoRedoReturn,
  ColumnPreference,
  LayoutPreference,
  UseLayoutPreferenceOptions,
  UseLayoutPreferenceReturn,
  CrossTabMessageType,
  CrossTabMessage,
  UseCrossTabSyncOptions,
  UseCrossTabSyncReturn,
} from '../../application/state';

// ============================================================================
// Drag and Drop hooks -- HTML5 DnD sortable lists (zero dependencies)
// ============================================================================
export { useSortableList } from '../../application/interaction/drag-and-drop';
export type {
  UseSortableListOptions,
  SortableContainerProps,
  SortableItemProps,
  UseSortableListReturn,
} from '../../application/interaction/drag-and-drop';

// ============================================================================
// Search hooks -- multi-source search with debounce, grouping, highlights
// ============================================================================
export { useGlobalSearch } from '../../application/navigation/search';
export type {
  SearchResult,
  SearchSource,
  UseGlobalSearchOptions,
  SearchResultGroup,
  HighlightSegment,
  UseGlobalSearchReturn,
} from '../../application/navigation/search';

// Tenant branding 2-step hook
export { useTenantBranding } from '../../tenant';
export type { UseTenantBrandingOptions, UseTenantBrandingReturn, TenantBrandingSession } from '../../tenant';
