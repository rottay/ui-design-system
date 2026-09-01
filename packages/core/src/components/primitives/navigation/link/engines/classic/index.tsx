/**
 * @fileoverview Classic Link Engine - Rottay Design System
 * @description Ant Design implementation of the Link component.
 * Uses Typography.Link for consistent Ant Design styling and behavior.
 *
 * @remarks
 * The Classic engine leverages Ant Design's Typography.Link component,
 * providing a feature-rich implementation with:
 * - Built-in Ant Design theming support
 * - Consistent typography with other Ant components
 * - Native disabled and underline prop support
 * - Smooth color transitions
 *
 * This is the default engine and provides the most complete feature set.
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Link href="/dashboard" type="primary">Dashboard</Link>
 *
 * // Or explicitly specify the engine
 * <Link engine="classic" href="/about">About Us</Link>
 * ```
 *
 * @example Integration with Ant Design Theme
 * ```tsx
 * import { ConfigProvider } from 'antd';
 * import { Link } from '@rottay/design-system';
 *
 * <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
 *   <Link type="primary" href="/dashboard">
 *     Uses Ant Design's theme token
 *   </Link>
 * </ConfigProvider>
 * ```
 *
 * @see {@link LinkProps} for prop documentation
 * @see {@link https://ant.design/components/typography#typographylink Ant Design Typography.Link}
 *
 * @module Link/engines/classic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Typography } from 'antd';
import type { LinkProps } from '../../contracts';
import { LINK_DEFAULTS } from '../../contracts';

// ============================================================================
// Ant Design Link Reference
// ============================================================================

/** Extract Link component from Ant Design Typography */
const { Link: AntLink } = Typography;

// ============================================================================
// Color Mapping
// ============================================================================

/**
 * Maps semantic link types to CSS variable colors rather than Ant Design
 * theme tokens, so tenant-specific themes can override link colors
 * without reconfiguring the Ant Design ConfigProvider.
 */
const typeColorMap: Record<string, string> = {
  default: 'var(--ds-color-link)',
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  danger: 'var(--ds-color-error)',
};

// ============================================================================
// Classic Link Component
// ============================================================================

/**
 * Classic engine Link component using Ant Design's Typography.Link.
 *
 * @description
 * Wraps Ant Design's Typography.Link component to provide consistent
 * styling with the Rottay Design System's Link API. Supports all standard
 * Link props while leveraging Ant Design's built-in features.
 *
 * @remarks
 * - Uses Ant Design's disabled and underline props natively
 * - Applies custom colors via style prop for type support
 * - Handles external links with security attributes
 * - Prevents click events when disabled
 *
 * @param props - {@link LinkProps}
 * @returns Ant Design Typography.Link element
 *
 * @example
 * ```tsx
 * <ClassicLink href="/dashboard" type="primary" underline>
 *   Go to Dashboard
 * </ClassicLink>
 * ```
 */
export default function ClassicLink(props: LinkProps): React.ReactElement {
  // ========================================================================
  // Props Destructuring
  // ========================================================================

  const {
    children,
    href,
    type = LINK_DEFAULTS.type,
    disabled = LINK_DEFAULTS.disabled,
    underline = LINK_DEFAULTS.underline,
    external = LINK_DEFAULTS.external,
    externalIcon: _externalIcon,
    className,
    style,
    onClick,
    ...rest
  } = props;

  // externalIcon is consumed by the modern engine only; swallowed here so it
  // never leaks onto the DOM through rest.
  void _externalIcon;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle click events on the link.
   * Prevents navigation when the link is disabled.
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e as any);
  };

  // ========================================================================
  // External Link Attributes
  // ========================================================================

  /** Security attributes for external links */
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  // ========================================================================
  // Render
  // ========================================================================

  // When disabled, we omit our type color so Ant Design applies its own
  // muted color, ensuring a consistent disabled appearance across themes
  return (
    <AntLink
      href={disabled ? undefined : href}
      disabled={disabled}
      underline={underline}
      onClick={handleClick}
      className={className}
      style={{
        color: disabled ? undefined : typeColorMap[type],
        ...style,
      }}
      {...externalProps}
      {...rest}
    >
      {children}
    </AntLink>
  );
}

// ============================================================================
// Display Name
// ============================================================================

/** Set display name for React DevTools debugging */
ClassicLink.displayName = 'ClassicLink';
