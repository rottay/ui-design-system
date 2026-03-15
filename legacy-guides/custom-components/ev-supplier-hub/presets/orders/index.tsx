'use client';

/**
 * EvSupplierHub - Orders Preset
 * Orders table with order number, supplier, status workflow badges, progress dots,
 * amount, expected date, search/filter, KPI stats, and empty state
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
import type { EvSupplierHubProps, SupplierOrder } from '../../core';

const MOCK_ORDERS: SupplierOrder[] = [
  { id: 'so1', supplierName: 'BevCo Distributors', orderNumber: 'SO-2026-001', status: 'received', totalAmount: 2450, expectedDate: new Date(Date.now() - 86400000) },
  { id: 'so2', supplierName: 'Spirit World Imports', orderNumber: 'SO-2026-002', status: 'ordered', totalAmount: 5800, expectedDate: new Date(Date.now() + 172800000) },
  { id: 'so3', supplierName: 'FreshFarm Produce', orderNumber: 'SO-2026-003', status: 'approved', totalAmount: 890, expectedDate: new Date(Date.now() + 86400000) },
  { id: 'so4', supplierName: 'BevCo Distributors', orderNumber: 'SO-2026-004', status: 'submitted', totalAmount: 1200, expectedDate: new Date(Date.now() + 259200000) },
  { id: 'so5', supplierName: 'BarSupply Pro', orderNumber: 'SO-2026-005', status: 'draft', totalAmount: 3400, expectedDate: new Date(Date.now() + 432000000) },
  { id: 'so6', supplierName: 'FreshFarm Produce', orderNumber: 'SO-2026-006', status: 'received', totalAmount: 650, expectedDate: new Date(Date.now() - 172800000) },
  { id: 'so7', supplierName: 'Ice Masters Ltd', orderNumber: 'SO-2026-007', status: 'ordered', totalAmount: 1800, expectedDate: new Date(Date.now() + 345600000) },
  { id: 'so8', supplierName: 'CleanTech Services', orderNumber: 'SO-2026-008', status: 'approved', totalAmount: 2100, expectedDate: new Date(Date.now() + 518400000) },
];

const STATUS_CONFIG: Record<string, { color: 'primary' | 'info' | 'warning' | 'success' | 'error'; step: number; label: string }> = {
  draft: { color: 'primary', step: 1, label: 'Draft' },
  submitted: { color: 'info', step: 2, label: 'Submitted' },
  approved: { color: 'warning', step: 3, label: 'Approved' },
  ordered: { color: 'info', step: 4, label: 'Ordered' },
  received: { color: 'success', step: 5, label: 'Received' },
};

const STEPS = ['draft', 'submitted', 'approved', 'ordered', 'received'];

export const OrdersEvSupplierHub = createPreset<EvSupplierHubProps>({
  name: 'EvSupplierHub.Orders',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvSupplierHubProps>) => {
    const { Box, Text } = primitives;
    const { orders, onOrderClick, onCreateOrder, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = orders?.length ? orders : MOCK_ORDERS;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return data.filter(o => {
        if (searchTerm && !o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) && !o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter && o.status !== statusFilter) return false;
        return true;
      });
    }, [data, searchTerm, statusFilter]);

    const totalValue = data.reduce((s, o) => s + o.totalAmount, 0);
    const pending = data.filter(o => o.status !== 'received').length;
    const receivedValue = data.filter(o => o.status === 'received').reduce((s, o) => s + o.totalAmount, 0);
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Supplier breakdown
    const supplierBreakdown = useMemo(() => {
      const map: Record<string, { count: number; total: number }> = {};
      data.forEach(o => {
        if (!map[o.supplierName]) map[o.supplierName] = { count: 0, total: 0 };
        map[o.supplierName].count++;
        map[o.supplierName].total += o.totalAmount;
      });
      return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [data]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Supplier Orders</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {data.length} orders | {pending} in progress | ${totalValue.toLocaleString()} total</Text>
          </div>
          <button onClick={onCreateOrder} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Order</button>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Orders', value: data.length.toString(), color: tokens.colors.primaryScale[600] },
            { label: 'In Progress', value: pending.toString(), color: tokens.colors.warningScale[600] },
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, color: tokens.colors.infoScale[600] },
            { label: 'Received', value: `$${receivedValue.toLocaleString()}`, color: tokens.colors.successScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[4], borderTop: `3px solid ${kpi.color}`, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Status Pipeline */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((step, i) => {
              const cfg = STATUS_CONFIG[step];
              const count = data.filter(o => o.status === step).length;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                  <div onClick={() => setStatusFilter(statusFilter === step ? null : step)} style={{ textAlign: 'center' as const, cursor: 'pointer', opacity: statusFilter && statusFilter !== step ? 0.4 : 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: count > 0 ? tokens.colors[`${cfg.color}Scale`][100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: count > 0 ? tokens.colors[`${cfg.color}Scale`][700] : tokens.colors.neutral[400] }}>{count}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{step}</Text>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, backgroundColor: tokens.colors.neutral[200], margin: `0 ${tokens.spacing[2]}px`, marginBottom: tokens.spacing[4] }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <input type="text" placeholder="Search by order # or supplier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All</div>
              {STEPS.map(s => (
                <div key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>
                  {STATUS_CONFIG[s].label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[4] }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Order #', 'Supplier', 'Status', 'Progress', 'Amount', 'Expected'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;
                const isHovered = hoveredRow === order.id;
                return (
                  <tr key={order.id} onClick={() => onOrderClick?.(order.id)} onMouseEnter={() => setHoveredRow(order.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.bold as number, fontFamily: 'monospace', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{order.orderNumber}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{order.supplierName}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, cfg.color)}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {STEPS.map((step, i) => {
                          const stepCfg = STATUS_CONFIG[step];
                          const isCompleted = stepCfg.step <= cfg.step;
                          return (
                            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: isCompleted ? tokens.colors[`${cfg.color}Scale`][500] : tokens.colors.neutral[200] }} />
                              {i < STEPS.length - 1 && <div style={{ width: 12, height: 2, backgroundColor: isCompleted ? tokens.colors[`${cfg.color}Scale`][300] : tokens.colors.neutral[200] }} />}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.bold as number, color: tokens.colors.successScale[600], fontSize: tokens.typography.fontSize.sm, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>${order.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{formatDate(order.expectedDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCE6'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No orders match your filters</Text>
          </div>
        )}

        {/* Supplier Breakdown */}
        <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>Orders by Supplier</Text>
          {supplierBreakdown.map(([name, info], i) => {
            const pct = Math.round((info.total / totalValue) * 100);
            const bar = createProgressBarStyle(tokens, { percent: pct, color: tokens.colors.primaryScale[400] });
            return (
              <div key={name} style={{ marginBottom: i < supplierBreakdown.length - 1 ? tokens.spacing[3] : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{name} ({info.count} orders)</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${info.total.toLocaleString()} ({pct}%)</Text>
                </div>
                <div style={bar.track}><div style={bar.fill} /></div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
