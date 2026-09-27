import type { ReactNode } from 'react';
import { Box } from '@rottay/design-system';

import {
  DOCS_EYEBROW,
  DOCS_PANEL_BORDER,
  DOCS_PANEL_SHADOW,
  DOCS_PANEL_SURFACE,
  resolveDocsTone,
  type DocsBaseProps,
  type DocsTone,
} from '../tone';

export type DocsMetricTileProps = DocsBaseProps & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  tone?: DocsTone;
};

export function DocsMetricTile({ label, value, detail, tone = 'default', style, ...props }: DocsMetricTileProps) {
  const panelTone = resolveDocsTone(tone);

  return (
    <Box
      {...props}
      style={{
        minWidth: 0,
        padding: 14,
        borderRadius: 18,
        border: DOCS_PANEL_BORDER,
        background: panelTone.background,
        boxShadow: DOCS_PANEL_SHADOW,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: detail ? 126 : 92,
        ...style,
      }}
    >
      <Box style={DOCS_EYEBROW}>{label}</Box>
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          padding: '10px 12px',
          borderRadius: 14,
          background: DOCS_PANEL_SURFACE,
          border: DOCS_PANEL_BORDER,
        }}
      >
        <Box
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            display: 'block',
            color: 'var(--ds-color-text-primary)',
            lineHeight: 1.15,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Box>
        {detail ? (
          <Box
            style={{
              fontSize: '0.75rem',
              display: 'block',
              marginTop: 6,
              color: 'var(--ds-color-text-secondary)',
              lineHeight: 1.5,
              overflowWrap: 'anywhere',
            }}
          >
            {detail}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
