import type { ServiceAccountDashboardProps } from './core';
import { SERVICE_ACCOUNT_DASHBOARD_DEFAULTS } from './core';
import { SERVICE_ACCOUNT_DASHBOARD_PRESETS } from './presets';

export { type ServiceAccountDashboardProps, type ServiceAccountDashboardPreset, type ServiceAccount, type ServiceAccountStatus, SERVICE_ACCOUNT_DASHBOARD_DEFAULTS } from './core';
export { getStatusColors } from './core';
export * from './presets';

export function ServiceAccountDashboard(props: ServiceAccountDashboardProps): React.ReactElement {
  const preset = props.preset ?? SERVICE_ACCOUNT_DASHBOARD_DEFAULTS.preset ?? 'overview';
  const PresetComponent = SERVICE_ACCOUNT_DASHBOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

ServiceAccountDashboard.displayName = 'ServiceAccountDashboard';
export { OverviewServiceAccountDashboard, DetailServiceAccountDashboard } from './presets';
