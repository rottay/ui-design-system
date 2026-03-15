'use client';

/**
 * PricingTable - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { type CSSProperties } from 'react';
import type { PricingTableProps, PricingPlan, PricingFeature } from '../../types';

function renderFeatureValue(value: boolean | string | undefined): React.ReactNode {
  if (value === true) {
    return (
      <span style={{ color: 'var(--ds-color-success-600, #16a34a)', fontSize: 16, fontWeight: 700 }}>
        {'\u2713'}
      </span>
    );
  }
  if (value === false || value === undefined) {
    return <span style={{ color: 'var(--ds-color-border-primary, #d1d5db)', fontSize: 16 }}>{'\u2717'}</span>;
  }
  return <span style={{ fontSize: 13 }}>{value}</span>;
}

const cellStyle: CSSProperties = {
  padding: '10px 16px',
  borderTop: '1px solid var(--ds-color-neutral-100, #f3f4f6)',
};

const btnBase: CSSProperties = {
  width: '100%',
  padding: '8px 16px',
  borderRadius: 'var(--ds-radius-md, 6px)',
  border: '1px solid var(--ds-color-border-primary, #d1d5db)',
  background: 'var(--ds-color-surface, var(--ds-color-background, #fff))',
  color: 'var(--ds-color-text-primary, var(--ds-color-text, #111827))',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'var(--ds-font-size-sm, 13px)',
  marginTop: 12,
};

const primaryBtn: CSSProperties = {
  ...btnBase,
  background: 'var(--ds-button-primary-bg, var(--ds-color-primary))',
  color: 'var(--ds-button-primary-color, var(--ds-color-primary-foreground, #fff))',
  borderColor: 'var(--ds-button-primary-border, var(--ds-color-primary))',
};

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

  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* Billing toggle */}
      {onBillingCycleChange && (
        <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: billingCycle === 'monthly' ? 700 : 400, fontSize: 'var(--ds-font-size-sm, 14px)' }}>Monthly</span>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
            <input
              type="checkbox"
              checked={billingCycle === 'yearly'}
              onChange={(e) => onBillingCycleChange(e.target.checked ? 'yearly' : 'monthly')}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              inset: 0,
              borderRadius: 12,
              background: billingCycle === 'yearly' ? 'var(--ds-color-primary)' : 'var(--ds-color-neutral-300)',
              transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--ds-color-white, #fff)',
                top: 3,
                left: billingCycle === 'yearly' ? 23 : 3,
                transition: 'left 0.2s',
              }} />
            </span>
          </label>
          <span style={{ fontWeight: billingCycle === 'yearly' ? 700 : 400, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
            Yearly
            <span style={{
              marginLeft: 6,
              padding: '2px 6px',
              borderRadius: 'var(--ds-radius-sm, 4px)',
              background: 'var(--ds-color-success-600, #16a34a)',
              color: 'var(--ds-color-text-on-primary, #fff)',
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
              <th style={{ ...cellStyle, textAlign: 'left', width: 200, verticalAlign: 'bottom', fontSize: 'var(--ds-font-size-sm, 13px)', fontWeight: 600, color: 'var(--ds-color-text-muted)', border: 'none' }}>
                Features
              </th>
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'top', border: 'none' }}>
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <div style={{
                        padding: 16,
                        borderRadius: 'var(--ds-radius-lg, 8px)',
                        border: isHighlighted ? '2px solid var(--ds-color-primary)' : '1px solid var(--ds-color-border-secondary, #e5e7eb)',
                        background: isHighlighted ? 'var(--ds-color-primary-50, #eff6ff)' : undefined,
                      }}>
                        {plan.popular && (
                          <div style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 'var(--ds-radius-sm, 4px)',
                            background: 'var(--ds-color-primary)',
                            color: 'var(--ds-color-text-on-primary, #fff)',
                            fontSize: 10,
                            fontWeight: 600,
                            marginBottom: 8,
                          }}>
                            Most Popular
                          </div>
                        )}
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                          {typeof plan.price === 'number' ? `${currency}${plan.price}` : plan.price}
                        </div>
                        {plan.priceNote && (
                          <div style={{ fontSize: 'var(--ds-font-size-xs, 11px)', color: 'var(--ds-color-text-muted)' }}>{plan.priceNote}</div>
                        )}
                        {plan.description && (
                          <div style={{ fontSize: 'var(--ds-font-size-xs, 11px)', color: 'var(--ds-color-text-muted)', marginTop: 4 }}>{plan.description}</div>
                        )}
                        <button
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
          <tbody>
            {features.map((feature, index) => {
              const isCategory = feature.category && (index === 0 || features[index - 1].category !== feature.category);
              return (
                <React.Fragment key={feature.key}>
                  {isCategory && (
                    <tr>
                      <td
                        colSpan={plans.length + 1}
                        style={{
                          padding: '16px 16px 8px',
                          fontWeight: 700,
                          fontSize: 'var(--ds-font-size-xs, 12px)',
                          textTransform: 'uppercase' as const,
                          color: 'var(--ds-color-text-muted)',
                          borderTop: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
                        }}
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ ...cellStyle, fontSize: 'var(--ds-font-size-sm, 13px)' }}>
                      {feature.label}
                    </td>
                    {plans.map(plan => (
                      <td key={plan.id} style={{ ...cellStyle, textAlign: 'center' }}>
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
