/**
 * Apollo List Engine
 *
 * Native HTML + Tailwind CSS list implementation.
 * Implements unified ListProps interface.
 */

'use client';

import type { ListProps, ListItemProps, ListItemMetaProps } from '../../../../types/components/list';
import { cn } from '../../../../utils/cn';

/**
 * Apollo List - Native HTML + Tailwind implementation with unified ListProps
 */
function ApolloList<T = any>({
  dataSource = [],
  renderItem,
  className,
  loading,
  size = 'default',
  bordered = false,
  split = true,
  header,
  footer,
  itemLayout = 'horizontal',
  grid,
  pagination,
  locale,
  rowKey = 'id',
  loadMore,
  style,
  id,
  renderEmpty,
}: ListProps<T>) {
  const getRowKey = (item: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return String(rowKey(item));
    }
    return String((item as any)[rowKey] ?? index);
  };

  const sizeStyles = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
  };

  const itemPadding = {
    small: 'px-3 py-2',
    default: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const listClasses = cn(
    'w-full',
    bordered && 'border border-gray-200 rounded-lg',
    sizeStyles[size],
    className
  );

  // Handle loading state
  if (loading) {
    const isSpinConfig = typeof loading === 'object';
    const spinSize = isSpinConfig ? loading.size ?? 'default' : 'default';
    const spinTip = isSpinConfig ? loading.tip : undefined;

    const spinnerSizes = {
      small: 'h-6 w-6',
      default: 'h-8 w-8',
      large: 'h-12 w-12',
    };

    return (
      <div className="w-full p-8 flex flex-col items-center justify-center gap-2">
        <svg
          className={cn('animate-spin text-blue-600', spinnerSizes[spinSize])}
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {spinTip && <div className="text-gray-500 text-sm">{spinTip}</div>}
      </div>
    );
  }

  // Handle grid layout
  if (grid) {
    const { gutter = 16, column = 4 } = grid;
    const gridClasses = cn(
      'grid gap-4',
      `grid-cols-${column}`,
      className
    );

    return (
      <div className={gridClasses} style={{ gap: gutter, ...style }} id={id}>
        {dataSource.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            {renderEmpty ? renderEmpty() : locale?.emptyText ?? 'No data'}
          </div>
        ) : (
          dataSource.map((item, index) => (
            <div key={getRowKey(item, index)}>
              {renderItem ? renderItem(item, index) : null}
            </div>
          ))
        )}
      </div>
    );
  }

  // Regular list layout
  return (
    <div className={listClasses} style={style} id={id}>
      {header && (
        <div className={cn('px-4 py-3 bg-gray-50 border-b border-gray-200', bordered && 'rounded-t-lg')}>
          {header}
        </div>
      )}

      <ul className={cn('list-none', split && 'divide-y divide-gray-200')}>
        {dataSource.length === 0 ? (
          <li className={cn(itemPadding[size], 'text-center text-gray-400')}>
            {renderEmpty ? renderEmpty() : locale?.emptyText ?? 'No data'}
          </li>
        ) : (
          dataSource.map((item, index) => (
            <li key={getRowKey(item, index)} className={itemPadding[size]}>
              {renderItem ? renderItem(item, index) : null}
            </li>
          ))
        )}
      </ul>

      {loadMore && (
        <div className={cn('px-4 py-3', bordered && 'border-t border-gray-200')}>
          {loadMore}
        </div>
      )}

      {footer && (
        <div className={cn('px-4 py-3 bg-gray-50 border-t border-gray-200', bordered && 'rounded-b-lg')}>
          {footer}
        </div>
      )}

      {pagination && pagination !== false && (
        <div className="flex justify-center items-center gap-2 px-4 py-3 border-t border-gray-200">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={pagination.current === 1 || pagination.disabled}
            onClick={() => pagination.onChange?.(pagination.current! - 1, pagination.pageSize!)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.current} of {Math.ceil((pagination.total ?? 0) / (pagination.pageSize ?? 10))}
          </span>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={
              pagination.current === Math.ceil((pagination.total ?? 0) / (pagination.pageSize ?? 10)) ||
              pagination.disabled
            }
            onClick={() => pagination.onChange?.(pagination.current! + 1, pagination.pageSize!)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

ApolloList.displayName = 'ApolloList';

/**
 * Apollo List.Item - Simple wrapper for list items
 */
function ApolloListItem({ children, className, style, actions, extra }: ListItemProps) {
  return (
    <div className={cn('flex items-start justify-between', className)} style={style}>
      <div className="flex-1">{children}</div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2 ml-4">
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}
      {extra && <div className="ml-4">{extra}</div>}
    </div>
  );
}

ApolloListItem.displayName = 'ApolloListItem';

/**
 * Apollo List.Item.Meta - Metadata display with avatar, title, and description
 */
function ApolloListItemMeta({ avatar, title, description, className, style }: ListItemMetaProps) {
  return (
    <div className={cn('flex gap-3', className)} style={style}>
      {avatar && <div className="flex-shrink-0">{avatar}</div>}
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium text-gray-900">{title}</div>}
        {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
      </div>
    </div>
  );
}

ApolloListItemMeta.displayName = 'ApolloListItemMeta';

// Attach Item and Item.Meta as sub-components
const ListWithSubComponents = ApolloList as typeof ApolloList & {
  Item: typeof ApolloListItem & {
    Meta: typeof ApolloListItemMeta;
  };
};

const ItemWithMeta = ApolloListItem as typeof ApolloListItem & {
  Meta: typeof ApolloListItemMeta;
};

ItemWithMeta.Meta = ApolloListItemMeta;
ListWithSubComponents.Item = ItemWithMeta;

export default ListWithSubComponents;
