/**
 * Titan Pagination Engine
 *
 * Adapter that converts unified PaginationProps to Ant Design Pagination.
 */

'use client';

import { Pagination as AntPagination } from 'antd';
import type { PaginationProps } from '../../../../types/components/pagination';

/**
 * Titan Pagination - Ant Design implementation with unified PaginationProps
 */
function TitanPagination({
  current,
  defaultCurrent,
  total,
  pageSize,
  defaultPageSize,
  onChange,
  onShowSizeChange,
  showSizeChanger,
  showQuickJumper,
  showTotal,
  disabled,
  simple,
  size,
  pageSizeOptions,
  hideOnSinglePage,
  responsive,
  itemRender,
  showLessItems,
  className,
  style,
  id,
  'aria-label': ariaLabel,
}: PaginationProps) {
  // Map unified size to AntD size (AntD uses 'small', 'default', no 'large')
  // 'large' is not an official size in AntD pagination, so we map it to 'default'
  const antSize = size === 'large' ? 'default' : size;

  return (
    <AntPagination
      current={current}
      defaultCurrent={defaultCurrent}
      total={total}
      pageSize={pageSize}
      defaultPageSize={defaultPageSize}
      onChange={onChange}
      onShowSizeChange={onShowSizeChange}
      showSizeChanger={showSizeChanger}
      showQuickJumper={showQuickJumper}
      showTotal={showTotal}
      disabled={disabled}
      simple={simple}
      size={antSize}
      pageSizeOptions={pageSizeOptions}
      hideOnSinglePage={hideOnSinglePage}
      responsive={responsive}
      itemRender={itemRender}
      showLessItems={showLessItems}
      className={className}
      style={style}
      id={id}
      aria-label={ariaLabel}
    />
  );
}

TitanPagination.displayName = 'TitanPagination';

export default TitanPagination;
