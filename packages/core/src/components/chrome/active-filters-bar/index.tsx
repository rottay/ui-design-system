'use client';

/**
 * @fileoverview ActiveFiltersBar pattern -- horizontal active filter chip
 * row with clear-all and add-filter affordances.
 *
 * @description
 * Engine-free pattern that renders a row of active filter chips. Each chip
 * shows a label/value pair with an inline remove button, and the rail also
 * exposes a "Clear all" button plus an optional "+ Add filter" CTA. Returns
 * null when no filters are active, so consumers can mount it
 * unconditionally without dealing with empty-state logic.
 *
 * Used as the active-filter row that sits between the toolbar and the
 * table on workspace/list pages.
 *
 * The pattern stays domain-agnostic. Each chip's label and displayValue
 * are consumer-supplied, so the rail knows nothing about tenants, users,
 * or any specific entity.
 */

import { Plus, X } from 'lucide-react';

import { Box, Flex, Text } from '../../primitives';

/** A single active filter chip rendered by the rail. */
export interface ActiveFilter {
  /** Stable key used in remove callbacks. */
  key: string;
  /** Field/column label rendered in the chip's eyebrow text. */
  label: string;
  /** Underlying filter value (used as a fallback if displayValue is absent). */
  value: string;
  /** Optional human-friendly value for the chip. */
  displayValue?: string;
  /** The data field this filter targets (carried for consumer use). */
  field?: string;
}

export interface ActiveFiltersBarProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
  onAddFilter?: () => void;
}

export function ActiveFiltersBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  onAddFilter,
}: ActiveFiltersBarProps) {
  if (!activeFilters.length) return null;

  return (
    <Box
      style={{
        padding: '10px 16px 12px',
        borderBottom: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 94%, var(--ds-color-bg-primary) 6%), color-mix(in srgb, var(--ds-surface-card) 90%, var(--ds-color-bg-primary) 10%))',
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
              size="xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 24,
                padding: '0 9px',
                borderRadius: 999,
                border: '1px solid color-mix(in srgb, var(--ds-color-primary) 22%, transparent)',
                background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.11em',
                color: 'var(--ds-color-primary)',
              }}
            >
              {activeFilters.length} active
            </Text>
            {activeFilters.map((filter) => (
              <Box
                key={filter.key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 32,
                  padding: '0 10px 0 12px',
                  borderRadius: 999,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card)))',
                  border: '1px solid color-mix(in srgb, var(--ds-color-primary) 20%, transparent)',
                  boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 4%, transparent)',
                }}
              >
                <Text
                  size="xs"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                    color: 'var(--ds-color-text-muted)',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filter.label}
                </Text>
                <Text
                  size="xs"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ds-color-text-primary)',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filter.displayValue ?? filter.value}
                </Text>
                <Box
                  as="button"
                  onClick={() => onRemoveFilter(filter.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
                    background: 'color-mix(in srgb, var(--ds-color-bg-primary) 54%, transparent)',
                    cursor: 'pointer',
                    borderRadius: 9999,
                    color: 'var(--ds-color-text-secondary)',
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
            onClick={onClearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 32,
              padding: '0 12px',
              border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
              background: 'color-mix(in srgb, var(--ds-color-bg-primary) 52%, transparent)',
              cursor: 'pointer',
              borderRadius: 999,
              fontSize: 12,
              color: 'var(--ds-color-text-secondary)',
              transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
            }}
          >
            <X style={{ width: 12, height: 12 }} />
            <Text size="xs" style={{ fontSize: 12, color: 'inherit', fontWeight: 600 }}>
              Clear all
            </Text>
          </Box>

          {onAddFilter && (
            <Box
              as="button"
              onClick={onAddFilter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 32,
                padding: '0 12px',
                border: '1px solid color-mix(in srgb, var(--ds-color-primary) 24%, transparent)',
                background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
                cursor: 'pointer',
                borderRadius: 999,
                fontSize: 12,
                color: 'var(--ds-color-primary)',
                transition: 'opacity 0.15s ease, background 0.15s ease',
              }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              <Text size="xs" style={{ fontSize: 12, color: 'inherit', fontWeight: 700 }}>
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
