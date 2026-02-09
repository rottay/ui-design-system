/**
 * EvBudgetPlanner - Core Interface
 * Event budget planning
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvBudgetPlannerPreset = 'overview' | 'breakdown';

export interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  actual: number;
  currency: string;
  color: string;
  subcategories?: Array<{ name: string;
  planned: number;
  actual: number }>;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  currency: string;
  variance: number;
}

export interface EvBudgetPlannerProps extends EngineAwareProps {
  preset?: EvBudgetPlannerPreset;
  categories?: BudgetCategory[];
  summary?: BudgetSummary;
  onCategoryClick?: (id: string) => void;
  onEditBudget?: (categoryId: string, amount: number) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_BUDGET_PLANNER_DEFAULTS: Partial<EvBudgetPlannerProps> = {
  preset: 'overview',

};
