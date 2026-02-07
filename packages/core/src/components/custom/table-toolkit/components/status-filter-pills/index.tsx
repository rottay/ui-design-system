'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { StatusFilterPillsProps } from '../../core';

export const StatusFilterPills = createPreset<StatusFilterPillsProps>({
  name: 'TableToolkit.StatusFilterPills',
  render: ({ primitives, props, tokens }: PresetContext<StatusFilterPillsProps>) => {
    const { Box } = primitives;
    const {
      options,
      value,
      onChange,
      showCounts = false,
      size = 'md',
      className,
      style,
    } = props;

    const isSelected = (optionValue: string) =>
      Array.isArray(value) ? value.includes(optionValue) : value === optionValue;

    const paddingY = size === 'sm' ? tokens.spacing[1] : tokens.spacing[2];
    const paddingX = size === 'sm' ? tokens.spacing[2] : tokens.spacing[3];
    const fontSize = size === 'sm' ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm;

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          flexWrap: 'wrap' as const,
          ...style,
        }}
      >
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${paddingY}px ${paddingX}px`,
                fontSize,
                fontWeight: selected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: selected ? tokens.colors.primary : tokens.colors.neutral[600],
                backgroundColor: selected ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selected ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.full,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              {option.icon && <span style={{ fontSize }}>{option.icon}</span>}
              {option.label}
              {showCounts && option.count !== undefined && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: selected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[400],
                  fontFamily: 'monospace',
                  marginLeft: tokens.spacing[1],
                }}>
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </Box>
    );
  },
});
