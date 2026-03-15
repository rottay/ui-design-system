/**
 * @fileoverview Card.Header Compound - Rottay Design System
 * @description Header section for Card with title, subtitle, and extra content.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The CardHeader provides a consistent header layout for cards with
 * flexible content slots for title, subtitle, avatar, and extra actions.
 *
 * **Layout Structure:**
 * - Avatar slot (optional, left side)
 * - Text content (title + subtitle, center)
 * - Extra content (optional, right side)
 *
 * **CSS Variables:**
 * - `--ds-card-title-size` - Title font size
 * - `--ds-card-title-color` - Title text color
 * - `--ds-card-subtitle-size` - Subtitle font size
 * - `--ds-card-subtitle-color` - Subtitle text color
 *
 * @example Basic Header
 * ```tsx
 * <Card.Header title="Card Title" />
 * ```
 *
 * @example With Avatar and Actions
 * ```tsx
 * <Card.Header
 *   title="John Doe"
 *   subtitle="Software Engineer"
 *   avatar={<Avatar src="/avatar.jpg" />}
 *   extra={<Button icon={<MoreIcon />} />}
 *   divider
 * />
 * ```
 *
 * @see {@link Card} for the main component
 * @module CardHeader
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import type { CardHeaderProps } from '../../Card.types';

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
    borderBottom: divider ? '1px solid var(--ds-card-header-border, var(--ds-card-border, #e5e5e5))' : 'none',
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
    fontSize: 'var(--ds-card-title-font-size, 16px)',
    fontWeight: 600,
    color: 'var(--ds-card-title-color, var(--ds-color-text-primary, #171717))',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const subtitleStyle: CSSProperties = {
    margin: 0,
    fontSize: 'var(--ds-card-subtitle-font-size, 14px)',
    color: 'var(--ds-card-subtitle-color, var(--ds-color-text-secondary, #737373))',
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
