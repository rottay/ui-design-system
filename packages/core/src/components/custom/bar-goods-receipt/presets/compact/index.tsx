'use client';

/**
 * BarGoodsReceipt - Compact Preset
 * Compact list of goods receipts
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarGoodsReceiptProps, GoodsReceipt } from '../../core';

const MOCK_RECEIPTS: GoodsReceipt[] = [
  { id: 'gr1', receiptNumber: 'GR-2024-015', poNumber: 'PO-2024-042', supplierName: 'BevCo Distributors', status: 'in_progress', receivedBy: 'John D.', items: [{ id: 'ri1', productName: 'Corona', orderedQuantity: 10, receivedQuantity: 10, unit: 'cases', condition: 'good' }] },
  { id: 'gr2', receiptNumber: 'GR-2024-014', poNumber: 'PO-2024-041', supplierName: 'Spirit House', status: 'completed', receivedBy: 'Maria S.', receivedAt: '2024-01-14T10:00:00Z', items: [{ id: 'ri2', productName: 'Tequila', orderedQuantity: 6, receivedQuantity: 6, unit: 'bottles', condition: 'good' }] },
];

const STATUS_COLORS: Record<string, string> = { pending: 'neutral', in_progress: 'warning', completed: 'success', rejected: 'error' };

export const CompactBarGoodsReceipt = createPreset<BarGoodsReceiptProps>({
  name: 'BarGoodsReceipt.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BarGoodsReceiptProps>) => {
    const { Box, Text } = primitives;
    const { receipts: propReceipts, onReceiptSelect, className, style } = props;
    const receipts = propReceipts && propReceipts.length > 0 ? propReceipts : MOCK_RECEIPTS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Goods Receipts</Text>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {receipts.map(receipt => (
            <div key={receipt.id} onClick={() => onReceiptSelect?.(receipt.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{receipt.receiptNumber}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{receipt.supplierName} - {receipt.items.length} items</Text>
              </div>
              <span style={createBadgeStyle(tokens, STATUS_COLORS[receipt.status] as any)}>{receipt.status.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
