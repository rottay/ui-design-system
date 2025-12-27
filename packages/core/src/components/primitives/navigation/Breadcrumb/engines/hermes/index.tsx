/**
 * @fileoverview Breadcrumb Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Breadcrumb component.
 * A lightweight, utility-first engine for Tailwind CSS projects.
 *
 * @remarks
 * **Engine Overview:**
 * Hermes is the lightweight engine in the Rottay Design System, built on
 * DaisyUI and Tailwind CSS. It provides utility-first styling with:
 * - DaisyUI's breadcrumbs component styling
 * - Tailwind CSS utility classes
 * - CSS-based separators (no custom separator support)
 * - Minimal JavaScript bundle
 *
 * **When to Use Hermes:**
 * - Projects using Tailwind CSS as the primary styling solution
 * - When bundle size optimization is important
 * - Modern web apps with utility-first CSS approach
 *
 * **Limitations:**
 * - Custom separators are ignored (DaisyUI uses CSS `::before` for separators)
 * - Styling relies on DaisyUI theme configuration
 *
 * **Multi-Tenant Theming:**
 * Hermes breadcrumbs use DaisyUI theme variables which can be customized
 * per tenant via Tailwind configuration or CSS variables.
 *
 * @example Basic Usage
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * <Breadcrumb
 *   engine="hermes"
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
 *   engine="hermes"
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
 *   engine="hermes"
 *   maxItems={3}
 *   items={longItemsList}
 * />
 * // Renders: Home > ... > Current
 * ```
 *
 * @see {@link BreadcrumbProps} - Component props interface
 * @see {@link TitanBreadcrumb} - Ant Design alternative
 * @see {@link ApolloBreadcrumb} - Vanilla alternative
 * @see {@link https://daisyui.com/components/breadcrumbs/} - DaisyUI Breadcrumbs docs
 * @module Breadcrumb/Engines/Hermes
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import type { BreadcrumbProps, BreadcrumbItem } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Hermes Engine implementation of the Breadcrumb component.
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
 * <HermesBreadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'products', label: 'Products', href: '/products' },
 *     { key: 'item', label: 'Product Name' },
 *   ]}
 *   className="mb-4"
 * />
 * ```
 */
export default function HermesBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    items,
    // DaisyUI breadcrumbs uses CSS li separators, so we ignore the separator prop
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

  return (
    <div className={`breadcrumbs text-sm ${className}`} style={style}>
      <ul>
        {displayItems.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <a href={item.href} onClick={item.onClick}>
                {item.icon} {item.label}
              </a>
            ) : (
              <span>
                {item.icon} {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
