'use client';

/**
 * @fileoverview List Classic Engine - Rottay Design System
 * @description Ant Design-based list with full feature support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's List component to provide
 * comprehensive list functionality including pagination and grid layout.
 *
 * **Exported Components:**
 * - `List` - Main list container
 * - `Item` - List item wrapper
 * - `Meta` - Item metadata display
 *
 * **Implementation Details:**
 * - Uses `antd/List` for core rendering
 * - Full pagination configuration
 * - Grid layout support
 * - Loading states
 * - Locale customization
 *
 * **Ant Design Features:**
 * - Built-in pagination
 * - Responsive grid
 * - Item actions
 * - Virtual scrolling (via rowKey)
 *
 * @example Basic Usage
 * ```tsx
 * import { List } from '@rottay/design-system';
 *
 * <List
 *   engine="classic"
 *   dataSource={data}
 *   renderItem={(item) => <List.Item>{item.name}</List.Item>}
 * />
 * ```
 *
 * @see {@link List} for the main component
 * @see {@link https://ant.design/components/list} Ant Design List
 * @module List/engines/classic
 * @category Display
 * @package @rottay/design-system
 */
import React from 'react';
import { List as AntList } from 'antd';
import type { ListProps, ListItemProps, ListItemMetaProps } from '../../types';
import { LIST_DEFAULTS } from '../../types';

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
