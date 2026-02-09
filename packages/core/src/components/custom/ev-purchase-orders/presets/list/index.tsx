'use client';

/**
 * EvPurchaseOrders - List Preset
 * Orders table with status flow badges (draft->submitted->approved->ordered->received),
 * search/filter, supplier breakdown, KPI stats, progress dots, empty state
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createPanelHeaderStyle, createHoverStyle, createFilterPillStyle, createProgressBarStyle } from '../../../helpers';
import type { EvPurchaseOrdersProps, PurchaseOrder } from '../../core';

const MOCK: PurchaseOrder[] = [
  {
    id: 'po1', orderNumber: 'PO-2026-001', supplierName: 'BevCo Distributors', status: 'received',
    items: [{ name: 'Heineken Kegs', quantity: 10, unitPrice: 85, received: 10 }, { name: 'Corona Cases', quantity: 5, unitPrice: 42, received: 5 }],
    totalAmount: 1060, createdAt: new Date(Date.now() - 604800000), expectedDate: new Date(Date.now() - 86400000),
  },
  {
    id: 'po2', orderNumber: 'PO-2026-002', supplierName: 'Spirit World Imports', status: 'ordered',
    items: [{ name: 'Tequila Silver', quantity: 6, unitPrice: 35, received: 0 }, { name: 'Rum White', quantity: 8, unitPrice: 28, received: 0 }, { name: 'Vodka Premium', quantity: 4, unitPrice: 42, received: 0 }],
    totalAmount: 602, createdAt: new Date(Date.now() - 259200000), expectedDate: new Date(Date.now() + 172800000),
  },
  {
    id: 'po3', orderNumber: 'PO-2026-003', supplierName: 'FreshFarm Produce', status: 'approved',
    items: [{ name: 'Lime', quantity: 100, unitPrice: 0.5, received: 0 }, { name: 'Mint Bunches', quantity: 20, unitPrice: 3, received: 0 }, { name: 'Orange Juice', quantity: 12, unitPrice: 8, received: 0 }],
    totalAmount: 206, createdAt: new Date(Date.now() - 172800000), expectedDate: new Date(Date.now() + 86400000),
  },
  {
    id: 'po4', orderNumber: 'PO-2026-004', supplierName: 'BevCo Distributors', status: 'submitted',
    items: [{ name: 'IPA Craft Kegs', quantity: 4, unitPrice: 95, received: 0 }, { name: 'Stella Cases', quantity: 3, unitPrice: 48, received: 0 }],
    totalAmount: 524, createdAt: new Date(Date.now() - 86400000), expectedDate: new Date(Date.now() + 432000000),
  },
  {
    id: 'po5', orderNumber: 'PO-2026-005', supplierName: 'BarSupply Pro', status: 'draft',
    items: [{ name: 'Cocktail Napkins', quantity: 50, unitPrice: 4, received: 0 }, { name: 'Straws Eco', quantity: 100, unitPrice: 2, received: 0 }, { name: 'Garnish Picks', quantity: 30, unitPrice: 5, received: 0 }],
    totalAmount: 550, createdAt: new Date(Date.now() - 3600000), expectedDate: new Date(Date.now() + 604800000),
  },
  {
    id: 'po6', orderNumber: 'PO-2026-006', supplierName: 'Spirit World Imports', status: 'received',
    items: [{ name: 'Gin London Dry', quantity: 6, unitPrice: 38, received: 6 }, { name: 'Campari', quantity: 4, unitPrice: 32, received: 4 }],
    totalAmount: 356, createdAt: new Date(Date.now() - 864000000), expectedDate: new Date(Date.now() - 432000000),
  },
  {
    id: 'po7', orderNumber: 'PO-2026-007', supplierName: 'FreshFarm Produce', status: 'ordered',
    items: [{ name: 'Lemons', quantity: 50, unitPrice: 0.6, received: 0 }, { name: 'Ginger', quantity: 10, unitPrice: 4, received: 0 }],
    totalAmount: 70, createdAt: new Date(Date.now() - 129600000), expectedDate: new Date(Date.now() + 259200000),
  },
];

const STATUS_CFG: Record<string, { color: 'primary' | 'info' | 'warning' | 'success' | 'error'; step: number }> = {
  draft: { color: 'primary', step: 1 },
  submitted: { color: 'info', step: 2 },
  approved: { color: 'warning', step: 3 },
  rejected: { color: 'error', step: 0 },
  ordered: { color: 'info', step: 4 },
  received: { color: 'success', step: 5 },
};

const STEPS = ['draft', 'submitted', 'approved', 'ordered', 'received'];
const STATUS_FILTERS = ['All', 'draft', 'submitted', 'approved', 'ordered', 'received'];

export const ListEvPurchaseOrders = createPreset<EvPurchaseOrdersProps>({
  name: 'EvPurchaseOrders.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvPurchaseOrdersProps>) => {
    const { Box, Text } = primitives;
    const { orders = MOCK, onOrderClick, onApprove, onReject, onCreateOrder, className, style } = props;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);

    const filteredOrders = useMemo(() => {
      let result = orders;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        result = result.filter(o => o.orderNumber.toLowerCase().includes(q) || o.supplierName.toLowerCase().includes(q));
      }
      if (statusFilter !== 'All') result = result.filter(o => o.status === statusFilter);
      return result;
    }, [orders, searchTerm, statusFilter]);

    const totalValue = useMemo(() => orders.reduce((s, o) => s + o.totalAmount, 0), [orders]);
    const pending = useMemo(() => orders.filter(o => !['received', 'rejected'].includes(o.status)).length, [orders]);
    const receivedValue = useMemo(() => orders.filter(o => o.status === 'received').reduce((s, o) => s + o.totalAmount, 0), [orders]);

    const supplierBreakdown = useMemo(() => {
      const map: Record<string, { count: number; total: number }> = {};
      orders.forEach(o => {
        if (!map[o.supplierName]) map[o.supplierName] = { count: 0, total: 0 };
        map[o.supplierName].count += 1;
        map[o.supplierName].total += o.totalAmount;
      });
      return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [orders]);

    const maxSupplierTotal = Math.max(...supplierBreakdown.map(([, v]) => v.total), 1);

    const thStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
    const tdStyle = { padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], borderBottom: `1px solid ${tokens.colors.neutral[100]}` };

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Purchase Orders</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{orders.length} orders from {supplierBreakdown.length} suppliers</Text>
          </div>
          <button onClick={onCreateOrder} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>+ New PO</button>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Orders', value: `${orders.length}`, color: tokens.colors.primaryScale[600] },
            { label: 'In Progress', value: `${pending}`, color: tokens.colors.infoScale[600] },
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, color: tokens.colors.warningScale[600] },
            { label: 'Received', value: `$${receivedValue.toLocaleString()}`, color: tokens.colors.successScale[600] },
            { label: 'Suppliers', value: `${supplierBreakdown.length}`, color: tokens.colors.neutral[700] },
          ].map((kpi, idx) => (
            <div key={idx} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Status Summary Dots */}
        <div style={{ display: 'flex', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {STEPS.map(step => {
            const cfg = STATUS_CFG[step];
            const count = orders.filter(o => o.status === step).length;
            return (
              <div key={step} style={{ ...cardBase, flex: 1, textAlign: 'center' as const, padding: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors[`${cfg.color}Scale`][600], display: 'block' }}>{count}</Text>
                <Text style={{ fontSize: 10, color: tokens.colors.neutral[500], textTransform: 'capitalize' as const }}>{step}</Text>
              </div>
            );
          })}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          <input type="text" placeholder="Search by PO # or supplier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: 200, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{ ...createFilterPillStyle(tokens, { active: statusFilter === f }), cursor: 'pointer', border: 'none', fontFamily: 'inherit', textTransform: 'capitalize' as const }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden', marginBottom: tokens.spacing[5] }}>
          <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>All Purchase Orders ({filteredOrders.length})</Text>
            {searchTerm && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Filtered from {orders.length}</Text>}
          </div>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: tokens.spacing[8], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.neutral[300], display: 'block', marginBottom: tokens.spacing[2] }}>No orders found</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  <th style={thStyle}>PO #</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Items</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Progress</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Expected</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const cfg = STATUS_CFG[order.status] || STATUS_CFG.draft;
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  const isOverdue = order.expectedDate.getTime() < Date.now() && order.status !== 'received';
                  const isHovered = hoveredRow === order.id;
                  return (
                    <tr key={order.id} onClick={() => onOrderClick?.(order.id)} onMouseEnter={() => setHoveredRow(order.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                      <td style={tdStyle}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>{order.supplierName}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Created {formatDate(order.createdAt)}</Text>
                      </td>
                      <td style={tdStyle}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{order.items.length} items ({itemCount} units)</Text>
                      </td>
                      <td style={tdStyle}>
                        <span style={createBadgeStyle(tokens, cfg.color)}>{order.status}</span>
                        {isOverdue && <span style={{ ...createBadgeStyle(tokens, 'error'), marginLeft: tokens.spacing[1] }}>Overdue</span>}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                          {STEPS.map((step, i) => {
                            const stepCfg = STATUS_CFG[step];
                            const done = stepCfg.step <= cfg.step;
                            return (
                              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 7, height: 7, borderRadius: tokens.borderRadius.full, backgroundColor: done ? tokens.colors[`${cfg.color}Scale`][500] : tokens.colors.neutral[200] }} />
                                {i < STEPS.length - 1 && <div style={{ width: 10, height: 2, backgroundColor: done ? tokens.colors[`${cfg.color}Scale`][300] : tokens.colors.neutral[200] }} />}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${order.totalAmount.toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontSize: tokens.typography.fontSize.xs, color: isOverdue ? tokens.colors.errorScale[600] : tokens.colors.neutral[500], fontWeight: isOverdue ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.normal }}>{formatDate(order.expectedDate)}</td>
                      <td style={tdStyle}>
                        {order.status === 'submitted' && (
                          <div style={{ display: 'flex', gap: tokens.spacing[1] }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => onApprove?.(order.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: 'none', borderRadius: tokens.borderRadius.md, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Approve</button>
                            <button onClick={() => onReject?.(order.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: 'none', borderRadius: tokens.borderRadius.md, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Supplier Breakdown */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Supplier Breakdown</Text></div>
          <div style={{ padding: tokens.spacing[4] }}>
            {supplierBreakdown.map(([name, data], idx) => (
              <div key={name} style={{ marginBottom: idx < supplierBreakdown.length - 1 ? tokens.spacing[3] : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{name}</Text>
                  <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{data.count} orders</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${data.total.toLocaleString()}</Text>
                  </div>
                </div>
                {(() => { const pb = createProgressBarStyle(tokens, { percent: Math.round((data.total / maxSupplierTotal) * 100), color: tokens.colors.primaryScale[500] }); return <div style={pb.track}><div style={pb.fill} /></div>; })()}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], padding: tokens.spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.successScale[50]})` }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Showing {filteredOrders.length} of {orders.length} orders</Text>
          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Total: <strong>${totalValue.toLocaleString()}</strong></Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Pending: <strong>{pending}</strong></Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600], fontWeight: tokens.typography.fontWeight.bold }}>Received: ${receivedValue.toLocaleString()}</Text>
          </div>
        </div>
      </Box>
    );
  },
});
