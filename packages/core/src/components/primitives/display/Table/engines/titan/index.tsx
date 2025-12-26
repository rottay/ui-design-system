'use client';

/**
 * Table - Titan Engine (Ant Design)
 */
import { Table as AntTable } from 'antd';
import type { TableProps } from '../../types';

export const Table = <T extends object = object>(props: TableProps<T>) => {
  const {
    dataSource,
    columns,
    rowKey,
    loading,
    size,
    bordered,
    pagination,
    rowSelection,
    expandable,
    scroll,
    tableLayout,
    showHeader,
    title,
    footer,
    locale,
    rowClassName,
    rowHoverable,
    onRow,
    onHeaderRow,
    onChange,
    summary,
    sticky,
    virtual,
    showSorterTooltip,
    sortDirections,
    getPopupContainer,
    className,
    style,
    id,
  } = props;

  // Map size
  const antSize = size === 'default' ? 'middle' : size;

  return (
    <AntTable<T>
      dataSource={dataSource}
      columns={columns as any}
      rowKey={rowKey}
      loading={loading}
      size={antSize}
      bordered={bordered}
      pagination={pagination as any}
      rowSelection={rowSelection as any}
      expandable={expandable as any}
      scroll={scroll}
      tableLayout={tableLayout}
      showHeader={showHeader}
      title={title as any}
      footer={footer as any}
      locale={locale}
      rowClassName={rowClassName}
      rowHoverable={rowHoverable}
      onRow={onRow}
      onHeaderRow={onHeaderRow as any}
      onChange={onChange as any}
      summary={summary as any}
      sticky={sticky}
      virtual={virtual}
      showSorterTooltip={showSorterTooltip}
      sortDirections={sortDirections}
      getPopupContainer={getPopupContainer}
      className={className}
      style={style}
      id={id}
    />
  );
};

Table.displayName = 'Table.Titan';

export default Table;
