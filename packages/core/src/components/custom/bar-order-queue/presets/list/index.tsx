'use client';

/**
 * BarOrderQueue - List Preset
 * Flat list view of orders with status badges
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarOrderQueueProps, QueueOrder, OrderStatus } from '../../core';

const MOCK_ORDERS: QueueOrder[] = [
  { id: 'o1', orderNumber: '#1042', status: 'pending', items: [{ name: 'Margarita', quantity: 2 }], total: 28.00, currency: 'USD', customerName: 'Table 5', posStation: 'POS-1', createdAt: '2024-01-15T20:30:00Z', elapsedMinutes: 3 },
  { id: 'o2', orderNumber: '#1041', status: 'preparing', items: [{ name: 'Old Fashioned', quantity: 1 }], total: 15.00, currency: 'USD', posStation: 'POS-2', createdAt: '2024-01-15T20:28:00Z', elapsedMinutes: 5 },
  { id: 'o3', orderNumber: '#1040', status: 'ready', items: [{ name: 'Mojito', quantity: 2 }], total: 26.00, currency: 'USD', customerName: 'Table 2', posStation: 'POS-1', createdAt: '2024-01-15T20:20:00Z', elapsedMinutes: 13 },
];

const STATUS_MAP: Record<OrderStatus, string> = {
  pending: 'warning',
  preparing: 'info',
  ready: 'success',
  picked_up: 'neutral',
};

export const ListBarOrderQueue = createPreset<BarOrderQueueProps>({
  name: 'BarOrderQueue.List',
  render: ({ primitives, props, tokens }: PresetContext<BarOrderQueueProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onStatusChange, onOrderSelect, className, style } = props;

    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
          Order Queue
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {orders.map(order => (
            <div key={order.id} onClick={() => onOrderSelect?.(order.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], minWidth: 60 }}>{order.orderNumber}</Text>
              <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[order.status] as any), minWidth: 80, textAlign: 'center' as const }}>{order.status}</span>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>
              </div>
              {order.customerName && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 80 }}>{order.customerName}</Text>}
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: order.elapsedMinutes > 10 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500], minWidth: 40 }}>{order.elapsedMinutes}m</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], minWidth: 60, textAlign: 'right' as const }}>${order.total.toFixed(2)}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
