/**
 * Hermes List Engine
 *
 * DaisyUI + Tailwind CSS list implementation.
 */

'use client';

import type { ListProps, ListItemProps, ListItemMetaProps } from '../../../../types/components/list';

function HermesList<T = any>({
  dataSource = [],
  renderItem,
  className = '',
  loading,
  size = 'default',
  bordered = false,
  split = true,
  header,
  footer,
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

  const sizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
  };

  const listClasses = [
    'w-full',
    bordered && 'border border-base-300 rounded-lg',
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center gap-2">
        <span className="loading loading-spinner text-primary loading-md"></span>
      </div>
    );
  }

  if (grid) {
    const { gutter = 16, column = 4 } = grid;
    return (
      <div
        className={`grid gap-4 ${className}`}
        style={{ gridTemplateColumns: `repeat(${column}, 1fr)`, gap: gutter, ...style }}
        id={id}
      >
        {dataSource.length === 0 ? (
          <div className="col-span-full text-center text-base-content/40 py-8">
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

  return (
    <div className={listClasses} style={style} id={id}>
      {header && (
        <div className={`px-4 py-3 bg-base-200 ${bordered ? 'border-b border-base-300 rounded-t-lg' : ''}`}>
          {header}
        </div>
      )}

      <ul className="menu">
        {dataSource.length === 0 ? (
          <li className="p-3 text-center text-base-content/40">
            {renderEmpty ? renderEmpty() : locale?.emptyText ?? 'No data'}
          </li>
        ) : (
          dataSource.map((item, index) => (
            <li key={getRowKey(item, index)} className={`p-3 ${split && index < dataSource.length - 1 ? 'border-b border-base-200' : ''}`}>
              {renderItem ? renderItem(item, index) : null}
            </li>
          ))
        )}
      </ul>

      {loadMore && (
        <div className={`px-4 py-3 ${bordered ? 'border-t border-base-300' : ''}`}>
          {loadMore}
        </div>
      )}

      {footer && (
        <div className={`px-4 py-3 bg-base-200 ${bordered ? 'border-t border-base-300 rounded-b-lg' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

HermesList.displayName = 'HermesList';

function HermesListItem({ children, className = '', style, actions, extra }: ListItemProps) {
  return (
    <div className={`flex items-start justify-between ${className}`} style={style}>
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

HermesListItem.displayName = 'HermesListItem';

function HermesListItemMeta({ avatar, title, description, className = '', style }: ListItemMetaProps) {
  return (
    <div className={`flex gap-3 ${className}`} style={style}>
      {avatar && <div className="flex-shrink-0">{avatar}</div>}
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium text-base-content">{title}</div>}
        {description && <div className="text-sm text-base-content/60 mt-1">{description}</div>}
      </div>
    </div>
  );
}

HermesListItemMeta.displayName = 'HermesListItemMeta';

const ListWithSubComponents = HermesList as typeof HermesList & {
  Item: typeof HermesListItem & { Meta: typeof HermesListItemMeta };
};

const ItemWithMeta = HermesListItem as typeof HermesListItem & { Meta: typeof HermesListItemMeta };
ItemWithMeta.Meta = HermesListItemMeta;
ListWithSubComponents.Item = ItemWithMeta;

export default ListWithSubComponents;
