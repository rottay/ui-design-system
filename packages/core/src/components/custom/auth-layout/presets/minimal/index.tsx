/**
 * AuthLayout - Minimal Preset
 * Simple email/password only
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AuthLayoutProps } from '../../core';

export const MinimalAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Minimal',
  render: ({ primitives, props, tokens }: PresetContext<AuthLayoutProps>) => {
    const { Box, Stack, Card } = primitives;
    const { title, subtitle, children, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: tokens.spacing[4],
          background: `var(--color-neutral-100, ${tokens.colors.neutral[100]})`,
          ...style,
        }}
      >
        <Card
          variant="elevated"
          padding="lg"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <Stack direction="vertical" spacing="md">
            {title && (
              <h1 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: 600,
                textAlign: 'center',
                margin: 0,
              }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{
                color: `var(--color-neutral-500)`,
                textAlign: 'center',
                margin: 0,
              }}>
                {subtitle}
              </p>
            )}
            {children}
          </Stack>
        </Card>
      </Box>
    );
  },
});
