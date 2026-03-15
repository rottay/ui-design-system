'use client';

import { useMemo, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FilterBuilderProps } from '../../core';
import { FILTER_BUILDER_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const BarFilterBuilder = createPreset<FilterBuilderProps>({
  name: 'FilterBuilder.Bar',
  render: ({ primitives, props, tokens, engine }: PresetContext<FilterBuilderProps>) => {
    const { Box } = primitives;
    const {
      filterConfig,
      filters,
      onFiltersChange,
      quickPresets: rawQuickPresets = [],
      searchKey = FILTER_BUILDER_DEFAULTS.searchKey!,
      searchIcon,
      className,
      style,
    } = props;

    const quickPresets = Array.isArray(rawQuickPresets) ? rawQuickPresets : [];

    const primaryFields = useMemo(() => filterConfig.filter((f) => f.primary), [filterConfig]);
    const searchField = useMemo(() => filterConfig.find((f) => f.key === searchKey), [filterConfig, searchKey]);

    const hasFilters = useMemo(() => {
      return Object.entries(filters).some(([, val]) => {
        if (val === '' || val === null || val === undefined) return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      });
    }, [filters]);

    const setFilter = useCallback((key: string, value: unknown) => {
      onFiltersChange({ ...filters, [key]: value });
    }, [filters, onFiltersChange]);

    const resetFilters = useCallback(() => {
      const cleared: Record<string, unknown> = {};
      filterConfig.forEach((f) => {
        if (f.type === 'multiselect') cleared[f.key] = [];
        else if (f.type === 'boolean') cleared[f.key] = null;
        else cleared[f.key] = '';
      });
      onFiltersChange(cleared);
    }, [filterConfig, onFiltersChange]);

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.md,
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          flexWrap: 'wrap' as const,
          ...style,
        }}
      >
        {/* Search */}
        {searchField && (
          <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140, maxWidth: 260 }}>
            {searchIcon && (
              <span style={{
                position: 'absolute',
                left: tokens.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                pointerEvents: 'none',
              }}>
                {searchIcon}
              </span>
            )}
            <input
              type="text"
              value={(filters[searchKey] as string) ?? ''}
              onChange={(e) => setFilter(searchKey, e.target.value)}
              placeholder={searchField.placeholder ?? 'Search...'}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                paddingLeft: searchIcon ? tokens.spacing[8] : tokens.spacing[3],
                fontSize: tokens.typography.fontSize.sm,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                color: tokens.colors.neutral[900],
                outline: 'none',
                fontFamily: 'inherit',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </div>
        )}

        {/* Primary fields as selects */}
        {primaryFields.filter((f) => f.key !== searchKey).map((field) => (
          <select
            key={field.key}
            value={(filters[field.key] as string) ?? ''}
            onChange={(e) => setFilter(field.key, e.target.value)}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.sm,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[900],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              fontFamily: 'inherit',
              minWidth: field.minWidth ?? 120,
            }}
          >
            <option value="">{field.placeholder ?? `All ${field.label}`}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}

        {/* Quick presets */}
        {quickPresets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => onFiltersChange({ ...filters, ...preset.filters })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              fontFamily: 'inherit',
            }}
          >
            {preset.icon && <span>{preset.icon}</span>}
            {preset.label}
          </button>
        ))}

        {hasFilters && (
          <button
            onClick={resetFilters}
            style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Clear
          </button>
        )}
      </Box>
    );
  },
});
