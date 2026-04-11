/**
 * @fileoverview Breadcrumb Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Breadcrumb component.
 * A lightweight, utility-first engine for Tailwind CSS projects.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the lightweight engine in the Rottay Design System, built on
 * DaisyUI and Tailwind CSS. It provides utility-first styling with:
 * - DaisyUI's breadcrumbs component styling
 * - Tailwind CSS utility classes
 * - CSS-based separators (no custom separator support)
 * - Minimal JavaScript bundle
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS as the primary styling solution
 * - When bundle size optimization is important
 * - Modern web apps with utility-first CSS approach
 *
 * **Limitations:**
 * - Custom separators are ignored (DaisyUI uses CSS `::before` for separators)
 * - Styling relies on DaisyUI theme configuration
 *
 * **Multi-Tenant Theming:**
 * Modern breadcrumbs use DaisyUI theme variables which can be customized
 * per tenant via Tailwind configuration or CSS variables.
 *
 * @example Basic Usage
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * <Breadcrumb
 *   engine="modern"
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'docs', label: 'Documents', href: '/docs' },
 *     { key: 'current', label: 'Add Document' },
 *   ]}
 * />
 * ```
 *
 * @example With Icons
 * ```tsx
 * <Breadcrumb
 *   engine="modern"
 *   items={[
 *     { key: 'home', label: 'Home', href: '/', icon: <HomeIcon className="w-4 h-4" /> },
 *     { key: 'files', label: 'Files', href: '/files', icon: <FolderIcon className="w-4 h-4" /> },
 *     { key: 'doc', label: 'Document.pdf' },
 *   ]}
 * />
 * ```
 *
 * @example With MaxItems Truncation
 * ```tsx
 * <Breadcrumb
 *   engine="modern"
 *   maxItems={3}
 *   items={longItemsList}
 * />
 * // Renders: Home > ... > Current
 * ```
 *
 * @see {@link BreadcrumbProps} - Component props interface
 * @see {@link ClassicBreadcrumb} - Ant Design alternative
 * @see {@link RusticBreadcrumb} - Vanilla alternative
 * @see {@link https://daisyui.com/components/breadcrumbs/} - DaisyUI Breadcrumbs docs
 * @module Breadcrumb/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import type { BreadcrumbProps, BreadcrumbItem } from '../Breadcrumb.types';

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Breadcrumb component.
 *
 * @description
 * Uses DaisyUI's breadcrumbs component for a Tailwind CSS-native experience.
 * Provides lightweight styling with utility classes.
 *
 * @remarks
 * **Key Features:**
 * - DaisyUI breadcrumbs styling
 * - Tailwind CSS utility classes
 * - Automatic separator via CSS `::before`
 * - Responsive design support
 *
 * **HTML Structure:**
 * ```html
 * <div class="breadcrumbs text-sm">
 *   <ul>
 *     <li><a href="/">Home</a></li>
 *     <li><a href="/docs">Documents</a></li>
 *     <li>Current Page</li>
 *   </ul>
 * </div>
 * ```
 *
 * **Note on Separator:**
 * DaisyUI uses CSS `::before` pseudo-elements for separators,
 * so the `separator` prop is ignored in this implementation.
 *
 * @param props - {@link BreadcrumbProps}
 * @returns The rendered DaisyUI Breadcrumb
 *
 * @example
 * ```tsx
 * <ModernBreadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'products', label: 'Products', href: '/products' },
 *     { key: 'item', label: 'Product Name' },
 *   ]}
 *   className="mb-4"
 * />
 * ```
 */
export default function ModernBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    items,
    // DaisyUI renders separators via CSS ::before on <li> elements, making
    // the JS separator prop unnecessary; we destructure it out to avoid
    // passing an unknown prop to the DOM
    separator: _separator,
    maxItems,
    className = '',
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
  // Render
  // ---------------------------------------------------------------------------

  // DaisyUI breadcrumbs require a div > ul > li structure; items with href
  // render as <a> for navigation, items without render as <span> to indicate
  // the current (non-clickable) page in the trail
  return (
    <div
      className={`breadcrumbs text-sm ${className}`}
      style={{
        fontSize: 'var(--ds-font-size-sm, 14px)',
        color: 'var(--ds-color-text-secondary)',
        // Override DaisyUI's ::before separator color via CSS custom property.
        // DaisyUI breadcrumbs use ::before pseudo-elements styled with the
        // current text color; this CSS variable lets tenants control it.
        '--bc-color': 'var(--ds-breadcrumb-separator-color, var(--ds-color-text-tertiary, currentColor))',
        ...style,
      } as React.CSSProperties}
    >
      <ul>
        {displayItems.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <a
                href={item.href}
                onClick={item.onClick}
                style={{
                  color: 'var(--ds-breadcrumb-link-color, var(--ds-color-primary))',
                }}
              >
                {item.icon} {item.label}
              </a>
            ) : (
              <span style={{ color: 'var(--ds-color-text-primary)' }}>
                {item.icon} {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
