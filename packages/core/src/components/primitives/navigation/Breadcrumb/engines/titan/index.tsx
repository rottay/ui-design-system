/**
 * @fileoverview Breadcrumb Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Breadcrumb component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Titan is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Native Ant Design styling and animations
 * - Full theme token integration
 * - RTL (Right-to-Left) support
 * - Responsive behavior
 *
 * **When to Use Titan:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When consistent styling with other Ant Design components is needed
 *
 * **Multi-Tenant Theming:**
 * Titan breadcrumbs inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Truncation Behavior:**
 * When `maxItems` is specified and the items array exceeds it:
 * - First item is always shown
 * - Middle items are replaced with ellipsis (...)
 * - Last (maxItems - 2) items are shown
 *
 * @example Basic Usage
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * // Titan is the default engine
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'products', label: 'Products', href: '/products' },
 *     { key: 'current', label: 'Current Page' },
 *   ]}
 * />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Breadcrumb
 *   engine="titan"
 *   items={items}
 *   separator=">"
 * />
 * ```
 *
 * @example With Icons and Custom Separator
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/', icon: <HomeOutlined /> },
 *     { key: 'list', label: 'Application List', href: '/apps' },
 *     { key: 'app', label: 'Application' },
 *   ]}
 *   separator={<RightOutlined />}
 * />
 * ```
 *
 * @see {@link BreadcrumbProps} - Component props interface
 * @see {@link HermesBreadcrumb} - DaisyUI alternative
 * @see {@link ApolloBreadcrumb} - Vanilla alternative
 * @see {@link https://ant.design/components/breadcrumb} - Ant Design Breadcrumb docs
 * @module Breadcrumb/Engines/Titan
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import type { BreadcrumbProps, BreadcrumbItem } from '../../types';
import { BREADCRUMB_DEFAULTS } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Titan Engine implementation of the Breadcrumb component.
 *
 * @description
 * Wraps Ant Design's Breadcrumb component with Rottay's standardized props API.
 * Provides enterprise-grade breadcrumb functionality with full Ant Design integration.
 *
 * @remarks
 * **Key Features:**
 * - Native Ant Design styling
 * - Automatic hover effects on links
 * - Theme token integration
 * - Custom separator support
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | items | items (transformed) |
 * | separator | separator |
 * | className | className |
 * | style | style |
 *
 * **Note on maxItems:**
 * Ant Design doesn't natively support maxItems truncation, so this
 * implementation handles it manually by transforming the items array.
 *
 * @param props - {@link BreadcrumbProps}
 * @returns The rendered Ant Design Breadcrumb
 *
 * @example
 * ```tsx
 * <TitanBreadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'category', label: 'Electronics', href: '/electronics' },
 *     { key: 'product', label: 'Laptop Pro' },
 *   ]}
 *   separator="/"
 *   maxItems={4}
 * />
 * ```
 */
export default function TitanBreadcrumb(props: BreadcrumbProps): React.ReactElement {
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
   * Handle maxItems truncation manually since AntD doesn't support it directly.
   * Shows: first item + ellipsis + last (maxItems - 2) items
   */
  const displayItems: BreadcrumbItem[] = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { key: 'ellipsis', label: '...' },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

  /**
   * Transform Rottay items to Ant Design format.
   * Maps our standardized props to Ant Design's expected structure.
   */
  const antItems = displayItems.map((item) => ({
    title: (
      <>
        {item.icon} {item.label}
      </>
    ),
    href: item.href,
    onClick: item.onClick,
  }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AntBreadcrumb
      items={antItems}
      separator={separator}
      className={className}
      style={style}
    />
  );
}
