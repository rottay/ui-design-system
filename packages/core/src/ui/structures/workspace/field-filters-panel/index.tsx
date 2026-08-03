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
 *
 * COMPOSITION LAW (premium wave): the quick-slice preset chip is the Button
 * primitive (ghost variant, round shape; engine resolved by the
 * DesignSystemProvider) painted through the
 * `--ds-button-ghost-*` channels in the skin — the hand-rolled Box-as-button
 * chip (and its physical `marginRight` icon spacing, an RTL leak) is
 * retired. Every inline style is drained to the skin; geometry keys on the
 * stable data-part hooks. The root is a labelled region.
 */

import type { ReactNode } from 'react';

import {
  ActionFilterIcon,
} from '@/graphics/icons/presentation/semantic/generated/roles/action-filter';
import {
  AiSparklesIcon,
} from '@/graphics/icons/presentation/semantic/generated/roles/ai-sparkles';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Box, Button, Flex, Input, Select, Text } from '../../../primitives';

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
  const panelLabel = tOr('fieldFiltersPanel.title', 'Advanced filters');

  return (
    <Box
      className="ds-structure ds-field-filters-panel"
      data-part="root"
      data-active-count={activeCount}
      role="region"
      aria-label={panelLabel}
    >
      <Flex align="center" justify="between" gap={12} wrap="wrap" data-part="header">
        <Box data-part="header-copy">
          <Flex align="center" gap={8} wrap="wrap">
            <Text
              data-part="title-pill"
              size="xs"
              color="subtle"
            >
              {panelLabel}
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
        <Box data-part="signals">
          <InlineSignal label={`${activeCount} ${tOr('fieldFiltersPanel.activeSuffix', 'active')}`} tone={activeCount > 0 ? 'primary' : 'neutral'} />
          <InlineSignal label={tOr('fieldFiltersPanel.appliesLive', 'Applies live')} tone="neutral" />
        </Box>
      </Flex>

      {presets && presets.length > 0 && (
        <Box data-part="presets-region">
          <Flex align="center" gap={10} wrap="wrap">
            <Text
              data-part="presets-pill"
              size="xs"
              color="subtle"
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

      <Box data-part="grid">
        {filters.map((filter) => {
          const value = values[filter.key] ?? '';
          const visual = filterVisuals?.[filter.key] ?? defaultFilterVisual(filter.label, tOr('fieldFiltersPanel.refineBy', 'Refine by'));
          const inputLabel =
            filter.type === 'date-range'
              ? filter.placeholder ?? `${tOr('fieldFiltersPanel.anyPrefix', 'Any')} ${filter.label}`
              : filter.placeholder ?? `${tOr('fieldFiltersPanel.allPrefix', 'All')} ${filter.label}`;

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
    <Button
      variant="ghost"
      size="xs"
      shape="round"
      data-part="preset-chip"
      onClick={onClick}
      icon={
        <Box as="span" data-part="preset-chip-icon">
          <AiSparklesIcon size={10} decorative />
        </Box>
      }
    >
      {label}
    </Button>
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
    >
      <Text
        data-part="signal-label"
        size="xs"
        color="inherit"
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
    <Box data-part="filter-card">
      <Flex align="start" gap={10} data-part="filter-card-head">
        <Box data-part="filter-card-icon">
          {icon}
        </Box>
        <Box data-part="filter-card-copy">
          <Text
            data-part="filter-card-label"
            size="xs"
            color="subtle"
          >
            {label}
          </Text>
          <Text
            data-part="filter-card-description"
            size="xs"
            color="secondary"
          >
            {description}
          </Text>
        </Box>
      </Flex>
      <Box data-part="control-slot">{children}</Box>
    </Box>
  );
}

function defaultFilterVisual(fallbackLabel: string, refineByPrefix: string): FieldFilterVisual {
  return {
    icon: <ActionFilterIcon size={15} decorative />,
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
