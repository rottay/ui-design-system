'use client';

/**
 * @fileoverview List Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS list implementation with maximum accessibility.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free list using only
 * inline styles and semantic HTML elements.
 *
 * **Exported Components:**
 * - `List` - Main list container (div + ul)
 * - `Item` - List item wrapper (li)
 * - `Meta` - Item metadata display (div)
 *
 * **Implementation Details:**
 * - Uses semantic `<ul>` and `<li>` elements
 * - Inline styles for all visual properties
 * - Flexbox-based layouts
 * - Grid support via CSS Grid
 * - Skeleton loading states
 *
 * **Accessibility Features:**
 * - Semantic list markup
 * - Proper list item structure
 * - Keyboard navigation support
 * - Screen reader friendly
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility compliance
 *
 * @example Basic Usage
 * ```tsx
 * import { List } from '@rottay/design-system';
 *
 * <List engine="rustic" bordered>
 *   <List.Item>Item content</List.Item>
 * </List>
 * ```
 *
 * @see {@link List} for the main component
 * @module List/engines/rustic
 * @category Display
 * @package @rottay/design-system
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
            <div
              style={{
                fontSize: 'var(--ds-list-meta-description-font-size, 14px)',
                color: 'var(--ds-list-meta-description-color, var(--ds-color-text-secondary))',
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Meta.displayName = 'List.Item.Meta.Rustic';

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
Item.displayName = 'List.Item.Rustic';

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
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--ds-list-skeleton-bg, var(--ds-color-bg-tertiary))',
                  borderRadius: '50%',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 16,
                    background: 'var(--ds-list-skeleton-bg, var(--ds-color-bg-tertiary))',
                    borderRadius: 4,
                    width: '33%',
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 12,
                    background: 'var(--ds-list-skeleton-bg, var(--ds-color-bg-tertiary))',
                    borderRadius: 4,
                    width: '66%',
                  }}
                />
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
          border: bordered ? '1px solid var(--ds-list-border-color, var(--ds-color-border))' : undefined,
          borderRadius: bordered ? 'var(--ds-list-border-radius, 8px)' : undefined,
          fontSize: fontSizes[size],
          ...style,
        }}
      >
        {header && (
          <div
            style={{
              padding: '12px 16px',
              fontWeight: 500,
              borderBottom: bordered ? '1px solid var(--ds-list-border-color, var(--ds-color-border))' : undefined,
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
                <div style={{ borderBottom: '1px solid var(--ds-list-split-color, var(--ds-color-border-subtle))' }} />
              )}
            </React.Fragment>
          ))}
        </ul>
        {footer && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: bordered ? '1px solid var(--ds-list-border-color, var(--ds-color-border))' : undefined,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);
List.displayName = 'List.Rustic';

export default List;
