import type { ServiceAccountDashboardPreset } from '../core';
import { OverviewServiceAccountDashboard } from './overview';
import { DetailServiceAccountDashboard } from './detail';

export { OverviewServiceAccountDashboard } from './overview';
export { DetailServiceAccountDashboard } from './detail';

export const SERVICE_ACCOUNT_DASHBOARD_PRESETS: Record<ServiceAccountDashboardPreset, React.ComponentType<any>> = {
  overview: OverviewServiceAccountDashboard,
  detail: DetailServiceAccountDashboard,
};
