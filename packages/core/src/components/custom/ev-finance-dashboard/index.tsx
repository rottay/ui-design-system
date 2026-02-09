/**
 * EvFinanceDashboard - Main Export
 * Finance manager dashboard
 * Automatically selects preset based on props
 */

import type { EvFinanceDashboardProps } from './core';
import { EV_FINANCE_DASHBOARD_DEFAULTS } from './core';
import { EV_FINANCE_DASHBOARD_PRESETS } from './presets';

export {
  type EvFinanceDashboardProps,
  type EvFinanceDashboardPreset,
  type FinanceKpi as EvFinanceDashboardFinanceKpi,
  type ExpenseItem as EvFinanceDashboardExpenseItem,
  type RevenueEntry as EvFinanceDashboardRevenueEntry,
  type InvoiceItem as EvFinanceDashboardInvoiceItem,
  EV_FINANCE_DASHBOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvFinanceDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function EvFinanceDashboard(props: EvFinanceDashboardProps): React.ReactElement {
  const preset = props.preset ?? EV_FINANCE_DASHBOARD_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_FINANCE_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvFinanceDashboard.displayName = 'EvFinanceDashboard';

export { OverviewEvFinanceDashboard, DetailedEvFinanceDashboard } from './presets';
