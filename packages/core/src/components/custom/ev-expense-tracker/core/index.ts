/**
 * EvExpenseTracker - Core Interface
 * Expense tracking
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvExpenseTrackerPreset = 'list' | 'dashboard';

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  date: Date;
  vendor: string;
  status: "pending" | "approved" | "rejected" | "paid";
  receiptUrl?: string;
  submittedBy: string;
}

export interface ExpenseCategory {
  name: string;
  total: number;
  percentage: number;
  color: string;
}

export interface EvExpenseTrackerProps extends EngineAwareProps {
  preset?: EvExpenseTrackerPreset;
  expenses?: Expense[];
  categories?: ExpenseCategory[];
  onExpenseClick?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUploadReceipt?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_EXPENSE_TRACKER_DEFAULTS: Partial<EvExpenseTrackerProps> = {
  preset: 'list',

};
