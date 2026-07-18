'use client';

/**
 * @fileoverview ActiveFiltersBar — structures-tier horizontal active filter chip
 * row with clear-all and add-filter affordances.
 *
 * @description
 * Engine-free structures family that renders a row of active filter chips. Each chip
 * shows a label/value pair with an inline remove button, and the rail also
 * exposes a "Clear all" button plus an optional "+ Add filter" CTA. Returns
 * null when no filters are active, so consumers can mount it
 * unconditionally without dealing with empty-state logic.
 *
 * Used as the active-filter row that sits between the toolbar and the
 * table on workspace/list pages.
 *
 * The family stays domain-agnostic. Each chip's label and displayValue
 * are consumer-supplied, so the rail knows nothing about tenants, users,
 * or any specific entity.
 */

import {
  PlusIcon as Plus,
  XIcon as X,
} from '../../../../graphics/icons';

import { Box, Flex, Text } from '../../../primitives';
import type { ActiveFilter } from '@/foundation/contracts/runtime/components/patterns/data';

export type { ActiveFilter } from '@/foundation/contracts/runtime/components/patterns/data';

export interface ActiveFiltersBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
  onAddFilter?: () => void;
  /** When embedded, the rail becomes visually transparent to a parent shell. */
  surfaceVariant?: 'default' | 'embedded';
}

export function ActiveFiltersBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onAddFilter,
  surfaceVariant = 'default',
}: ActiveFiltersBarProps) {
  if (!activeFilters.length) return null;

  const embedded = surfaceVariant === 'embedded';

  return (
    <Box
      data-part="root"
      data-embedded={embedded}
      className="ds-structure ds-active-filters-bar"
      style={{
        padding: embedded ? '6px 16px 10px' : '10px 16px 12px',
      }}
    >
      <Flex
        align="center"
        gap={12}
        justify="between"
        style={{
          flexWrap: 'wrap',
        }}
      >
        <Box style={{ minWidth: 0, flex: '1 1 560px' }}>
          <Flex align="center" gap={8} wrap="wrap">
            <Text
              data-part="pill"
              size="xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 24,
                padding: '0 9px',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.11em',
              }}
            >
              {activeFilters.length} active
            </Text>
            {activeFilters.map((filter) => (
              <Box
                key={filter.key}
                data-part="chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 32,
                  padding: '0 10px 0 12px',
                }}
              >
                <Text
                  data-part="chip-label"
                  size="xs"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filter.label}
                </Text>
                <Text
                  data-part="chip-value"
                  size="xs"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filter.displayValue ?? filter.value}
                </Text>
                <Box
                  as="button"
                  data-part="chip-remove"
                  onClick={() => onRemoveFilter(filter.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                    flexShrink: 0,
                  }}
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X style={{ width: 12, height: 12 }} />
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>

        <Flex
          align="center"
          gap={8}
          wrap="wrap"
          justify="end"
          style={{
            flex: '0 0 auto',
            paddingTop: 0,
          }}
        >
          <Box
            as="button"
            data-part="clear-all"
            onClick={onClearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 32,
              padding: '0 12px',
              cursor: 'pointer',
              fontSize: 12,
              transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
            }}
          >
            <X style={{ width: 12, height: 12 }} />
            <Text size="xs" style={{ fontSize: 12, fontWeight: 600 }}>
              Clear all
            </Text>
          </Box>

          {onAddFilter && (
            <Box
              as="button"
              data-part="add-filter"
              onClick={onAddFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 32,
                padding: '0 12px',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'opacity 0.15s ease, background 0.15s ease',
              }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              <Text size="xs" style={{ fontSize: 12, fontWeight: 700 }}>
                Add filter
              </Text>
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { ActiveFiltersBar as WorkspaceFilterRail };
export type {
  ActiveFiltersBarProps as WorkspaceFilterRailProps,
  ActiveFilter as WorkspaceActiveFilter,
};
