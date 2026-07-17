'use client';

/**
 * @fileoverview Modern (token-driven) engine for the PricingTable pattern.
 *
 * Builds the same plan-comparison grid as the Classic engine but uses DS token
 * token skin rules and shared modern-style helpers instead of Ant Design
 * components. This avoids pulling in Ant Design's JavaScript runtime for
 * projects that rely on a lightweight pipeline, keeping the bundle small.
 *
 * @example
 * <ModernPricingTable
 *   plans={[{ id: 'team', name: 'Team', price: 49, cta: 'Start Trial', features: { api: true } }]}
 *   features={[{ key: 'api', label: 'API Access' }]}
 *   billingCycle="monthly"
 *   onBillingCycleChange={(cycle) => setCycle(cycle)}
 * />
 */

import React from 'react';
import type { PricingTableProps, PricingPlan, PricingFeature } from '../../contracts';
import { pillBadgeSmStyle, spinnerStyle } from '../../../../foundation/engine-styles/modern';

/**
 * Renders a tri-state feature indicator using Unicode characters.
 * - `true` -> green checkmark
 * - `false`/`undefined` -> muted cross
 * - `string` -> custom label (e.g. "10 GB")
 */
function renderFeatureValue(value: boolean | string | undefined): React.ReactNode {
  if (value === true) return <span data-part="feature-value" data-feature-state="included" className="ds-pricing-table__feature-value text-lg">{'\u2713'}</span>;
  if (value === false || value === undefined) return <span data-part="feature-value" data-feature-state="excluded" className="ds-pricing-table__feature-value text-lg">{'\u2717'}</span>;
  return <span data-part="feature-value" data-feature-state="custom" className="ds-pricing-table__feature-value text-sm">{value}</span>;
}

/**
 * Modern (token-driven) engine for the PricingTable pattern component.
 *
 * Uses DS token skin rules and shared modern-style helpers to compose the
 * pricing layout. Tooltips use the native title attribute instead of a
 * JS-driven Ant Design Tooltip.
 *
 * @param props - {@link PricingTableProps} controlling plans, features, billing cycle, and callbacks.
 * @returns A feature-comparison pricing table styled with DS tokens.
 */
export default function ModernPricingTable(props: PricingTableProps) {
  const {
    plans,
    features,
    highlightedPlan,
    onSelectPlan,
    billingCycle,
    onBillingCycleChange,
    currency = '$',
    renderPlanHeader,
    loading,
    className,
    style,
  } = props;

  /* Short-circuit: spinner while pricing data loads */
  if (loading) {
    return (
      <div
        className={`ds-pattern-pricing-table ds-engine-modern flex justify-center items-center py-12 ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-cycle={billingCycle ?? 'monthly'}
        style={style}
      >
        <span data-part="spinner" role="status" aria-label="Loading" style={spinnerStyle(24)} />
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-pricing-table ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-cycle={billingCycle ?? 'monthly'}
      style={style}
    >
      {/* Billing toggle -- Only rendered when the consumer provides a
          billing-cycle change handler, keeping the toggle opt-in for
          static pricing pages. */}
      {onBillingCycleChange && (
        <div data-part="toggle" data-cycle={billingCycle ?? 'monthly'} className="flex justify-center items-center gap-3 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'opacity-50'}`}>Monthly</span>
          <input
            data-part="toggle-input"
            type="checkbox"
            style={{ width: 40, height: 20, cursor: 'pointer' }}
            checked={billingCycle === 'yearly'}
            onChange={(e) => onBillingCycleChange(e.target.checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : 'opacity-50'}`}>
            Yearly
            <span data-part="plan-badge" data-variant="savings" className="ds-pricing-table__plan-badge ml-1" style={pillBadgeSmStyle}>Save 20%</span>
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* Plan headers */}
          <thead>
            <tr>
              <th className="w-48 text-sm font-semibold opacity-50 align-bottom">Features</th>
              {/* Each plan becomes a column. Highlighted plans get primary border + tinted bg. */}
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} className="text-center align-top">
                    {/* renderPlanHeader lets consumers fully replace the card content */}
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <div data-part="plan-card" data-highlighted={isHighlighted} className="ds-pricing-table__plan-card p-4">
                        {plan.popular && (
                          <span data-part="plan-badge" data-variant="popular" className="ds-pricing-table__plan-badge mb-2" style={pillBadgeSmStyle}>Most Popular</span>
                        )}
                        <div className="font-bold text-lg">{plan.name}</div>
                        {/* Price displayed as currency+number or raw string for "Custom" tiers */}
                        <div className="text-3xl font-extrabold mt-1">
                          {typeof plan.price === 'number' ? `${currency}${plan.price}` : plan.price}
                        </div>
                        {plan.priceNote && (
                          <div className="text-xs opacity-50">{plan.priceNote}</div>
                        )}
                        {plan.description && (
                          <div className="text-xs opacity-50 mt-1">{plan.description}</div>
                        )}
                        <button
                          className="ds-pricing-table__cta-button"
                          data-part="cta-button"
                          data-highlighted={isHighlighted}
                          style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer', width: '100%', marginTop: 12 }}
                          onClick={() => onSelectPlan?.(plan.id)}
                        >
                          {plan.cta}
                        </button>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Feature rows -- Category headers are emitted when a feature's
              category differs from the previous one, allowing a flat features
              array to still produce visually grouped sections. */}
          <tbody>
            {features.map((feature, index) => {
              const isCategory = feature.category && (index === 0 || features[index - 1].category !== feature.category);
              return (
                <React.Fragment key={feature.key}>
                  {isCategory && (
                    <tr>
                      <td
                        data-part="category-header"
                        colSpan={plans.length + 1}
                        className="ds-pricing-table__category-header font-bold text-xs uppercase opacity-40 pt-6 pb-2 border-t"
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  {/* Feature row */}
                  <tr data-part="feature-row">
                    <td className="text-sm">
                      {/* Native title tooltip -- no JS overhead */}
                      {feature.description ? (
                        <span className="ds-pricing-table__feature-label" data-part="feature-label" title={feature.description} style={{ cursor: 'help' }}>
                          {feature.label}
                        </span>
                      ) : (
                        feature.label
                      )}
                    </td>
                    {/* Each cell shows the tri-state feature indicator for this plan */}
                    {plans.map(plan => (
                      <td key={plan.id} className="text-center">
                        {renderFeatureValue(plan.features[feature.key])}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
