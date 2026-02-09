'use client';

/**
 * EvPurchaseOrders - Detail Preset
 * Single order view with item breakdown, received vs ordered, approval section
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createPanelHeaderStyle, createHoverStyle } from '../../../helpers';
import type { EvPurchaseOrdersProps, PurchaseOrder } from '../../core';

const MOCK: PurchaseOrder[] = [
  {
    id: 'po2', orderNumber: 'PO-2026-002', supplierName: 'Spirit World Imports', status: 'ordered',
    items: [
      { name: 'Tequila Silver 750ml', quantity: 6, unitPrice: 35, received: 0 },
      { name: 'Rum White 750ml', quantity: 8, unitPrice: 28, received: 4 },
      { name: 'Vodka Premium 1L', quantity: 4, unitPrice: 42, received: 4 },
      { name: 'Triple Sec 750ml', quantity: 3, unitPrice: 18, received: 3 },
      { name: 'Gin London Dry 750ml', quantity: 5, unitPrice: 32, received: 0 },
    ],
    totalAmount: 602, createdAt: new Date(Date.now() - 259200000), expectedDate: new Date(Date.now() + 172800000),
  },
];

const STATUS_CFG: Record<string, { emoji: string; color: 'primary' | 'info' | 'warning' | 'success' | 'error'; label: string }> = {
  draft: { emoji: '📝', color: 'primary', label: 'Draft' },
  submitted: { emoji: '📤', color: 'info', label: 'Submitted' },
  approved: { emoji: '✅', color: 'warning', label: 'Approved' },
  rejected: { emoji: '❌', color: 'error', label: 'Rejected' },
  ordered: { emoji: '📦', color: 'info', label: 'Ordered' },
  received: { emoji: '🎉', color: 'success', label: 'Received' },
};

const STEPS = ['draft', 'submitted', 'approved', 'ordered', 'received'];

export const DetailEvPurchaseOrders = createPreset<EvPurchaseOrdersProps>({
  name: 'EvPurchaseOrders.Detail',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvPurchaseOrdersProps>) => {
    const { Box, Text } = primitives;
    const { orders = MOCK, onApprove, onReject, className, style } = props;

    const order = orders[0];

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    if (!order) {
      return (
        <Box className={className} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colors.neutral[50], ...style }}>
          <Text style={{ color: tokens.colors.neutral[400] }}>No order selected</Text>
        </Box>
      );
    }

    const cfg = STATUS_CFG[order.status] || STATUS_CFG.draft;
    const totalOrdered = order.items.reduce((s, i) => s + i.quantity, 0);
    const totalReceived = order.items.reduce((s, i) => s + i.received, 0);
    const receivePercent = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

    const thStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
    const tdStyle = { padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], borderBottom: `1px solid ${tokens.colors.neutral[100]}` };

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    // Determine current step index
    const stepIdx = STEPS.indexOf(order.status);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Order Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>📄 {order.orderNumber}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{order.supplierName} - Created {formatDate(order.createdAt)}</Text>
          </div>
          <span style={{ ...createBadgeStyle(tokens, cfg.color), fontSize: tokens.typography.fontSize.sm, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px` }}>{cfg.emoji} {cfg.label}</span>
        </div>

        {/* Status Progress */}
        <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((step, i) => {
              const stepCfg = STATUS_CFG[step];
              const isActive = i <= stepIdx;
              const isCurrent = step === order.status;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                  <div style={{ textAlign: 'center' as const }}>
                    <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: isActive ? tokens.colors[`${cfg.color}Scale`][isCurrent ? 500 : 200] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: tokens.spacing[1], border: isCurrent ? `2px solid ${tokens.colors[`${cfg.color}Scale`][600]}` : 'none' }}>
                      <span style={{ fontSize: 16 }}>{stepCfg.emoji}</span>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: isCurrent ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.normal, color: isActive ? tokens.colors.neutral[800] : tokens.colors.neutral[400], textTransform: 'capitalize' as const }}>{step}</Text>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 3, backgroundColor: i < stepIdx ? tokens.colors[`${cfg.color}Scale`][300] : tokens.colors.neutral[200], margin: `0 ${tokens.spacing[2]}px`, marginBottom: tokens.spacing[4] }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[5] }}>
          {/* Item Breakdown Table */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
            <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>📋 Order Items</Text></div>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  <th style={thStyle}>Item</th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Qty</th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Unit Price</th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Received</th>
                  <th style={{ ...thStyle, textAlign: 'right' as const }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const pct = item.quantity > 0 ? Math.round((item.received / item.quantity) * 100) : 0;
                  return (
                    <tr key={idx} style={{ ...hoverStyle }}>
                      <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium }}>{item.name}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const }}>{item.quantity}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const }}>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: tokens.spacing[2] }}>
                          <div style={{ width: 40, height: 4, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? tokens.colors.successScale[400] : tokens.colors.warningScale[400], borderRadius: tokens.borderRadius.full }} />
                          </div>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: pct === 100 ? tokens.colors.successScale[600] : tokens.colors.neutral[600] }}>{item.received}/{item.quantity}</Text>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.bold }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.bold, borderBottom: 'none' }}>Total</td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], fontSize: tokens.typography.fontSize.md, borderBottom: 'none' }}>${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
            {/* Order Info */}
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>📌 Order Info</Text></div>
              <div style={{ padding: tokens.spacing[4] }}>
                {[
                  { label: 'Order Number', value: order.orderNumber },
                  { label: 'Supplier', value: order.supplierName },
                  { label: 'Created', value: formatDate(order.createdAt) },
                  { label: 'Expected', value: formatDate(order.expectedDate) },
                  { label: 'Total Items', value: `${order.items.length} items (${totalOrdered} units)` },
                ].map((info, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{info.label}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{info.value}</Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Receiving Progress */}
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>📥 Receiving</Text></div>
              <div style={{ padding: tokens.spacing[4], textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: receivePercent === 100 ? tokens.colors.successScale[600] : tokens.colors.primaryScale[600], display: 'block' }}>{receivePercent}%</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[3], display: 'block' }}>{totalReceived} of {totalOrdered} units received</Text>
                <div style={{ height: 12, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${receivePercent}%`, backgroundColor: receivePercent === 100 ? tokens.colors.successScale[400] : tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.full }} />
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            {(order.status === 'submitted' || order.status === 'approved') && (
              <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>🔑 Actions</Text></div>
                <div style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                  {order.status === 'submitted' && (
                    <>
                      <button onClick={() => onApprove?.(order.id)} style={{ width: '100%', padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit' }}>✅ Approve Order</button>
                      <button onClick={() => onReject?.(order.id)} style={{ width: '100%', padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: `1px solid ${tokens.colors.errorScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>❌ Reject Order</button>
                    </>
                  )}
                  {order.status === 'approved' && (
                    <button style={{ width: '100%', padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit' }}>📦 Mark as Ordered</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
