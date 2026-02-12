'use client';

/**
 * BarOrderHistory - Compact Preset
 * Compact card list of recent orders
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarOrderHistoryProps, HistoryOrder } from '../../core';

const MOCK_ORDERS: HistoryOrder[] = [
  { id: 'o1', orderNumber: '#1042', status: 'completed', items: [{ name: 'Margarita', quantity: 2 }], total: 28.00, currency: 'USD', posStation: 'POS-1', paymentMethod: 'Card', createdAt: '2024-01-15T20:30:00Z' },
  { id: 'o2', orderNumber: '#1041', status: 'completed', items: [{ name: 'Old Fashioned', quantity: 1 }], total: 15.00, currency: 'USD', posStation: 'POS-2', paymentMethod: 'Cash', createdAt: '2024-01-15T20:28:00Z' },
  { id: 'o3', orderNumber: '#1040', status: 'cancelled', items: [{ name: 'Mojito', quantity: 3 }], total: 39.00, currency: 'USD', posStation: 'POS-1', paymentMethod: 'Card', createdAt: '2024-01-15T20:20:00Z' },
];

const STATUS_COLORS: Record<string, string> = { completed: 'success', cancelled: 'error', refunded: 'warning' };

export const CompactBarOrderHistory = createPreset<BarOrderHistoryProps>({
  name: 'BarOrderHistory.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BarOrderHistoryProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onOrderSelect, className, style } = props;
    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Recent Orders</Text>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {orders.map(order => (
            <div key={order.id} onClick={() => onOrderSelect?.(order.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{order.orderNumber}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</Text>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <span style={createBadgeStyle(tokens, STATUS_COLORS[order.status] as any)}>{order.status}</span>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginTop: tokens.spacing[1] }}>${order.total.toFixed(2)}</Text>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
