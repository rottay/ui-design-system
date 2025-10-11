import type { ReactNode } from 'react';
import type { BreadcrumbProps, TabsProps, AvatarProps } from 'antd';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbProps['items'];
  actions?: ReactNode;
  tabs?: TabsProps['items'];
  onBack?: () => void;
  avatar?: AvatarProps;
  tags?: Array<{ label: string; color?: string }>;
  className?: string;
  style?: React.CSSProperties;
}
