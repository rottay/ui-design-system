/**
 * Breadcrumb - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { BreadcrumbProps, BreadcrumbItem } from '../../types';
import { BREADCRUMB_DEFAULTS } from '../../types';

export default function ApolloBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  const {
    items,
    separator = BREADCRUMB_DEFAULTS.separator,
    maxItems,
    className,
    style,
  } = props;

  const displayItems: BreadcrumbItem[] = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { key: 'ellipsis', label: '...' },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    ...style,
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--color-primary, #0066CC)',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const itemStyle: React.CSSProperties = {
    color: 'var(--color-neutral-600, #666)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const separatorStyle: React.CSSProperties = {
    color: 'var(--color-neutral-400, #999)',
  };

  return (
    <nav className={className} style={containerStyle} aria-label="breadcrumb">
      {displayItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {item.href ? (
            <a href={item.href} style={linkStyle} onClick={item.onClick}>
              {item.icon} {item.label}
            </a>
          ) : (
            <span style={itemStyle}>
              {item.icon} {item.label}
            </span>
          )}
          {index < displayItems.length - 1 && (
            <span style={separatorStyle}>{separator}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
