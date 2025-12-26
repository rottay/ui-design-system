'use client';

/**
 * List - Apollo Engine (Vanilla HTML/CSS)
 */
import React from 'react';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../../types';
import { LIST_DEFAULTS } from '../../types';

export const Meta = React.forwardRef<HTMLDivElement, ListItemMetaProps>(
  (props, ref) => {
    const { avatar, title, description, className, style } = props;
    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          ...style,
        }}
      >
        {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div style={{ fontWeight: 500, marginBottom: description ? '4px' : 0 }}>
              {title}
            </div>
          )}
          {description && (
            <div style={{ fontSize: '14px', color: '#00000073' }}>
              {description}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Meta.displayName = 'List.Item.Meta.Apollo';

export const Item = React.forwardRef<HTMLLIElement, ListItemProps>(
  (props, ref) => {
    const { actions, extra, children, className, style } = props;
    return (
      <li
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          ...style,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        {extra && <div style={{ marginLeft: '16px', flexShrink: 0 }}>{extra}</div>}
        {actions && actions.length > 0 && (
          <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {actions.map((action, index) => (
              <span key={index}>{action}</span>
            ))}
          </div>
        )}
      </li>
    );
  }
);
Item.displayName = 'List.Item.Apollo';

export const List = React.forwardRef<HTMLDivElement, ListProps>(
  (props, ref) => {
    const {
      dataSource,
      renderItem,
      bordered = LIST_DEFAULTS.bordered,
      header,
      footer,
      loading,
      size = LIST_DEFAULTS.size,
      split = LIST_DEFAULTS.split,
      grid,
      children,
      className,
      style,
    } = props;

    const fontSizes = {
      small: '12px',
      default: '14px',
      large: '16px',
    };

    const listContent = dataSource && renderItem
      ? dataSource.map((item, index) => renderItem(item, index))
      : children;

    if (loading) {
      return (
        <div ref={ref} className={className} style={{ ...style }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: '12px 0', display: 'flex', gap: '12px' }}>
              <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 16, background: '#f5f5f5', borderRadius: 4, width: '33%', marginBottom: 8 }} />
                <div style={{ height: 12, background: '#f5f5f5', borderRadius: 4, width: '66%' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={className}
        style={{
          border: bordered ? '1px solid #d9d9d9' : undefined,
          borderRadius: bordered ? '8px' : undefined,
          fontSize: fontSizes[size],
          ...style,
        }}
      >
        {header && (
          <div
            style={{
              padding: '12px 16px',
              fontWeight: 500,
              borderBottom: bordered ? '1px solid #d9d9d9' : undefined,
            }}
          >
            {header}
          </div>
        )}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: bordered ? '0 16px' : 0,
            ...(grid ? {
              display: 'grid',
              gridTemplateColumns: `repeat(${grid.column || 1}, 1fr)`,
              gap: grid.gutter || 16,
            } : {}),
          }}
        >
          {React.Children.map(listContent, (child, index) => (
            <React.Fragment key={index}>
              {child}
              {split && index < React.Children.count(listContent) - 1 && !grid && (
                <div style={{ borderBottom: '1px solid #f0f0f0' }} />
              )}
            </React.Fragment>
          ))}
        </ul>
        {footer && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: bordered ? '1px solid #d9d9d9' : undefined,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);
List.displayName = 'List.Apollo';

export default List;
