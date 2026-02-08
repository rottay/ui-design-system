import { useMemo } from 'react';
/**
 * AuthLayout - Minimal Preset
 * Clean centered card with engine-differentiated surface styling
 */

import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { AuthLayoutProps } from '../../core';

export const MinimalAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Minimal',
  render: ({ primitives, props, tokens, engine }: PresetContext<AuthLayoutProps>) => {
    const { Box, Stack } = primitives;
    const { title, subtitle, children, className, style } = props;

    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, {
      elevation: 'md',
      glass: engine === 'modern',
    }), [tokens, engine]);

    return (
      <Box
        className={className}
        style={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: tokens.spacing[4],
          background: `var(--color-neutral-100, ${tokens.colors.neutral[100]})`,
          ...style,
        }}
      >
        <Box
          style={{
            ...surfaceStyle,
            width: '100%',
            maxWidth: 400,
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.common.white,
          }}
        >
          <Stack direction="vertical" spacing="md">
            {title && (
              <h1 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.semibold,
                textAlign: 'center',
                margin: 0,
                color: tokens.colors.neutral[900],
              }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{
                color: tokens.colors.neutral[500],
                textAlign: 'center',
                margin: 0,
                fontSize: tokens.typography.fontSize.sm,
              }}>
                {subtitle}
              </p>
            )}
            {children}
          </Stack>
        </Box>
      </Box>
    );
  },
});
