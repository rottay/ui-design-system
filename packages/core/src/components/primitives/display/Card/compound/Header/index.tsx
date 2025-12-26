/**
 * @fileoverview Card.Header Compound Component
 * @description Header section for Card component with title, subtitle, avatar, and extra content.
 * Provides a consistent header layout across all card variations.
 *
 * @module Card/compound/Header
 * @package @es-rottay/designsystem-core
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardHeaderProps } from '../../types';

/**
 * Padding size to CSS value mapping.
 * @internal
 */
const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px 16px',
  md: '16px 24px',
  lg: '20px 32px',
};

/**
 * Card header compound component.
 * Displays title, subtitle, avatar, and extra content in a consistent layout.
 *
 * Features:
 * - Flexible title and subtitle with text truncation
 * - Optional avatar/icon support
 * - Extra content slot (typically for action buttons)
 * - Optional divider below the header
 * - Configurable padding
 *
 * @component
 * @example
 * // Basic usage with title
 * <Card.Header title="Card Title" />
 *
 * @example
 * // With subtitle and avatar
 * <Card.Header
 *   title="John Doe"
 *   subtitle="Software Engineer"
 *   avatar={<Avatar src="/avatar.jpg" />}
 * />
 *
 * @example
 * // With extra content and divider
 * <Card.Header
 *   title="Settings"
 *   extra={<Button icon={<SettingsIcon />} />}
 *   divider
 * />
 *
 * @param {CardHeaderProps} props - Component properties
 * @returns {React.ReactElement} The rendered CardHeader component
 */
export function CardHeader({
  title,
  subtitle,
  extra,
  avatar,
  divider = false,
  padding = 'md',
  children,
  className = '',
  style,
}: CardHeaderProps): React.ReactElement {
  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    padding: PADDING_MAP[padding],
    borderBottom: divider ? '1px solid var(--card-border-color, #f0f0f0)' : 'none',
    ...style,
  };

  const contentWrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  };

  const textContentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: 'var(--card-title-size, 16px)',
    fontWeight: 600,
    color: 'var(--card-title-color, #000)',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const subtitleStyle: CSSProperties = {
    margin: 0,
    fontSize: 'var(--card-subtitle-size, 14px)',
    color: 'var(--card-subtitle-color, #666)',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const extraStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const hasTextContent = title || subtitle;

  return (
    <div className={`rottay-card-header ${className}`} style={headerStyle}>
      <div className="rottay-card-header-content" style={contentWrapperStyle}>
        {avatar && (
          <div className="rottay-card-header-avatar" style={{ flexShrink: 0 }}>
            {avatar}
          </div>
        )}
        {hasTextContent && (
          <div className="rottay-card-header-text" style={textContentStyle}>
            {title && <h3 style={titleStyle}>{title}</h3>}
            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {extra && (
        <div className="rottay-card-header-extra" style={extraStyle}>
          {extra}
        </div>
      )}
    </div>
  );
}

CardHeader.displayName = 'Card.Header';

export type { CardHeaderProps };
