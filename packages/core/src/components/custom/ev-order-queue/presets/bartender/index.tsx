'use client';

/**
 * EvOrderQueue - Bartender Preset
 * Compact drink-focused queue with inline status flow, quick actions, drink ticker
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
  { id: 'o1', orderNumber: '#B201', items: [{ name: 'Margarita', quantity: 2, notes: 'Salt rim' }, { name: 'Corona', quantity: 1 }], status: 'pending', customerName: 'Table 5', createdAt: new Date(Date.now() - 90000), priority: 'rush' },
  { id: 'o2', orderNumber: '#B202', items: [{ name: 'Mojito', quantity: 1 }, { name: 'Old Fashioned', quantity: 1 }], status: 'pending', customerName: 'Bar 3', createdAt: new Date(Date.now() - 60000), priority: 'normal' },
  { id: 'o3', orderNumber: '#B199', items: [{ name: 'Espresso Martini', quantity: 3 }], status: 'preparing', customerName: 'VIP 1', createdAt: new Date(Date.now() - 240000), priority: 'rush' },
  { id: 'o4', orderNumber: '#B198', items: [{ name: 'Gin & Tonic', quantity: 2 }, { name: 'Aperol Spritz', quantity: 2 }], status: 'preparing', customerName: 'Table 10', createdAt: new Date(Date.now() - 360000), priority: 'normal' },
  { id: 'o5', orderNumber: '#B197', items: [{ name: 'Whiskey Sour', quantity: 1 }], status: 'ready', customerName: 'Bar 7', createdAt: new Date(Date.now() - 480000), priority: 'normal' },
  { id: 'o6', orderNumber: '#B196', items: [{ name: 'Red Bull Vodka', quantity: 2 }, { name: 'Heineken', quantity: 3 }], status: 'ready', customerName: 'Table 2', createdAt: new Date(Date.now() - 600000), priority: 'normal' },
  { id: 'o7', orderNumber: '#B195', items: [{ name: 'Pina Colada', quantity: 1 }], status: 'picked_up', customerName: 'Bar 1', createdAt: new Date(Date.now() - 900000), priority: 'normal' },
  { id: 'o8', orderNumber: '#B203', items: [{ name: 'Water', quantity: 2 }, { name: 'Coke', quantity: 1 }], status: 'pending', customerName: 'Table 14', createdAt: new Date(Date.now() - 30000), priority: 'normal' },
];

const STATUS_FLOW = ['pending', 'preparing', 'ready', 'picked_up'] as const;
const STATUS_EMOJI: Record<string, string> = { pending: '\uD83D\uDCCB', preparing: '\uD83C\uDF78', ready: '\uD83D\uDECE', picked_up: '\u2705' };
const STATUS_LABEL: Record<string, string> = { pending: 'Queue', preparing: 'Making', ready: 'Serve', picked_up: 'Done' };

export const BartenderEvOrderQueue = createPreset<EvOrderQueueProps>({
  name: 'EvOrderQueue.Bartender',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvOrderQueueProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onStartPreparing, onMarkReady, onConfirmPickup, className, style } = props;

    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;

    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const activeOrders = useMemo(() => {
      return orders.filter(o => {
        if (o.status === 'picked_up') return false;
        if (searchTerm && !o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) && !o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      });
    }, [orders, searchTerm]);

    const getElapsed = (d: Date) => {
      const mins = Math.floor((Date.now() - d.getTime()) / 60000);
      return mins < 1 ? '<1m' : `${mins}m`;
    };

    const getTimerStyle = (d: Date) => {
      const mins = Math.floor((Date.now() - d.getTime()) / 60000);
      if (mins > 8) return { color: tokens.colors.errorScale[600], fontWeight: tokens.typography.fontWeight.bold };
      if (mins > 4) return { color: tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.semibold };
      return { color: tokens.colors.successScale[600], fontWeight: tokens.typography.fontWeight.medium };
    };

    const drinkCount = activeOrders.reduce((s, o) => s + o.items.reduce((si, it) => si + it.quantity, 0), 0);
    const rushOrders = activeOrders.filter(o => o.priority === 'rush');

    const getAction = (order: BarOrder) => {
      switch (order.status) {
        case 'pending': return { label: '\uD83C\uDF78 Make', fn: () => onStartPreparing?.(order.id), bg: tokens.colors.infoScale[600] };
        case 'preparing': return { label: '\uD83D\uDECE Serve', fn: () => onMarkReady?.(order.id), bg: tokens.colors.successScale[600] };
        case 'ready': return { label: '\u2705 Done', fn: () => onConfirmPickup?.(order.id), bg: tokens.colors.primaryScale[600] };
        default: return null;
      }
    };

    // Progress for order throughput
    const totalActive = orders.filter(o => o.status !== 'picked_up').length;
    const completed = orders.filter(o => o.status === 'picked_up').length;
    const throughputPct = orders.length > 0 ? Math.round((completed / orders.length) * 100) : 0;
    const throughputBar = createProgressBarStyle(tokens, { percent: throughputPct, color: tokens.colors.successScale[500] });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'\uD83C\uDF78'} Bartender Queue
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {drinkCount} drinks to make - {activeOrders.length} active orders
            </Text>
          </div>
          {rushOrders.length > 0 && <span style={createBadgeStyle(tokens, 'error')}>{'\uD83D\uDEA8'} {rushOrders.length} Rush Orders</span>}
        </div>

        {/* Throughput Bar */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Order Throughput</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{completed}/{orders.length} completed ({throughputPct}%)</Text>
          </div>
          <div style={throughputBar.track}><div style={throughputBar.fill} /></div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: tokens.spacing[4], position: 'relative' as const }}>
          <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
          <input type="text" placeholder="Search by order # or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
          />
        </div>

        {/* Status Flow Headers */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
          {STATUS_FLOW.filter(s => s !== 'picked_up').map(status => {
            const count = activeOrders.filter(o => o.status === status).length;
            const colors = { pending: tokens.colors.warningScale, preparing: tokens.colors.infoScale, ready: tokens.colors.successScale };
            const scale = colors[status as keyof typeof colors] || tokens.colors.primaryScale;
            return (
              <div key={status} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: scale[50], borderRadius: tokens.borderRadius.md, border: `1px solid ${scale[200]}`, textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: scale[700] }}>
                  {STATUS_EMOJI[status]} {STATUS_LABEL[status]} ({count})
                </Text>
              </div>
            );
          })}
        </div>

        {/* Order List */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {activeOrders.map((order) => {
            const action = getAction(order);
            const isHovered = hoveredOrder === order.id;
            const timerStyle = getTimerStyle(order.createdAt);
            const statusIdx = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]);

            return (
              <div key={order.id}
                onMouseEnter={() => setHoveredOrder(order.id)} onMouseLeave={() => setHoveredOrder(null)}
                style={{
                  ...cardBase, padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                  ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}),
                  borderLeft: order.priority === 'rush' ? `4px solid ${tokens.colors.errorScale[500]}` : `4px solid transparent`,
                }}>
                {/* Order # */}
                <div style={{ minWidth: 60 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{order.orderNumber}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{order.customerName}</Text>
                </div>

                {/* Items (compact) */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                    {order.items.map((item, idx) => (
                      <span key={idx} style={{ fontSize: tokens.typography.fontSize.xs, backgroundColor: tokens.colors.neutral[100], padding: `1px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, color: tokens.colors.neutral[700] }}>
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                  {order.items.some(i => i.notes) && (
                    <Text style={{ fontSize: 10, color: tokens.colors.warningScale[600], marginTop: 2 }}>
                      {'\u26A0'} {order.items.filter(i => i.notes).map(i => i.notes).join(', ')}
                    </Text>
                  )}
                </div>

                {/* Status Progress Dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {STATUS_FLOW.slice(0, 3).map((s, idx) => (
                    <div key={s} style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: idx <= statusIdx ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200] }} />
                  ))}
                </div>

                {/* Timer */}
                <div style={{ minWidth: 40, textAlign: 'right' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, ...timerStyle, fontFamily: 'monospace' }}>{getElapsed(order.createdAt)}</Text>
                </div>

                {/* Priority */}
                {order.priority === 'rush' && <span style={{ fontSize: 14 }}>{'\uD83D\uDEA8'}</span>}

                {/* Action */}
                {action && (
                  <button onClick={action.fn} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: action.bg, color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, ...hoverStyle }}>
                    {action.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {activeOrders.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDF78'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>All caught up!</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No active drink orders</Text>
          </div>
        )}

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Active Orders', value: totalActive.toString(), emoji: '\uD83D\uDCCB' },
            { label: 'Drinks to Make', value: drinkCount.toString(), emoji: '\uD83C\uDF78' },
            { label: 'Completed', value: completed.toString(), emoji: '\u2705' },
            { label: 'Throughput', value: `${throughputPct}%`, emoji: '\uD83D\uDCC8' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
