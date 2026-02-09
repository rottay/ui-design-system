/**
 * RefundWorkflow - Core Interface
 * Refund request management with queue and detail views,
 * status tracking, approval actions, and audit timeline.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type RefundWorkflowPreset = 'queue' | 'detail';

export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';

export type RefundReason = 'duplicate' | 'fraudulent' | 'customer-request' | 'product-issue' | 'service-issue' | 'other';

export interface RefundRequest {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  originalAmount: number;
  reason: RefundReason;
  reasonDetail?: string;
  status: RefundStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  paymentMethod: string;
  notes?: string[];
}

export interface RefundWorkflowProps extends EngineAwareProps {
  preset?: RefundWorkflowPreset;
  refunds: RefundRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onProcess?: (id: string) => void;
  onViewTransaction?: (transactionId: string) => void;
  selectedRefundId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const REFUND_WORKFLOW_DEFAULTS: Partial<RefundWorkflowProps> = {
  preset: 'queue',
  title: 'Refund Requests',
};

// ============================================================================
// Shared Utilities
// ============================================================================

export interface RefundStatusColors {
  bg: string;
  color: string;
  border: string;
  dot: string;
}

export function getRefundStatusColors(tokens: DesignTokens): Record<RefundStatus, RefundStatusColors> {
  return {
    pending: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      dot: tokens.colors.warningScale[500],
    },
    approved: {
      bg: tokens.colors.infoScale[50],
      color: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
      dot: tokens.colors.infoScale[500],
    },
    processing: {
      bg: tokens.colors.primaryScale[50],
      color: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
      dot: tokens.colors.primaryScale[500],
    },
    completed: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      dot: tokens.colors.successScale[500],
    },
    rejected: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      dot: tokens.colors.errorScale[500],
    },
    failed: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      dot: tokens.colors.errorScale[500],
    },
  };
}

export function getReasonLabel(reason: RefundReason): string {
  const labels: Record<RefundReason, string> = {
    'duplicate': 'Duplicate Charge',
    'fraudulent': 'Fraudulent',
    'customer-request': 'Customer Request',
    'product-issue': 'Product Issue',
    'service-issue': 'Service Issue',
    'other': 'Other',
  };
  return labels[reason];
}

export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20ac',
    GBP: '\u00a3',
    JPY: '\u00a5',
    CAD: 'CA$',
    AUD: 'A$',
    BRL: 'R$',
    MXN: 'MX$',
  };
  const symbol = currencySymbols[currency.toUpperCase()] || currency + ' ';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = (absAmount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}
