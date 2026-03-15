'use client';

/**
 * BarOrderHistory - Table Preset
 * Full data table with filters and pagination
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarOrderHistoryProps, HistoryOrder } from '../../core';

const MOCK_ORDERS: HistoryOrder[] = [
  { id: 'o1', orderNumber: '#1042', status: 'completed', items: [{ name: 'Margarita', quantity: 2 }], total: 28.00, currency: 'USD', customerName: 'Table 5', posStation: 'POS-1', paymentMethod: 'Card', createdAt: '2024-01-15T20:30:00Z', completedAt: '2024-01-15T20:45:00Z' },
  { id: 'o2', orderNumber: '#1041', status: 'completed', items: [{ name: 'Old Fashioned', quantity: 1 }, { name: 'Wings', quantity: 1 }], total: 27.00, currency: 'USD', posStation: 'POS-2', paymentMethod: 'Cash', createdAt: '2024-01-15T20:28:00Z', completedAt: '2024-01-15T20:40:00Z' },
  { id: 'o3', orderNumber: '#1040', status: 'cancelled', items: [{ name: 'Mojito', quantity: 3 }], total: 39.00, currency: 'USD', customerName: 'Table 2', posStation: 'POS-1', paymentMethod: 'Card', createdAt: '2024-01-15T20:20:00Z' },
  { id: 'o4', orderNumber: '#1039', status: 'refunded', items: [{ name: 'Beer Flight', quantity: 1 }], total: 18.00, currency: 'USD', posStation: 'POS-2', paymentMethod: 'Card', createdAt: '2024-01-15T20:15:00Z', completedAt: '2024-01-15T20:30:00Z' },
  { id: 'o5', orderNumber: '#1038', status: 'completed', items: [{ name: 'Corona', quantity: 4 }], total: 28.00, currency: 'USD', customerName: 'VIP Booth', posStation: 'POS-1', paymentMethod: 'Tab', createdAt: '2024-01-15T20:10:00Z', completedAt: '2024-01-15T20:20:00Z' },
];

const STATUS_COLORS: Record<string, string> = {
  completed: 'success',
  cancelled: 'error',
  refunded: 'warning',
};

export const TableBarOrderHistory = createPreset<BarOrderHistoryProps>({
  name: 'BarOrderHistory.Table',
  render: ({ primitives, props, tokens }: PresetContext<BarOrderHistoryProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onOrderSelect, onExport, className, style } = props;

    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Order History</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{orders.length} orders - ${totalRevenue.toFixed(2)} revenue</Text>
          </div>
          <button onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Export</button>
        </div>

        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['Order', 'Status', 'Items', 'Customer', 'POS', 'Payment', 'Total', 'Date'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id} onClick={() => onOrderSelect?.(order.id)} style={{ cursor: 'pointer', borderBottom: idx < orders.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{order.orderNumber}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <span style={createBadgeStyle(tokens, STATUS_COLORS[order.status] as any)}>{order.status}</span>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{order.customerName || '-'}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{order.posStation}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{order.paymentMethod}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${order.total.toFixed(2)}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
