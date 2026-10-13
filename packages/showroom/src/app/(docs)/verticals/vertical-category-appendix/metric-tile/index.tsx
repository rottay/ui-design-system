'use client';

import { Box, Text } from '@rottay/design-system';

import {
  BORDER,
  PANEL_BACKGROUND,
  PANEL_SHADOW,
  TEXT_MUTED,
  TEXT_SECONDARY,
} from '../foundation';

export function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
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
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Text
        size="lg"
        weight="bold"
        style={{
          display: 'block',
          marginTop: 10,
          overflowWrap: 'anywhere',
          lineHeight: 1.15,
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}
      >
        {detail}
      </Text>
    </Box>
  );
}
