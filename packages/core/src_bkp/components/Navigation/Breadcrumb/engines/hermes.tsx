/**
 * Hermes Breadcrumb Engine
 *
 * DaisyUI breadcrumbs implementation with unified BreadcrumbProps.
 */

'use client';

import type { BreadcrumbProps, BreadcrumbItem } from '../../../../types/components/breadcrumb';

/**
 * Hermes Breadcrumb - DaisyUI implementation with unified BreadcrumbProps
 */
function HermesBreadcrumb({
  items,
  separator,
  className = '',
  style,
  maxItems,
  'aria-label': ariaLabel = 'Breadcrumb',
}: BreadcrumbProps) {
  // Handle maxItems by showing first item, ..., and last (maxItems - 1) items
  const displayItems: (BreadcrumbItem | 'ellipsis')[] = (() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    const result: (BreadcrumbItem | 'ellipsis')[] = [];
    // Show first item
    result.push(items[0]);
    // Add ellipsis
    result.push('ellipsis');
    // Show last (maxItems - 2) items
    const remainingCount = maxItems - 2;
    result.push(...items.slice(-remainingCount));

    return result;
  })();

  const renderItem = (item: BreadcrumbItem | 'ellipsis', index: number) => {
    // Handle ellipsis
    if (item === 'ellipsis') {
      return (
        <li key="ellipsis">
          <span className="opacity-50">...</span>
        </li>
      );
    }

    const content = (
      <>
        {item.icon && <span className="mr-1 inline-flex items-center">{item.icon}</span>}
        <span>{item.title}</span>
      </>
    );

    const itemClasses = [item.className].filter(Boolean).join(' ');

    return (
      <li key={index}>
        {item.href ? (
          <a href={item.href} onClick={item.onClick} className={itemClasses}>
            {content}
          </a>
        ) : item.onClick ? (
          <button type="button" onClick={item.onClick} className={itemClasses}>
            {content}
          </button>
        ) : (
          <span className={itemClasses}>{content}</span>
        )}
      </li>
    );
  };

  // Build classes array for DaisyUI breadcrumbs
  const classes = ['breadcrumbs text-sm', className].filter(Boolean).join(' ');

  return (
    <nav aria-label={ariaLabel} className={classes} style={style}>
      <ul>
        {displayItems.map((item, index) => renderItem(item, index))}
      </ul>
      {/* Note: DaisyUI breadcrumbs use CSS to add separators automatically */}
      {/* Custom separator support would require CSS override */}
      {separator && (
        <style>
          {`
            .breadcrumbs > ul > li + li:before {
              content: "${typeof separator === 'string' ? separator : '/'}";
            }
          `}
        </style>
      )}
    </nav>
  );
}

HermesBreadcrumb.displayName = 'HermesBreadcrumb';

export default HermesBreadcrumb;
