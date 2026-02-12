'use client';

/**
 * BarStockMovements - Table Preset
 * Tabular view of stock movements
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarStockMovementsProps, StockMovement, MovementType } from '../../core';

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm1', type: 'receipt', itemName: 'Corona Extra', quantity: 120, unit: 'units', reference: 'PO-042', performedBy: 'John D.', createdAt: '2024-01-15T14:30:00Z' },
  { id: 'm2', type: 'sale', itemName: 'Margarita', quantity: 12, unit: 'servings', reference: 'ORD-1042', performedBy: 'POS-1', createdAt: '2024-01-15T21:15:00Z' },
  { id: 'm3', type: 'waste', itemName: 'Lime Juice', quantity: 0.5, unit: 'liters', performedBy: 'Maria S.', createdAt: '2024-01-15T10:00:00Z' },
];

const TYPE_COLORS: Record<MovementType, string> = { receipt: 'success', sale: 'info', transfer: 'warning', waste: 'error', adjustment: 'neutral' };

export const TableBarStockMovements = createPreset<BarStockMovementsProps>({
  name: 'BarStockMovements.Table',
  render: ({ primitives, props, tokens }: PresetContext<BarStockMovementsProps>) => {
    const { Box, Text } = primitives;
    const { movements: propMovements, onMovementSelect, className, style } = props;
    const movements = propMovements && propMovements.length > 0 ? propMovements : MOCK_MOVEMENTS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Stock Movements</Text>
        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['Date', 'Type', 'Item', 'Quantity', 'Reference', 'By'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.map((m, idx) => (
                <tr key={m.id} onClick={() => onMovementSelect?.(m.id)} style={{ cursor: 'pointer', borderBottom: idx < movements.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{new Date(m.createdAt).toLocaleDateString()}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><span style={createBadgeStyle(tokens, TYPE_COLORS[m.type] as any)}>{m.type}</span></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{m.itemName}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: m.quantity > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>{m.quantity > 0 ? '+' : ''}{m.quantity} {m.unit}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{m.reference || '-'}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{m.performedBy}</Text></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
