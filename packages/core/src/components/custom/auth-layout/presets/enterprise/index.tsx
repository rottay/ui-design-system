import { useMemo } from 'react';
/**
 * AuthLayout - Enterprise Preset
 * Full-featured auth with SSO, social providers, terms acceptance, and tenant branding
 */

import { createPreset, PresetContext } from '../../../factory';
import {
  createEmptyStateStyle,
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { AuthLayoutProps } from '../../core';

export const EnterpriseAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Enterprise',
  render: ({ primitives, props, tokens, engine, tenant }: PresetContext<AuthLayoutProps>) => {
    const { Box, Stack, Card, Divider, Button, Alert } = primitives;
    const {
      title,
      subtitle,
      children,
      logo,
      socialProviders = [],
      showTerms,
      termsContent,
      footer,
      className,
      style,
    } = props;

    const brandLogo = logo || tenant.branding.logo;

    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, {
      elevation: 'lg',
      glass: tokens.surface.useGlass,
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
        <Card
          variant="elevated"
          padding="lg"
          style={{
            width: '100%',
            maxWidth: 480,
            ...surfaceStyle,
          }}
        >
          <Stack direction="vertical" spacing="lg">
            {/* Company branding */}
            {brandLogo && (
              <Box style={{ textAlign: 'center' }}>
                {typeof brandLogo === 'string'
                  ? <img src={brandLogo} alt={tenant.branding.companyName} style={{ height: 56 }} />
                  : brandLogo}
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

            {/* Enterprise notice */}
            <Alert
              type="info"
              message="Enterprise SSO"
              description="Sign in with your organization's identity provider for enhanced security."
            />

            {/* SSO / Social Providers */}
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

            {/* Divider between social and credentials form */}
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
                  or use credentials
                </span>
                <Divider />
              </Box>
            )}

            {/* Form Content */}
            {children}

            {/* Terms acceptance */}
            {showTerms && (
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}>
                <input type="checkbox" style={{ marginTop: tokens.spacing[1] }} />
                <span>
                  {termsContent || (
                    <>
                      I agree to the{' '}
                      <span style={{
                        color: tokens.colors.primaryScale[600],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        Terms of Service
                      </span>
                      {' '}and{' '}
                      <span style={{
                        color: tokens.colors.primaryScale[600],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}>
                        Privacy Policy
                      </span>
                    </>
                  )}
                </span>
              </label>
            )}

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
