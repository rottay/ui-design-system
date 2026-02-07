import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BannerAlertPreset = 'standard' | 'compact';

export type BannerAlertType = 'info' | 'warning' | 'success' | 'error';

export interface BannerAlertAction {
  key: string;
  label: string;
  onClick?: () => void;
}

export interface BannerAlertProps extends EngineAwareProps {
  preset?: BannerAlertPreset;
  type?: BannerAlertType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: BannerAlertAction[];
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BANNER_ALERT_DEFAULTS: Partial<BannerAlertProps> = {
  preset: 'standard',
  type: 'info',
  dismissible: true,
};
