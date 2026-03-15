'use client';

/**
 * BarSupplierDirectory - Table Preset
 * Data table of suppliers
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarSupplierDirectoryProps, Supplier } from '../../core';

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'BevCo Distributors', contactName: 'Mike Johnson', email: 'mike@bevco.com', phone: '+1-555-0101', category: 'Beer & Wine', rating: 4.5, totalOrders: 45, totalSpent: 28500, currency: 'USD', isActive: true, leadTimeDays: 3 },
  { id: 's2', name: 'Spirit House', contactName: 'Sarah Lee', email: 'sarah@spirithouse.com', phone: '+1-555-0102', category: 'Spirits', rating: 4.8, totalOrders: 32, totalSpent: 42000, currency: 'USD', isActive: true, leadTimeDays: 5 },
  { id: 's3', name: 'Fresh Produce Co.', contactName: 'Carlos Mendez', email: 'carlos@freshproduce.com', phone: '+1-555-0103', category: 'Fresh Produce', rating: 4.2, totalOrders: 60, totalSpent: 8500, currency: 'USD', isActive: true, leadTimeDays: 1 },
  { id: 's4', name: 'Ice & More Supply', contactName: 'Tom Wilson', email: 'tom@icemore.com', phone: '+1-555-0104', category: 'Supplies', rating: 3.8, totalOrders: 20, totalSpent: 5200, currency: 'USD', isActive: false, leadTimeDays: 2 },
];

export const TableBarSupplierDirectory = createPreset<BarSupplierDirectoryProps>({
  name: 'BarSupplierDirectory.Table',
  render: ({ primitives, props, tokens }: PresetContext<BarSupplierDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { suppliers: propSuppliers, onSupplierSelect, onSupplierCreate, onSupplierEdit, onCreateOrder, className, style } = props;

    const suppliers = propSuppliers && propSuppliers.length > 0 ? propSuppliers : MOCK_SUPPLIERS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Supplier Directory</Text>
          <button onClick={onSupplierCreate} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Supplier</button>
        </div>

        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['Supplier', 'Contact', 'Category', 'Rating', 'Orders', 'Total Spent', 'Lead Time', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, idx) => (
                <tr key={s.id} onClick={() => onSupplierSelect?.(s.id)} style={{ cursor: 'pointer', borderBottom: idx < suppliers.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{s.name}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[800], display: 'block' }}>{s.contactName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.email}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{s.category}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: s.rating >= 4 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600] }}>{s.rating.toFixed(1)}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{s.totalOrders}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>${s.totalSpent.toLocaleString()}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{s.leadTimeDays}d</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><span style={createBadgeStyle(tokens, s.isActive ? 'success' : 'error')}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      <button onClick={(e) => { e.stopPropagation(); onCreateOrder?.(s.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Order</button>
                      <button onClick={(e) => { e.stopPropagation(); onSupplierEdit?.(s.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
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
