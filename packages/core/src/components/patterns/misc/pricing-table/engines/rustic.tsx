'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the PricingTable pattern.
 *
 * Zero-dependency implementation that relies exclusively on inline styles
 * referencing `--ds-*` CSS custom properties. This engine is intended for
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
      <span data-part="feature-value" data-feature-state="included" style={{ color: 'var(--ds-color-success-600, var(--ds-color-success))', fontSize: 16, fontWeight: 700 }}>
        {'\u2713'}
      </span>
    );
  }
  if (value === false || value === undefined) {
    return <span data-part="feature-value" data-feature-state="excluded" style={{ color: 'var(--ds-color-border-primary, var(--ds-color-border))', fontSize: 16 }}>{'\u2717'}</span>;
  }
  return <span data-part="feature-value" data-feature-state="custom" style={{ fontSize: 13 }}>{value}</span>;
}

/** Shared table cell padding and border. Extracted to avoid repetition across
 *  the ~40+ cells in a typical pricing table. */
const cellStyle: CSSProperties = {
  padding: '10px 16px',
  borderTop: '1px solid var(--ds-color-border-secondary, var(--ds-color-neutral-100))',
};

/** Default (ghost) button style for non-highlighted plan CTAs. */
const btnBase: CSSProperties = {
  width: '100%',
  padding: '8px 16px',
  borderRadius: 'var(--ds-radius-md, 8px)',
  border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
  background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
  color: 'var(--ds-color-text-primary, var(--ds-color-text))',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'var(--ds-font-size-sm, 14px)',
  marginTop: 12,
};

/** Primary button style for the highlighted/recommended plan CTA. Spreads
 *  btnBase and overrides background and border to the primary color. */
const primaryBtn: CSSProperties = {
  ...btnBase,
  background: 'var(--ds-button-primary-bg, var(--ds-color-primary))',
  color: 'var(--ds-button-primary-color, var(--ds-color-text-on-primary, var(--ds-color-text-inverse)))',
  borderColor: 'var(--ds-button-primary-border, var(--ds-color-primary))',
};

/**
 * Rustic (Vanilla CSS) engine for the PricingTable pattern component.
 *
 * Every visual element is built from native HTML and inline styles that
 * reference `--ds-*` tokens, making this engine fully theme-aware without
 * importing any CSS framework. The custom toggle switch is implemented via a
 * hidden checkbox plus absolutely-positioned pseudo-knob spans.
 *
 * @param props - {@link PricingTableProps} controlling plans, features, billing cycle, and callbacks.
 * @returns A feature-comparison pricing table styled with inline CSS and DS tokens.
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
        <span data-part="loading-label" style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
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
            <span data-part="toggle-track" data-cycle={billingCycle ?? 'monthly'} style={{
              position: 'absolute',
              cursor: 'pointer',
              inset: 0,
              borderRadius: 12,
              background: billingCycle === 'yearly' ? 'var(--ds-color-primary)' : 'var(--ds-color-neutral-300)',
              transition: 'background 0.2s',
            }}>
              <span data-part="toggle-thumb" data-cycle={billingCycle ?? 'monthly'} style={{
                position: 'absolute',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
                top: 3,
                left: billingCycle === 'yearly' ? 23 : 3,
                transition: 'left 0.2s',
              }} />
            </span>
          </label>
          <span style={{ fontWeight: billingCycle === 'yearly' ? 700 : 400, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
            Yearly
            <span data-part="plan-badge" data-variant="savings" style={{
              marginLeft: 6,
              padding: '2px 6px',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              background: 'var(--ds-color-success-600, var(--ds-color-success))',
              color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
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
              <th data-part="table-heading" style={{ ...cellStyle, textAlign: 'left', width: 200, verticalAlign: 'bottom', fontSize: 'var(--ds-font-size-sm, 14px)', fontWeight: 600, color: 'var(--ds-color-text-muted)', border: 'none' }}>
                Features
              </th>
              {/* Each plan column header: highlighted plans get thicker primary border + tinted bg */}
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} data-part="plan-column" data-highlighted={isHighlighted} style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                    {/* renderPlanHeader lets consumers fully replace the plan card */}
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <div data-part="plan-card" data-highlighted={isHighlighted} style={{
                        padding: 16,
                        borderRadius: 'var(--ds-radius-lg, 12px)',
                        border: isHighlighted ? '2px solid var(--ds-color-primary)' : '1px solid var(--ds-color-border-secondary, var(--ds-color-border-primary))',
                        background: isHighlighted ? 'var(--ds-color-primary-50, var(--ds-color-bg-muted))' : undefined,
                      }}>
                        {plan.popular && (
                          <div data-part="plan-badge" data-variant="popular" style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 'var(--ds-radius-sm, 6px)',
                            background: 'var(--ds-color-primary)',
                            color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
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
                          <div data-part="price-note" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>{plan.priceNote}</div>
                        )}
                        {plan.description && (
                          <div data-part="plan-description" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))', marginTop: 4 }}>{plan.description}</div>
                        )}
                        {/* CTA button: highlighted plans get the primary button style */}
                        <button
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
                        data-part="category-header"
                        colSpan={plans.length + 1}
                        style={{
                          padding: '16px 16px 8px',
                          fontWeight: 700,
                          fontSize: 'var(--ds-font-size-xs, 12px)',
                          textTransform: 'uppercase' as const,
                          color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))',
                          borderTop: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
                        }}
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  {/* Feature row: label cell + one value cell per plan */}
                  <tr data-part="feature-row">
                    <td data-part="feature-label-cell" style={{ ...cellStyle, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                      {feature.label}
                    </td>
                    {plans.map(plan => (
                      <td key={plan.id} data-part="feature-value-cell" style={{ ...cellStyle, textAlign: 'center' }}>
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
