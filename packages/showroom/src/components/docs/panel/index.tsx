import type { ReactNode } from 'react';
import { Box } from '@rottay/design-system';

import { DocsFrame } from '../frame';
import { SectionDivider } from '../section-divider';
import {
  DOCS_EYEBROW,
  DOCS_PANEL_BORDER,
  DOCS_PANEL_SHADOW,
  resolveDocsTone,
  type DocsBaseProps,
  type DocsTone,
} from '../tone';

export type DocsPanelProps = DocsBaseProps & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: DocsTone;
};

export function DocsPanel({
  eyebrow,
  title,
  description,
  actions,
  footer,
  tone = 'default',
  children,
  style,
  ...props
}: DocsPanelProps) {
  const panelTone = resolveDocsTone(tone);
  const hasHeader = eyebrow || title || description || actions;

  return (
    <DocsFrame
      {...props}
      style={{
        height: '100%',
        padding: 18,
        border: DOCS_PANEL_BORDER,
        background: panelTone.background,
        boxShadow: DOCS_PANEL_SHADOW,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, width: '100%', height: '100%' }}>
        {hasHeader ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, width: '100%' }}>
            {eyebrow || actions ? (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  minWidth: 0,
                  flexWrap: 'wrap',
                }}
              >
                {eyebrow ? (
                  <Box style={{ display: 'block', minWidth: 0 }}>
                    {typeof eyebrow === 'string' || typeof eyebrow === 'number' ? (
                      <Box style={DOCS_EYEBROW}>{eyebrow}</Box>
                    ) : (
                      eyebrow
                    )}
                  </Box>
                ) : (
                  <Box />
                )}
                {actions}
              </Box>
            ) : null}

            {title ? (
              <Box
                as="h2"
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'block',
                  color: 'var(--ds-color-text-primary)',
                  lineHeight: 1.3,
                  overflowWrap: 'anywhere',
                }}
              >
                {title}
              </Box>
            ) : null}

            {description ? (
              <Box
                style={{
                  fontSize: '0.875rem',
                  display: 'block',
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.6,
                  overflowWrap: 'anywhere',
                }}
              >
                {description}
              </Box>
            ) : null}
          </Box>
        ) : null}

        {hasHeader && (children || footer) ? <SectionDivider style={{ background: panelTone.divider }} /> : null}

        {children}

        {footer ? (
          <>
            {hasHeader || children ? (
              <SectionDivider style={{ marginTop: 'auto', background: panelTone.divider }} />
            ) : null}
            {footer}
          </>
        ) : null}
      </Box>
    </DocsFrame>
  );
}
