import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { KpiGridProps } from '../../core';
import {
  createAccentBarStyle, createCardStyle 
} from '../../../helpers';

export const Compact = createPreset<KpiGridProps>((context: PresetContext<KpiGridProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { items, columns = 3, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  return (
    <Box
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: tokens.spacing[2],
        ...style,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.key}
          style={{
            ...cardStyle,
            padding: tokens.spacing[4],
          }}
        >
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
            {item.label}
          </Text>

          <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
            {item.value}{item.unit}
          </Text>
        </Box>
      ))}
    </Box>
  );
});
