'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { BulkSelectToggleProps } from '../../core';

export const BulkSelectToggle = createPreset<BulkSelectToggleProps>({
  name: 'TableToolkit.BulkSelectToggle',
  render: ({ primitives, props, tokens }: PresetContext<BulkSelectToggleProps>) => {
    const { Box } = primitives;
    const {
      active,
      onToggle,
      selectedCount = 0,
      selectIcon,
      doneIcon,
      size = 'md',
      className,
      style,
    } = props;

    const paddingY = size === 'sm' ? tokens.spacing[1] : tokens.spacing[2];
    const paddingX = size === 'sm' ? tokens.spacing[2] : tokens.spacing[3];
    const fontSize = size === 'sm' ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm;

    return (
      <Box
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          ...style,
        }}
      >
        <button
          onClick={onToggle}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${paddingY}px ${paddingX}px`,
            fontSize,
            fontWeight: tokens.typography.fontWeight.medium,
            color: active ? tokens.colors.common.white : tokens.colors.neutral[600],
            backgroundColor: active ? tokens.colors.primary : tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${active ? tokens.colors.primary : tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease',
            boxShadow: active ? `0 0 0 3px ${tokens.colors.primaryScale[100]}` : 'none',
          }}
        >
          {active ? (doneIcon ?? '\u2715') : (selectIcon ?? '\u2610')}
          {active ? 'Done' : 'Select'}
        </button>

        {active && selectedCount > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            height: 24,
            padding: `0 ${tokens.spacing[2]}px`,
            backgroundColor: tokens.colors.primaryScale[100],
            color: tokens.colors.primaryScale[700],
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.bold,
            fontFamily: 'monospace',
          }}>
            {selectedCount}
          </span>
        )}
      </Box>
    );
  },
});
