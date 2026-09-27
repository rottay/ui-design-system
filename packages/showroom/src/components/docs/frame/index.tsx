import { Box } from '@rottay/design-system';

import type { DocsBaseProps } from '../tone';

export type DocsFrameProps = DocsBaseProps & { hoverable?: boolean };

/** The docs card frame: a framed, elevated surface for docs content. */
export function DocsFrame({ hoverable = false, style, ...props }: DocsFrameProps) {
  return (
    <Box
      {...props}
      style={{
        position: 'relative',
        minWidth: 0,
        borderRadius: 'var(--ds-radius-xl, 20px)',
        border: '1px solid var(--ds-color-border-secondary, rgba(255, 255, 255, 0.1))',
        background: 'var(--ds-color-bg-elevated, rgba(255, 255, 255, 0.04))',
        boxShadow: 'var(--ds-shadow-md, 0 18px 48px rgba(0, 0, 0, 0.16))',
        transition: hoverable ? 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease' : undefined,
        ...style,
      }}
    />
  );
}
