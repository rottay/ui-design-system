'use client';

/**
 * BarGoodsReceipt - Form Preset
 * Full receiving form with item checklist
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarGoodsReceiptProps, GoodsReceipt } from '../../core';

const MOCK_RECEIPT: GoodsReceipt = {
  id: 'gr1', receiptNumber: 'GR-2024-015', poNumber: 'PO-2024-042', supplierName: 'BevCo Distributors', status: 'in_progress', receivedBy: 'John D.',
  items: [
    { id: 'ri1', productName: 'Corona Extra (24-pack)', orderedQuantity: 10, receivedQuantity: 10, unit: 'cases', condition: 'good' },
    { id: 'ri2', productName: 'Heineken (24-pack)', orderedQuantity: 5, receivedQuantity: 4, unit: 'cases', condition: 'good', notes: '1 case missing' },
    { id: 'ri3', productName: 'Modelo Especial (24-pack)', orderedQuantity: 8, receivedQuantity: 8, unit: 'cases', condition: 'damaged', notes: '2 bottles broken in case' },
  ],
};

const MOCK_RECEIPTS: GoodsReceipt[] = [
  MOCK_RECEIPT,
  { id: 'gr2', receiptNumber: 'GR-2024-014', poNumber: 'PO-2024-041', supplierName: 'Spirit House', status: 'completed', receivedBy: 'Maria S.', receivedAt: '2024-01-14T10:00:00Z', items: [{ id: 'ri4', productName: 'Tequila Patron', orderedQuantity: 6, receivedQuantity: 6, unit: 'bottles', condition: 'good' }] },
];

const STATUS_COLORS: Record<string, string> = { pending: 'neutral', in_progress: 'warning', completed: 'success', rejected: 'error' };
const CONDITION_COLORS: Record<string, string> = { good: 'success', damaged: 'warning', rejected: 'error' };

export const FormBarGoodsReceipt = createPreset<BarGoodsReceiptProps>({
  name: 'BarGoodsReceipt.Form',
  render: ({ primitives, props, tokens }: PresetContext<BarGoodsReceiptProps>) => {
    const { Box, Text } = primitives;
    const { receipts: propReceipts, activeReceipt, onReceiptSelect, onUpdateQuantity, onUpdateCondition, onComplete, onReject, className, style } = props;

    const receipts = propReceipts && propReceipts.length > 0 ? propReceipts : MOCK_RECEIPTS;
    const active = activeReceipt || receipts[0];
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[5] }}>Goods Receipt</Text>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: tokens.spacing[5] }}>
          {/* Receipt List */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {receipts.map(receipt => (
              <div key={receipt.id} onClick={() => onReceiptSelect?.(receipt.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, borderLeft: active?.id === receipt.id ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{receipt.receiptNumber}</Text>
                  <span style={createBadgeStyle(tokens, STATUS_COLORS[receipt.status] as any)}>{receipt.status.replace(/_/g, ' ')}</span>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{receipt.supplierName} - {receipt.poNumber}</Text>
              </div>
            ))}
          </div>

          {/* Active Receipt Form */}
          {active && (
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{active.receiptNumber}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>PO: {active.poNumber} - Supplier: {active.supplierName}</Text>
                </div>
                <span style={createBadgeStyle(tokens, STATUS_COLORS[active.status] as any)}>{active.status.replace(/_/g, ' ')}</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: tokens.spacing[4] }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${tokens.colors.neutral[200]}` }}>
                    {['Product', 'Ordered', 'Received', 'Unit', 'Condition', 'Notes'].map(h => (
                      <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                      <td style={{ padding: `${tokens.spacing[3]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{item.productName}</Text></td>
                      <td style={{ padding: `${tokens.spacing[3]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{item.orderedQuantity}</Text></td>
                      <td style={{ padding: `${tokens.spacing[3]}px` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: item.receivedQuantity < item.orderedQuantity ? tokens.colors.warningScale[600] : tokens.colors.successScale[600] }}>{item.receivedQuantity}</Text>
                      </td>
                      <td style={{ padding: `${tokens.spacing[3]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.unit}</Text></td>
                      <td style={{ padding: `${tokens.spacing[3]}px` }}><span style={createBadgeStyle(tokens, CONDITION_COLORS[item.condition] as any)}>{item.condition}</span></td>
                      <td style={{ padding: `${tokens.spacing[3]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.notes || '-'}</Text></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {active.status === 'in_progress' && (
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <button onClick={() => onComplete?.(active.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Complete Receipt</button>
                  <button onClick={() => onReject?.(active.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: `1px solid ${tokens.colors.errorScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Reject</button>
                </div>
              )}
            </div>
          )}
        </div>
      </Box>
    );
  },
});
