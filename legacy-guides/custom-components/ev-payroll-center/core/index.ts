/**
 * EvPayrollCenter - Core Interface
 * Staff payroll center
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvPayrollCenterPreset = 'overview' | 'detail';

export interface PayrollRecord {
  id: string;
  staffName: string;
  role: string;
  scheduledHours: number;
  workedHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: "pending" | "approved" | "paid";
}

export interface SettlementInfo {
  id: string;
  settlementNumber: string;
  periodStart: Date;
  periodEnd: Date;
  totalAmount: number;
  staffCount: number;
  status: "draft" | "approved" | "processing" | "completed";
}

export interface EvPayrollCenterProps extends EngineAwareProps {
  preset?: EvPayrollCenterPreset;
  payrollRecords?: PayrollRecord[];
  settlements?: SettlementInfo[];
  onApprovePayroll?: (id: string) => void;
  onGenerateSettlement?: () => void;
  onRecordClick?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_PAYROLL_CENTER_DEFAULTS: Partial<EvPayrollCenterProps> = {
  preset: 'overview',

};
