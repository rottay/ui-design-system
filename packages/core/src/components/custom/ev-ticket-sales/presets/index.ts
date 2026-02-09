/**
 * EvTicketSales - All Presets
 */

export { OverviewEvTicketSales } from './overview';
export { BreakdownEvTicketSales } from './breakdown';

import type { EvTicketSalesPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTicketSalesProps } from '../core';
import { OverviewEvTicketSales } from './overview';
import { BreakdownEvTicketSales } from './breakdown';

export const EV_TICKET_SALES_PRESETS: Record<EvTicketSalesPreset, ComponentType<EvTicketSalesProps>> = {
  overview: OverviewEvTicketSales,
  breakdown: BreakdownEvTicketSales,
};
