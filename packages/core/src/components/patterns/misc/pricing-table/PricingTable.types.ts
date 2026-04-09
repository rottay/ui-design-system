/**
 * @fileoverview Type definitions for the PricingTable pattern component.
 * Defines {@link PricingPlan} (table columns representing plans),
 * {@link PricingFeature} (table rows representing feature comparisons),
 * and {@link PricingTableProps} controlling the comparison grid layout,
 * billing cycle toggle, and highlighted plan selection.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single pricing plan displayed as a column in the table.
 *
 * Each plan has a price, a CTA button, and a feature map indicating which
 * features are included and at what level.
 */
export interface PricingPlan {
  /** Unique identifier for this plan. */
  id: string;

  /** Display name of the plan (e.g., "Starter", "Pro", "Enterprise"). */
  name: string;

  /**
   * Price for the plan. Use a number for programmatic formatting with
   * `currency`, or a string for pre-formatted prices (e.g., "Custom").
   */
  price: number | string;

  /** Short description of the plan (e.g., "Best for small teams"). */
  description?: string;

  /**
   * Map of feature keys to their availability or value for this plan.
   * - `true`/`false`: Feature is included/excluded (renders checkmark/dash).
   * - `string`: Custom display value (e.g., "Unlimited", "10 GB").
   *
   * Keys must match the `key` field of the corresponding {@link PricingFeature}.
   */
  features: Record<string, boolean | string>;

  /** Label for the call-to-action button (e.g., "Get Started", "Contact Sales"). */
  cta: string;

  /** Whether to visually highlight this plan as the recommended option. */
  popular?: boolean;

  /**
   * Additional note displayed below the price (e.g., "/month", "billed annually").
   */
  priceNote?: string;
}

/**
 * Represents a feature row in the pricing comparison table.
 *
 * Features are rendered as rows with their availability for each plan
 * determined by the plan's `features` record.
 */
export interface PricingFeature {
  /** Unique key matching entries in each plan's `features` record. */
  key: string;

  /** Human-readable feature name displayed in the row header. */
  label: string;

  /** Tooltip or additional description explaining the feature. */
  description?: string;

  /**
   * Optional grouping category. When provided, features with the same
   * category are visually grouped under a section header.
   */
  category?: string;
}

/**
 * Props for the PricingTable pattern component.
 *
 * Renders a feature-comparison grid with plan columns, feature rows,
 * an optional billing cycle toggle, and per-plan CTA buttons.
 *
 * @example
 * ```tsx
 * <PricingTable
 *   plans={[
 *     { id: 'free', name: 'Free', price: 0, cta: 'Get Started',
 *       features: { storage: '5 GB', support: false } },
 *     { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true,
 *       features: { storage: '100 GB', support: true } },
 *   ]}
 *   features={[
 *     { key: 'storage', label: 'Storage', category: 'Resources' },
 *     { key: 'support', label: 'Priority Support', category: 'Support' },
 *   ]}
 *   highlightedPlan="pro"
 *   billingCycle="monthly"
 *   onBillingCycleChange={(cycle) => setCycle(cycle)}
 *   onSelectPlan={(planId) => handlePlanSelect(planId)}
 *   currency="$"
 * />
 * ```
 */
export interface PricingTableProps extends PatternBaseProps {
  /** List of plans rendered as columns in the comparison table. */
  plans: PricingPlan[];

  /** List of features rendered as rows in the comparison table. */
  features: PricingFeature[];

  /** ID of the plan to visually highlight as recommended. */
  highlightedPlan?: string;

  /** Callback fired when a plan's CTA button is clicked. */
  onSelectPlan?: (planId: string) => void;

  /**
   * Currently selected billing cycle. Controls which price is shown
   * when plans have cycle-dependent pricing.
   */
  billingCycle?: 'monthly' | 'yearly';

  /** Callback fired when the user toggles the billing cycle. */
  onBillingCycleChange?: (cycle: 'monthly' | 'yearly') => void;

  /** Currency symbol prepended to numeric prices (e.g., "$", "EUR"). */
  currency?: string;

  /**
   * Custom renderer for plan column headers.
   * Use to override the default header layout with custom branding or badges.
   */
  renderPlanHeader?: (plan: PricingPlan) => ReactNode;
}
