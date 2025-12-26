/**
 * Alert - Core Interface
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends BaseComponentProps, EngineAwareProps {
  type?: AlertType;
  message: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  /** Children content */
  children?: ReactNode;
}

export const ALERT_DEFAULTS: Partial<AlertProps> = {
  type: 'info',
  showIcon: true,
  closable: false,
};
