'use client';

/**
 * BarOrderQueue - Kanban Preset
 * Column-based order queue by status
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarOrderQueueProps, QueueOrder, OrderStatus } from '../../core';

const STATUSES: { key: OrderStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'warning' },
  { key: 'preparing', label: 'Preparing', color: 'info' },
  { key: 'ready', label: 'Ready', color: 'success' },
  { key: 'picked_up', label: 'Picked Up', color: 'neutral' },
];

const MOCK_ORDERS: QueueOrder[] = [
  { id: 'o1', orderNumber: '#1042', status: 'pending', items: [{ name: 'Margarita', quantity: 2 }, { name: 'Nachos', quantity: 1 }], total: 38.00, currency: 'USD', customerName: 'Table 5', posStation: 'POS-1', createdAt: '2024-01-15T20:30:00Z', elapsedMinutes: 3 },
  { id: 'o2', orderNumber: '#1041', status: 'preparing', items: [{ name: 'Old Fashioned', quantity: 1 }], total: 15.00, currency: 'USD', customerName: 'Bar Seat 3', posStation: 'POS-2', createdAt: '2024-01-15T20:28:00Z', elapsedMinutes: 5 },
  { id: 'o3', orderNumber: '#1040', status: 'preparing', items: [{ name: 'Corona', quantity: 4 }, { name: 'Wings', quantity: 2 }], total: 52.00, currency: 'USD', customerName: 'Table 8', posStation: 'POS-1', createdAt: '2024-01-15T20:25:00Z', elapsedMinutes: 8 },
  { id: 'o4', orderNumber: '#1039', status: 'ready', items: [{ name: 'Mojito', quantity: 2 }], total: 26.00, currency: 'USD', customerName: 'Table 2', posStation: 'POS-1', createdAt: '2024-01-15T20:20:00Z', elapsedMinutes: 13 },
  { id: 'o5', orderNumber: '#1038', status: 'picked_up', items: [{ name: 'Beer Flight', quantity: 1 }], total: 18.00, currency: 'USD', customerName: 'VIP Booth', posStation: 'POS-2', createdAt: '2024-01-15T20:15:00Z', elapsedMinutes: 18 },
];

export const KanbanBarOrderQueue = createPreset<BarOrderQueueProps>({
  name: 'BarOrderQueue.Kanban',
  render: ({ primitives, props, tokens }: PresetContext<BarOrderQueueProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onStatusChange, onOrderSelect, className, style } = props;

    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const columns = useMemo(() => {
      return STATUSES.map(s => ({
        ...s,
        orders: orders.filter(o => o.status === s.key),
      }));
    }, [orders]);

    const statusColors: Record<string, string> = {
      warning: tokens.colors.warningScale[500],
      info: tokens.colors.infoScale[500],
      success: tokens.colors.successScale[500],
      neutral: tokens.colors.neutral[400],
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
            Order Queue
          </Text>
          <span style={createBadgeStyle(tokens, 'info')}>{orders.length} orders</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`, gap: tokens.spacing[4] }}>
          {columns.map(col => (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }}>
                <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: statusColors[col.color] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{col.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginLeft: 'auto' }}>({col.orders.length})</Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {col.orders.map(order => (
                  <div key={order.id} onClick={() => onOrderSelect?.(order.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, borderLeft: `3px solid ${statusColors[col.color]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{order.orderNumber}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: order.elapsedMinutes > 10 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>{order.elapsedMinutes}m</Text>
                    </div>
                    {order.customerName && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{order.customerName}</Text>
                    )}
                    {order.items.map((item, i) => (
                      <Text key={i} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], display: 'block' }}>{item.quantity}x {item.name}</Text>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${order.total.toFixed(2)}</Text>
                      {col.key !== 'picked_up' && (
                        <button onClick={(e) => { e.stopPropagation(); const nextStatus = STATUSES[STATUSES.findIndex(s => s.key === col.key) + 1]; if (nextStatus) onStatusChange?.(order.id, nextStatus.key); }}
                          style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Next {'\u2192'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {col.orders.length === 0 && (
                  <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>No orders</Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
