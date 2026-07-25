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
import type { CardHeaderProps } from '../../contracts';

/**
 * Padding size to CSS value mapping.
 * @internal
 */
const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: 'var(--ds-card-header-padding-sm, var(--ds-spacing-3, 12px) var(--ds-spacing-4, 16px))',
  md: 'var(--ds-card-header-padding, var(--ds-spacing-4, 16px) var(--ds-spacing-5, 20px))',
  lg: 'var(--ds-card-header-padding-lg, var(--ds-spacing-5, 20px) var(--ds-spacing-6, 24px))',
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
  eyebrow,
  icon,
  title,
  headingLevel = 3,
  subtitle,
  extra,
  avatar,
  divider = false,
  padding = 'md',
  children,
  className = '',
  style,
  ...rest
}: CardHeaderProps): React.ReactElement {
  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'var(--ds-card-header-gap, var(--ds-spacing-3, 12px))',
    padding: PADDING_MAP[padding],
    ...style,
  };

  const contentWrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-card-header-gap, var(--ds-spacing-3, 12px))',
    flex: 1,
    minWidth: 0,
  };

  const textContentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-spacing-1, 4px)',
    flex: 1,
    minWidth: 0,
  };

  const extraStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-card-header-actions-gap, var(--ds-spacing-2, 8px))',
  };

  const hasTextContent = eyebrow || title || subtitle;
  const Heading = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

  return (
    <div
      {...rest}
      className={`rottay-card-header ${className}`}
      data-part="header"
      data-divider={divider ? 'true' : undefined}
      data-has-icon={icon ? 'true' : undefined}
      data-has-avatar={avatar ? 'true' : undefined}
      data-has-eyebrow={eyebrow ? 'true' : undefined}
      data-has-extra={extra ? 'true' : undefined}
      style={headerStyle}
    >
      <div className="rottay-card-header-content" style={contentWrapperStyle}>
        {icon && (
          <span className="rottay-card-header-icon" data-part="icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {avatar && (
          <div className="rottay-card-header-avatar" data-part="avatar" style={{ flexShrink: 0 }}>
            {avatar}
          </div>
        )}
        {hasTextContent && (
          <div className="rottay-card-header-text" style={textContentStyle}>
            {eyebrow && <span data-part="eyebrow">{eyebrow}</span>}
            {title && <Heading data-part="title">{title}</Heading>}
            {subtitle && <p data-part="subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {extra && (
        <div className="rottay-card-header-extra" data-part="extra" style={extraStyle}>
          {extra}
        </div>
      )}
    </div>
  );
}

CardHeader.displayName = 'Card.Header';

export type { CardHeaderProps };
