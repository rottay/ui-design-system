/**
 * BhTokenBudget - Core Interface
 * Budget configuration and alert thresholds for BitHire ATS platform
 *
 * Token types imported from @rottay/recruiter (single source of truth).
 * TokenBalance fields: currentBalance, reservedBalance, lowBalanceThreshold, etc.
 * DBQuota fields from @rottay/ia-chat: quotaLimit, quotaUsed, alertThreshold, etc.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBQuota } from '@rottay/ia-chat';
import type { TokenBalance as DBTokenBalance } from '@rottay/recruiter';

export type BhTokenBudgetPreset = 'config' | 'compact';

export interface BudgetAllocation {
  teamId: string;
  teamName: string;
  /** Maps to quota allocation or team token budget */
  allocated: number;
  /** Maps to DBQuota.quotaUsed */
  used: number;
  /** Maps to DBQuota.alertThreshold */
  alertThreshold: number;
  department?: string;
  warningThreshold?: number;
  hardLimit?: boolean;
  periodStart?: string;
  periodEnd?: string;
  billingCycle?: 'monthly' | 'daily' | 'weekly';
}

export interface BhTokenBudgetProps extends EngineAwareProps {
  preset?: BhTokenBudgetPreset;

  /** List of team budget allocations */
  allocations?: BudgetAllocation[];

  /** Total budget amount */
  totalBudget?: number;

  /** Total used amount */
  totalUsed?: number;

  /** Currency symbol */
  currency?: string;

  /** Callback when allocation changes */
  onAllocationChange?: (teamId: string, amount: number) => void;

  /** Callback when alert threshold changes */
  onAlertChange?: (teamId: string, threshold: number) => void;

  /** Callback to save configuration */
  onSave?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Lifetime token metrics */
  lifetimePurchased?: number;
  lifetimeConsumed?: number;
  lifetimeExpired?: number;

  /** Auto-purchase configuration */
  autoPurchaseEnabled?: boolean;
  autoPurchaseThreshold?: number;
  autoPurchaseAmount?: number;
  lastPurchaseAt?: string;
  lowBalanceAlertSent?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TOKEN_BUDGET_DEFAULTS: Partial<BhTokenBudgetProps> = {
  preset: 'config',
  currency: '$',
};
