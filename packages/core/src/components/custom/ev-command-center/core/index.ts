/**
 * EvCommandCenter - Core Interface
 * Unified operations dashboard with crowd, orders, staff, revenue, alerts, and stages panels
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvCommandCenterPreset = 'fullscreen' | 'mobile';

export interface CommandPanel {
  id: string;
  title: string;
  type: 'crowd' | 'orders' | 'staff' | 'revenue' | 'alerts' | 'stages';
  value: string;
  trend?: number;
  status: 'normal' | 'warning' | 'critical';
  details?: string;
}

export interface CommandAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface EvCommandCenterProps extends EngineAwareProps {
  preset?: EvCommandCenterPreset;
  panels?: CommandPanel[];
  alerts?: CommandAlert[];
  eventName?: string;
  onPanelClick?: (panelId: string) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_COMMAND_CENTER_DEFAULTS: Partial<EvCommandCenterProps> = {
  preset: 'fullscreen',
};
