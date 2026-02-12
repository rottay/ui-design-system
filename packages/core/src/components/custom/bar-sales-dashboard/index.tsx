/**
 * BarSalesDashboard - Main Export
 * Sales analytics with StatsGrid + Charts
 */

import type { BarSalesDashboardProps } from './core';
import { BAR_SALES_DASHBOARD_DEFAULTS } from './core';
import { BAR_SALES_DASHBOARD_PRESETS } from './presets';

export {
  type BarSalesDashboardProps,
  type BarSalesDashboardPreset,
  type SalesStat as BarSalesStat,
  type SalesByCategory as BarSalesByCategory,
  type SalesByHour as BarSalesByHour,
  type TopProduct as BarTopProduct,
  BAR_SALES_DASHBOARD_DEFAULTS,
} from './core';
export * from './presets';

export function BarSalesDashboard(props: BarSalesDashboardProps): React.ReactElement {
  const preset = props.preset ?? BAR_SALES_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BAR_SALES_DASHBOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarSalesDashboard.displayName = 'BarSalesDashboard';

export { DashboardBarSalesDashboard, CompactBarSalesDashboard } from './presets';
