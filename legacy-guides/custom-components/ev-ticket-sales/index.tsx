/**
 * EvTicketSales - Main Export
 * Ticket sales dashboard
 * Automatically selects preset based on props
 */

import type { EvTicketSalesProps } from './core';
import { EV_TICKET_SALES_DEFAULTS } from './core';
import { EV_TICKET_SALES_PRESETS } from './presets';

export {
  type EvTicketSalesProps,
  type EvTicketSalesPreset,
  type SalesKpi as EvTicketSalesSalesKpi,
  type TicketTypeBreakdown as EvTicketSalesTicketTypeBreakdown,
  type SalesTrend as EvTicketSalesSalesTrend,
  EV_TICKET_SALES_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvTicketSales component
 * Renders the appropriate preset based on the preset prop
 */
export function EvTicketSales(props: EvTicketSalesProps): React.ReactElement {
  const preset = props.preset ?? EV_TICKET_SALES_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_TICKET_SALES_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvTicketSales.displayName = 'EvTicketSales';

export { OverviewEvTicketSales, BreakdownEvTicketSales } from './presets';
