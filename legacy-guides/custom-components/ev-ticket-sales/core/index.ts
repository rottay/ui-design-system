/**
 * EvTicketSales - Core Interface
 * Ticket sales dashboard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTicketSalesPreset = 'overview' | 'breakdown';

export interface SalesKpi {
  label: string;
  value: number;
  currency?: string;
  trend: "up" | "down" | "flat";
  trendValue: number;
}

export interface TicketTypeBreakdown {
  type: string;
  sold: number;
  total: number;
  price: number;
  revenue: number;
  color: string;
}

export interface SalesTrend {
  date: string;
  amount: number;
  count: number;
}

export interface EvTicketSalesProps extends EngineAwareProps {
  preset?: EvTicketSalesPreset;
  kpis?: SalesKpi[];
  breakdown?: TicketTypeBreakdown[];
  trends?: SalesTrend[];
  capacityPercent?: number;
  onExport?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TICKET_SALES_DEFAULTS: Partial<EvTicketSalesProps> = {
  preset: 'overview',

};
