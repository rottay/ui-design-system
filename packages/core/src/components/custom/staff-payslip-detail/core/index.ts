/**
 * StaffPayslipDetail - Core Interface
 * Individual payment detail with breakdown
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffPayslipDetailPreset = 'full' | 'compact';

export interface PayslipEarning {
  label: string;
  hours?: number;
  rate?: number;
  amount: number;
}

export interface PayslipDeduction {
  label: string;
  amount: number;
  type: 'tax' | 'insurance' | 'other';
}

export interface PayslipData {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  period: string;
  payDate: Date;
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  paymentMethod: string;
  referenceNumber?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
}

export interface StaffPayslipDetailProps extends EngineAwareProps {
  preset?: StaffPayslipDetailPreset;
  payslip?: PayslipData;
  onBack?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_PAYSLIP_DETAIL_DEFAULTS: Partial<StaffPayslipDetailProps> = {
  preset: 'full',
};
