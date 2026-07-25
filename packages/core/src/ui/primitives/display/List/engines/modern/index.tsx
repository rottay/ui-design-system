'use client';

/**
 * @fileoverview Modern engine for the List display primitive.
 *
 * Renders List, Item, and Meta as semantic markup (`<ul>`/`<li>`) whose paint
 * and static geometry (item padding, meta gaps, header/footer chrome, size
 * steps, loading posture) live in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/list.css`), keyed on the
 * `data-part` / `data-size` / `data-bordered` / `data-loading` hooks stamped
 * here. Tailwind structural utilities (`flex`, `min-w-0`, skeleton shapes)
 * remain; inline styles are reserved for the data-driven CSS Grid projection
 * (`grid.column` / `grid.gutter`) and the public `style` override channel.
 *
 * @example
 * ```tsx
 * <List engine="modern" bordered>
 *   <List.Item>Item content</List.Item>
 * </List>
 * ```
 */
import React from 'react';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../../contracts';
import { LIST_DEFAULTS } from '../../contracts';

/** Modern List Item Meta. Renders avatar + title + description with a flex row. */
export const Meta = React.forwardRef<HTMLDivElement, ListItemMetaProps>(
  (props, ref) => {
    const { avatar, title, description, className = '', style } = props;
    // flex-start alignment so multi-line descriptions don't center the avatar
    return (
      <div
        ref={ref}
        className={`rottay-list-item-meta rottay-list-item-meta--modern flex items-start ${className}`}
        data-part="meta"
        style={style}
      >
        {avatar && <div className="flex-shrink-0" data-part="meta-avatar">{avatar}</div>}
        <div className="flex-1 min-w-0" data-part="meta-content">
          {title && (
            <div data-part="meta-title">
              {title}
            </div>
          )}
          {description && (
            <div data-part="meta-description">
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
    // Content takes remaining space; extra and actions are flex-shrink-0 on the
    // inline-end side (the skin's margins are logical, so they flip in RTL).
    return (
      <li
        ref={ref}
        className={`rottay-list-item rottay-list-item--modern flex items-center justify-between ${className}`}
        data-part="item"
        style={style}
      >
        <div className="flex-1 min-w-0" data-part="item-content">{children}</div>
        {extra && (
          <div className="flex-shrink-0" data-part="item-extra">
            {extra}
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className="flex items-center" data-part="item-actions">
            {actions.map((action, index) => (
              <span key={index} data-part="item-action">{action}</span>
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
 * @param props - DS ListProps.
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

    // Prefer renderItem for data-driven lists; fall back to children for declarative usage
    const listContent = dataSource && renderItem
      ? dataSource.map((item, index) => renderItem(item, index))
      : children;

    // Three-row skeleton with avatar circle + two text bars to match typical list layouts
    if (loading) {
      return (
        <div
          ref={ref}
          className={`rottay-list rottay-list--modern animate-pulse ${className}`}
          data-part="root"
          data-loading="true"
          style={style}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3" data-part="skeleton-row">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full" data-part="skeleton-avatar" />
                <div className="flex-1">
                  <div className="h-4 rounded w-1/3 mb-2" data-part="skeleton-line" />
                  <div className="h-3 rounded w-2/3" data-part="skeleton-line" />
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
        className={`rottay-list rottay-list--modern ${className}`}
        data-part="root"
        data-loading="false"
        data-bordered={bordered ? 'true' : 'false'}
        data-size={size}
        style={style}
      >
        {header && (
          <div data-part="header">
            {header}
          </div>
        )}
        {/* When grid is set, switch to CSS Grid; otherwise render as a standard vertical list.
            The grid tracks/gutter are a data-driven projection of the `grid` prop,
            so they stay inline. */}
        <ul
          className={`${grid ? 'grid' : ''}`}
          data-part="list"
          style={grid ? {
            gridTemplateColumns: `repeat(${grid.column || 1}, 1fr)`,
            gap: grid.gutter || 16,
          } : undefined}
        >
          {React.Children.map(listContent, (child, index) => (
            <React.Fragment key={index}>
              {child}
              {split && index < React.Children.count(listContent) - 1 && !grid && (
                // The divider must be an <li>: axe's `list` rule requires a
                // <ul>'s direct children to be <li>/<script>/<template> only.
                // aria-hidden keeps it out of the accessible list count.
                <li data-part="divider" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </ul>
        {footer && (
          <div data-part="footer">
            {footer}
          </div>
        )}
      </div>
    );
  }
);
List.displayName = 'List.Modern';

export default List;
