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

// Engine hooks -- exported from src/engines/, not re-exported here

// Theme hooks
export { useTheme, useThemeContext } from '../theming/useTheme';

// Tenant hooks -- exported from src/tenancy/, not re-exported here
// Product profile hooks -- exported from src/product-profiles/, not re-exported here

// Token hooks
export { useTokens, useOptionalTokens } from './tokens';

// Granular token sub-hooks (subscribe to specific slices only)
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

// Feature hooks
export { useFeatures, useHasFeature, useFeatureContext } from '../features';

// Responsive hooks
export {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from './responsive';
export type {
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from './responsive';

// Component token hooks
export { useCollapseTokens } from './components';
export type {
  UseCollapseTokensOptions,
  UseCollapseTokensResult,
} from './components';

// Accessibility hooks
export { useKeyboardNavigation, useAriaAnnounce } from './a11y';
export type {
  UseKeyboardNavigationOptions,
  UseKeyboardNavigationResult,
  UseAriaAnnounceResult,
} from './a11y';

// Shortcut hooks
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

// Data hooks
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

// Form hooks
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

// Command registry hooks
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

// Routing hooks
export { useRouterState } from './routing';
export type {
  UseRouterStateOptions,
  UseRouterStateReturn,
} from './routing';

// AI hooks
export { useStreamingText, useChat } from './ai';
export type {
  UseStreamingTextOptions,
  UseStreamingTextReturn,
  ChatMessage,
  UseChatOptions,
  UseChatReturn,
} from './ai';

// Notification hooks
export { useNotificationPreferences } from './notifications';
export type {
  NotificationChannel,
  NotificationCategory,
  UseNotificationPreferencesOptions,
  UseNotificationPreferencesReturn,
} from './notifications';

// State hooks
export { useUndoRedo, useLayoutPreference } from './state';
export type {
  UseUndoRedoOptions,
  UseUndoRedoReturn,
  ColumnPreference,
  LayoutPreference,
  UseLayoutPreferenceOptions,
  UseLayoutPreferenceReturn,
} from './state';

// Drag and Drop hooks
export { useSortableList } from './dnd';
export type {
  UseSortableListOptions,
  SortableContainerProps,
  SortableItemProps,
  UseSortableListReturn,
} from './dnd';

// Search hooks
export { useGlobalSearch } from './search';
export type {
  SearchResult,
  SearchSource,
  UseGlobalSearchOptions,
  SearchResultGroup,
  HighlightSegment,
  UseGlobalSearchReturn,
} from './search';
