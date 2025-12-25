/**
 * Apollo Breadcrumb Engine
 *
 * Native HTML + Tailwind CSS breadcrumb implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { BreadcrumbProps, BreadcrumbItem } from '../../../../types/components/breadcrumb';
import { cn } from '../../../../utils/cn';

/**
 * Apollo Breadcrumb - Native HTML + Tailwind implementation
 */
function ApolloBreadcrumb({
  items,
  separator = '/',
  className,
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
    // Show last (maxItems - 2) items (accounting for first item and ellipsis)
    const remainingCount = maxItems - 2;
    result.push(...items.slice(-remainingCount));

    return result;
  })();

  const renderItem = (item: BreadcrumbItem | 'ellipsis', index: number, isLast: boolean) => {
    // Handle ellipsis
    if (item === 'ellipsis') {
      return (
        <li key="ellipsis" className="flex items-center">
          <span className="text-gray-400 px-1">...</span>
          {!isLast && (
            <span className="mx-2 text-gray-400" aria-hidden="true">
              {separator}
            </span>
          )}
        </li>
      );
    }

    const content = (
      <>
        {item.icon && <span className="mr-1 inline-flex items-center">{item.icon}</span>}
        <span>{item.title}</span>
      </>
    );

    const itemContent = item.href ? (
      <a
        href={item.href}
        onClick={item.onClick}
        className={cn(
          'text-blue-600 hover:text-blue-800 hover:underline transition-colors',
          item.className
        )}
      >
        {content}
      </a>
    ) : item.onClick ? (
      <button
        type="button"
        onClick={item.onClick}
        className={cn(
          'text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-transparent border-none cursor-pointer p-0',
          item.className
        )}
      >
        {content}
      </button>
    ) : (
      <span
        className={cn(
          isLast ? 'text-gray-700 font-medium' : 'text-gray-500',
          item.className
        )}
      >
        {content}
      </span>
    );

    return (
      <li key={index} className="flex items-center">
        {itemContent}
        {!isLast && (
          <span className="mx-2 text-gray-400" aria-hidden="true">
            {separator}
          </span>
        )}
      </li>
    );
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex', className)}
      style={style}
    >
      <ol className="flex items-center flex-wrap gap-y-1">
        {displayItems.map((item, index) =>
          renderItem(item, index, index === displayItems.length - 1)
        )}
      </ol>
    </nav>
  );
}

ApolloBreadcrumb.displayName = 'ApolloBreadcrumb';

export default ApolloBreadcrumb;
