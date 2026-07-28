'use client';

/**
 * @fileoverview FieldFiltersPanel — structures-tier filter card grid
 * with quick-slice presets and per-card visual metadata.
 *
 * @description
 * Engine-free structures family that renders an advanced filter panel as a responsive
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

import {
  SlidersHorizontalIcon as SlidersHorizontal,
  SparklesIcon as Sparkles,
} from '../../../../graphics/icons';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
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

  if (!filters.length) return null;

  const activeCount = Object.values(values).filter((value) => value && value !== 'all').length;

  return (
    <Box
      className="ds-structure ds-field-filters-panel"
      data-part="root"
      style={{
        padding: '12px 16px 14px',
      }}
    >
      <Flex align="center" justify="between" gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
        <Box style={{ minWidth: 0, flex: '1 1 540px' }}>
          <Flex align="center" gap={8} wrap="wrap">
            <Text
              data-part="title-pill"
              size="xs"
              color="subtle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 22,
                padding: '0 8px',
              }}
            >
              {tOr('fieldFiltersPanel.title', 'Advanced filters')}
            </Text>
            <Text
              data-part="subtitle"
              size="xs"
              color="secondary"
            >
              {tOr('fieldFiltersPanel.subtitle', 'Precision filters for the current slice.')}
            </Text>
          </Flex>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          <InlineSignal label={`${activeCount} ${tOr('fieldFiltersPanel.activeSuffix', 'active')}`} tone={activeCount > 0 ? 'primary' : 'neutral'} />
          <InlineSignal label={tOr('fieldFiltersPanel.appliesLive', 'Applies live')} tone="neutral" />
        </Box>
      </Flex>

      {presets && presets.length > 0 && (
        <Box style={{ marginBottom: 12 }}>
          <Flex align="center" gap={10} wrap="wrap">
            <Text
              data-part="presets-pill"
              size="xs"
              color="subtle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 20,
                padding: '0 8px',
              }}
            >
              {tOr('fieldFiltersPanel.quickSlices', 'Quick slices')}
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
        data-part="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 10,
        }}
      >
        {filters.map((filter) => {
          const value = values[filter.key] ?? '';
          const visual = filterVisuals?.[filter.key] ?? defaultFilterVisual(filter.label, tOr('fieldFiltersPanel.refineBy', 'Refine by'));
          const inputLabel =
            filter.type === 'date-range'
              ? filter.placeholder ?? `${tOr('fieldFiltersPanel.anyPrefix', 'Any')} ${filter.label}`
              : filter.placeholder ?? `${tOr('fieldFiltersPanel.allPrefix', 'All')} ${filter.label}`;
          const controlStyle = { width: '100%', minHeight: 40 } as const;

          if (filter.type === 'select' || filter.type === 'enum') {
            return (
              <FilterCard
                key={filter.key}
                label={filter.label}
                icon={visual.icon}
                description={visual.description}
              >
                <Select
                  className="ds-field-filters-panel__control"
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
                  className="ds-field-filters-panel__control"
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
                className="ds-field-filters-panel__control"
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
      data-part="preset-chip"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 30,
        padding: '0 10px',
        cursor: 'pointer',
      }}
    >
      <Box
        data-part="preset-chip-icon"
        style={{
          width: 16,
          height: 16,
          marginRight: 7,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
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
      data-part="signal"
      data-tone={tone}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 24,
        padding: '0 9px',
      }}
    >
      <Text
        data-part="signal-label"
        size="xs"
        color="inherit"
        style={{
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
      data-part="filter-card"
      style={{
        padding: 12,
        minHeight: 118,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex align="start" gap={10} style={{ marginBottom: 8 }}>
        <Box
          data-part="filter-card-icon"
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text
            data-part="filter-card-label"
            size="xs"
            color="subtle"
            style={{
              display: 'block',
            }}
          >
            {label}
          </Text>
          <Text
            data-part="filter-card-description"
            size="xs"
            color="secondary"
            style={{
              display: 'block',
              marginTop: 3,
            }}
          >
            {description}
          </Text>
        </Box>
      </Flex>
      <Box data-part="control-slot" style={{ marginTop: 'auto' }}>{children}</Box>
    </Box>
  );
}

function defaultFilterVisual(fallbackLabel: string, refineByPrefix: string): FieldFilterVisual {
  return {
    icon: <SlidersHorizontal style={{ width: 15, height: 15 }} />,
    description: `${refineByPrefix} ${fallbackLabel.toLowerCase()}.`,
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
