/**
 * BhTokenBudget - Core Interface
 * Budget configuration and alert thresholds for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTokenBudgetPreset = 'config' | 'compact';

export interface BudgetAllocation {
  teamId: string;
  teamName: string;
  allocated: number;
  used: number;
  alertThreshold: number;
}

export interface BhTokenBudgetProps extends EngineAwareProps {
  preset?: BhTokenBudgetPreset;

  /** List of team budget allocations */
  allocations: BudgetAllocation[];

  /** Total budget amount */
  totalBudget: number;

  /** Total used amount */
  totalUsed: number;

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

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TOKEN_BUDGET_DEFAULTS: Partial<BhTokenBudgetProps> = {
  preset: 'config',
  currency: '$',
};
