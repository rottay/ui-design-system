import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type ErrorPagePreset = 'standard' | 'minimal';

export type ErrorCode = '404' | '500' | '403' | 'generic';

export interface ErrorPageAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export interface ErrorPageProps extends EngineAwareProps {
  preset?: ErrorPagePreset;
  code?: ErrorCode;
  title?: string;
  description?: string;
  illustration?: ReactNode;
  actions?: ErrorPageAction[];
  className?: string;
  style?: React.CSSProperties;
}

export const ERROR_PAGE_DEFAULTS: Partial<ErrorPageProps> = {
  preset: 'standard',
  code: '404',
};

export const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string }> = {
  '404': { title: 'Page not found', description: 'The page you are looking for does not exist or has been moved.' },
  '500': { title: 'Internal server error', description: 'Something went wrong on our end. Please try again later.' },
  '403': { title: 'Access denied', description: 'You do not have permission to access this resource.' },
  generic: { title: 'Something went wrong', description: 'An unexpected error occurred. Please try again.' },
};
