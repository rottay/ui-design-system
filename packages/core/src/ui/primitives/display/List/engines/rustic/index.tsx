'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the List display primitive.
 * Zero-dependency list using semantic `<ul>`/`<li>` markup, inline styles, and
 * DS CSS variables for theming. Includes skeleton loading and CSS Grid layout.
 *
 * @example
 * ```tsx
 * <List engine="rustic" bordered>
 *   <List.Item>Item content</List.Item>
 * </List>
 * ```
 */
import React from 'react';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../../contracts';
import { LIST_DEFAULTS } from '../../contracts';

/** Rustic List Item Meta. Renders avatar/title/description with flexbox inline styles. */
export const Meta = React.forwardRef<HTMLDivElement, ListItemMetaProps>(
  (props, ref) => {
    const { avatar, title, description, className, style } = props;
    // flex-start keeps avatar top-aligned when description wraps to multiple lines
    return (
      <div
        ref={ref}
        className={`rottay-list-item-meta rottay-list-item-meta--rustic ${className ?? ''}`.trim()}
        data-part="meta"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          ...style,
        }}
      >
        {avatar && <div style={{ flexShrink: 0 }} data-part="meta-avatar">{avatar}</div>}
        <div style={{ flex: 1, minWidth: 0 }} data-part="meta-content">
          {title && (
            <div style={{ fontWeight: 500, marginBottom: description ? '4px' : 0 }} data-part="meta-title">
              {title}
            </div>
          )}
          {description && (
            <div
              data-part="meta-description"
              style={{ fontSize: 'var(--ds-list-meta-description-font-size, 14px)' }}
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

/** Rustic List Item. Semantic `<li>` with inline flex layout for content/extra/actions. */
export const Item = React.forwardRef<HTMLLIElement, ListItemProps>(
  (props, ref) => {
    const { actions, extra, children, className, style } = props;
    // Content fills available space; extra and actions are pushed to the right
    return (
      <li
        ref={ref}
        className={className}
        data-part="item"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          ...style,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }} data-part="item-content">{children}</div>
        {extra && <div style={{ marginLeft: '16px', flexShrink: 0 }} data-part="item-extra">{extra}</div>}
        {actions && actions.length > 0 && (
          <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }} data-part="item-actions">
            {actions.map((action, index) => (
              <span key={index} data-part="item-action">{action}</span>
            ))}
          </div>
        )}
      </li>
    );
  }
);
Item.displayName = 'List.Item.Rustic';

/**
 * Rustic List container. Renders a semantic `<ul>` inside a styled div, with
 * DS CSS variable borders, optional grid layout, and a skeleton loading state.
 *
 * @param props - DS ListProps with inline-style-based options.
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
      grid,
      children,
      className,
      style,
    } = props;

    // Map DS size tokens to explicit pixel values for framework-free rendering
    const fontSizes = {
      small: '12px',
      default: '14px',
      large: '16px',
    };

    // Prefer renderItem for data-driven lists; fall back to children for declarative usage
    const listContent = dataSource && renderItem
      ? dataSource.map((item, index) => renderItem(item, index))
      : children;

    // Three-row skeleton with avatar circle + text bars matching typical list layouts
    if (loading) {
      return (
        <div ref={ref} className={`rottay-list rottay-list--rustic ${className ?? ''}`.trim()} data-part="root" data-loading="true" style={{ ...style }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: '12px 0', display: 'flex', gap: '12px' }} data-part="skeleton-row">
              <div
                data-part="skeleton-avatar"
                style={{ width: 40, height: 40 }}
              />
              <div style={{ flex: 1 }}>
                <div
                  data-part="skeleton-line"
                  style={{ height: 16, width: '33%', marginBottom: 8 }}
                />
                <div
                  data-part="skeleton-line"
                  style={{ height: 12, width: '66%' }}
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
        className={`rottay-list rottay-list--rustic ${className ?? ''}`.trim()}
        data-part="root"
        data-loading="false"
        data-bordered={bordered ? 'true' : 'false'}
        style={{
          fontSize: fontSizes[size],
          ...style,
        }}
      >
        {header && (
          <div
            data-part="header"
            style={{ padding: '12px 16px', fontWeight: 500 }}
          >
            {header}
          </div>
        )}
        {/* Reset native list styling; horizontal padding only when bordered to inset content */}
        <ul
          data-part="list"
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
                <div data-part="divider" />
              )}
            </React.Fragment>
          ))}
        </ul>
        {footer && (
          <div
            data-part="footer"
            style={{ padding: '12px 16px' }}
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
