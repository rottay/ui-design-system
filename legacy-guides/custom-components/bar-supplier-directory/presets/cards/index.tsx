'use client';

/**
 * BarSupplierDirectory - Cards Preset
 * Card grid of suppliers
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { BarSupplierDirectoryProps, Supplier } from '../../core';

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'BevCo Distributors', contactName: 'Mike Johnson', email: 'mike@bevco.com', phone: '+1-555-0101', category: 'Beer & Wine', rating: 4.5, totalOrders: 45, totalSpent: 28500, currency: 'USD', isActive: true, leadTimeDays: 3 },
  { id: 's2', name: 'Spirit House', contactName: 'Sarah Lee', email: 'sarah@spirithouse.com', phone: '+1-555-0102', category: 'Spirits', rating: 4.8, totalOrders: 32, totalSpent: 42000, currency: 'USD', isActive: true, leadTimeDays: 5 },
  { id: 's3', name: 'Fresh Produce Co.', contactName: 'Carlos Mendez', email: 'carlos@freshproduce.com', phone: '+1-555-0103', category: 'Fresh Produce', rating: 4.2, totalOrders: 60, totalSpent: 8500, currency: 'USD', isActive: true, leadTimeDays: 1 },
];

export const CardsBarSupplierDirectory = createPreset<BarSupplierDirectoryProps>({
  name: 'BarSupplierDirectory.Cards',
  render: ({ primitives, props, tokens }: PresetContext<BarSupplierDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { suppliers: propSuppliers, onSupplierSelect, onCreateOrder, className, style } = props;
    const suppliers = propSuppliers && propSuppliers.length > 0 ? propSuppliers : MOCK_SUPPLIERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[5] }}>Suppliers</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
          {suppliers.map(s => (
            <div key={s.id} onClick={() => onSupplierSelect?.(s.id)} style={{ ...cardBase, padding: tokens.spacing[5], cursor: 'pointer', ...hoverStyle, opacity: s.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{s.name}</Text>
                <span style={createBadgeStyle(tokens, s.isActive ? 'success' : 'error')}>{s.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{s.category}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>{s.contactName} - {s.email}</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                <div style={{ textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.rating.toFixed(1)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Rating</Text>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.totalOrders}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Orders</Text>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.leadTimeDays}d</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Lead Time</Text>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onCreateOrder?.(s.id); }} style={{ width: '100%', padding: `${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: `1px solid ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Create Order</button>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
