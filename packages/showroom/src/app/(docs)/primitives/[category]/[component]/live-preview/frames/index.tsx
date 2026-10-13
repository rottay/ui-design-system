'use client';

import type { ReactNode } from 'react';
import {
  Box,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Shared preview helpers
// ---------------------------------------------------------------------------

export function PreviewFrame({
  children,
  height = 208,
  width = 296,
}: {
  children: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <Box
      style={{
        position: 'relative',
        width: 'min(100%, 100%)',
        maxWidth: width,
        minHeight: height,
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-container, #ffffff) 0%, var(--ds-color-bg-secondary, #f8fafc) 100%)',
      }}
    >
      {children}
    </Box>
  );
}

export function SurfaceBlock({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Box
      style={{
        padding: 14,
        borderRadius: 14,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-container)',
        ...style,
      }}
    >
      {children}
    </Box>
  );
}
