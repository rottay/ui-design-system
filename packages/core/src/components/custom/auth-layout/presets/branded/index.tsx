/**
 * AuthLayout - Branded Preset
 * Standard + logo + tenant branding colors
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AuthLayoutProps } from '../../core';

export const BrandedAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Branded',
  render: ({ primitives, props, tokens, tenant }: PresetContext<AuthLayoutProps>) => {
    const { Box, Stack, Divider } = primitives;
    const {
      title,
      subtitle,
      children,
      logo,
      backgroundImage,
      footer,
      className,
      style,
    } = props;

    const brandLogo = logo || tenant.branding.logo;
    const brandColor = tenant.branding.primaryColor || tokens.colors.primary;

    return (
      <Box
        className={className}
        style={{
          minHeight: '100vh',
          display: 'flex',
          ...style,
        }}
      >
        {/* Left side - Branding */}
        <Box
          style={{
            flex: 1,
            background: backgroundImage
              ? `url(${backgroundImage}) center/cover`
              : brandColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing[8],
          }}
        >
          <Box style={{ textAlign: 'center', color: 'white' }}>
            {brandLogo && (
              typeof brandLogo === 'string'
                ? <img src={brandLogo} alt={tenant.branding.companyName} style={{ height: '64px' }} />
                : brandLogo
            )}
            <h2 style={{ marginTop: tokens.spacing[4], fontSize: tokens.typography.fontSize['3xl'] }}>
              {tenant.branding.companyName}
            </h2>
          </Box>
        </Box>

        {/* Right side - Form */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing[8],
            background: 'white',
          }}
        >
          <Box style={{ width: '100%', maxWidth: '400px' }}>
            <Stack direction="vertical" spacing="lg">
              {title && (
                <h1 style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: 600,
                  margin: 0,
                }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ color: `var(--color-neutral-500)`, margin: 0 }}>
                  {subtitle}
                </p>
              )}
              {children}
              {footer && (
                <>
                  <Divider />
                  {footer}
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  },
});
