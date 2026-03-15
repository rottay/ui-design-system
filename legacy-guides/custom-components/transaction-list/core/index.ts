/**
 * TransactionList - Core Interface
 * Stripe-style payment transactions view with status badges, filter chips,
 * summary tabs, and export actions.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type TransactionListPreset = 'standard' | 'detailed';

export type TransactionStatus = 'succeeded' | 'failed' | 'incomplete' | 'refunded' | 'disputed' | 'uncaptured' | 'pending';

export type PaymentMethodType = 'visa' | 'mastercard' | 'amex' | 'paypal' | 'bank' | 'crypto' | 'other';

export interface PaymentMethod {
  type: PaymentMethodType;
  last4?: string;
  icon?: ReactNode;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  description?: string;
  customer?: string;
  date: string;
  refundedDate?: string;
  disputeAmount?: number;
  metadata?: Record<string, string>;
}

export interface TransactionSummary {
  key: TransactionStatus | 'all';
  label: string;
  count: number;
  active?: boolean;
}

export interface TransactionFilter {
  key: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
}

export type TransactionAction = 'refund' | 'dispute' | 'capture' | 'cancel' | 'copy' | 'archive';

export interface TransactionRowAction {
  key: TransactionAction;
  label: string;
  icon?: ReactNode;
  hidden?: (transaction: Transaction) => boolean;
  danger?: boolean;
}

export interface TransactionListProps extends EngineAwareProps {
  preset?: TransactionListPreset;
  transactions: Transaction[];
  summaries?: TransactionSummary[];
  activeSummary?: string;
  onSummaryChange?: (key: string) => void;
  filters?: TransactionFilter[];
  onFilterClick?: (key: string) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  title?: string;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  onExport?: () => void;
  onEditColumns?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  totalResults?: number;
  loading?: boolean;
  emptyText?: ReactNode;
  formatAmount?: (amount: number, currency: string) => string;
  /** Row-level action handler (refund, dispute, capture, cancel) */
  onTransactionAction?: (action: TransactionAction, transaction: Transaction) => void;
  /** Custom row actions (overrides defaults) */
  rowActions?: TransactionRowAction[];
  className?: string;
  style?: CSSProperties;
}

export const TRANSACTION_LIST_DEFAULTS: Partial<TransactionListProps> = {
  preset: 'standard',
  searchPlaceholder: 'Search',
  title: 'Transactions',
  emptyText: 'No transactions',
};

// ============================================================================
// Shared Utilities
// ============================================================================

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

export function getStatusConfig(tokens: DesignTokens): Record<TransactionStatus, StatusConfig> {
  return {
    succeeded: {
      label: 'Succeeded',
      bgColor: tokens.colors.successScale[50],
      textColor: tokens.colors.successScale[700],
      dotColor: tokens.colors.successScale[500],
    },
    failed: {
      label: 'Failed',
      bgColor: tokens.colors.errorScale[50],
      textColor: tokens.colors.errorScale[700],
      dotColor: tokens.colors.errorScale[500],
    },
    pending: {
      label: 'Pending',
      bgColor: tokens.colors.warningScale[50],
      textColor: tokens.colors.warningScale[700],
      dotColor: tokens.colors.warningScale[500],
    },
    refunded: {
      label: 'Refunded',
      bgColor: tokens.colors.infoScale[50],
      textColor: tokens.colors.infoScale[700],
      dotColor: tokens.colors.infoScale[500],
    },
    incomplete: {
      label: 'Incomplete',
      bgColor: tokens.colors.neutral[100],
      textColor: tokens.colors.neutral[600],
      dotColor: tokens.colors.neutral[400],
    },
    disputed: {
      label: 'Disputed',
      bgColor: tokens.colors.errorScale[100],
      textColor: tokens.colors.errorScale[800],
      dotColor: tokens.colors.errorScale[600],
    },
    uncaptured: {
      label: 'Uncaptured',
      bgColor: tokens.colors.neutral[100],
      textColor: tokens.colors.neutral[600],
      dotColor: tokens.colors.neutral[400],
    },
  };
}

export function defaultFormatAmount(amount: number, currency: string): string {
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

export function generateDefaultSummaries(transactions: Transaction[]): TransactionSummary[] {
  const statusCounts: Record<string, number> = { all: transactions.length };
  const statusKeys: TransactionStatus[] = ['succeeded', 'refunded', 'disputed', 'failed', 'uncaptured', 'incomplete', 'pending'];

  for (const status of statusKeys) {
    statusCounts[status] = transactions.filter((t) => t.status === status).length;
  }

  return [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'succeeded', label: 'Succeeded', count: statusCounts.succeeded },
    { key: 'refunded', label: 'Refunded', count: statusCounts.refunded },
    { key: 'disputed', label: 'Disputed', count: statusCounts.disputed },
    { key: 'failed', label: 'Failed', count: statusCounts.failed },
    { key: 'uncaptured', label: 'Uncaptured', count: statusCounts.uncaptured },
  ];
}
