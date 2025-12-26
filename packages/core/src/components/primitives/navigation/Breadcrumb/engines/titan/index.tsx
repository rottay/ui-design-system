/**
 * Breadcrumb - Titan Engine (Ant Design)
 */

import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import type { BreadcrumbProps, BreadcrumbItem } from '../../types';
import { BREADCRUMB_DEFAULTS } from '../../types';

export default function TitanBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  const {
    items,
    separator = BREADCRUMB_DEFAULTS.separator,
    maxItems,
    className,
    style,
  } = props;

  // Handle maxItems truncation manually since AntD doesn't support it directly
  const displayItems: BreadcrumbItem[] = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { key: 'ellipsis', label: '...' },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

  const antItems = displayItems.map((item) => ({
    title: (
      <>
        {item.icon} {item.label}
      </>
    ),
    href: item.href,
    onClick: item.onClick,
  }));

  return (
    <AntBreadcrumb
      items={antItems}
      separator={separator}
      className={className}
      style={style}
    />
  );
}
