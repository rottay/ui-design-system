/**
 * Pagination - Titan Engine (Ant Design)
 */

import React from 'react';
import { Pagination as AntPagination } from 'antd';
import type { PaginationProps } from '../types';
import { PAGINATION_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'small' as const,
  md: 'default' as const,
  lg: 'default' as const,
};

export default function TitanPagination(props: PaginationProps): React.ReactElement {
  const {
    current,
    total,
    pageSize = PAGINATION_DEFAULTS.pageSize,
    size = PAGINATION_DEFAULTS.size,
    showSizeChanger = PAGINATION_DEFAULTS.showSizeChanger,
    showTotal = PAGINATION_DEFAULTS.showTotal,
    disabled,
    onChange,
    className,
    style,
  } = props;

  return (
    <AntPagination
      current={current}
      total={total}
      pageSize={pageSize}
      size={SIZE_MAP[size!]}
      showSizeChanger={showSizeChanger}
      showTotal={showTotal ? (total) => `Total ${total} items` : undefined}
      disabled={disabled}
      onChange={onChange}
      className={className}
      style={style}
    />
  );
}
