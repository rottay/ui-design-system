import React from 'react';
import { Button, theme } from 'antd';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { DefaultErrorFallbackProps } from './types';

/**
 * DefaultErrorFallback Component
 *
 * Default fallback UI displayed when ErrorBoundary catches an error.
 * Features theme-aware styling and displays error details in development mode.
 */
export const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Theme-specific container styles
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '48px 24px',
      textAlign: 'center',
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: '#121212',
          borderRadius: 8,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F9FAFB',
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        };
      case 'vercel':
        return {
          ...baseStyles,
          background: '#FAFAFA',
          borderRadius: 8,
          border: `1px solid ${token.colorBorder}`,
        };
      case 'airbnb':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
        };
      case 'slack':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          boxShadow: token.boxShadow,
        };
    }
  };

  // Theme-specific icon size
  const getIconSize = (): number => {
    switch (template) {
      case 'spotify':
        return 64;
      case 'stripe':
        return 56;
      case 'notion':
        return 48;
      case 'linear':
        return 64;
      default:
        return 56;
    }
  };

  // Theme-specific title styles
  const getTitleStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      color: token.colorText,
      marginBottom: 8,
      marginTop: 16,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.5px',
        };
      case 'stripe':
        return {
          ...baseStyles,
          fontSize: 28,
          fontWeight: 600,
        };
      case 'notion':
        return {
          ...baseStyles,
          fontSize: 26,
          fontWeight: 700,
        };
      case 'linear':
        return {
          ...baseStyles,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.3px',
        };
      default:
        return {
          ...baseStyles,
          fontSize: 28,
          fontWeight: 600,
        };
    }
  };

  // Theme-specific error details styles
  const getErrorDetailsStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      marginTop: 24,
      padding: 16,
      background: token.colorBgLayout,
      border: `1px solid ${token.colorBorder}`,
      textAlign: 'left',
      maxWidth: '600px',
      overflow: 'auto',
      maxHeight: '300px',
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          borderRadius: 8,
          background: '#1a1a1a',
        };
      case 'stripe':
        return {
          ...baseStyles,
          borderRadius: 6,
          background: '#F7F9FC',
        };
      case 'notion':
        return {
          ...baseStyles,
          borderRadius: 3,
          background: '#F7F6F3',
        };
      case 'linear':
        return {
          ...baseStyles,
          borderRadius: 12,
          background: '#F3F4F6',
        };
      default:
        return {
          ...baseStyles,
          borderRadius: token.borderRadius,
        };
    }
  };

  return (
    <div style={getContainerStyles()}>
      {/* Error Icon */}
      <div style={{ color: token.colorError }}>
        <AlertTriangleIcon size={getIconSize()} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 style={getTitleStyles()}>Something went wrong</h2>

      {/* Description */}
      <p
        style={{
          fontSize: 16,
          color: token.colorTextSecondary,
          marginBottom: 24,
          maxWidth: '500px',
        }}
      >
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>

      {/* Try Again Button */}
      <Button
        type="primary"
        size="large"
        icon={<RefreshCwIcon size={16} />}
        onClick={resetError}
        style={{
          fontWeight: 500,
        }}
      >
        Try Again
      </Button>

      {/* Error Details (Development Only) */}
      {isDevelopment && (
        <div style={getErrorDetailsStyles()}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: token.colorTextSecondary,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Error Details (Development Mode)
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: token.colorError,
              marginBottom: 8,
              fontFamily: 'monospace',
            }}
          >
            {error.name}: {error.message}
          </div>
          {error.stack && (
            <pre
              style={{
                fontSize: 12,
                color: token.colorTextSecondary,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                lineHeight: 1.5,
              }}
            >
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

DefaultErrorFallback.displayName = 'DefaultErrorFallback';
