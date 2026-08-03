'use client';

/**
 * @fileoverview TableToolbar — structures-tier lightweight one-row toolbar
 * with search, free-form slots, and a primary action.
 *
 * @description
 * Engine-free toolbar chrome that pairs with the `data-table` pattern
 * and with list views. Unlike the heavier `ListToolbar` pattern
 * (two-row, requires title/totalCount/viewMode/density and structured
 * `FilterPillConfig[]`), this family is deliberately slot-driven so
 * consumers can drop in any composition of status pills, selects,
 * bulk-action toggles, and export buttons without conforming to a
 * structured filter shape.
 *
 * Use `TableToolbar` (chrome) when you want:
 *   - a single-row toolbar
 *   - free-form `filters` / `actions` / `leftContent` ReactNode slots
 *   - an optional search input (certified Input with its built-in
 *     `clearable` affordance wired to the search handler)
 *   - a primary action that supports either `href` or `onClick`
 *
 * Use `ListToolbar` (pattern, still in `components/patterns/`) when you
 * want:
 *   - the full professional two-row treatment with title, count,
 *     structured filter pills, density control, view-mode toggle, and
 *     settings dropdown
 *
 * COMPOSITION NOTES: the primary action renders through the certified
 * Button `href` contract (never an `<a>` wrapping a `<button>` — nested
 * interactives are invalid); the search clear is the Input primitive's
 * own `clearable` button. The root stamps `data-structure='table-toolbar'`
 * as its always-present specificity hook (the record/PT10 precedent), and
 * every static geometry lives in
 * `presentation/components/skin/table-toolbar.css`; the only inline styles
 * left are icon glyph sizes and the Input class/style passthrough the
 * contract tests pin per engine (P-79).
 */

import {
  PlusIcon as Plus,
  SearchIcon as Search,
  XIcon as X,
} from '../../../../graphics/icons';
import type { ReactNode } from 'react';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Box, Button, Flex, Input } from '../../../primitives';

export interface TableToolbarProps {
  /** Search input value */
  search?: string;
  /** Search input change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Whether filters are active */
  isFiltered?: boolean;
  /** Reset filters handler */
  onResetFilters?: () => void;
  /** Primary action button config */
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  /** Additional filter components rendered between the spacer and the actions */
  filters?: ReactNode;
  /** Additional action buttons rendered before the primary action */
  actions?: ReactNode;
  /** Left side content (rendered after the search input) */
  leftContent?: ReactNode;
}

/** Border-relief vertical separator between toolbar sections */
function ToolbarDivider() {
  return (
    <Box
      data-part="divider"
      className="ds-table-toolbar__divider"
    />
  );
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  isFiltered,
  onResetFilters,
  primaryAction,
  filters,
  actions,
  leftContent,
}: TableToolbarProps) {
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
      return fallback;
    }
    return resolved;
  };
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? tOr('tableToolbar.searchPlaceholder', 'Search...');

  return (
    <Box
      data-part="root"
      data-structure="table-toolbar"
      className="ds-structure ds-table-toolbar"
    >
      <Flex align="center" gap={0} className="ds-table-toolbar__row">
        {/* Left: Search + leftContent */}
        <Flex align="center" gap={8} className="ds-table-toolbar__left">
          {onSearchChange && (
            <Box className="ds-table-toolbar__search-field" role="search">
              <Search
                data-part="search-icon"
                className="ds-table-toolbar__search-icon"
              />
              <Input
                data-part="search-input"
                className="ds-table-toolbar__search-input"
                placeholder={resolvedSearchPlaceholder}
                value={search ?? ''}
                onChange={(value: string) => onSearchChange(value)}
                clearable
                onClear={() => onSearchChange('')}
              />
            </Box>
          )}

          {leftContent}
        </Flex>

        {/* Spacer */}
        <Box className="ds-table-toolbar__spacer" />

        {/* Right: Filters + Divider + Actions */}
        <Flex align="center" gap={0} className="ds-table-toolbar__right">
          {filters && (
            <Flex align="center" gap={8} wrap="wrap" className="ds-table-toolbar__filters">
              {filters}

              {isFiltered && onResetFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X style={{ width: 14, height: 14 }} />}
                  onClick={onResetFilters}
                >
                  {tOr('tableToolbar.clearFilters', 'Clear filters')}
                </Button>
              )}
            </Flex>
          )}

          {(actions || primaryAction) && <ToolbarDivider />}

          <Flex align="center" gap={8} className="ds-table-toolbar__actions">
            {actions}

            {primaryAction && (
              <Button
                href={primaryAction.href}
                onClick={primaryAction.onClick}
                icon={primaryAction.icon ?? (
                  <Plus style={{ width: 16, height: 16 }} />
                )}
              >
                {primaryAction.label}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
