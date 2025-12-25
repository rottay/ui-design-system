/**
 * AuthLayout - Social Preset
 * Standard + OAuth provider buttons
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AuthLayoutProps } from '../../core';

export const SocialAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Social',
  render: ({ primitives, props, tokens }: PresetContext<AuthLayoutProps>) => {
    const { Box, Stack, Card, Divider, Button } = primitives;
    const {
      title,
      subtitle,
      children,
      logo,
      socialProviders = [],
      footer,
      className,
      style,
    } = props;

    return (
      <Box
        className={className}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: tokens.spacing[4],
          background: `var(--color-neutral-100)`,
          ...style,
        }}
      >
        <Card variant="elevated" padding="lg" style={{ width: '100%', maxWidth: '420px' }}>
          <Stack direction="vertical" spacing="lg">
            {logo && (
              <Box style={{ textAlign: 'center' }}>
                {typeof logo === 'string' ? <img src={logo} alt="Logo" style={{ height: '48px' }} /> : logo}
              </Box>
            )}

            {title && (
              <h1 style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: 600, textAlign: 'center', margin: 0 }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{ color: `var(--color-neutral-500)`, textAlign: 'center', margin: 0 }}>
                {subtitle}
              </p>
            )}

            {/* Social Providers */}
            {socialProviders.length > 0 && (
              <Stack direction="vertical" spacing="sm">
                {socialProviders.map((provider) => (
                  <Button
                    key={provider.name}
                    variant="secondary"
                    fullWidth
                    onClick={provider.onClick}
                    icon={provider.icon}
                  >
                    Continue with {provider.name}
                  </Button>
                ))}
              </Stack>
            )}

            {socialProviders.length > 0 && children && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Divider />
                <span style={{ color: `var(--color-neutral-400)`, whiteSpace: 'nowrap' }}>or</span>
                <Divider />
              </Box>
            )}

            {children}

            {footer && (
              <>
                <Divider />
                <Box style={{ textAlign: 'center' }}>{footer}</Box>
              </>
            )}
          </Stack>
        </Card>
      </Box>
    );
  },
});
