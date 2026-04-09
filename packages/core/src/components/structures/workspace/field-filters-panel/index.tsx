'use client';

/**
 * @fileoverview FieldFiltersPanel — structures-tier filter card grid
 * with quick-slice presets and per-card visual metadata.
 *
 * @description
 * Engine-free chrome family that renders an advanced filter panel as a responsive
 * grid of 230px+ FilterCards. Each card carries a label, optional icon and
 * description, and a control (Select for `select`/`enum`/`date-range`,
 * Input for free-form text). The panel also accepts a list of quick-slice
 * preset chips that batch-apply multiple filter values in one click.
 *
 * Different from the FilterBuilder pattern (also in DS):
 *   - FilterBuilder: Airtable-style tree of `{field, operator, value}`
 *     rules with 16+ operators and AND/OR groups. Use for query-builder UX.
 *   - FieldFiltersPanel: flat single-field equality with optional
 *     options arrays. Use for workspace/list-page filter panels where
 *     each filter maps to one column and the value is a single string.
 *
 * The family stays domain-agnostic. The optional `filterVisuals` map lets
 * each consumer keep platform-specific narrative (e.g. tenant or role copy)
 * inside its own workspace-config file rather than baking it into the DS.
 */

import type { ReactNode } from 'react';

import { Sparkles, SlidersHorizontal } from 'lucide-react';

import { Box, Flex, Input, Select, Text } from '../../../primitives';

export interface FieldFilterDefinition {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'date-range' | 'enum';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FieldFilterPreset {
  key: string;
  label: string;
  values: Record<string, string>;
}

export interface FieldFilterVisual {
  icon: ReactNode;
  description: string;
}

export interface FieldFiltersPanelProps {
  filters: FieldFilterDefinition[];
  presets?: FieldFilterPreset[];
  values: Record<string, string>;
  onChange: (filterKey: string, value: string) => void;
  /**
   * Per-filter visual metadata (icon + description). When a filter key is
   * present in this map, the FilterCard renders the consumer-supplied icon
   * and description. When absent, the card falls back to a generic
   * SlidersHorizontal icon and an auto-generated "Refine by {label}"
   * description.
   */
  filterVisuals?: Record<string, FieldFilterVisual>;
}

export function FieldFiltersPanel({
  filters,
  presets,
  values,
  onChange,
  filterVisuals,
}: FieldFiltersPanelProps) {
  if (!filters.length) return null;

  const activeCount = Object.values(values).filter((value) => value && value !== 'all').length;

  return (
    <Box
      style={{
        padding: '12px 16px 14px',
        borderBottom: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 97%, white 3%), color-mix(in srgb, var(--ds-surface-card) 93%, var(--ds-color-bg-primary) 7%))',
      }}
    >
      <Flex align="center" justify="between" gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
        <Box style={{ minWidth: 0, flex: '1 1 540px' }}>
          <Flex align="center" gap={8} wrap="wrap">
            <Text
              size="xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 22,
                padding: '0 8px',
                borderRadius: 999,
                border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
                background: 'color-mix(in srgb, var(--ds-color-bg-primary) 52%, transparent)',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.11em',
                color: 'var(--ds-color-text-muted)',
              }}
            >
              Advanced filters
            </Text>
            <Text size="xs" style={{ fontSize: 12, lineHeight: 1.45, color: 'var(--ds-color-text-secondary)' }}>
              Precision filters for the current slice.
            </Text>
          </Flex>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          <InlineSignal label={`${activeCount} active`} tone={activeCount > 0 ? 'primary' : 'neutral'} />
          <InlineSignal label="Applies live" tone="neutral" />
        </Box>
      </Flex>

      {presets && presets.length > 0 && (
        <Box style={{ marginBottom: 12 }}>
          <Flex align="center" gap={10} wrap="wrap">
            <Text
              size="xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 20,
                padding: '0 8px',
                borderRadius: 999,
                border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
                background: 'color-mix(in srgb, var(--ds-color-bg-primary) 48%, transparent)',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.11em',
                color: 'var(--ds-color-text-muted)',
              }}
            >
              Quick slices
            </Text>
            {presets.map((preset) => (
              <PresetChip
                key={preset.key}
                label={preset.label}
                onClick={() => {
                  Object.entries(preset.values).forEach(([filterKey, filterValue]) => {
                    onChange(filterKey, filterValue);
                  });
                }}
              />
            ))}
          </Flex>
        </Box>
      )}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 10,
        }}
      >
        {filters.map((filter) => {
          const value = values[filter.key] ?? '';
          const visual = filterVisuals?.[filter.key] ?? defaultFilterVisual(filter.label);
          const inputLabel =
            filter.type === 'date-range'
              ? filter.placeholder ?? `Any ${filter.label}`
              : filter.placeholder ?? `All ${filter.label}`;
          const controlStyle = {
            width: '100%',
            minHeight: 40,
            borderRadius: 12,
            background: 'color-mix(in srgb, var(--ds-color-bg-primary) 72%, var(--ds-surface-card))',
            border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 88%, transparent)',
            boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 4%, transparent)',
          } as const;

          if (filter.type === 'select' || filter.type === 'enum') {
            return (
              <FilterCard
                key={filter.key}
                label={filter.label}
                icon={visual.icon}
                description={visual.description}
              >
                <Select
                  value={value || 'all'}
                  onChange={(next) => onChange(filter.key, String(next === 'all' ? '' : next))}
                  searchable={Boolean((filter.options?.length ?? 0) > 6)}
                  clearable
                  virtual={{ itemHeight: 36, containerHeight: 264 }}
                  options={[
                    { value: 'all', label: inputLabel },
                    ...(filter.options ?? []),
                  ]}
                  style={controlStyle}
                />
              </FilterCard>
            );
          }

          if (filter.type === 'date-range') {
            return (
              <FilterCard
                key={filter.key}
                label={filter.label}
                icon={visual.icon}
                description={visual.description}
              >
                <Select
                  value={value || 'all'}
                  onChange={(next) => onChange(filter.key, String(next === 'all' ? '' : next))}
                  clearable
                  virtual={{ itemHeight: 36, containerHeight: 240 }}
                  options={[
                    { value: 'all', label: inputLabel },
                    ...(filter.options ?? []),
                  ]}
                  style={controlStyle}
                />
              </FilterCard>
            );
          }

          return (
            <FilterCard
              key={filter.key}
              label={filter.label}
              icon={visual.icon}
              description={visual.description}
            >
              <Input
                value={value}
                onChange={(next) => onChange(filter.key, next)}
                placeholder={filter.placeholder}
                style={controlStyle}
              />
            </FilterCard>
          );
        })}
      </Box>
    </Box>
  );
}

function PresetChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 30,
        padding: '0 10px',
        borderRadius: 999,
        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 92%, white 8%), color-mix(in srgb, var(--ds-surface-card) 90%, var(--ds-color-bg-primary) 10%))',
        color: 'var(--ds-color-text-secondary)',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.01em',
        transition: 'border-color 0.12s ease, background 0.12s ease, color 0.12s ease, transform 0.12s ease',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 4%, transparent)',
      }}
    >
      <Box
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          marginRight: 7,
          flexShrink: 0,
          border: '1px solid color-mix(in srgb, var(--ds-color-primary) 24%, transparent)',
          background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ds-color-primary)',
        }}
      >
        <Sparkles style={{ width: 10, height: 10 }} />
      </Box>
      {label}
    </Box>
  );
}

function InlineSignal({
  label,
  tone,
}: {
  label: string;
  tone: 'neutral' | 'primary';
}) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 24,
        padding: '0 9px',
        borderRadius: 12,
        border:
          tone === 'primary'
            ? '1px solid color-mix(in srgb, var(--ds-color-primary) 22%, transparent)'
            : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
        background:
          tone === 'primary'
            ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card)))'
            : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 94%, white 6%), color-mix(in srgb, var(--ds-surface-card) 90%, var(--ds-color-bg-primary) 10%))',
        color: tone === 'primary' ? 'var(--ds-color-primary)' : 'var(--ds-color-text-secondary)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 4%, transparent)',
      }}
    >
      <Text
        size="xs"
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.09em',
          color: 'inherit',
          lineHeight: 1,
        }}
      >
        {label}
      </Text>
    </Box>
  );
}

function FilterCard({
  label,
  icon,
  description,
  children,
}: {
  label: string;
  icon: ReactNode;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box
      style={{
        padding: 12,
        borderRadius: 18,
        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 95%, white 5%), color-mix(in srgb, var(--ds-surface-card) 90%, var(--ds-color-bg-primary) 10%))',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, white 4%, transparent)',
        minHeight: 118,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex align="start" gap={10} style={{ marginBottom: 8 }}>
        <Box
          style={{
            width: 30,
            height: 30,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
            background: 'color-mix(in srgb, var(--ds-color-bg-primary) 52%, transparent)',
            color: 'var(--ds-color-text-secondary)',
          }}
        >
          {icon}
        </Box>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text
            size="xs"
            style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.11em',
              color: 'var(--ds-color-text-muted)',
            }}
          >
            {label}
          </Text>
          <Text
            size="xs"
            style={{
              display: 'block',
              marginTop: 3,
              fontSize: 11,
              lineHeight: 1.35,
              color: 'var(--ds-color-text-secondary)',
            }}
          >
            {description}
          </Text>
        </Box>
      </Flex>
      <Box style={{ marginTop: 'auto' }}>{children}</Box>
    </Box>
  );
}

function defaultFilterVisual(fallbackLabel: string): FieldFilterVisual {
  return {
    icon: <SlidersHorizontal style={{ width: 15, height: 15 }} />,
    description: `Refine by ${fallbackLabel.toLowerCase()}.`,
  };
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { FieldFiltersPanel as WorkspaceAdvancedFilters };
export type {
  FieldFiltersPanelProps as WorkspaceAdvancedFiltersProps,
  FieldFilterDefinition as WorkspaceFilterDefinition,
  FieldFilterPreset as WorkspaceFilterPreset,
  FieldFilterVisual as WorkspaceFilterVisual,
};
