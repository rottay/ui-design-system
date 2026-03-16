'use client';

/**
 * @fileoverview Classic Table engine -- thin Ant Design wrapper.
 *
 * Delegates all table behavior (sorting, filtering, pagination, virtual scroll,
 * row selection, expandable rows, column pinning) to antd's Table internally.
 * The engine exists so the DS can expose a unified TableProps surface while
 * Ant Design handles the heavy rendering and accessibility under the hood.
 *
 * Engine: **Ant Design** (`antd/Table`)
 *
 * @example
 * ```tsx
 * <Table engine="classic" dataSource={users} columns={columns} pagination={{ pageSize: 20 }} />
 * ```
 *
 * @module Table/engines/classic
 * @category Display
 * @package @rottay/design-system
 */
import { Table as AntTable } from 'antd';
import type { TableProps } from '../Table.types';

/**
 * Classic Table engine backed by Ant Design.
 *
 * Acts as a near-passthrough to `antd/Table`, translating only the DS size
 * tokens ("small" | "default" | "large") into antd's naming ("small" | "middle" | "large").
 * All other props are forwarded as-is. The `as any` casts throughout the JSX
 * bridge structural type differences between DS generics and antd's internal
 * generics -- they are safe because the runtime shapes are identical.
 *
 * @param props - Unified DS TableProps (see Table.types.ts)
 * @returns An Ant Design Table element
 */
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

  // Antd uses "middle" where the DS uses "default". Other sizes pass through.
  const antSize = size === 'default' ? 'middle' : size;

  // Classic engine is a thin wrapper -- antd handles sorting, filtering,
  // pagination, virtual scroll, and all other table features internally.
  // The `as any` casts bridge DS types with antd's internal types which are
  // structurally compatible but use different generics.
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
