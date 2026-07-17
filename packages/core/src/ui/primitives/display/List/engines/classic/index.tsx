'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the List display primitive.
 * Thin wrapper around `antd/List` that exposes List, Item, and Meta
 * sub-components with DS-level prop types and forwarded refs.
 *
 * @example
 * ```tsx
 * <List engine="classic" dataSource={items} renderItem={(i) => <List.Item>{i.name}</List.Item>} />
 * ```
 */
import React from 'react';
import { List as AntList } from 'antd';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../../contracts';
import { LIST_DEFAULTS } from '../../contracts';

/**
 * Classic List container. Wraps `antd/List` inside a forwarded-ref div so
 * consumers can measure or scroll-to the list programmatically.
 *
 * @param props - DS ListProps (subset of antd ListProps with engine-agnostic types).
 * @returns A div-wrapped `antd/List`.
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
      pagination,
      locale,
      children,
      className,
      style,
    } = props;

    // Outer div receives the forwarded ref; `locale` cast to any because
    // the DS type is a simplified subset of antd's full locale shape.
    return (
      <div ref={ref} className={className} style={style}>
        <AntList
          dataSource={dataSource}
          renderItem={renderItem}
          bordered={bordered}
          header={header}
          footer={footer}
          loading={loading}
          size={size}
          split={split}
          itemLayout={itemLayout}
          grid={grid}
          pagination={pagination}
          locale={locale as any}
        >
          {children}
        </AntList>
      </div>
    );
  }
);
List.displayName = 'List.Classic';

/** Classic List Item. Delegates directly to `antd/List.Item` for actions/extra support. */
export const Item = React.forwardRef<HTMLDivElement, ListItemProps>(
  (props, ref) => {
    const { actions, extra, children, className, style } = props;
    return (
      <AntList.Item
        ref={ref}
        actions={actions}
        extra={extra}
        className={className}
        style={style}
      >
        {children}
      </AntList.Item>
    );
  }
);
Item.displayName = 'List.Item.Classic';

/** Classic List Item Meta. Provides avatar + title + description via `antd/List.Item.Meta`. */
export const Meta = React.forwardRef<HTMLDivElement, ListItemMetaProps>(
  (props, ref) => {
    const { avatar, title, description, className, style } = props;
    return (
      <div ref={ref}>
        <AntList.Item.Meta
          avatar={avatar}
          title={title}
          description={description}
          className={className}
          style={style}
        />
      </div>
    );
  }
);
Meta.displayName = 'List.Item.Meta.Classic';

export default List;
