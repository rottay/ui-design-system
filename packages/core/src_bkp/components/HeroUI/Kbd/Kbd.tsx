import React from 'react';
import { theme } from 'antd';
import { useTheme } from '../../../hooks/useTheme';
import type { KbdProps } from './types';

/**
 * Kbd Component - Theme-aware keyboard key display
 *
 * Displays keyboard keys visually as styled buttons/keys.
 * Perfect for showing shortcuts, hotkeys, and keyboard commands.
 *
 * @example
 * ```tsx
 * // Single key
 * <Kbd>K</Kbd>
 *
 * // Multiple keys
 * <Kbd keys={['Ctrl', 'K']} />
 *
 * // With custom styling
 * <Kbd size="lg" variant="shadow">Enter</Kbd>
 *
 * // Inline usage
 * <p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search</p>
 * ```
 */
export const Kbd: React.FC<KbdProps> = ({
  children,
  keys,
  size = 'md',
  variant = 'solid',
  className,
  style,
  abbr,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Theme-specific styles
  const getThemeStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      verticalAlign: 'middle',
      ...style,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: variant === 'shadow' ? '0 2px 4px rgba(0, 0, 0, 0.4)' : undefined,
        };

      case 'stripe':
        return {
          ...baseStyles,
          background: variant === 'flat' ? '#F6F9FC' : '#FFFFFF',
          color: token.colorText,
          border: variant === 'bordered' ? `1px solid ${token.colorBorder}` : '1px solid #E3E8EE',
          boxShadow: variant === 'shadow' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
        };

      case 'notion':
        return {
          ...baseStyles,
          background: variant === 'flat' ? 'rgba(242, 241, 238, 1)' : 'rgba(255, 255, 255, 1)',
          color: 'rgba(55, 53, 47, 1)',
          border: '1px solid rgba(55, 53, 47, 0.16)',
          borderRadius: '3px',
          boxShadow: variant === 'shadow' ? 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px' : 'none',
        };

      case 'linear':
        return {
          ...baseStyles,
          background: variant === 'flat' ? 'rgba(0, 0, 0, 0.04)' : '#FFFFFF',
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: '6px',
          boxShadow: variant === 'shadow' ? '0 2px 8px rgba(0, 0, 0, 0.12)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
        };

      case 'airbnb':
        return {
          ...baseStyles,
          background: '#FFFFFF',
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        };

      case 'slack':
        return {
          ...baseStyles,
          background: 'rgba(248, 248, 248, 1)',
          color: 'rgba(29, 28, 29, 1)',
          border: '1px solid rgba(29, 28, 29, 0.13)',
          borderRadius: '4px',
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.03)',
        };

      case 'vercel':
        return {
          ...baseStyles,
          background: variant === 'flat' ? '#0A0A0A' : '#000000',
          color: '#FFFFFF',
          border: '1px solid #333333',
          borderRadius: '5px',
          boxShadow: variant === 'shadow' ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 0 0 1px rgba(255, 255, 255, 0.1)',
        };

      default:
        return {
          ...baseStyles,
          background: token.colorBgContainer,
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: token.boxShadowSecondary,
        };
    }
  };

  // Size mapping
  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '11px', minWidth: '20px' },
    md: { padding: '3px 8px', fontSize: '13px', minWidth: '24px' },
    lg: { padding: '4px 10px', fontSize: '15px', minWidth: '28px' },
  };

  const themeStyles = getThemeStyles();
  const finalStyles = {
    ...themeStyles,
    ...sizeStyles[size],
  };

  // If keys array is provided, render multiple keys with separator
  if (keys && keys.length > 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span style={{ color: token.colorTextSecondary, fontSize: '12px', padding: '0 2px' }}>
                +
              </span>
            )}
            <kbd
              className={className}
              style={finalStyles}
              title={abbr}
            >
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </span>
    );
  }

  // Single key
  return (
    <kbd
      className={className}
      style={finalStyles}
      title={abbr}
    >
      {children}
    </kbd>
  );
};

Kbd.displayName = 'Kbd';
