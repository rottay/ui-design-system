/**
 * SystemHealthDashboard - All Presets
 */

import type { SystemHealthDashboardPreset } from '../core';
import { StatusPageSystemHealthDashboard } from './status-page';
import { OpsDashboardSystemHealthDashboard } from './ops-dashboard';
import { CompactSystemHealthDashboard } from './compact';

export { StatusPageSystemHealthDashboard } from './status-page';
export { OpsDashboardSystemHealthDashboard } from './ops-dashboard';
export { CompactSystemHealthDashboard } from './compact';

export const SYSTEM_HEALTH_DASHBOARD_PRESETS: Record<SystemHealthDashboardPreset, React.ComponentType<any>> = {
  'status-page': StatusPageSystemHealthDashboard,
  'ops-dashboard': OpsDashboardSystemHealthDashboard,
  compact: CompactSystemHealthDashboard,
};
