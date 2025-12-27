/**
 * Breadcrumb.Item - Compound Component
 *
 * Used for declarative breadcrumb item definition.
 * Alternative to the `items` prop approach.
 *
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *   <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
 *   <Breadcrumb.Item>Current Page</Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

export interface BreadcrumbItemProps {
  /** Item label/content */
  children?: ReactNode;
  /** Link href */
  href?: string;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  /** Icon to display before label */
  icon?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const BreadcrumbItem = forwardRef<HTMLSpanElement, BreadcrumbItemProps>(
  (props, ref) => {
    const { children, href, onClick, icon, className = '', style = {} } = props;

    const itemStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      ...style,
    };

    const linkStyle: React.CSSProperties = {
      color: href ? 'var(--color-primary-500, #1890ff)' : 'inherit',
      textDecoration: 'none',
      cursor: href || onClick ? 'pointer' : 'default',
    };

    const content = (
      <>
        {icon}
        {children}
      </>
    );

    if (href) {
      return (
        <span ref={ref} className={`rottay-breadcrumb-item ${className}`} style={itemStyle}>
          <a href={href} onClick={onClick} style={linkStyle}>
            {content}
          </a>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={`rottay-breadcrumb-item ${className}`}
        style={{ ...itemStyle, ...linkStyle }}
        onClick={onClick}
      >
        {content}
      </span>
    );
  }
);

BreadcrumbItem.displayName = 'Breadcrumb.Item';

export default BreadcrumbItem;
