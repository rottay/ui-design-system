/**
 * AuthLayout - Branded Preset
 * Split layout with left branding panel and right form, tenant-aware
 */

import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { AuthLayoutProps } from '../../core';

export const BrandedAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Branded',
  render: ({ primitives, props, tokens, engine, tenant }: PresetContext<AuthLayoutProps>) => {
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
    const brandColor = tenant.branding.primaryColor || tokens.colors.primaryScale[600];

    const isModern = engine === 'modern';

    const leftPanelBackground = backgroundImage
      ? `url(${backgroundImage}) center/cover`
      : isModern
        ? `linear-gradient(135deg, ${brandColor}, ${tokens.colors.primaryScale[800]})`
        : brandColor;

    const formSurfaceStyle = createSurfaceStyle(tokens, {
      elevation: 'sm',
      glass: isModern,
    });

    return (
      <Box
        className={className}
        style={{
          minHeight: '100%',
          display: 'flex',
          ...style,
        }}
      >
        {/* Left side - Branding */}
        <Box
          style={{
            flex: 1,
            background: leftPanelBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing[8],
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Overlay for background images */}
          {backgroundImage && (
            <Box style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }} />
          )}
          <Box style={{
            textAlign: 'center',
            color: tokens.colors.common.white,
            position: 'relative',
            zIndex: 1,
          }}>
            {brandLogo && (
              typeof brandLogo === 'string'
                ? <img src={brandLogo} alt={tenant.branding.companyName} style={{ height: 64 }} />
                : brandLogo
            )}
            <h2 style={{
              marginTop: tokens.spacing[4],
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
              marginBottom: 0,
            }}>
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
            backgroundColor: tokens.colors.common.white,
          }}
        >
          <Box style={{ width: '100%', maxWidth: 400 }}>
            <Stack direction="vertical" spacing="lg">
              {title && (
                <h1 style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  margin: 0,
                  color: tokens.colors.neutral[900],
                }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{
                  color: tokens.colors.neutral[500],
                  margin: 0,
                  fontSize: tokens.typography.fontSize.sm,
                }}>
                  {subtitle}
                </p>
              )}
              {children}
              {footer && (
                <>
                  <Divider />
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}>
                    {footer}
                  </Box>
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  },
});
