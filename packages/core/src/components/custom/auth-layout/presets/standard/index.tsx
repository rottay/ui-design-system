/**
 * AuthLayout - Standard Preset
 * Email/password + remember me + forgot password with full token compliance
 */

import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { AuthLayoutProps } from '../../core';
import { AUTH_LAYOUT_DEFAULTS } from '../../core';

export const StandardAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<AuthLayoutProps>) => {
    const { Box, Stack, Card, Divider } = primitives;
    const {
      title = AUTH_LAYOUT_DEFAULTS.title,
      subtitle,
      children,
      logo,
      showRememberMe = AUTH_LAYOUT_DEFAULTS.showRememberMe,
      showForgotPassword = AUTH_LAYOUT_DEFAULTS.showForgotPassword,
      onForgotPassword,
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

            {/* Header */}
            <Box style={{ textAlign: 'center' }}>
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
                  marginTop: tokens.spacing[2],
                  marginBottom: 0,
                  fontSize: tokens.typography.fontSize.sm,
                }}>
                  {subtitle}
                </p>
              )}
            </Box>

            <Divider />

            {/* Form Content */}
            {children}

            {/* Remember me / Forgot password row */}
            {(showRememberMe || showForgotPassword) && (
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                {showRememberMe && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    cursor: 'pointer',
                    color: tokens.colors.neutral[700],
                  }}>
                    <input type="checkbox" />
                    Remember me
                  </label>
                )}
                {showForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: tokens.colors.primaryScale[600],
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      fontFamily: 'inherit',
                      transition: `color ${tokens.motion.hover}`,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </Box>
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
