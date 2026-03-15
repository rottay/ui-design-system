'use client';

/**
 * @fileoverview Table Classic Engine - Rottay Design System
 * @description Ant Design-based table with full feature support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Table component to provide
 * comprehensive data table functionality.
 *
 * **Implementation Details:**
 * - Uses `antd/Table` for core rendering
 * - Maps size variants to Ant Design sizes
 * - Full pagination configuration support
 * - Row selection with checkbox/radio
 * - Expandable rows with custom render
 * - Virtual scrolling for large datasets
 * - Fixed columns and headers
 *
 * **Ant Design Features:**
 * - Column filtering with menus
 * - Nested column groups
 * - Summary rows
 * - Sticky headers
 * - Resizable columns
 * - Tree data structure
 *
 * @example Basic Usage
 * ```tsx
 * import { Table } from '@rottay/design-system';
 *
 * <Table
 *   engine="classic"
 *   dataSource={data}
 *   columns={columns}
 *   pagination={{ pageSize: 20 }}
 * />
 * ```
 *
 * @see {@link Table} for the main component
 * @see {@link https://ant.design/components/table} Ant Design Table
 * @module Table/engines/classic
 * @category Display
 * @package @rottay/design-system
 */
import { Table as AntTable } from 'antd';
import type { TableProps } from '../Table.types';

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

Table.displayName = 'Table.Classic';

export default Table;
