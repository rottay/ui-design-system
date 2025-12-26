'use client';

/**
 * List - Titan Engine (Ant Design)
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
List.displayName = 'List.Titan';

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
Item.displayName = 'List.Item.Titan';

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
Meta.displayName = 'List.Item.Meta.Titan';

export default List;
