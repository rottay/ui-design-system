'use client';

/**
 * EvOrderQueue - Kitchen Preset
 * Kanban-style order board with status columns, timers, priority indicators, action buttons
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvOrderQueueProps, BarOrder } from '../../core';

const MOCK_ORDERS: BarOrder[] = [
  { id: 'o1', orderNumber: '#1042', items: [{ name: 'Nachos Grande', quantity: 1, notes: 'Extra jalapenos' }, { name: 'Wings Basket', quantity: 2 }], status: 'pending', customerName: 'Table 5', createdAt: new Date(Date.now() - 180000), priority: 'rush' },
  { id: 'o2', orderNumber: '#1043', items: [{ name: 'Loaded Fries', quantity: 1 }, { name: 'Slider Trio', quantity: 1 }], status: 'pending', customerName: 'Bar Seat 3', createdAt: new Date(Date.now() - 120000), priority: 'normal' },
  { id: 'o3', orderNumber: '#1040', items: [{ name: 'Fish Tacos', quantity: 2, notes: 'No cilantro' }, { name: 'Caesar Salad', quantity: 1 }], status: 'preparing', customerName: 'Table 12', createdAt: new Date(Date.now() - 420000), priority: 'normal' },
  { id: 'o4', orderNumber: '#1039', items: [{ name: 'Burger Deluxe', quantity: 1, notes: 'Medium rare' }], status: 'preparing', customerName: 'VIP Booth 2', createdAt: new Date(Date.now() - 600000), priority: 'rush' },
  { id: 'o5', orderNumber: '#1038', items: [{ name: 'Pretzel Bites', quantity: 1 }, { name: 'Onion Rings', quantity: 1 }], status: 'ready', customerName: 'Table 8', createdAt: new Date(Date.now() - 900000), priority: 'normal' },
  { id: 'o6', orderNumber: '#1037', items: [{ name: 'Pizza Flatbread', quantity: 1 }], status: 'ready', customerName: 'Bar Seat 7', createdAt: new Date(Date.now() - 1080000), priority: 'normal' },
  { id: 'o7', orderNumber: '#1035', items: [{ name: 'Mozzarella Sticks', quantity: 2 }, { name: 'Wings Basket', quantity: 1 }], status: 'picked_up', customerName: 'Table 3', createdAt: new Date(Date.now() - 1500000), priority: 'normal' },
  { id: 'o8', orderNumber: '#1044', items: [{ name: 'Quesadilla', quantity: 1, notes: 'Add chicken' }], status: 'pending', customerName: 'Table 9', createdAt: new Date(Date.now() - 60000), priority: 'normal' },
];

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: 'warning' | 'info' | 'success' | 'primary' }> = {
  pending: { label: 'Pending', emoji: '\uD83D\uDCCB', color: 'warning' },
  preparing: { label: 'Preparing', emoji: '\uD83D\uDD25', color: 'info' },
  ready: { label: 'Ready', emoji: '\u2705', color: 'success' },
  picked_up: { label: 'Picked Up', emoji: '\uD83D\uDCE6', color: 'primary' },
};

export const KitchenEvOrderQueue = createPreset<EvOrderQueueProps>({
  name: 'EvOrderQueue.Kitchen',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvOrderQueueProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onStartPreparing, onMarkReady, onConfirmPickup, className, style } = props;

    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;

    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredOrders = useMemo(() => {
      if (!activeFilter) return orders;
      return orders.filter(o => o.status === activeFilter);
    }, [orders, activeFilter]);

    const getElapsedTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = (d: Date) => {
      const mins = Math.floor((Date.now() - d.getTime()) / 60000);
      if (mins > 10) return tokens.colors.errorScale[600];
      if (mins > 5) return tokens.colors.warningScale[600];
      return tokens.colors.successScale[600];
    };

    const statusGroups = ['pending', 'preparing', 'ready', 'picked_up'];
    const pending = orders.filter(o => o.status === 'pending');
    const preparing = orders.filter(o => o.status === 'preparing');
    const ready = orders.filter(o => o.status === 'ready');
    const rushCount = orders.filter(o => o.priority === 'rush' && o.status !== 'picked_up').length;

    const getActionButton = (order: BarOrder) => {
      switch (order.status) {
        case 'pending': return { label: '\uD83D\uDD25 Start', onClick: () => onStartPreparing?.(order.id), bg: tokens.colors.infoScale[600] };
        case 'preparing': return { label: '\u2705 Ready', onClick: () => onMarkReady?.(order.id), bg: tokens.colors.successScale[600] };
        case 'ready': return { label: '\uD83D\uDCE6 Picked Up', onClick: () => onConfirmPickup?.(order.id), bg: tokens.colors.primaryScale[600] };
        default: return null;
      }
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\uD83C\uDF73'} Kitchen Display
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {pending.length} pending - {preparing.length} preparing - {ready.length} ready
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            {rushCount > 0 && <span style={createBadgeStyle(tokens, 'error')}>{'\uD83D\uDEA8'} {rushCount} Rush</span>}
            <span style={createBadgeStyle(tokens, 'success')}>{'\uD83D\uDFE2'} Kitchen Open</span>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Pending', value: pending.length.toString(), emoji: '\uD83D\uDCCB', color: 'warning' as const },
            { label: 'Preparing', value: preparing.length.toString(), emoji: '\uD83D\uDD25', color: 'info' as const },
            { label: 'Ready', value: ready.length.toString(), emoji: '\u2705', color: 'success' as const },
            { label: 'Total Items', value: orders.filter(o => o.status !== 'picked_up').reduce((s, o) => s + o.items.reduce((si, it) => si + it.quantity, 0), 0).toString(), emoji: '\uD83C\uDF7D', color: 'primary' as const },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const, padding: tokens.spacing[3] }}>
              <span style={{ fontSize: 20 }}>{stat.emoji}</span>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors[`${stat.color}Scale`][600], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[5] }}>
          <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All ({orders.length})</div>
          {statusGroups.map(st => {
            const cfg = STATUS_CONFIG[st];
            const count = orders.filter(o => o.status === st).length;
            return (
              <div key={st} onClick={() => setActiveFilter(activeFilter === st ? null : st)} style={createFilterPillStyle(tokens, { active: activeFilter === st })}>
                {cfg.emoji} {cfg.label} ({count})
              </div>
            );
          })}
        </div>

        {/* Order Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
          {filteredOrders.filter(o => o.status !== 'picked_up').map((order) => {
            const statusCfg = STATUS_CONFIG[order.status];
            const action = getActionButton(order);
            const isHovered = hoveredOrder === order.id;
            const elapsed = getElapsedTime(order.createdAt);
            const timerColor = getTimerColor(order.createdAt);

            return (
              <div key={order.id}
                onMouseEnter={() => setHoveredOrder(order.id)} onMouseLeave={() => setHoveredOrder(null)}
                style={{
                  ...cardBase, padding: 0, overflow: 'hidden', ...hoverStyle,
                  ...(isHovered ? getHoverTransform(tokens) : {}),
                  borderLeft: order.priority === 'rush' ? `4px solid ${tokens.colors.errorScale[500]}` : 'none',
                }}>
                {/* Card Header */}
                <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{order.orderNumber}</Text>
                    {order.priority === 'rush' && <span style={createBadgeStyle(tokens, 'error')}>{'\uD83D\uDEA8'} RUSH</span>}
                  </div>
                  <span style={createBadgeStyle(tokens, statusCfg.color)}>{statusCfg.emoji} {statusCfg.label}</span>
                </div>

                {/* Items */}
                <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDC64'} {order.customerName}</Text>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[1] }}>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                          {item.quantity}x {item.name}
                        </Text>
                        {item.notes && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600], fontStyle: 'italic' as const }}>{'\u26A0'} {item.notes}</Text>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: Timer + Action */}
                <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <span style={{ fontSize: 14 }}>{'\u23F1'}</span>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: timerColor, fontFamily: 'monospace' }}>{elapsed}</Text>
                  </div>
                  {action && (
                    <button onClick={action.onClick} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: action.bg, color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', fontFamily: 'inherit', ...hoverStyle }}>
                      {action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredOrders.filter(o => o.status !== 'picked_up').length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDF73'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No active orders</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Orders will appear here when placed</Text>
          </div>
        )}

        {/* Completed Orders (collapsed) */}
        {orders.filter(o => o.status === 'picked_up').length > 0 && (
          <div style={{ ...cardBase, marginTop: tokens.spacing[5], padding: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[2], display: 'block' }}>
              {'\uD83D\uDCE6'} Recently Picked Up
            </Text>
            <div style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
              {orders.filter(o => o.status === 'picked_up').map(o => (
                <span key={o.id} style={{ ...createBadgeStyle(tokens, 'primary'), opacity: 0.7 }}>{o.orderNumber} - {o.customerName}</span>
              ))}
            </div>
          </div>
        )}
      </Box>
    );
  },
});
