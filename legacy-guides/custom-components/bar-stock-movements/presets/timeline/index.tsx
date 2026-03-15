'use client';

/**
 * BarStockMovements - Timeline Preset
 * Vertical timeline of stock movements
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, createFilterPillStyle } from '../../../helpers';
import type { BarStockMovementsProps, StockMovement, MovementType } from '../../core';

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm1', type: 'receipt', itemName: 'Corona Extra (24-pack)', quantity: 5, unit: 'cases', reference: 'PO-2024-042', performedBy: 'John D.', createdAt: '2024-01-15T14:30:00Z' },
  { id: 'm2', type: 'sale', itemName: 'Margarita ingredients', quantity: 12, unit: 'servings', reference: 'ORD-1042', performedBy: 'POS-1', createdAt: '2024-01-15T21:15:00Z' },
  { id: 'm3', type: 'waste', itemName: 'Lime Juice', quantity: 0.5, unit: 'liters', notes: 'Expired batch', performedBy: 'Maria S.', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'm4', type: 'transfer', itemName: 'Bourbon Jim Beam', quantity: 2, unit: 'bottles', fromLocation: 'Main Storage', toLocation: 'Bar Counter', performedBy: 'Carlos M.', createdAt: '2024-01-15T18:00:00Z' },
  { id: 'm5', type: 'adjustment', itemName: 'Red Bull', quantity: -3, unit: 'cans', notes: 'Physical count correction', performedBy: 'Admin', createdAt: '2024-01-15T09:00:00Z' },
  { id: 'm6', type: 'receipt', itemName: 'Tequila Patron', quantity: 6, unit: 'bottles', reference: 'PO-2024-041', performedBy: 'John D.', createdAt: '2024-01-14T11:00:00Z' },
];

const TYPE_COLORS: Record<MovementType, string> = { receipt: 'success', sale: 'info', transfer: 'warning', waste: 'error', adjustment: 'neutral' };
const TYPE_LABELS: Record<MovementType, string> = { receipt: 'Receipt', sale: 'Sale', transfer: 'Transfer', waste: 'Waste', adjustment: 'Adjustment' };

export const TimelineBarStockMovements = createPreset<BarStockMovementsProps>({
  name: 'BarStockMovements.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<BarStockMovementsProps>) => {
    const { Box, Text } = primitives;
    const { movements: propMovements, onMovementSelect, onCreateMovement, className, style } = props;

    const movements = propMovements && propMovements.length > 0 ? propMovements : MOCK_MOVEMENTS;
    const [typeFilter, setTypeFilter] = useState<MovementType | null>(null);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filtered = useMemo(() => movements.filter(m => !typeFilter || m.type === typeFilter), [movements, typeFilter]);

    const typeColors: Record<string, string> = {
      success: tokens.colors.successScale[500],
      info: tokens.colors.infoScale[500],
      warning: tokens.colors.warningScale[500],
      error: tokens.colors.errorScale[500],
      neutral: tokens.colors.neutral[400],
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Stock Movements</Text>
          <button onClick={onCreateMovement} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ New Movement</button>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          <div onClick={() => setTypeFilter(null)} style={createFilterPillStyle(tokens, { active: typeFilter === null })}>All</div>
          {(Object.keys(TYPE_LABELS) as MovementType[]).map(type => (
            <div key={type} onClick={() => setTypeFilter(typeFilter === type ? null : type)} style={createFilterPillStyle(tokens, { active: typeFilter === type })}>{TYPE_LABELS[type]}</div>
          ))}
        </div>

        <div style={{ position: 'relative' as const, paddingLeft: tokens.spacing[8] }}>
          <div style={{ position: 'absolute' as const, left: 15, top: 0, bottom: 0, width: 2, backgroundColor: tokens.colors.neutral[200] }} />
          {filtered.map(movement => (
            <div key={movement.id} onClick={() => onMovementSelect?.(movement.id)} style={{ position: 'relative' as const, marginBottom: tokens.spacing[4], cursor: 'pointer' }}>
              <div style={{ position: 'absolute' as const, left: -tokens.spacing[8] + 7, top: tokens.spacing[3], width: 18, height: 18, borderRadius: tokens.borderRadius.full, backgroundColor: typeColors[TYPE_COLORS[movement.type]], border: `3px solid ${tokens.colors.common.white}` }} />
              <div style={{ ...cardBase, padding: tokens.spacing[4], ...hoverStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, TYPE_COLORS[movement.type] as any)}>{TYPE_LABELS[movement.type]}</span>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{movement.itemName}</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{new Date(movement.createdAt).toLocaleString()}</Text>
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: movement.quantity > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.unit}
                  </Text>
                  {movement.reference && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Ref: {movement.reference}</Text>}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>By: {movement.performedBy}</Text>
                </div>
                {movement.notes && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginTop: tokens.spacing[1] }}>{movement.notes}</Text>}
                {movement.type === 'transfer' && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginTop: tokens.spacing[1] }}>{movement.fromLocation} {'\u2192'} {movement.toLocation}</Text>}
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
