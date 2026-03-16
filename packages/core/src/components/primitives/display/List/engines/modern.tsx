'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the List display primitive.
 * Provides List, Item, and Meta sub-components using Tailwind utility classes
 * and DaisyUI color tokens, with built-in skeleton loading and CSS Grid support.
 *
 * @example
 * ```tsx
 * <List engine="modern" bordered>
 *   <List.Item>Item content</List.Item>
 * </List>
 * ```
 */
import React from 'react';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../List.types';
import { LIST_DEFAULTS } from '../List.types';

/** Modern List Item Meta. Renders avatar + title + description with Tailwind flex layout. */
export const Meta = React.forwardRef<HTMLDivElement, ListItemMetaProps>(
  (props, ref) => {
    const { avatar, title, description, className = '', style } = props;
    // flex-start alignment so multi-line descriptions don't center the avatar
    return (
      <div ref={ref} className={`flex items-start gap-3 ${className}`} style={style}>
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          {title && <div className="font-medium text-base-content">{title}</div>}
          {description && <div className="text-sm text-base-content/60">{description}</div>}
        </div>
      </div>
    );
  }
);
Meta.displayName = 'List.Item.Meta.Modern';

/** Modern List Item. Uses `<li>` with flex layout for content, extra, and actions. */
export const Item = React.forwardRef<HTMLLIElement, ListItemProps>(
  (props, ref) => {
    const { actions, extra, children, className = '', style } = props;
    // Content takes remaining space; extra and actions are flex-shrink-0 on the right
    return (
      <li
        ref={ref}
        className={`flex items-center justify-between py-3 ${className}`}
        style={style}
      >
        <div className="flex-1 min-w-0">{children}</div>
        {extra && <div className="ml-4 flex-shrink-0">{extra}</div>}
        {actions && actions.length > 0 && (
          <div className="ml-4 flex items-center gap-2">
            {actions.map((action, index) => (
              <span key={index}>{action}</span>
            ))}
          </div>
        )}
      </li>
    );
  }
);
Item.displayName = 'List.Item.Modern';

/**
 * Modern List container. Builds a `<ul>` inside a bordered/sized div, with
 * CSS Grid support, skeleton loading, and split dividers between items.
 *
 * @param props - DS ListProps with Tailwind-based styling options.
 * @returns A div-wrapped `<ul>` with optional header, footer, and loading skeleton.
 */
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
      itemLayout = LIST_DEFAULTS.itemLayout,
      grid,
      children,
      className = '',
      style,
    } = props;

    const sizeClasses = {
      small: 'text-sm',
      default: 'text-base',
      large: 'text-lg',
    };

    // Prefer renderItem for data-driven lists; fall back to children for declarative usage
    const listContent = dataSource && renderItem
      ? dataSource.map((item, index) => renderItem(item, index))
      : children;

    // Three-row skeleton with avatar circle + two text bars to match typical list layouts
    if (loading) {
      return (
        <div ref={ref} className={`animate-pulse ${className}`} style={style}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-base-300 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-base-300 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-base-300 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${bordered ? 'border border-base-300 rounded-lg' : ''} ${sizeClasses[size]} ${className}`}
        style={style}
      >
        {header && (
          <div className={`px-4 py-3 font-medium ${bordered ? 'border-b border-base-300' : ''}`}>
            {header}
          </div>
        )}
        {/* When grid is set, switch to CSS Grid; otherwise render as a standard vertical list */}
        <ul
          className={`${grid ? 'grid' : ''} ${itemLayout === 'vertical' ? '' : ''}`}
          style={grid ? {
            gridTemplateColumns: `repeat(${grid.column || 1}, 1fr)`,
            gap: grid.gutter || 16,
          } : undefined}
        >
          {React.Children.map(listContent, (child, index) => (
            <React.Fragment key={index}>
              {child}
              {split && index < React.Children.count(listContent) - 1 && !grid && (
                <div className="border-b border-base-200" />
              )}
            </React.Fragment>
          ))}
        </ul>
        {footer && (
          <div className={`px-4 py-3 ${bordered ? 'border-t border-base-300' : ''}`}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);
List.displayName = 'List.Modern';

export default List;
