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
      <div
        ref={ref}
        className={`flex items-start ${className}`}
        style={{ gap: 'var(--ds-list-meta-avatar-margin-right, 12px)', ...style }}
      >
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          {title && (
            <div
              className="font-medium"
              style={{
                color: 'var(--ds-list-meta-title-color, var(--ds-color-text-primary))',
                fontSize: 'var(--ds-list-meta-title-font-size, inherit)',
                fontWeight: 'var(--ds-list-meta-title-font-weight, 500)',
              }}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              className="text-sm"
              style={{
                color: 'var(--ds-list-meta-description-color, var(--ds-color-text-secondary))',
                fontSize: 'var(--ds-list-meta-description-font-size, 0.875rem)',
                marginTop: 'var(--ds-list-meta-description-margin-top, 0)',
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
Meta.displayName = 'List.Item.Meta.Modern';

/** Modern List Item. Uses `<li>` with flex layout for content, extra, and actions. */
export const Item = React.forwardRef<HTMLLIElement, ListItemProps>(
  (props, ref) => {
    const { actions, extra, children, className = '', style } = props;
    // Content takes remaining space; extra and actions are flex-shrink-0 on the right
    return (
      <li
        ref={ref}
        className={`flex items-center justify-between ${className}`}
        style={{
          padding: 'var(--ds-list-default-padding-vertical, 12px) var(--ds-list-default-padding-horizontal, 16px)',
          background: 'var(--ds-list-item-background-color, transparent)',
          color: 'var(--ds-list-text-color, inherit)',
          transition: 'background var(--ds-list-transition-duration, var(--ds-motion-normal)) var(--ds-list-transition-timing, ease-in-out)',
          ...style,
        }}
      >
        <div className="flex-1 min-w-0">{children}</div>
        {extra && (
          <div
            className="flex-shrink-0"
            style={{ marginLeft: 'var(--ds-list-extra-margin-left, 16px)' }}
          >
            {extra}
          </div>
        )}
        {actions && actions.length > 0 && (
          <div
            className="flex items-center"
            style={{
              marginLeft: 'var(--ds-list-extra-margin-left, 16px)',
              gap: 'var(--ds-list-actions-gap, 8px)',
              color: 'var(--ds-list-actions-color, var(--ds-color-primary))',
            }}
          >
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

    const sizeFontSize = {
      small: 'var(--ds-list-sm-font-size, 12px)',
      default: 'var(--ds-list-default-font-size, 14px)',
      large: 'var(--ds-list-lg-font-size, 16px)',
    };

    // Prefer renderItem for data-driven lists; fall back to children for declarative usage
    const listContent = dataSource && renderItem
      ? dataSource.map((item, index) => renderItem(item, index))
      : children;

    // Three-row skeleton with avatar circle + two text bars to match typical list layouts
    if (loading) {
      return (
        <div
          ref={ref}
          className={`animate-pulse ${className}`}
          style={{ opacity: 'var(--ds-list-loading-opacity, 0.6)', ...style }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full" style={{ background: 'var(--ds-list-item-hover-background-color, var(--ds-surface-panel))' }} />
                <div className="flex-1">
                  <div className="h-4 rounded w-1/3 mb-2" style={{ background: 'var(--ds-list-item-hover-background-color, var(--ds-surface-panel))' }} />
                  <div className="h-3 rounded w-2/3" style={{ background: 'var(--ds-list-item-hover-background-color, var(--ds-surface-panel))' }} />
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
        className={`${bordered ? 'border rounded-lg' : ''} ${className}`}
        style={{
          background: 'var(--ds-list-background-color, transparent)',
          color: 'var(--ds-list-text-color, inherit)',
          fontSize: sizeFontSize[size],
          ...(bordered && {
            borderColor: 'var(--ds-list-border-color, var(--ds-color-border))',
            borderWidth: 'var(--ds-list-border-width, 1px)',
            borderRadius: 'var(--ds-list-border-radius, var(--ds-radius-lg))',
          }),
          ...style,
        }}
      >
        {header && (
          <div
            className={`px-4 py-3 font-medium ${bordered ? 'border-b' : ''}`}
            style={{
              padding: 'var(--ds-list-header-padding-vertical, 12px) var(--ds-list-header-padding-horizontal, 16px)',
              fontSize: 'var(--ds-list-header-font-size, inherit)',
              fontWeight: 'var(--ds-list-header-font-weight, 600)',
              background: 'var(--ds-list-header-background-color, transparent)',
              ...(bordered ? { borderColor: 'var(--ds-list-border-color, var(--ds-color-border))' } : {}),
            }}
          >
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
                <div
                  className="border-b"
                  style={{
                    borderColor: 'var(--ds-list-split-color, var(--ds-color-border))',
                    borderBottomWidth: 'var(--ds-list-split-width, 1px)',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </ul>
        {footer && (
          <div
            className={`px-4 py-3 ${bordered ? 'border-t' : ''}`}
            style={{
              padding: 'var(--ds-list-footer-padding-vertical, 12px) var(--ds-list-footer-padding-horizontal, 16px)',
              fontSize: 'var(--ds-list-footer-font-size, inherit)',
              background: 'var(--ds-list-footer-background-color, transparent)',
              ...(bordered ? { borderColor: 'var(--ds-list-border-color, var(--ds-color-border))' } : {}),
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);
List.displayName = 'List.Modern';

export default List;
