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
 * **Paint contract:**
 * - `--ds-card-title-font-size` / `--ds-card-title-color` - Title typography
 * - `--ds-card-subtitle-font-size` / `--ds-card-subtitle-color` - Subtitle typography
 * - `--ds-card-header-padding{,-sm,-lg}` - Section padding per `data-padding`
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
import type { CardHeaderProps } from '../../contracts';

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
 * Layout and paint are owned by `presentation/components/skin/card-compounds.css`,
 * keyed on the class + `data-part`/`data-padding` contract stamped here; only a
 * caller's own `style` prop stays inline.
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
  const hasTextContent = eyebrow || title || subtitle;
  const Heading = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

  return (
    <div
      {...rest}
      className={`rottay-card-header ${className}`}
      data-part="header"
      data-divider={divider ? 'true' : undefined}
      data-padding={padding}
      data-has-icon={icon ? 'true' : undefined}
      data-has-avatar={avatar ? 'true' : undefined}
      data-has-eyebrow={eyebrow ? 'true' : undefined}
      data-has-extra={extra ? 'true' : undefined}
      style={style}
    >
      <div className="rottay-card-header-content">
        {icon && (
          <span className="rottay-card-header-icon" data-part="icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {avatar && (
          <div className="rottay-card-header-avatar" data-part="avatar">
            {avatar}
          </div>
        )}
        {hasTextContent && (
          <div className="rottay-card-header-text">
            {eyebrow && <span data-part="eyebrow">{eyebrow}</span>}
            {title && <Heading data-part="title">{title}</Heading>}
            {subtitle && <p data-part="subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {extra && (
        <div className="rottay-card-header-extra" data-part="extra">
          {extra}
        </div>
      )}
    </div>
  );
}

CardHeader.displayName = 'Card.Header';

export type { CardHeaderProps };
