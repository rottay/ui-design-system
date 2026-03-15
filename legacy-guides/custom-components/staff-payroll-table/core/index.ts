/**
 * StaffPayrollTable - Core Interface
 * Payroll calculations table by period with hours, bonuses, deductions
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffPayrollTablePreset = 'detailed' | 'summary';

export interface PayrollLineItem {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  period: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  grossPay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  currency: string;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
}

export interface StaffPayrollTableProps extends EngineAwareProps {
  preset?: StaffPayrollTablePreset;
  items?: PayrollLineItem[];
  period?: string;
  onItemClick?: (id: string) => void;
  onApprove?: (id: string) => void;
  onApproveAll?: () => void;
  onExport?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_PAYROLL_TABLE_DEFAULTS: Partial<StaffPayrollTableProps> = {
  preset: 'detailed',
};
