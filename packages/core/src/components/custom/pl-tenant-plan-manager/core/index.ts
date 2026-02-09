/**
 * PlTenantPlanManager - Core Interface
 * Manage tenant subscription plans with pricing tiers, feature sets, and usage limits
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlTenantPlanManagerPreset = 'overview' | 'comparison';

// ─── Plan Types ──────────────────────────────────────────────────────────

export type PlanTier = 'free' | 'starter' | 'business' | 'enterprise';
export type PlanStatus = 'active' | 'deprecated' | 'draft';

export interface PlanFeature {
  /** Feature display name */
  name: string;
  /** Whether this feature is included in the plan */
  included: boolean;
  /** Optional limit value (e.g. "100", "Unlimited", 5000) */
  limit?: number | string;
}

export interface TenantPlan {
  /** Unique plan identifier */
  id: string;
  /** Display name of the plan */
  name: string;
  /** Plan tier level */
  tier: PlanTier;
  /** Current plan status */
  status: PlanStatus;
  /** Price amount in cents or smallest currency unit */
  price: number;
  /** Billing interval */
  interval: 'monthly' | 'yearly';
  /** List of features included in this plan */
  features: PlanFeature[];
  /** Maximum number of users allowed */
  maxUsers: number | string;
  /** Maximum storage allowed (e.g. "10 GB", "Unlimited") */
  maxStorage: string;
  /** API rate limit (e.g. "1000/min", "Unlimited") */
  apiRateLimit: string;
  /** Number of tenants currently subscribed to this plan */
  subscriberCount: number;
  /** Total revenue generated from this plan */
  revenue: number;
  /** Optional plan description */
  description?: string;
  /** Whether this plan should be visually highlighted (e.g. "Most Popular") */
  highlighted?: boolean;
}

// ─── Component Props ─────────────────────────────────────────────────────

export interface PlTenantPlanManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlTenantPlanManagerPreset;

  /** Plans to display */
  plans: TenantPlan[];

  /** Callback when a plan card is clicked */
  onPlanClick?: (planId: string) => void;

  /** Callback to create a new plan */
  onCreate?: () => void;

  /** Callback to edit a plan */
  onEdit?: (planId: string) => void;

  /** Callback to deprecate a plan */
  onDeprecate?: (planId: string) => void;

  /** Callback to duplicate a plan */
  onDuplicate?: (planId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_TENANT_PLAN_MANAGER_DEFAULTS: Partial<PlTenantPlanManagerProps> = {
  preset: 'overview',
  emptyText: 'No plans found',
};
