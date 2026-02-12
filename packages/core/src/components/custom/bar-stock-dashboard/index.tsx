/**
 * BarStockDashboard - Main Export
 * Inventory overview with stock levels, alerts, trends
 */

import type { BarStockDashboardProps } from './core';
import { BAR_STOCK_DASHBOARD_DEFAULTS } from './core';
import { BAR_STOCK_DASHBOARD_PRESETS } from './presets';

export {
  type BarStockDashboardProps,
  type BarStockDashboardPreset,
  type StockItem as BarStockDashboardItem,
  type StockAlert as BarStockDashboardAlert,
  BAR_STOCK_DASHBOARD_DEFAULTS,
} from './core';
export * from './presets';

export function BarStockDashboard(props: BarStockDashboardProps): React.ReactElement {
  const preset = props.preset ?? BAR_STOCK_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BAR_STOCK_DASHBOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarStockDashboard.displayName = 'BarStockDashboard';

export { DashboardBarStockDashboard, CompactBarStockDashboard } from './presets';
