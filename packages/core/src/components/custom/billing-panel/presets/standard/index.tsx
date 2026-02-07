import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BillingPanelProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Standard = createPreset<BillingPanelProps>((context: PresetContext<BillingPanelProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;

  const { plan, invoices = [], paymentMethod, onChangePlan, onUpdatePayment, onDownloadInvoice, className, style } = props;

  const cardStyle = createCardStyle(tokens);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return tokens.colors.successScale[600];
      case 'pending': return tokens.colors.warningScale[600];
      case 'overdue': return tokens.colors.errorScale[600];
      default: return tokens.colors.neutral[600];
    }
  };

  return (
    <Box className={className} style={style}>
      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6], marginBottom: tokens.spacing[6] }}>
        {plan && (
          <Box style={cardStyle}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
              Current Plan
            </Text>
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
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Change Plan
              </Button>
            )}
          </Box>
        )}

        {paymentMethod && (
          <Box style={cardStyle}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
              Payment Method
            </Text>
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
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Update Payment
              </Button>
            )}
          </Box>
        )}
      </Box>

      {invoices.length > 0 && (
        <Box style={cardStyle}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
            Invoices
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Box style={{ minWidth: '600px' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Date</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Amount</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Status</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Action</Text>
              </Box>
              {invoices.map((invoice) => (
                <Box key={invoice.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{invoice.date}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>${invoice.amount.toFixed(2)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: getStatusColor(invoice.status), fontWeight: tokens.typography.fontWeight.medium }}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Text>
                  <Box>
                    {invoice.downloadUrl && onDownloadInvoice && (
                      <Button
                        onClick={() => onDownloadInvoice(invoice.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: tokens.colors.primaryScale[600],
                          padding: tokens.spacing[1],
                          border: 'none',
                          fontSize: tokens.typography.fontSize.sm,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Download
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
});
