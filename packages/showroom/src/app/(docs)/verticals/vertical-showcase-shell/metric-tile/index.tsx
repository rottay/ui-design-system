'use client';

import { Box, Flex, Text } from '@rottay/design-system';

import {
  BORDER,
  PANEL_BACKGROUND,
  PANEL_SHADOW,
  TEXT_MUTED,
  TEXT_SECONDARY,
  type VerticalHeroMetric,
} from '../foundation';

export function MetricTile({ label, value, detail }: VerticalHeroMetric) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: '16px 18px',
        borderRadius: 'var(--ds-border-radius-lg, 16px)',
        background: PANEL_BACKGROUND,
        border: `1px solid ${BORDER}`,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Flex align="center" gap={8}>
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: 'var(--ds-color-primary)',
            boxShadow: '0 0 0 4px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)',
            flexShrink: 0,
          }}
        />
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: TEXT_MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </Text>
      </Flex>
      <Box
        style={{
          height: 1,
          marginTop: 10,
          background: `linear-gradient(90deg, ${BORDER}, transparent)`,
        }}
      />
      <Text
        size="lg"
        weight="bold"
        style={{
          display: 'block',
          marginTop: 12,
          lineHeight: 1.15,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{ display: 'block', marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}
      >
        {detail}
      </Text>
    </Box>
  );
}
