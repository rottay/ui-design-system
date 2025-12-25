/**
 * Breadcrumb - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { BreadcrumbProps, BreadcrumbItem } from '../types';

export default function HermesBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  const {
    items,
    // DaisyUI breadcrumbs uses CSS li separators, so we ignore the separator prop
    separator: _separator,
    maxItems,
    className = '',
    style,
  } = props;

  const displayItems: BreadcrumbItem[] = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { key: 'ellipsis', label: '...' },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

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
