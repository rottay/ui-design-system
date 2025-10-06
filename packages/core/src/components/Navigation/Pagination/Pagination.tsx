import React from 'react';
import { Pagination as AntPagination } from 'antd';
import type { PaginationProps } from './types';

export const Pagination: React.FC<PaginationProps> = (props) => {
  return <AntPagination {...props} />;
};

Pagination.displayName = 'Pagination';
