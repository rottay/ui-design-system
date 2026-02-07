'use client';

import React, { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BillingPanelProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Compact = createPreset<BillingPanelProps>((context: PresetContext<BillingPanelProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;

  const { plan, invoices = [], paymentMethod, onChangePlan, onUpdatePayment, onDownloadInvoice, className, style } = props;

  const [activeTab, setActiveTab] = useState<'plan' | 'payment' | 'invoices'>('plan');

  const cardStyle = createCardStyle(tokens);

  const tabStyle = (isActive: boolean) => ({
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
    color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
    border: 'none',
    borderBottom: isActive ? `2px solid ${tokens.colors.primaryScale[600]}` : '2px solid transparent',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `all ${tokens.motion.hover}`,
  });

  return (
    <Box style={cardStyle} className={className}>
      <Box style={{ display: 'flex', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, marginBottom: tokens.spacing[4] }}>
        <Button onClick={() => setActiveTab('plan')} style={tabStyle(activeTab === 'plan')}>Plan</Button>
        <Button onClick={() => setActiveTab('payment')} style={tabStyle(activeTab === 'payment')}>Payment</Button>
        <Button onClick={() => setActiveTab('invoices')} style={tabStyle(activeTab === 'invoices')}>Invoices</Button>
      </Box>

      {activeTab === 'plan' && plan && (
        <Box>
          <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], marginBottom: tokens.spacing[1] }}>
            {plan.name}
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4] }}>
            ${plan.price}/{plan.period === 'monthly' ? 'mo' : 'yr'}
          </Text>
          {plan.features && plan.features.length > 0 && (
            <Box style={{ marginBottom: tokens.spacing[4] }}>
              {plan.features.map((feature, idx) => (
                <Text key={idx} style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1] }}>
                  • {feature}
                </Text>
              ))}
            </Box>
          )}
          {onChangePlan && (
            <Button
              onClick={onChangePlan}
              style={{
                backgroundColor: tokens.colors.primaryScale[500],
                color: tokens.colors.common.white,
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              Change Plan
            </Button>
          )}
        </Box>
      )}

      {activeTab === 'payment' && paymentMethod && (
        <Box>
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1] }}>
            {paymentMethod.brand ? `${paymentMethod.brand} ` : ''}{paymentMethod.type.toUpperCase()} ••••{paymentMethod.last4}
          </Text>
          {paymentMethod.expiry && (
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4] }}>
              Expires {paymentMethod.expiry}
            </Text>
          )}
          {onUpdatePayment && (
            <Button
              onClick={onUpdatePayment}
              style={{
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[700],
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              Update Payment
            </Button>
          )}
        </Box>
      )}

      {activeTab === 'invoices' && (
        <Box>
          {invoices.length === 0 ? (
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No invoices</Text>
          ) : (
            invoices.map((invoice) => (
              <Box key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: tokens.spacing[2], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{invoice.date}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>${invoice.amount.toFixed(2)}</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600], fontWeight: tokens.typography.fontWeight.medium }}>
                    {invoice.status}
                  </Text>
                  {invoice.downloadUrl && onDownloadInvoice && (
                    <Button
                      onClick={() => onDownloadInvoice(invoice.id)}
                      style={{
                        backgroundColor: 'transparent',
                        color: tokens.colors.primaryScale[600],
                        padding: tokens.spacing[1],
                        border: 'none',
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                      }}
                    >
                      Download
                    </Button>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
});
