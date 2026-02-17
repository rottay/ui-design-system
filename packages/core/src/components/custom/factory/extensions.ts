/**
 * Extension Helpers Factory
 *
 * Creates an ExtensionHelpers object from a ComponentExtensions config.
 * All methods return sensible defaults when no extensions are provided,
 * so presets can call ctx.ext.* unconditionally.
 */

import type { ReactNode } from 'react';
import type { DesignTokens } from '../../../core/types/tokens';
import type {
  ComponentExtensions,
  ExtensionHelpers,
  ResolvedColumn,
  SlotContext,
  SlotContent,
  ActionDefinition,
  BulkActionDefinition,
  FilterDefinition,
  FilterPreset,
  SearchConfig,
  SelectionExtensions,
  SortExtensions,
  PaginationExtensions,
  MotionExtensions,
  LayoutExtensions,
  DataExtensions,
  DragAndDropExtensions,
  ExportExtensions,
  KeyboardExtensions,
  LifecycleExtensions,
  AccessibilityExtensions,
  RenderExtensions,
} from '../../../core/types/extensions';

/** Empty object reused across helpers to avoid re-allocation */
const EMPTY_OBJ = Object.freeze({}) as any;
const EMPTY_ARR = Object.freeze([]) as unknown as any[];

/**
 * Resolve a slot content value to a ReactNode.
 * If the slot is a function, we call it with a minimal SlotContext.
 */
function resolveSlot<T>(
  content: SlotContent<T> | undefined,
  tokens: DesignTokens,
): ReactNode | null {
  if (content === undefined || content === null) return null;
  if (typeof content === 'function') {
    // Build a minimal SlotContext - presets can provide richer context
    const ctx: SlotContext<T> = {
      tokens,
      data: EMPTY_ARR,
      selectedKeys: EMPTY_ARR,
      filterValues: EMPTY_OBJ,
      searchQuery: '',
      sort: null,
      page: 1,
      pageSize: 10,
      totalItems: 0,
    };
    return (content as (context: SlotContext<T>) => ReactNode)(ctx);
  }
  return content as ReactNode;
}

/**
 * Merge default columns with column extensions.
 * Handles: extra columns (positioned), hidden columns, ordering, overrides, pins.
 */
function mergeColumns<T>(
  defaults: { key: string; label: string; [k: string]: any }[],
  ext: ComponentExtensions<T>,
): ResolvedColumn<T>[] {
  const colExt = ext.columns;
  if (!colExt) {
    return defaults.map(col => ({ ...col } as ResolvedColumn<T>));
  }

  const hiddenSet = new Set(colExt.hidden ?? []);

  // Start with defaults, filtering hidden
  let result: ResolvedColumn<T>[] = defaults
    .filter(col => !hiddenSet.has(col.key))
    .map(col => {
      const resolved: ResolvedColumn<T> = { ...col } as ResolvedColumn<T>;

      // Apply overrides
      if (colExt.overrides?.[col.key]) {
        resolved._renderOverride = colExt.overrides[col.key];
      }
      if (colExt.headerOverrides?.[col.key]) {
        resolved.renderHeader = colExt.headerOverrides[col.key];
      }
      if (colExt.footerOverrides?.[col.key]) {
        resolved.renderFooter = colExt.footerOverrides[col.key];
      }
      if (colExt.pinned?.[col.key]) {
        resolved.pin = colExt.pinned[col.key];
      }
      if (colExt.groups?.[col.key]) {
        resolved.group = colExt.groups[col.key];
      }
      if (colExt.resizable !== undefined) {
        resolved.resizable = colExt.resizable;
      }
      return resolved;
    });

  // Insert extra columns
  if (colExt.extra) {
    for (const extra of colExt.extra) {
      if (hiddenSet.has(extra.key)) continue;

      const resolved: ResolvedColumn<T> = {
        ...extra,
        _isExtra: true,
      };

      if (extra.insertBefore) {
        const idx = result.findIndex(c => c.key === extra.insertBefore);
        if (idx >= 0) {
          result.splice(idx, 0, resolved);
          continue;
        }
      }
      if (extra.insertAfter) {
        const idx = result.findIndex(c => c.key === extra.insertAfter);
        if (idx >= 0) {
          result.splice(idx + 1, 0, resolved);
          continue;
        }
      }
      // Default: append
      result.push(resolved);
    }
  }

  // Apply column order
  if (colExt.order && colExt.order.length > 0) {
    const orderMap = new Map<string, number>();
    colExt.order.forEach((key, i) => orderMap.set(key, i));

    result.sort((a, b) => {
      const aOrder = orderMap.get(a.key);
      const bOrder = orderMap.get(b.key);
      // Both in order array: sort by position
      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      // Only a in order: a comes first
      if (aOrder !== undefined) return -1;
      // Only b in order: b comes first
      if (bOrder !== undefined) return 1;
      // Neither: preserve original order (stable sort)
      return 0;
    });
  }

  return result;
}

/**
 * Merge default actions with extension actions.
 * Extension actions are appended after defaults.
 */
function mergeActions<T>(
  defaults: ActionDefinition<T>[] | undefined,
  extensions: ActionDefinition<T>[] | undefined,
): ActionDefinition<T>[] {
  if (!extensions?.length) return defaults ?? [];
  if (!defaults?.length) return extensions;
  return [...defaults, ...extensions];
}

function mergeBulkActions<T>(
  defaults: BulkActionDefinition<T>[] | undefined,
  extensions: BulkActionDefinition<T>[] | undefined,
): BulkActionDefinition<T>[] {
  if (!extensions?.length) return defaults ?? [];
  if (!defaults?.length) return extensions;
  return [...defaults, ...extensions];
}

/**
 * Create ExtensionHelpers from a ComponentExtensions config.
 * All methods are safe to call when extensions is undefined.
 */
export function createExtensionHelpers<T = any>(
  extensions: ComponentExtensions<T> | undefined,
  tokens: DesignTokens,
): ExtensionHelpers<T> {
  const ext = extensions ?? (EMPTY_OBJ as ComponentExtensions<T>);

  return {
    // --- Slots ---
    slot(name: string, fallback?: ReactNode): ReactNode | null {
      const content = ext.slots?.[name];
      if (content === undefined) return fallback ?? null;
      return resolveSlot(content, tokens) ?? fallback ?? null;
    },

    hasSlot(name: string): boolean {
      return ext.slots?.[name] !== undefined;
    },

    // --- Columns ---
    columns(defaults) {
      return mergeColumns(defaults, ext);
    },

    get hasColumnExtensions(): boolean {
      const c = ext.columns;
      if (!c) return false;
      return !!(c.extra?.length || c.hidden?.length || c.order?.length ||
        c.overrides || c.headerOverrides || c.footerOverrides || c.pinned);
    },

    // --- Actions ---
    rowActions(defaults?: ActionDefinition<T>[]) {
      return mergeActions(defaults, ext.actions?.row);
    },

    toolbarActions(defaults?: ActionDefinition<T>[]) {
      return mergeActions(defaults, ext.actions?.toolbar);
    },

    bulkActions(defaults?: BulkActionDefinition<T>[]) {
      return mergeBulkActions(defaults, ext.actions?.bulk);
    },

    contextMenuActions(defaults?: ActionDefinition<T>[]) {
      return mergeActions(defaults, ext.actions?.contextMenu);
    },

    get hasActionExtensions(): boolean {
      const a = ext.actions;
      if (!a) return false;
      return !!(a.row?.length || a.toolbar?.length || a.bulk?.length || a.contextMenu?.length || a.fab);
    },

    // --- Filters ---
    filterDefs(defaults?: FilterDefinition[]) {
      const extra = ext.filters?.extra;
      if (!extra?.length) return defaults ?? [];
      if (!defaults?.length) return extra;
      return [...defaults, ...extra];
    },

    searchConfig(defaults?: Partial<SearchConfig>): SearchConfig {
      return { ...defaults, ...ext.filters?.search } as SearchConfig;
    },

    filterPresets(): FilterPreset[] {
      return ext.filters?.presets ?? [];
    },

    get hasFilterExtensions(): boolean {
      const f = ext.filters;
      if (!f) return false;
      return !!(f.extra?.length || f.search || f.presets?.length);
    },

    // --- Rendering ---
    section(name: string, defaultRender: () => ReactNode): ReactNode {
      const rendering = ext.rendering;
      if (!rendering) return defaultRender();

      // Replace takes precedence
      if (rendering.replace?.[name]) {
        const ctx: SlotContext<T> = {
          tokens,
          data: EMPTY_ARR,
          selectedKeys: EMPTY_ARR,
          filterValues: EMPTY_OBJ,
          searchQuery: '',
          sort: null,
          page: 1,
          pageSize: 10,
          totalItems: 0,
        };
        return rendering.replace[name](ctx);
      }

      // Wrap wraps the default
      if (rendering.wrap?.[name]) {
        const defaultOutput = defaultRender();
        const ctx: SlotContext<T> = {
          tokens,
          data: EMPTY_ARR,
          selectedKeys: EMPTY_ARR,
          filterValues: EMPTY_OBJ,
          searchQuery: '',
          sort: null,
          page: 1,
          pageSize: 10,
          totalItems: 0,
        };
        return rendering.wrap[name](defaultOutput, ctx);
      }

      return defaultRender();
    },

    itemRenderer() {
      return ext.rendering?.renderItem;
    },

    cardRenderer() {
      return ext.rendering?.renderCard;
    },

    // --- Selection ---
    selectionConfig(): SelectionExtensions<T> {
      return ext.selection ?? EMPTY_OBJ;
    },

    // --- Sort ---
    sortConfig(): SortExtensions {
      return ext.sorting ?? EMPTY_OBJ;
    },

    // --- Pagination ---
    paginationConfig(): PaginationExtensions {
      return ext.pagination ?? EMPTY_OBJ;
    },

    // --- Motion ---
    entranceMotion(defaults?: MotionExtensions['entrance']): MotionExtensions['entrance'] {
      if (!ext.motion?.entrance) return defaults;
      return { ...defaults, ...ext.motion.entrance };
    },

    staggerMotion(defaults?: MotionExtensions['stagger']): MotionExtensions['stagger'] {
      if (!ext.motion?.stagger) return defaults;
      return { ...defaults, ...ext.motion.stagger };
    },

    get animationsDisabled(): boolean {
      return ext.motion?.disableAll ?? false;
    },

    // --- Layout ---
    layoutConfig(): LayoutExtensions {
      return ext.layout ?? EMPTY_OBJ;
    },

    density(): 'compact' | 'default' | 'comfortable' | 'spacious' {
      return ext.layout?.density ?? 'default';
    },

    // --- Data ---
    dataConfig(): DataExtensions<T> {
      return ext.data ?? EMPTY_OBJ;
    },

    emptyState() {
      return ext.data?.emptyState;
    },

    rowHighlight() {
      return ext.data?.rowHighlight;
    },

    // --- Export ---
    exportConfig(): ExportExtensions<T> {
      return ext.export ?? EMPTY_OBJ;
    },

    get hasExport(): boolean {
      return !!(ext.export?.formats?.length || ext.export?.onExport);
    },

    // --- Keyboard ---
    keyboardConfig(): KeyboardExtensions {
      return ext.keyboard ?? EMPTY_OBJ;
    },

    // --- DnD ---
    dragAndDropConfig(): DragAndDropExtensions<T> {
      return ext.dragAndDrop ?? EMPTY_OBJ;
    },

    // --- Lifecycle ---
    lifecycleHooks(): LifecycleExtensions<T> {
      return ext.lifecycle ?? EMPTY_OBJ;
    },

    // --- Accessibility ---
    a11yConfig(): AccessibilityExtensions {
      return ext.accessibility ?? EMPTY_OBJ;
    },

    // --- Meta ---
    get hasExtensions(): boolean {
      return extensions !== undefined && extensions !== null;
    },

    get raw(): ComponentExtensions<T> {
      return ext;
    },
  };
}
