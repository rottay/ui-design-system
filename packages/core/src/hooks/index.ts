/**
 * @fileoverview System Hooks - Rottay Design System
 * @description Central exports for all React hooks that provide access to the
 * design system's state, configuration, and responsive utilities.
 *
 * @remarks
 * The Rottay Design System provides several categories of hooks:
 *
 * **Engine Hooks:**
 * - `useEngine` / `useEngineContext` - Access current UI rendering engine
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
 *
 * **Routing Hooks:**
 * - `useRouterState` - Sync surface state with URL query params (framework-agnostic)
 *
 * **Data Hooks:**
 * - `useSurfaceQuery` - Data fetching for Surface components
 * - `useTableExport` - Export table data to CSV, JSON, or clipboard
 * - `useOptimisticUpdate` - Optimistic mutations with automatic rollback
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
 * const { engine, setEngine } = useEngine();
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
 * @see {@link useEngine} - Engine hook
 * @see {@link useTheme} - Theme hook
 * @see {@link useBreakpoints} - Responsive hook
 * @module System/Hooks
 * @category System
 * @package @rottay/design-system
 */

// ============================================================================
// Engine hooks
// ============================================================================
// Exported from src/engines/, not re-exported here to avoid circular imports.
// Consumers use: import { useEngine } from '@rottay/design-system';

// ============================================================================
// Theme hooks -- light/dark mode toggling and theme context access
// ============================================================================
export { useTheme, useThemeContext } from '../runtime/theming/useTheme';

// Tenant hooks -- exported from src/tenancy/, not re-exported here (avoids circular deps)
// Product profile hooks -- exported from src/product-profiles/, same reason

// ============================================================================
// Token hooks -- access resolved design tokens from the nearest TokenProvider
// ============================================================================
// useTokens: full token object. useOptionalTokens: returns undefined outside provider.
export { useTokens, useOptionalTokens } from './tokens';

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
} from './tokens';
export type {
  ColorTokens,
  SpacingTokens,
  MotionTokenSlice,
  TypographyTokenSlice,
  CardTokens,
  AccentTokens,
} from './tokens';

// ============================================================================
// Feature hooks -- tenant-scoped feature flag gating
// ============================================================================
export { useFeatures, useHasFeature, useFeatureContext } from '../runtime/features';

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
} from './responsive';
export type {
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from './responsive';

// ============================================================================
// Component token hooks -- component-specific token resolution
// ============================================================================
export { useCollapseTokens } from './components';
export type {
  UseCollapseTokensOptions,
  UseCollapseTokensResult,
} from './components';

// ============================================================================
// Accessibility hooks -- keyboard navigation and screen reader support
// ============================================================================
export { useKeyboardNavigation, useAriaAnnounce } from './a11y';
export type {
  UseKeyboardNavigationOptions,
  UseKeyboardNavigationResult,
  UseAriaAnnounceResult,
} from './a11y';

// ============================================================================
// Shortcut hooks -- global keyboard shortcut registration and display
// ============================================================================
export {
  useGlobalShortcut,
  useGlobalShortcuts,
  useRegisteredShortcuts,
  ShortcutProvider,
  formatShortcutKey,
} from './shortcuts';
export type {
  ShortcutDefinition,
  ShortcutProviderProps,
} from './shortcuts';

// ============================================================================
// Data hooks -- fetching, exporting, optimistic updates, PDF generation
// ============================================================================
export { useSurfaceQuery, useTableExport, useOptimisticUpdate, usePdfExport } from './data';
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
  PdfMargins,
  PdfExportOptions,
  PdfTableData,
  PdfExportColumn,
  UsePdfExportReturn,
} from './data';

// ============================================================================
// Form hooks -- auto-save, draft persistence, change tracking
// ============================================================================
export { useAutoSave, useDraftSave, useFormDiff } from './form';
export type {
  AutoSaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
  UseDraftSaveOptions,
  UseDraftSaveReturn,
  FormDiffEntry,
  UseFormDiffOptions,
  UseFormDiffReturn,
} from './form';

// ============================================================================
// Command registry hooks -- command palette / action registry
// ============================================================================
export {
  CommandRegistryProvider,
  useRegisterCommands,
  useCommands,
  useExecuteCommand,
} from './commands';
export type {
  Command,
  UseCommandsReturn,
  CommandRegistryProviderProps,
} from './commands';

// ============================================================================
// Routing hooks -- URL query param synchronization
// ============================================================================
export { useRouterState } from './routing';
export type {
  UseRouterStateOptions,
  UseRouterStateReturn,
} from './routing';

// ============================================================================
// AI hooks -- streaming text and chat interfaces
// ============================================================================
export { useStreamingText, useChat } from './ai';
export type {
  UseStreamingTextOptions,
  UseStreamingTextReturn,
  ChatMessage,
  UseChatOptions,
  UseChatReturn,
} from './ai';

// ============================================================================
// Voice hooks -- Web Speech API wrapper for voice input / dictation
// ============================================================================
export { useVoiceInput } from './voice';
export type { UseVoiceInputOptions, UseVoiceInputResult } from './voice';

// ============================================================================
// Notification hooks -- preference matrix management (categories x channels)
// ============================================================================
export { useNotificationPreferences } from './notifications';
export type {
  NotificationChannel,
  NotificationCategory,
  UseNotificationPreferencesOptions,
  UseNotificationPreferencesReturn,
} from './notifications';

// ============================================================================
// State hooks -- undo/redo history and persisted layout preferences
// ============================================================================
export { useUndoRedo, useLayoutPreference } from './state';
export type {
  UseUndoRedoOptions,
  UseUndoRedoReturn,
  ColumnPreference,
  LayoutPreference,
  UseLayoutPreferenceOptions,
  UseLayoutPreferenceReturn,
} from './state';

// ============================================================================
// Drag and Drop hooks -- HTML5 DnD sortable lists (zero dependencies)
// ============================================================================
export { useSortableList } from './dnd';
export type {
  UseSortableListOptions,
  SortableContainerProps,
  SortableItemProps,
  UseSortableListReturn,
} from './dnd';

// ============================================================================
// Search hooks -- multi-source search with debounce, grouping, highlights
// ============================================================================
export { useGlobalSearch } from './search';
export type {
  SearchResult,
  SearchSource,
  UseGlobalSearchOptions,
  SearchResultGroup,
  HighlightSegment,
  UseGlobalSearchReturn,
} from './search';

// Tenant branding 2-step hook
export { useTenantBranding } from './tenant/branding';
export type { UseTenantBrandingOptions, UseTenantBrandingReturn, TenantBrandingSession } from './tenant/branding';
