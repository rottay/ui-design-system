'use client';

/**
 * BarPurchaseOrders - Table Preset
 * Data table of purchase orders with status and actions
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarPurchaseOrdersProps, PurchaseOrder, POStatus } from '../../core';

const MOCK_ORDERS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2024-042', supplierName: 'BevCo Distributors', status: 'pending_approval', items: [{ id: 'i1', productName: 'Corona Extra', quantity: 10, unit: 'cases', unitPrice: 30.00, totalPrice: 300.00 }, { id: 'i2', productName: 'Heineken', quantity: 5, unit: 'cases', unitPrice: 35.00, totalPrice: 175.00 }], totalAmount: 475.00, currency: 'USD', createdAt: '2024-01-15', expectedDelivery: '2024-01-20', createdBy: 'John D.' },
  { id: 'po2', poNumber: 'PO-2024-041', supplierName: 'Spirit House', status: 'ordered', items: [{ id: 'i3', productName: 'Tequila Patron', quantity: 6, unit: 'bottles', unitPrice: 45.00, totalPrice: 270.00 }], totalAmount: 270.00, currency: 'USD', createdAt: '2024-01-13', expectedDelivery: '2024-01-18', createdBy: 'Maria S.', approvedBy: 'Admin' },
  { id: 'po3', poNumber: 'PO-2024-040', supplierName: 'Fresh Produce Co.', status: 'received', items: [{ id: 'i4', productName: 'Limes', quantity: 20, unit: 'kg', unitPrice: 5.00, totalPrice: 100.00 }], totalAmount: 100.00, currency: 'USD', createdAt: '2024-01-10', createdBy: 'John D.', approvedBy: 'Admin' },
  { id: 'po4', poNumber: 'PO-2024-039', supplierName: 'BevCo Distributors', status: 'draft', items: [{ id: 'i5', productName: 'Red Bull', quantity: 10, unit: 'cases', unitPrice: 48.00, totalPrice: 480.00 }], totalAmount: 480.00, currency: 'USD', createdAt: '2024-01-15', createdBy: 'John D.' },
];

const STATUS_COLORS: Record<POStatus, string> = {
  draft: 'neutral', pending_approval: 'warning', approved: 'info', ordered: 'info',
  partially_received: 'warning', received: 'success', cancelled: 'error',
};

export const TableBarPurchaseOrders = createPreset<BarPurchaseOrdersProps>({
  name: 'BarPurchaseOrders.Table',
  render: ({ primitives, props, tokens }: PresetContext<BarPurchaseOrdersProps>) => {
    const { Box, Text } = primitives;
    const { orders: propOrders, onOrderSelect, onCreateOrder, onApprove, onReceive, className, style } = props;

    const orders = propOrders && propOrders.length > 0 ? propOrders : MOCK_ORDERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalPending = orders.filter(o => o.status === 'pending_approval' || o.status === 'ordered').reduce((s, o) => s + o.totalAmount, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Purchase Orders</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{orders.length} orders - ${totalPending.toFixed(2)} pending</Text>
          </div>
          <button onClick={onCreateOrder} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ New PO</button>
        </div>

        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['PO #', 'Supplier', 'Items', 'Total', 'Status', 'Expected', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id} onClick={() => onOrderSelect?.(order.id)} style={{ cursor: 'pointer', borderBottom: idx < orders.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{order.poNumber}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{order.supplierName}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{order.items.length} items</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${order.totalAmount.toFixed(2)}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><span style={createBadgeStyle(tokens, STATUS_COLORS[order.status] as any)}>{order.status.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{order.expectedDelivery || '-'}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      {order.status === 'pending_approval' && <button onClick={(e) => { e.stopPropagation(); onApprove?.(order.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Approve</button>}
                      {(order.status === 'ordered' || order.status === 'approved') && <button onClick={(e) => { e.stopPropagation(); onReceive?.(order.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Receive</button>}
                    </div>
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
