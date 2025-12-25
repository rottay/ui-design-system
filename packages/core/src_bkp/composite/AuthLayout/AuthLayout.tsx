import React from 'react';
import { Card, theme } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { AuthLayoutProps } from './types';

/**
 * AuthLayout Component
 *
 * Layout wrapper for authentication pages (login, register, forgot password).
 * Provides visual structure with logo, background options, and form container.
 *
 * Compatible with any authentication solution (NextAuth, Clerk, Auth0, etc.)
 * as it only handles the visual layout, not authentication logic.
 *
 * @example
 * ```tsx
 * <AuthLayout
 *   title="Welcome Back"
 *   subtitle="Sign in to your account"
 *   logoSrc="/logo.png"
 *   backgroundVariant="gradient"
 * >
 *   <Form onFinish={handleLogin}>
 *     <Input type="email" />
 *     <Input type="password" />
 *     <Button>Sign In</Button>
 *   </Form>
 * </AuthLayout>
 * ```
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  logoSrc,
  logoAlt = 'Logo',
  backgroundVariant = 'solid',
  backgroundImage,
  gradientColors,
  backgroundColor,
  position = 'center',
  maxWidth = 400,
  footer,
  showBackLink = false,
  backLinkText = 'Back to Home',
  backLinkUrl = '/',
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Use theme tokens as defaults
  const defaultGradientColors: [string, string] = [token.colorPrimary, token.colorSuccess];
  const defaultBackgroundColor = token.colorBgLayout;
  const finalGradientColors = gradientColors || defaultGradientColors;
  const finalBackgroundColor = backgroundColor || defaultBackgroundColor;

  // Theme-specific styles
  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      width: '100%',
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#121212',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          borderRadius: 8,
          border: `2px solid ${token.colorBorder}`,
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: 6,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
          borderRadius: 3,
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F9FAFB',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        };
    }
  };

  // Theme-specific body padding
  const getCardBodyPadding = (): number => {
    switch (template) {
      case 'spotify':
        return 40;
      case 'stripe':
        return 32;
      case 'notion':
        return 28;
      case 'linear':
        return 40;
      default:
        return 32;
    }
  };

  // Theme-specific title styles
  const getTitleStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      margin: 0,
      marginBottom: subtitle ? '0.5rem' : 0,
      color: token.colorText,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.5px',
        };
      case 'stripe':
        return {
          ...baseStyles,
          fontSize: 26,
          fontWeight: 600,
        };
      case 'notion':
        return {
          ...baseStyles,
          fontSize: 24,
          fontWeight: 700,
        };
      case 'linear':
        return {
          ...baseStyles,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '-0.3px',
        };
      default:
        return {
          ...baseStyles,
          fontSize: 24,
          fontWeight: 600,
        };
    }
  };
  // Background styles based on variant
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (backgroundVariant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${finalGradientColors[0]}, ${finalGradientColors[1]})`,
        };
      case 'image':
        return {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      case 'solid':
        return {
          backgroundColor: finalBackgroundColor,
        };
      case 'none':
        return {};
      default:
        return {
          backgroundColor: finalBackgroundColor,
        };
    }
  };

  // Justify content based on position
  const getJustifyContent = () => {
    switch (position) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };

  return (
    <div
      className={className}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: getJustifyContent(),
        padding: '2rem 1rem',
        ...getBackgroundStyle(),
        ...style,
      }}
    >
      {/* Back Link */}
      {showBackLink && (
        <div
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
          }}
        >
          <a
            href={backLinkUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: backgroundVariant === 'none' ? token.colorPrimary : token.colorBgContainer,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <ArrowLeft size={16} />
            {backLinkText}
          </a>
        </div>
      )}

      {/* Form Container */}
      <Card style={getCardStyles()} styles={{ body: { padding: getCardBodyPadding() } }}>
        {/* Logo */}
        {logoSrc && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: template === 'spotify' || template === 'linear' ? '2rem' : '1.5rem',
            }}
          >
            <img
              src={logoSrc}
              alt={logoAlt}
              style={{
                height: template === 'spotify' ? '56px' : template === 'linear' ? '52px' : '48px',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Title & Subtitle */}
        {(title || subtitle) && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: template === 'spotify' || template === 'linear' ? '2.5rem' : '2rem',
            }}
          >
            {title && (
              <h1 style={getTitleStyles()}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: template === 'spotify' ? 15 : 14,
                  color: token.colorTextSecondary,
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Form Content */}
        {children}

        {/* Footer */}
        {footer && (
          <div
            style={{
              marginTop: template === 'spotify' || template === 'linear' ? '2rem' : '1.5rem',
              paddingTop: template === 'spotify' || template === 'linear' ? '2rem' : '1.5rem',
              borderTop: `1px solid ${token.colorBorder}`,
              textAlign: 'center',
              fontSize: 14,
              color: token.colorTextSecondary,
            }}
          >
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

AuthLayout.displayName = 'AuthLayout';
