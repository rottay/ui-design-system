'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { TableEmptyStateProps } from '../../core';

export const TableEmptyState = createPreset<TableEmptyStateProps>({
  name: 'TableToolkit.EmptyState',
  render: ({ primitives, props, tokens }: PresetContext<TableEmptyStateProps>) => {
    const { Box } = primitives;
    const {
      icon,
      title = 'No data',
      description = 'There are no items to display.',
      isFiltered,
      filteredDescription = 'No items match your current filters.',
      onResetFilters,
      primaryAction,
      className,
      style,
    } = props;

    const displayDescription = isFiltered ? filteredDescription : description;

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${tokens.spacing[10]}px ${tokens.spacing[5]}px`,
          textAlign: 'center',
          ...style,
        }}
      >
        {/* Icon container */}
        {icon && (
          <div style={{
            width: 64,
            height: 64,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing[4],
            color: tokens.colors.neutral[400],
            fontSize: tokens.typography.fontSize['2xl'],
          }}>
            {icon}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[900],
          marginBottom: tokens.spacing[2],
        }}>
          {title}
        </div>

        {/* Description */}
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          maxWidth: 360,
          lineHeight: 1.5,
          marginBottom: tokens.spacing[4],
        }}>
          {displayDescription}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {isFiltered && onResetFilters && (
            <button
              onClick={onResetFilters}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear filters
            </button>
          )}

          {primaryAction && !isFiltered && (
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
        </div>
      </Box>
    );
  },
});
