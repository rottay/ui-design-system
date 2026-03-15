'use client';

/**
 * BarPurchaseOrders - Kanban Preset
 * Kanban board of POs by status
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarPurchaseOrdersProps, PurchaseOrder, POStatus } from '../../core';

const MOCK_ORDERS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2024-042', supplierName: 'BevCo Distributors', status: 'pending_approval', items: [{ id: 'i1', productName: 'Corona', quantity: 10, unit: 'cases', unitPrice: 30, totalPrice: 300 }], totalAmount: 475.00, currency: 'USD', createdAt: '2024-01-15', createdBy: 'John D.' },
  { id: 'po2', poNumber: 'PO-2024-041', supplierName: 'Spirit House', status: 'ordered', items: [{ id: 'i2', productName: 'Tequila', quantity: 6, unit: 'bottles', unitPrice: 45, totalPrice: 270 }], totalAmount: 270.00, currency: 'USD', createdAt: '2024-01-13', createdBy: 'Maria S.', approvedBy: 'Admin' },
  { id: 'po3', poNumber: 'PO-2024-040', supplierName: 'Fresh Produce', status: 'received', items: [{ id: 'i3', productName: 'Limes', quantity: 20, unit: 'kg', unitPrice: 5, totalPrice: 100 }], totalAmount: 100.00, currency: 'USD', createdAt: '2024-01-10', createdBy: 'John D.', approvedBy: 'Admin' },
];

const COLUMNS: { key: POStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'received', label: 'Received' },
];

const STATUS_COLORS: Record<POStatus, string> = {
  draft: 'neutral', pending_approval: 'warning', approved: 'info', ordered: 'info',
  partially_received: 'warning', received: 'success', cancelled: 'error',
};

export const KanbanBarPurchaseOrders = createPreset<BarPurchaseOrdersProps>({
  name: 'BarPurchaseOrders.Kanban',
  render: ({ primitives, props, tokens }: PresetContext<BarPurchaseOrdersProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onOrderSelect, onCreateOrder, className, style } = props;
    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Purchase Orders</Text>
          <button onClick={onCreateOrder} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ New PO</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: tokens.spacing[4] }}>
          {COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div key={col.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md, marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{col.label}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>({colOrders.length})</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                  {colOrders.map(order => (
                    <div key={order.id} onClick={() => onOrderSelect?.(order.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700], display: 'block' }}>{order.poNumber}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[1] }}>{order.supplierName}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{order.items.length} items</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${order.totalAmount.toFixed(2)}</Text>
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div style={{ padding: tokens.spacing[4], textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>No orders</Text>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
