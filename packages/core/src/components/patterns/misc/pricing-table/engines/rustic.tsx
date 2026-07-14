'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the PricingTable pattern.
 *
 * Zero-dependency implementation that relies on native elements and `--ds-*`
 * CSS custom properties. This engine is intended for
 * environments where neither Ant Design nor Tailwind is available, or where
 * full theme-token control is required without external CSS frameworks. All
 * interactive elements (toggle switch, buttons) are hand-built with native
 * HTML to avoid any third-party runtime.
 *
 * @example
 * <RusticPricingTable
 *   plans={[{ id: 'basic', name: 'Basic', price: 0, cta: 'Free', features: { storage: '5 GB' } }]}
 *   features={[{ key: 'storage', label: 'Storage' }]}
 *   currency="$"
 * />
 */

import React, { type CSSProperties } from 'react';
import type { PricingTableProps, PricingPlan, PricingFeature } from '../PricingTable.types';

/**
 * Renders a tri-state feature indicator using Unicode characters and DS tokens.
 * Uses double-fallback CSS variables (e.g. `--ds-color-success-600` with a
 * generic `--ds-color-success` fallback) so it works across both granular and
 * simplified token sets.
 */
function renderFeatureValue(value: boolean | string | undefined): React.ReactNode {
  if (value === true) {
    return (
      <span className="ds-pricing-table__feature-value" data-part="feature-value" data-feature-state="included" style={{ fontSize: 16, fontWeight: 700 }}>
        {'\u2713'}
      </span>
    );
  }
  if (value === false || value === undefined) {
    return <span className="ds-pricing-table__feature-value" data-part="feature-value" data-feature-state="excluded" style={{ fontSize: 16 }}>{'\u2717'}</span>;
  }
  return <span className="ds-pricing-table__feature-value" data-part="feature-value" data-feature-state="custom" style={{ fontSize: 13 }}>{value}</span>;
}

/** Shared table cell padding. Extracted to avoid repetition across
 *  the ~40+ cells in a typical pricing table. */
const cellStyle: CSSProperties = {
  padding: '10px 16px',
};

/** Default button layout for non-highlighted plan CTAs. */
const btnBase: CSSProperties = {
  width: '100%',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'var(--ds-font-size-sm, 14px)',
  marginTop: 12,
};

/** Primary button layout for the highlighted/recommended plan CTA. */
const primaryBtn: CSSProperties = {
  ...btnBase,
};

/**
 * Rustic (Vanilla CSS) engine for the PricingTable pattern component.
 *
 * Every visual element is built from native HTML and `--ds-*` tokens, making
 * this engine fully theme-aware without
 * importing any CSS framework. The custom toggle switch is implemented via a
 * hidden checkbox plus absolutely-positioned pseudo-knob spans.
 *
 * @param props - {@link PricingTableProps} controlling plans, features, billing cycle, and callbacks.
 * @returns A feature-comparison pricing table styled with DS tokens.
 */
export default function RusticPricingTable(props: PricingTableProps) {
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

  /* Short-circuit: plain text loading state with muted token color */
  if (loading) {
    return (
      <div
        className={`ds-pattern-pricing-table ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-cycle={billingCycle ?? 'monthly'}
        style={{ textAlign: 'center', padding: 48, ...style }}
      >
        <span className="ds-pricing-table__loading-label" data-part="loading-label">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-pricing-table ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-cycle={billingCycle ?? 'monthly'}
      style={style}
    >
      {/* Billing toggle -- Hand-built toggle switch using a hidden checkbox.
          The visible track and knob are absolutely-positioned spans whose
          position and color transition based on the billingCycle prop. */}
      {onBillingCycleChange && (
        <div data-part="toggle" data-cycle={billingCycle ?? 'monthly'} style={{ textAlign: 'center', marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: billingCycle === 'monthly' ? 700 : 400, fontSize: 'var(--ds-font-size-sm, 14px)' }}>Monthly</span>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
            <input
              data-part="toggle-input"
              type="checkbox"
              checked={billingCycle === 'yearly'}
              onChange={(e) => onBillingCycleChange(e.target.checked ? 'yearly' : 'monthly')}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span className="ds-pricing-table__toggle-track" data-part="toggle-track" data-cycle={billingCycle ?? 'monthly'} style={{
              position: 'absolute',
              cursor: 'pointer',
              inset: 0,
              transition: 'background 0.2s',
            }}>
              <span className="ds-pricing-table__toggle-thumb" data-part="toggle-thumb" data-cycle={billingCycle ?? 'monthly'} style={{
                position: 'absolute',
                width: 18,
                height: 18,
                top: 3,
                left: billingCycle === 'yearly' ? 23 : 3,
                transition: 'left 0.2s',
              }} />
            </span>
          </label>
          <span style={{ fontWeight: billingCycle === 'yearly' ? 700 : 400, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
            Yearly
            <span className="ds-pricing-table__plan-badge" data-part="plan-badge" data-variant="savings" style={{
              marginLeft: 6,
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 600,
            }}>Save 20%</span>
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: plans.length * 180 + 200 }}>
          <thead>
            <tr>
              <th className="ds-pricing-table__table-heading" data-part="table-heading" style={{ ...cellStyle, textAlign: 'left', width: 200, verticalAlign: 'bottom', fontSize: 'var(--ds-font-size-sm, 14px)', fontWeight: 600 }}>
                Features
              </th>
              {/* Each plan column header: highlighted plans get thicker primary border + tinted bg */}
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} className="ds-pricing-table__plan-column" data-part="plan-column" data-highlighted={isHighlighted} style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'top' }}>
                    {/* renderPlanHeader lets consumers fully replace the plan card */}
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <div className="ds-pricing-table__plan-card" data-part="plan-card" data-highlighted={isHighlighted} style={{
                        padding: 16,
                      }}>
                        {plan.popular && (
                          <div className="ds-pricing-table__plan-badge" data-part="plan-badge" data-variant="popular" style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 600,
                            marginBottom: 8,
                          }}>
                            Most Popular
                          </div>
                        )}
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</div>
                        {/* Price: number gets formatted with currency symbol; strings pass through for "Custom" etc. */}
                        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                          {typeof plan.price === 'number' ? `${currency}${plan.price}` : plan.price}
                        </div>
                          {plan.priceNote && (
                          <div className="ds-pricing-table__price-note" data-part="price-note" style={{ fontSize: 'var(--ds-font-size-xs, 12px)' }}>{plan.priceNote}</div>
                        )}
                        {plan.description && (
                          <div className="ds-pricing-table__plan-description" data-part="plan-description" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', marginTop: 4 }}>{plan.description}</div>
                        )}
                        {/* CTA button: highlighted plans get the primary button style */}
                        <button
                          className="ds-pricing-table__cta-button"
                          data-part="cta-button"
                          data-highlighted={isHighlighted}
                          style={isHighlighted ? primaryBtn : btnBase}
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
          {/* Feature rows -- category headers inserted when the category changes
              between adjacent features in the flat array */}
          <tbody>
            {features.map((feature, index) => {
              /* Detect category boundaries by comparing with the previous feature's category */
              const isCategory = feature.category && (index === 0 || features[index - 1].category !== feature.category);
              return (
                <React.Fragment key={feature.key}>
                  {isCategory && (
                    <tr>
                      <td
                        className="ds-pricing-table__category-header"
                        data-part="category-header"
                        colSpan={plans.length + 1}
                        style={{
                          padding: '16px 16px 8px',
                          fontWeight: 700,
                          fontSize: 'var(--ds-font-size-xs, 12px)',
                          textTransform: 'uppercase' as const,
                        }}
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  {/* Feature row: label cell + one value cell per plan */}
                  <tr data-part="feature-row">
                    <td className="ds-pricing-table__feature-label-cell" data-part="feature-label-cell" style={{ ...cellStyle, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                      {feature.label}
                    </td>
                    {plans.map(plan => (
                      <td key={plan.id} className="ds-pricing-table__feature-value-cell" data-part="feature-value-cell" style={{ ...cellStyle, textAlign: 'center' }}>
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
