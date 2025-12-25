/**
 * Titan List Engine
 *
 * Adapter that converts unified ListProps to Ant Design List.
 */

'use client';

import { List as AntList } from 'antd';
import type { ListProps as AntListProps } from 'antd';
import type { ListProps, ListSpinConfig } from '../../../../types/components/list';

/**
 * Titan List - Ant Design implementation with unified ListProps
 */
function TitanList<T = any>({
  dataSource,
  renderItem,
  className,
  loading,
  size,
  bordered,
  split,
  header,
  footer,
  itemLayout,
  grid,
  pagination,
  locale,
  rowKey,
  loadMore,
  style,
  id,
}: ListProps<T>) {
  // Map unified loading to AntD loading
  const antLoading = typeof loading === 'boolean'
    ? loading
    : loading
      ? {
          spinning: loading.spinning ?? true,
          size: loading.size,
          tip: loading.tip,
          delay: loading.delay,
        }
      : false;

  // Map unified pagination to AntD pagination
  const antPagination = pagination === false
    ? false
    : pagination
      ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: pagination.onChange,
          pageSizeOptions: pagination.pageSizeOptions,
          showSizeChanger: pagination.showSizeChanger,
          showTotal: typeof pagination.showTotal === 'function' ? pagination.showTotal : undefined,
          disabled: pagination.disabled,
          hideOnSinglePage: pagination.hideOnSinglePage,
          position: pagination.position,
        }
      : undefined;

  // Map rowKey - AntD expects string or function
  const antRowKey = typeof rowKey === 'function'
    ? (item: T) => String(rowKey(item))
    : rowKey;

  return (
    <AntList<T>
      dataSource={dataSource}
      renderItem={renderItem}
      className={className}
      loading={antLoading}
      size={size}
      bordered={bordered}
      split={split}
      header={header}
      footer={footer}
      itemLayout={itemLayout}
      grid={grid}
      pagination={antPagination}
      locale={locale}
      rowKey={antRowKey}
      loadMore={loadMore}
      style={style}
      id={id}
    />
  );
}

TitanList.displayName = 'TitanList';

// Attach Item and Item.Meta as sub-components
const ListWithSubComponents = TitanList as typeof TitanList & {
  Item: typeof AntList.Item;
};

ListWithSubComponents.Item = AntList.Item;

export default ListWithSubComponents;
