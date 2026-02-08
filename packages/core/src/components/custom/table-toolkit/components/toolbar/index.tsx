'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { TableToolbarProps } from '../../core';

export const TableToolbar = createPreset<TableToolbarProps>({
  name: 'TableToolkit.Toolbar',
  render: ({ primitives, props, tokens }: PresetContext<TableToolbarProps>) => {
    const { Box } = primitives;
    const {
      search,
      onSearchChange,
      searchPlaceholder = 'Search...',
      isFiltered,
      onResetFilters,
      primaryAction,
      filters,
      actions,
      leftContent,
      searchIcon,
      className,
      style,
    } = props;

    return (
      <Box
        className={className}
        style={{
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
        {leftContent}

        {/* Search */}
        {onSearchChange && (
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 200px',
            minWidth: 160,
            maxWidth: 320,
          }}>
            {searchIcon && (
              <span style={{
                position: 'absolute',
                left: tokens.spacing[3],
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                pointerEvents: 'none',
              }}>
                {searchIcon}
              </span>
            )}
            <input
              type="text"
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                paddingLeft: searchIcon ? tokens.spacing[8] : tokens.spacing[3],
                fontSize: tokens.typography.fontSize.sm,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
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

        {/* Filters slot */}
        {filters}

        {/* Clear filters */}
        {isFiltered && onResetFilters && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[600],
              backgroundColor: tokens.colors.neutral[100],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Clear filters
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions slot */}
        {actions}

        {/* Primary action */}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.common.white,
              backgroundColor: tokens.colors.primary,
              border: 'none',
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {primaryAction.icon && <span>{primaryAction.icon}</span>}
            {primaryAction.label}
          </button>
        )}
      </Box>
    );
  },
});
