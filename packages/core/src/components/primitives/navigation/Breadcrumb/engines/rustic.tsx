/**
 * @fileoverview Breadcrumb Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Breadcrumb component.
 * A zero-dependency engine for maximum control and accessibility.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless engine in the Rottay Design System, built with
 * pure HTML and CSS. It provides:
 * - Zero external dependencies
 * - Maximum styling flexibility
 * - Full accessibility support
 * - Smallest bundle footprint
 * - CSS variable-based theming
 *
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - Projects requiring custom styling without library constraints
 * - Accessibility-focused applications
 * - Server-side rendering scenarios
 * - When you want full control over markup and styles
 *
 * **CSS Variables Used:**
 * - `--ds-color-primary`: Link text color
 * - `--ds-color-neutral-600`: Non-link text color
 * - `--ds-color-neutral-400`: Separator color
 *
 * **Multi-Tenant Theming:**
 * Rustic breadcrumbs use CSS variables which can be easily customized
 * per tenant by overriding the root CSS variables.
 *
 * @example Basic Usage
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * <Breadcrumb
 *   engine="rustic"
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'about', label: 'About', href: '/about' },
 *     { key: 'team', label: 'Team' },
 *   ]}
 * />
 * ```
 *
 * @example Custom Separator
 * ```tsx
 * <Breadcrumb
 *   engine="rustic"
 *   separator=">"
 *   items={items}
 * />
 *
 * // Or with a custom element
 * <Breadcrumb
 *   engine="rustic"
 *   separator={<ChevronRight className="w-3 h-3" />}
 *   items={items}
 * />
 * ```
 *
 * @example With Icons
 * ```tsx
 * <Breadcrumb
 *   engine="rustic"
 *   items={[
 *     { key: 'home', label: 'Home', href: '/', icon: <HomeIcon /> },
 *     { key: 'settings', label: 'Settings', href: '/settings', icon: <CogIcon /> },
 *     { key: 'profile', label: 'Profile' },
 *   ]}
 * />
 * ```
 *
 * @see {@link BreadcrumbProps} - Component props interface
 * @see {@link ClassicBreadcrumb} - Ant Design alternative
 * @see {@link ModernBreadcrumb} - DaisyUI alternative
 * @module Breadcrumb/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import type { BreadcrumbProps, BreadcrumbItem } from '../Breadcrumb.types';
import { BREADCRUMB_DEFAULTS } from '../Breadcrumb.types';

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Breadcrumb component.
 *
 * @description
 * Pure HTML/CSS breadcrumb implementation with zero dependencies.
 * Provides full control over styling via CSS variables and inline styles.
 *
 * @remarks
 * **Key Features:**
 * - Semantic `<nav>` element with aria-label
 * - CSS variable-based theming
 * - Custom separator support (string or React element)
 * - Inline flexbox layout
 * - No external dependencies
 *
 * **HTML Structure:**
 * ```html
 * <nav aria-label="breadcrumb">
 *   <a href="/" style="...">Home</a>
 *   <span style="...">/</span>
 *   <a href="/products" style="...">Products</a>
 *   <span style="...">/</span>
 *   <span style="...">Current Page</span>
 * </nav>
 * ```
 *
 * **Accessibility:**
 * - Uses semantic `<nav>` element
 * - Includes `aria-label="breadcrumb"`
 * - Links use proper `<a>` tags
 * - Current page uses `<span>` (no href)
 *
 * @param props - {@link BreadcrumbProps}
 * @returns The rendered vanilla HTML Breadcrumb
 *
 * @example
 * ```tsx
 * <RusticBreadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'category', label: 'Category', href: '/category' },
 *     { key: 'current', label: 'Current Page' },
 *   ]}
 *   separator="/"
 * />
 * ```
 */
export default function RusticBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    items,
    separator = BREADCRUMB_DEFAULTS.separator,
    maxItems,
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Items Processing
  // ---------------------------------------------------------------------------

  /**
   * Handle maxItems truncation.
   * Shows: first item + ellipsis + last (maxItems - 2) items
   */
  const displayItems: BreadcrumbItem[] = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { key: 'ellipsis', label: '...' },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  /** Container styles using flexbox for alignment */
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    ...style,
  };

  // CSS variables with fallback chains (ds-breadcrumb -> ds-color -> hardcoded)
  // ensure the component works even when no theme variables are defined
  const linkStyle: React.CSSProperties = {
    color: 'var(--ds-breadcrumb-link-color, var(--ds-color-primary-500, #0066CC))',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  /** Non-link item styles (current page) */
  const itemStyle: React.CSSProperties = {
    color: 'var(--ds-breadcrumb-item-color, var(--ds-color-neutral-600, #666))',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  /** Separator styles */
  const separatorStyle: React.CSSProperties = {
    color: 'var(--ds-breadcrumb-separator-color, var(--ds-color-neutral-400, #999))',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Semantic <nav> with aria-label enables screen readers to identify
  // this as a breadcrumb navigation landmark
  return (
    <nav className={className} style={containerStyle} aria-label="breadcrumb">
      {displayItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {/* Render link or span based on href presence */}
          {item.href ? (
            <a href={item.href} style={linkStyle} onClick={item.onClick}>
              {item.icon} {item.label}
            </a>
          ) : (
            <span style={itemStyle}>
              {item.icon} {item.label}
            </span>
          )}

          {/* Render separator between items (not after last item) */}
          {index < displayItems.length - 1 && (
            <span style={separatorStyle}>{separator}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
