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
 *   - an optional search input
 *   - a primary action that supports either `href` or `onClick`
 *
 * Use `ListToolbar` (pattern, still in `components/patterns/`) when you
 * want:
 *   - the full professional two-row treatment with title, count,
 *     structured filter pills, density control, view-mode toggle, and
 *     settings dropdown
 */

import {
  PlusIcon as Plus,
  SearchIcon as Search,
  XIcon as X,
} from '../../../../graphics/icons';
import type { ReactNode } from 'react';

import { Box, Button, Flex, Input, Text } from '../../../primitives';

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
      style={{
        width: 2,
        height: 28,
        flexShrink: 0,
        marginInline: 4,
      }}
    />
  );
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  isFiltered,
  onResetFilters,
  primaryAction,
  filters,
  actions,
  leftContent,
}: TableToolbarProps) {
  return (
    <Box
      data-part="root"
      className="ds-structure ds-table-toolbar"
      style={{
        padding: '10px 16px',
      }}
    >
      <Flex align="center" gap={0}>
        {/* Left: Search + leftContent */}
        <Flex align="center" gap={8} style={{ flexShrink: 0, paddingRight: 12 }}>
          {onSearchChange && (
            <Box className="ds-table-toolbar__search-field" style={{ position: 'relative', width: 476 }}>
              <Search
                data-part="search-icon"
                className="ds-table-toolbar__search-icon"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  width: 15,
                  height: 15,
                  pointerEvents: 'none',
                }}
              />
              <Input
                data-part="search-input"
                className="ds-table-toolbar__search-input"
                placeholder={searchPlaceholder}
                value={search ?? ''}
                onChange={(value: string) => onSearchChange(value)}
                style={{
                  paddingLeft: 32,
                  fontSize: 13,
                }}
              />
            </Box>
          )}

          {leftContent}
        </Flex>

        {/* Spacer */}
        <Box style={{ flex: 1 }} />

        {/* Right: Filters + Divider + Actions */}
        <Flex align="center" gap={0} style={{ flexShrink: 0 }}>
          {filters && (
            <Flex align="center" gap={8} style={{ paddingRight: 12, flexWrap: 'wrap' }}>
              {filters}

              {isFiltered && onResetFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  style={{ gap: 4 }}
                >
                  <X style={{ width: 14, height: 14 }} />
                  <Text size="sm">Clear filters</Text>
                </Button>
              )}
            </Flex>
          )}

          {(actions || primaryAction) && <ToolbarDivider />}

          <Flex align="center" gap={8} style={{ paddingLeft: 12 }}>
            {actions}

            {primaryAction && (
              primaryAction.href ? (
                <a href={primaryAction.href} style={{ textDecoration: 'none' }}>
                  <Button>
                    {primaryAction.icon ?? (
                      <Plus style={{ width: 16, height: 16, marginRight: 8 }} />
                    )}
                    {primaryAction.label}
                  </Button>
                </a>
              ) : (
                <Button onClick={primaryAction.onClick}>
                  {primaryAction.icon ?? (
                    <Plus style={{ width: 16, height: 16, marginRight: 8 }} />
                  )}
                  {primaryAction.label}
                </Button>
              )
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
