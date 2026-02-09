'use client';

/**
 * SubscriptionManager - History Preset
 * Billing history and invoice list
 */

import { createPreset, PresetContext } from '../../../factory';
import type { SubscriptionManagerProps } from '../../core';
import { formatCurrency, getBillingEventColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const HistorySubscriptionManager = createPreset<SubscriptionManagerProps>({
  name: 'SubscriptionManager.History',
  render: ({ primitives, props, tokens }: PresetContext<SubscriptionManagerProps>) => {
    const { Box } = primitives;
    const eventColors = getBillingEventColors(tokens);

    const {
      billingHistory = [],
      onDownloadInvoice,
      title = 'Billing History',
      loading,
      className,
      style,
    } = props;

    const eventIcons: Record<string, string> = {
      payment: '💳', refund: '↩', upgrade: '⬆', downgrade: '⬇',
      cancellation: '✕', renewal: '🔄', 'trial-start': '🎁', 'trial-end': '⏰',
    };

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : billingHistory.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No billing history</Box>
        ) : (
          <Box>
            {/* Header */}
            <Box style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50],
            }}>
              {['Description', 'Amount', 'Status', 'Date', ''].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {billingHistory.map((event) => {
              const eColors = eventColors[event.status];

              return (
                <Box key={event.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  gap: tokens.spacing[2],
                  ...createListItemStyle(tokens),
                  alignItems: 'center',
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span>{eventIcons[event.type] || '📋'}</span>
                    <Box>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{event.description}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'capitalize' as const }}>{event.type.replace(/-/g, ' ')}</span>
                    </Box>
                  </Box>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: event.type === 'refund' ? tokens.colors.errorScale[600] : tokens.colors.neutral[900] }}>
                    {event.amount !== undefined ? (event.type === 'refund' ? '-' : '') + formatCurrency(event.amount, event.currency) : '—'}
                  </span>
                  <span style={{ display: 'inline-flex', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: eColors.bg, color: eColors.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>
                    {event.status}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {formatDistanceToNow(event.date, { addSuffix: true })}
                  </span>
                  <Box>
                    {event.invoiceUrl && onDownloadInvoice && (
                      <button onClick={() => onDownloadInvoice(event.id)} style={{
                        padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                      }}>Invoice</button>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
