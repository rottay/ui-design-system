'use client';

/**
 * AuthLayout - Minimal Preset
 * Clean centered card with dot-pattern background, branding area,
 * accent bar, social providers, remember-me, forgot-password, and footer.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle, createAccentBarStyle, createHoverStyle, getCardHoverShadow } from '../../../helpers';
import type { AuthLayoutProps } from '../../core';

export const MinimalAuthLayout = createPreset<AuthLayoutProps>({
  name: 'AuthLayout.Minimal',
  render: ({ primitives, props, tokens, engine }: PresetContext<AuthLayoutProps>) => {
    const { Box, Text, Stack, Divider } = primitives;
    const {
      title, subtitle, children, logo, showRememberMe, showForgotPassword,
      onForgotPassword, socialProviders, showTerms, termsContent, footer, className, style,
    } = props;

    const isGlass = engine === 'modern' && !!tokens.glass;
    const [cardHovered, setCardHovered] = useState(false);
    const [forgotHovered, setForgotHovered] = useState(false);
    const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: 'md', glass: isGlass, padding: 0,
    }), [tokens, isGlass]);

    const accentBarStyle = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
    const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);

    const backgroundPattern = useMemo<React.CSSProperties>(() => ({
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.spacing[4],
      background: `radial-gradient(${tokens.colors.neutral[200]} 1px, transparent 1px)`,
      backgroundSize: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
      backgroundColor: tokens.colors.neutral[50],
      ...style,
    }), [tokens, style]);

    const cardContainerStyle = useMemo<React.CSSProperties>(() => ({
      ...cardStyle, ...hoverBase,
      width: '100%', maxWidth: 420,
      overflow: 'hidden' as const, position: 'relative' as const,
      boxShadow: cardHovered ? getCardHoverShadow(tokens, 'md') : tokens.shadows.md,
    }), [cardStyle, hoverBase, tokens, cardHovered]);

    const brandingAreaStyle = useMemo<React.CSSProperties>(() => ({
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center',
      padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
      backgroundColor: tokens.colors.primaryScale[50],
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[100]}`,
    }), [tokens]);

    const titleStyle = useMemo<React.CSSProperties>(() => ({
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      textAlign: 'center' as const, margin: 0,
      color: tokens.colors.neutral[900],
    }), [tokens]);

    const subtitleStyle = useMemo<React.CSSProperties>(() => ({
      color: tokens.colors.neutral[500],
      textAlign: 'center' as const, margin: 0,
      fontSize: tokens.typography.fontSize.sm,
      lineHeight: tokens.typography.lineHeight.relaxed,
    }), [tokens]);

    const socialButtonStyle = (providerName: string): React.CSSProperties => {
      const isHover = hoveredSocial === providerName;
      return {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
        borderRadius: tokens.borderRadius.md,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: isHover ? tokens.colors.neutral[50] : tokens.colors.common.white,
        cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        color: tokens.colors.neutral[700],
        transform: isHover ? tokens.motion.transform : 'none',
        boxShadow: isHover ? tokens.shadows.sm : 'none',
        width: '100%',
      };
    };

    const forgotLinkStyle = useMemo<React.CSSProperties>(() => ({
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: forgotHovered ? tokens.colors.primaryScale[700] : tokens.colors.primaryScale[600],
      cursor: 'pointer', transition: `color ${tokens.motion.hover}`,
      background: 'none', border: 'none', padding: 0,
      textDecoration: forgotHovered ? 'underline' : 'none',
    }), [tokens, forgotHovered]);

    const footerAreaStyle = useMemo<React.CSSProperties>(() => ({
      padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
      backgroundColor: tokens.colors.neutral[50],
    }), [tokens]);

    return (
      <Box className={className} style={backgroundPattern}>
        <Box
          style={cardContainerStyle}
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
        >
          {/* Accent bar */}
          <Box style={accentBarStyle} />

          {/* Branding / logo area */}
          <Box style={brandingAreaStyle}>
            {logo && (
              <Box style={{ marginBottom: tokens.spacing[2] }}>
                {typeof logo === 'string'
                  ? <img src={logo} alt="Logo" style={{ height: tokens.spacing[8], objectFit: 'contain' as const }} />
                  : logo}
              </Box>
            )}
            {title && <Text style={titleStyle}>{title}</Text>}
            {subtitle && (
              <Text style={{ ...subtitleStyle, marginTop: tokens.spacing[1] }}>{subtitle}</Text>
            )}
          </Box>

          {/* Form area */}
          <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
            <Stack direction="vertical" spacing="md">
              {children}

              {/* Remember me + Forgot password row */}
              {(showRememberMe || showForgotPassword) && (
                <Box style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600],
                }}>
                  {showRememberMe ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: tokens.colors.primaryScale[600] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                        Remember me
                      </Text>
                    </label>
                  ) : <Box />}
                  {showForgotPassword && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      onMouseEnter={() => setForgotHovered(true)}
                      onMouseLeave={() => setForgotHovered(false)}
                      style={forgotLinkStyle}
                    >
                      Forgot password?
                    </button>
                  )}
                </Box>
              )}

              {/* Social providers */}
              {socialProviders && socialProviders.length > 0 && (
                <>
                  <Box style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs,
                  }}>
                    <Divider style={{ flex: 1 }} />
                    <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>
                      or continue with
                    </Text>
                    <Divider style={{ flex: 1 }} />
                  </Box>
                  <Stack direction="vertical" spacing="sm">
                    {socialProviders.map((provider) => (
                      <button
                        key={provider.name}
                        type="button"
                        onClick={provider.onClick}
                        onMouseEnter={() => setHoveredSocial(provider.name)}
                        onMouseLeave={() => setHoveredSocial(null)}
                        style={socialButtonStyle(provider.name)}
                      >
                        {provider.icon}
                        <span>{provider.name}</span>
                      </button>
                    ))}
                  </Stack>
                </>
              )}

              {/* Terms */}
              {showTerms && termsContent && (
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400],
                  textAlign: 'center' as const, lineHeight: tokens.typography.lineHeight.relaxed,
                }}>
                  {termsContent}
                </Text>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          {footer && (
            <Box style={footerAreaStyle}>
              <Text style={{
                fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500],
                textAlign: 'center' as const,
              }}>
                {footer}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
