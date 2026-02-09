/**
 * EvAdminCenter - Core Interface
 * Platform admin dashboard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvAdminCenterPreset = 'overview' | 'system';

export interface SystemMetric {
  label: string;
  value: string | number;
  status: "healthy" | "warning" | "critical";
  icon?: ReactNode;
}

export interface TenantSummary {
  id: string;
  name: string;
  eventsCount: number;
  revenue: number;
  status: "active" | "suspended" | "trial";
}

export interface SystemEvent {
  id: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "error";
  time: Date;
}

export interface AdminAction {
  key: string;
  label: string;
  icon: ReactNode;
  description?: string;
  onClick?: () => void;
}

export interface EvAdminCenterProps extends EngineAwareProps {
  preset?: EvAdminCenterPreset;
  systemMetrics?: SystemMetric[];
  tenants?: TenantSummary[];
  systemEvents?: SystemEvent[];
  quickActions?: AdminAction[];
  onTenantClick?: (tenantId: string) => void;
  onEventClick?: (eventId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ADMIN_CENTER_DEFAULTS: Partial<EvAdminCenterProps> = {
  preset: 'overview',

};
