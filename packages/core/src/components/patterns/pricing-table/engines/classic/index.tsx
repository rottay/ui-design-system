'use client';

/**
 * PricingTable - Classic Engine (Ant Design)
 */

import React from 'react';
import { Card, Button, Tag, Switch, Space, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { PricingTableProps, PricingPlan, PricingFeature } from '../../types';

function renderFeatureValue(value: boolean | string | undefined): React.ReactNode {
  if (value === true) return <CheckOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
  if (value === false || value === undefined) return <CloseOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />;
  return <span style={{ fontSize: 13 }}>{value}</span>;
}

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

  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`ds-pattern-pricing-table ds-engine-classic ${className ?? ''}`} style={style}>
      {/* Billing cycle toggle */}
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
              <Tag color="green" style={{ marginLeft: 4, fontSize: 10 }}>Save 20%</Tag>
            </span>
          </Space>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: plans.length * 180 + 200 }}>
          {/* Plan headers */}
          <thead>
            <tr>
              <th style={{ padding: 16, textAlign: 'left', width: 200, verticalAlign: 'bottom' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>Features</span>
              </th>
              {plans.map(plan => {
                const isHighlighted = plan.id === highlightedPlan || plan.popular;
                return (
                  <th key={plan.id} style={{ padding: 16, textAlign: 'center', verticalAlign: 'top' }}>
                    {renderPlanHeader ? renderPlanHeader(plan) : (
                      <Card
                        style={{
                          border: isHighlighted ? '2px solid #1890ff' : undefined,
                          background: isHighlighted ? '#f0f5ff' : undefined,
                        }}
                        styles={{ body: { padding: 16 } }}
                      >
                        {plan.popular && <Tag color="blue" style={{ marginBottom: 8 }}>Most Popular</Tag>}
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                          {typeof plan.price === 'number' ? `${currency}${plan.price}` : plan.price}
                        </div>
                        {plan.priceNote && (
                          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{plan.priceNote}</div>
                        )}
                        {plan.description && (
                          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>{plan.description}</div>
                        )}
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
                          color: 'rgba(0,0,0,0.45)',
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
                        {feature.category}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      {feature.description ? (
                        <Tooltip title={feature.description}>{feature.label}</Tooltip>
                      ) : (
                        feature.label
                      )}
                    </td>
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
