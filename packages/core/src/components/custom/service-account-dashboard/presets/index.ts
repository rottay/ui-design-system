import type { ServiceAccountDashboardPreset, ServiceAccountDashboardProps } from '../core';
import type { ComponentType } from 'react';
import { OverviewServiceAccountDashboard } from './overview';
import { DetailServiceAccountDashboard } from './detail';

export { OverviewServiceAccountDashboard } from './overview';
export { DetailServiceAccountDashboard } from './detail';

export const SERVICE_ACCOUNT_DASHBOARD_PRESETS: Record<ServiceAccountDashboardPreset, ComponentType<ServiceAccountDashboardProps>> = {
  overview: OverviewServiceAccountDashboard,
  detail: DetailServiceAccountDashboard,
};
