/**
 * AuthLayout - Social Preset
 * Standard layout with OAuth provider buttons and divider
 */

import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { AuthLayoutProps } from '../../core';

export const SocialAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Social',
  render: ({ primitives, props, tokens, engine }: PresetContext<AuthLayoutProps>) => {
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

    const surfaceStyle = createSurfaceStyle(tokens, {
      elevation: 'md',
      glass: engine === 'modern',
    });

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
        <Card
          variant="elevated"
          padding="lg"
          style={{
            width: '100%',
            maxWidth: 420,
            ...surfaceStyle,
          }}
        >
          <Stack direction="vertical" spacing="lg">
            {/* Logo */}
            {logo && (
              <Box style={{ textAlign: 'center' }}>
                {typeof logo === 'string' ? (
                  <img src={logo} alt="Logo" style={{ height: 48 }} />
                ) : logo}
              </Box>
            )}

            {/* Title */}
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

            {/* Subtitle */}
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

            {/* Divider between social and form */}
            {socialProviders.length > 0 && children && (
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
              }}>
                <Divider />
                <span style={{
                  color: tokens.colors.neutral[400],
                  whiteSpace: 'nowrap',
                  fontSize: tokens.typography.fontSize.sm,
                }}>
                  or
                </span>
                <Divider />
              </Box>
            )}

            {/* Form Content */}
            {children}

            {/* Footer */}
            {footer && (
              <>
                <Divider />
                <Box style={{
                  textAlign: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}>
                  {footer}
                </Box>
              </>
            )}
          </Stack>
        </Card>
      </Box>
    );
  },
});
