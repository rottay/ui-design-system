import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import type { BreadcrumbProps } from './types';

export const Breadcrumb: React.FC<BreadcrumbProps> = (props) => {
  return <AntBreadcrumb {...props} />;
};

Breadcrumb.displayName = 'Breadcrumb';
