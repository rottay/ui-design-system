/**
 * @fileoverview Breadcrumb Item Compound Component - Rottay Design System
 * @description Individual breadcrumb item for declarative breadcrumb definition.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The BreadcrumbItem component provides a declarative way to define
 * individual navigation steps within a breadcrumb trail. It supports
 * both linked and non-linked states.
 *
 * **When to Use:**
 * - When you prefer JSX composition over data arrays
 * - When items need complex children or conditional rendering
 * - When integrating with routing libraries that require components
 *
 * **Styling:**
 * Uses CSS variables for theming:
 * - `--ds-color-primary-500`: Link text color
 * - Gap and alignment handled via inline flexbox styles
 *
 * **Accessibility:**
 * - Links use proper anchor tags with href
 * - Non-linked items use spans with appropriate cursor
 * - Icon and text properly grouped for screen readers
 *
 * @example Basic Usage
 * ```tsx
 * <Breadcrumb items={[]}>
 *   <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *   <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
 *   <Breadcrumb.Item>Current Page</Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 *
 * @example With Icons
 * ```tsx
 * <Breadcrumb items={[]}>
 *   <Breadcrumb.Item href="/" icon={<HomeIcon />}>
 *     Home
 *   </Breadcrumb.Item>
 *   <Breadcrumb.Item href="/docs" icon={<BookIcon />}>
 *     Documentation
 *   </Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 *
 * @example With Click Handlers
 * ```tsx
 * <Breadcrumb items={[]}>
 *   <Breadcrumb.Item
 *     href="/"
 *     onClick={(e) => {
 *       e.preventDefault();
 *       router.push('/');
 *     }}
 *   >
 *     Home
 *   </Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 *
 * @see {@link BreadcrumbItemProps} - Component props interface
 * @see {@link Breadcrumb} - Parent breadcrumb component
 * @module Breadcrumb/Compound/Item
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the BreadcrumbItem compound component.
 *
 * @interface BreadcrumbItemProps
 *
 * @example Complete Props Usage
 * ```tsx
 * <Breadcrumb.Item
 *   href="/products"
 *   onClick={(e) => handleClick(e)}
 *   icon={<ShoppingBagIcon />}
 *   className="custom-item"
 *   style={{ fontWeight: 'bold' }}
 * >
 *   Products
 * </Breadcrumb.Item>
 * ```
 */
export interface BreadcrumbItemProps {
  /**
   * Item label/content displayed in the breadcrumb.
   * Can be a string or complex React elements.
   * @example 'Home'
   * @example <><strong>Products</strong> (42)</>
   */
  children?: ReactNode;

  /**
   * Link URL for the breadcrumb item.
   * When provided, the item renders as an anchor tag.
   * Omit for the current/active page.
   * @example '/'
   * @example '/products/electronics'
   */
  href?: string;

  /**
   * Click handler for the breadcrumb item.
   * Receives the click event for custom navigation handling.
   * @example (e) => { e.preventDefault(); router.push('/'); }
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;

  /**
   * Icon to display before the label text.
   * @example <HomeIcon />
   * @example <FolderIcon size={14} />
   */
  icon?: ReactNode;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Additional inline styles for the item container.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

/**
 * BreadcrumbItem compound component for declarative breadcrumb definition.
 *
 * @description
 * Represents a single navigation step in a breadcrumb trail.
 * Renders as a link when `href` is provided, otherwise as a span.
 *
 * @remarks
 * **Rendering Logic:**
 * - With `href`: Renders as `<span><a href="...">content</a></span>`
 * - Without `href`: Renders as `<span>content</span>`
 *
 * **Styling:**
 * - Uses inline flexbox for icon/text alignment
 * - Link color uses CSS variable `--ds-color-primary-500`
 * - Cursor changes based on interactivity
 *
 * @param props - {@link BreadcrumbItemProps}
 * @param ref - Forwarded ref to the outer span element
 * @returns The rendered breadcrumb item
 *
 * @example
 * ```tsx
 * <BreadcrumbItem href="/products" icon={<BoxIcon />}>
 *   Products
 * </BreadcrumbItem>
 * ```
 */
export const BreadcrumbItem = forwardRef<HTMLSpanElement, BreadcrumbItemProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { children, href, onClick, icon, className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /** Container styles for the item wrapper */
    const itemStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      ...style,
    };

    /** Link/text styles based on interactivity */
    const linkStyle: React.CSSProperties = {
      color: href ? 'var(--ds-color-primary-500, #1890ff)' : 'inherit',
      textDecoration: 'none',
      cursor: href || onClick ? 'pointer' : 'default',
    };

    // -------------------------------------------------------------------------
    // Content
    // -------------------------------------------------------------------------

    /** Composed content with optional icon */
    const content = (
      <>
        {icon}
        {children}
      </>
    );

    // -------------------------------------------------------------------------
    // Render - Link Variant
    // -------------------------------------------------------------------------

    if (href) {
      return (
        <span ref={ref} className={`rottay-breadcrumb-item ${className}`} style={itemStyle}>
          <a href={href} onClick={onClick} style={linkStyle} data-part="crumb" data-current={false}>
            {content}
          </a>
        </span>
      );
    }

    // -------------------------------------------------------------------------
    // Render - Non-Link Variant
    // -------------------------------------------------------------------------

    return (
      <span
        ref={ref}
        className={`rottay-breadcrumb-item ${className}`}
        style={{ ...itemStyle, ...linkStyle }}
        onClick={onClick}
        data-part="crumb"
        data-current={true}
      >
        {content}
      </span>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

BreadcrumbItem.displayName = 'Breadcrumb.Item';

// ============================================================================
// Default Export
// ============================================================================

export default BreadcrumbItem;
