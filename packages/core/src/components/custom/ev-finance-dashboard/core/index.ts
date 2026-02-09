/**
 * EvFinanceDashboard - Core Interface
 * Finance manager dashboard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvFinanceDashboardPreset = 'overview' | 'detailed';

export interface FinanceKpi {
  label: string;
  value: number;
  currency: string;
  trend: "up" | "down" | "flat";
  trendValue: number;
}

export interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  status: "pending" | "approved" | "paid";
}

export interface RevenueEntry {
  source: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "flat";
}

export interface InvoiceItem {
  id: string;
  number: string;
  vendor: string;
  amount: number;
  dueDate: Date;
  status: "draft" | "sent" | "paid" | "overdue";
}

export interface EvFinanceDashboardProps extends EngineAwareProps {
  preset?: EvFinanceDashboardPreset;
  kpis?: FinanceKpi[];
  expenses?: ExpenseItem[];
  revenueEntries?: RevenueEntry[];
  invoices?: InvoiceItem[];
  onExpenseClick?: (id: string) => void;
  onInvoiceClick?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_FINANCE_DASHBOARD_DEFAULTS: Partial<EvFinanceDashboardProps> = {
  preset: 'overview',

};
