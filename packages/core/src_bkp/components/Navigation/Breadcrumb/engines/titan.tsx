/**
 * Titan Breadcrumb Engine
 *
 * Adapter that converts unified BreadcrumbProps to Ant Design Breadcrumb.
 */

'use client';

import { Breadcrumb as AntBreadcrumb } from 'antd';
import type { BreadcrumbProps as AntBreadcrumbProps } from 'antd';
import type { BreadcrumbProps } from '../../../../types/components/breadcrumb';

/**
 * Titan Breadcrumb - Ant Design implementation with unified BreadcrumbProps
 */
function TitanBreadcrumb({
  items,
  separator,
  className,
  style,
  maxItems,
  'aria-label': ariaLabel,
}: BreadcrumbProps) {
  // Convert unified items format to AntD items format
  const antItems: AntBreadcrumbProps['items'] = items.map((item, index) => {
    // Handle menu items if present
    const menu = item.menu
      ? {
          items: item.menu.map((menuItem) => ({
            key: menuItem.title?.toString() ?? `menu-${index}`,
            label: menuItem.title,
            icon: menuItem.icon,
            onClick: menuItem.onClick,
            href: menuItem.href,
          })),
        }
      : undefined;

    return {
      title: item.title,
      href: item.href,
      onClick: item.onClick,
      className: item.className,
      menu,
      // AntD uses a different format for dropdownProps
      ...(item.icon && {
        // Wrap title with icon
        title: (
          <>
            {item.icon}
            <span style={{ marginLeft: item.icon ? 8 : 0 }}>{item.title}</span>
          </>
        ),
      }),
    };
  });

  return (
    <AntBreadcrumb
      items={antItems}
      separator={separator}
      className={className}
      style={style}
      aria-label={ariaLabel}
      // AntD uses maxItems differently - it shows maxItems and collapses the rest
      {...(maxItems && { maxItems })}
    />
  );
}

TitanBreadcrumb.displayName = 'TitanBreadcrumb';

export default TitanBreadcrumb;
