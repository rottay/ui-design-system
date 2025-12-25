/**
 * AuthLayout - Standard Preset
 * Email/password + remember me + forgot password
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AuthLayoutProps } from '../../core';
import { AUTH_LAYOUT_DEFAULTS } from '../../core';

export const StandardAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Standard',
  render: ({ primitives, props, tokens }: PresetContext<AuthLayoutProps>) => {
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
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <Stack direction="vertical" spacing="lg">
            {/* Logo */}
            {logo && (
              <Box style={{ textAlign: 'center' }}>
                {typeof logo === 'string' ? (
                  <img src={logo} alt="Logo" style={{ height: '48px' }} />
                ) : logo}
              </Box>
            )}

            {/* Header */}
            <Box style={{ textAlign: 'center' }}>
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
                <p style={{
                  color: `var(--color-neutral-500)`,
                  marginTop: tokens.spacing[2],
                  marginBottom: 0,
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
                      color: tokens.colors.primary,
                      cursor: 'pointer',
                      padding: 0,
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
                <Box style={{ textAlign: 'center' }}>{footer}</Box>
              </>
            )}
          </Stack>
        </Card>
      </Box>
    );
  },
});
