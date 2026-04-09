'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the PricingTable pattern.
 *
 * Renders a SaaS-style comparison table using Ant Design's Card, Button, Tag,
 * Switch, and Tooltip primitives. Plans display as column headers with a
 * feature-comparison grid beneath them. Supports monthly/yearly billing toggle,
 * plan highlighting, custom header rendering, and category grouping.
 *
 * @example
 * <ClassicPricingTable
 *   plans={[{ id: 'pro', name: 'Pro', price: 29, cta: 'Get Pro', features: { sso: true } }]}
 *   features={[{ key: 'sso', label: 'SSO', category: 'Security' }]}
 *   highlightedPlan="pro"
 *   onSelectPlan={(id) => console.log(id)}
 * />
 */

import React from 'react';
import { Card, Button, Tag, Switch, Space, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { PricingTableProps, PricingPlan, PricingFeature } from '../PricingTable.types';

/**
 * Converts a tri-state feature value into a visual indicator.
 *
 * Feature values can be boolean (check/cross icon), a string (custom label like
 * "10 GB"), or undefined (treated as unsupported). This tri-state covers the
 * common SaaS pricing matrix without requiring custom renderers.
 */
function renderFeatureValue(value: boolean | string | undefined): React.ReactNode {
  if (value === true) {
    return <CheckOutlined style={{ color: 'var(--ds-color-success-600, #16a34a)', fontSize: 16 }} />;
  }
  if (value === false || value === undefined) {
    return <CloseOutlined style={{ color: 'var(--ds-color-border-primary, #d4d4d8)', fontSize: 16 }} />;
  }
  return <span style={{ fontSize: 13 }}>{value}</span>;
}

/**
 * Classic (Ant Design) engine for the PricingTable pattern component.
 *
 * Renders a responsive HTML table where each column represents a pricing plan
 * and each row represents a feature. Plan headers are rendered inside Ant Design
 * Cards with optional highlighting for the recommended tier.
 *
 * @param props - {@link PricingTableProps} controlling plans, features, billing cycle, and callbacks.
 * @returns A feature-comparison pricing table styled with Ant Design components.
 */
export default function ClassicPricingTable(props: PricingTableProps) {
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

  /* Short-circuit: plain text loading placeholder while data fetches */
  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`ds-pattern-pricing-table ds-engine-classic ${className ?? ''}`} style={style}>
      {/* Billing cycle toggle -- opt-in: only rendered when onBillingCycleChange is provided.
           Active label is bold (600 weight) while the inactive one uses normal weight (400). */}
      {onBillingCycleChange && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space>
            <span style={{ fontWeight: billingCycle === 'monthly' ? 600 : 400 }}>Monthly</span>
            <Switch
              checked={billingCycle === 'yearly'}
              onChange={(checked) => onBillingCycleChange(checked ? 'yearly' : 'monthly')}
            />
            <span style={{ fontWeight: billingCycle === 'yearly' ? 600 : 400 }}>
              Yearly
              {/* Savings badge incentivizes yearly billing */}
              <Tag color="green" style={{ marginLeft: 4, fontSize: 10 }}>Save 20%</Tag>
            </span>
          </Space>
        </div>
      )}

      {/* Table -- overflowX enables horizontal scrolling on narrow viewports.
          minWidth scales with plan count to prevent columns from collapsing. */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: plans.length * 180 + 200 }}>
          {/* Plan headers */}
          <thead>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', width: 200, verticalAlign: 'bottom' }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))',
                  }}
                >
                  Features
                </span>
              </th>
              {/* Each plan becomes a column header. Plans are highlighted either
                  explicitly via highlightedPlan or when plan.popular is true. */}
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} style={{ padding: 16, textAlign: 'center', verticalAlign: 'top' }}>
                    {/* Allow consumers to fully replace the plan header via renderPlanHeader */}
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <Card
                        style={{
                          border: isHighlighted ? '2px solid var(--ds-color-primary-500, #1677ff)' : undefined,
                          background: isHighlighted ? 'var(--ds-color-primary-50, #eff6ff)' : undefined,
                        }}
                        styles={{ body: { padding: 16 } }}
                      >
                        {plan.popular && <Tag color="blue" style={{ marginBottom: 8 }}>Most Popular</Tag>}
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
                        {/* Price can be a number (formatted with currency symbol) or
                            a string like "Custom" for enterprise tiers. */}
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                          {typeof plan.price === 'number' ? `${currency}${plan.price}` : plan.price}
                        </div>
                        {plan.priceNote && (
                          <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))' }}>
                            {plan.priceNote}
                          </div>
                        )}
                        {plan.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))',
                              marginTop: 4,
                            }}
                          >
                            {plan.description}
                          </div>
                        )}
                        {/* CTA button: highlighted plans get primary styling to draw attention */}
                        <Button
                          type={isHighlighted ? 'primary' : 'default'}
                          block
                          style={{ marginTop: 12 }}
                          onClick={() => onSelectPlan?.(plan.id)}
                        >
                          {plan.cta}
                        </Button>
                      </Card>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Feature rows */}
          <tbody>
            {/* Render a category header row only when the category changes,
                grouping related features visually without restructuring the flat array. */}
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
                          fontSize: 13,
                          textTransform: 'uppercase',
                          color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))',
                          borderTop: '1px solid var(--ds-color-border-secondary, #f0f0f0)',
                        }}
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  {/* Feature row: label on left with optional tooltip, values across plan columns */}
                  <tr style={{ borderTop: '1px solid var(--ds-color-border-secondary, #f0f0f0)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      {/* When a feature has a description, wrap the label in a Tooltip for hover details */}
                      {feature.description ? (
                        <Tooltip title={feature.description}>{feature.label}</Tooltip>
                      ) : (
                        feature.label
                      )}
                    </td>
                    {/* Each cell renders the tri-state feature value for the corresponding plan */}
                    {plans.map(plan => (
                      <td key={plan.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
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
