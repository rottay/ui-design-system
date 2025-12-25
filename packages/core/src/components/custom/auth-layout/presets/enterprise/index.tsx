/**
 * AuthLayout - Enterprise Preset
 * Social + SSO + MFA + Terms acceptance
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AuthLayoutProps } from '../../core';

export const EnterpriseAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Enterprise',
  render: ({ primitives, props, tokens, tenant }: PresetContext<AuthLayoutProps>) => {
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
        <Card variant="elevated" padding="lg" style={{ width: '100%', maxWidth: '480px' }}>
          <Stack direction="vertical" spacing="lg">
            {/* Company branding */}
            <Box style={{ textAlign: 'center' }}>
              {brandLogo && (
                typeof brandLogo === 'string'
                  ? <img src={brandLogo} alt={tenant.branding.companyName} style={{ height: '56px' }} />
                  : brandLogo
              )}
            </Box>

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

            {socialProviders.length > 0 && children && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Divider />
                <span style={{ color: `var(--color-neutral-400)`, whiteSpace: 'nowrap' }}>or use credentials</span>
                <Divider />
              </Box>
            )}

            {children}

            {/* Terms acceptance */}
            {showTerms && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: tokens.typography.fontSize.sm }}>
                <input type="checkbox" style={{ marginTop: '4px' }} />
                <span>
                  {termsContent || (
                    <>
                      I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                    </>
                  )}
                </span>
              </label>
            )}

            {footer && (
              <>
                <Divider />
                <Box style={{ textAlign: 'center', fontSize: tokens.typography.fontSize.sm }}>
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
