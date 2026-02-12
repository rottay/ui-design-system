'use client';

/**
 * BarStockDashboard - Dashboard Preset
 * Full inventory dashboard with stats, alerts, stock table
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, createProgressBarStyle } from '../../../helpers';
import type { BarStockDashboardProps, StockItem, StockAlert } from '../../core';

const MOCK_ITEMS: StockItem[] = [
  { id: 's1', name: 'Tequila Patron', category: 'Spirits', currentLevel: 8, minLevel: 5, maxLevel: 30, unit: 'bottles', lastRestocked: '2024-01-10', costPerUnit: 45.00, status: 'ok' },
  { id: 's2', name: 'Bourbon Jim Beam', category: 'Spirits', currentLevel: 3, minLevel: 5, maxLevel: 20, unit: 'bottles', lastRestocked: '2024-01-08', costPerUnit: 28.00, status: 'low' },
  { id: 's3', name: 'Corona Extra', category: 'Beer', currentLevel: 48, minLevel: 24, maxLevel: 120, unit: 'units', lastRestocked: '2024-01-12', costPerUnit: 2.50, status: 'ok' },
  { id: 's4', name: 'Lime Juice', category: 'Mixers', currentLevel: 1, minLevel: 3, maxLevel: 10, unit: 'liters', lastRestocked: '2024-01-05', costPerUnit: 8.00, status: 'critical' },
  { id: 's5', name: 'Red Bull', category: 'Non-Alcoholic', currentLevel: 60, minLevel: 12, maxLevel: 48, unit: 'cans', lastRestocked: '2024-01-13', costPerUnit: 2.00, status: 'overstocked' },
  { id: 's6', name: 'Angostura Bitters', category: 'Mixers', currentLevel: 4, minLevel: 2, maxLevel: 8, unit: 'bottles', lastRestocked: '2024-01-01', costPerUnit: 12.00, status: 'ok' },
];

const MOCK_ALERTS: StockAlert[] = [
  { id: 'a1', itemName: 'Lime Juice', type: 'out_of_stock', message: 'Lime Juice critically low - only 1L remaining', severity: 'critical', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'a2', itemName: 'Bourbon Jim Beam', type: 'low_stock', message: 'Bourbon below minimum level (3/5)', severity: 'warning', createdAt: '2024-01-15T09:00:00Z' },
  { id: 'a3', itemName: 'Red Bull', type: 'overstock', message: 'Red Bull exceeds max capacity (60/48)', severity: 'info', createdAt: '2024-01-14T15:00:00Z' },
];

const STATUS_COLORS: Record<string, string> = { ok: 'success', low: 'warning', critical: 'error', overstocked: 'info' };

export const DashboardBarStockDashboard = createPreset<BarStockDashboardProps>({
  name: 'BarStockDashboard.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BarStockDashboardProps>) => {
    const { Box, Text } = primitives;
    const { items: propItems, alerts: propAlerts, onItemSelect, onAlertDismiss, onReorder, className, style } = props;

    const items = propItems && propItems.length > 0 ? propItems : MOCK_ITEMS;
    const alerts = propAlerts && propAlerts.length > 0 ? propAlerts : MOCK_ALERTS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalValue = items.reduce((s, i) => s + i.currentLevel * i.costPerUnit, 0);
    const lowCount = items.filter(i => i.status === 'low' || i.status === 'critical').length;
    const criticalCount = items.filter(i => i.status === 'critical').length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[5] }}>Stock Dashboard</Text>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Items', value: items.length.toString(), color: tokens.colors.neutral[900] },
            { label: 'Inventory Value', value: `$${totalValue.toFixed(0)}`, color: tokens.colors.primaryScale[600] },
            { label: 'Low Stock', value: lowCount.toString(), color: tokens.colors.warningScale[600] },
            { label: 'Critical', value: criticalCount.toString(), color: tokens.colors.errorScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[3] }}>Alerts</Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {alerts.map(alert => {
                const bg = alert.severity === 'critical' ? tokens.colors.errorScale[50] : alert.severity === 'warning' ? tokens.colors.warningScale[50] : tokens.colors.infoScale[50];
                const border = alert.severity === 'critical' ? tokens.colors.errorScale[200] : alert.severity === 'warning' ? tokens.colors.warningScale[200] : tokens.colors.infoScale[200];
                return (
                  <div key={alert.id} style={{ padding: tokens.spacing[3], backgroundColor: bg, border: `1px solid ${border}`, borderRadius: tokens.borderRadius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{alert.message}</Text>
                    <button onClick={() => onAlertDismiss?.(alert.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: 'transparent', color: tokens.colors.neutral[500], border: 'none', cursor: 'pointer', fontSize: tokens.typography.fontSize.xs, fontFamily: 'inherit' }}>Dismiss</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Table */}
        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['Item', 'Category', 'Level', 'Min/Max', 'Status', 'Value', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const pct = Math.min((item.currentLevel / item.maxLevel) * 100, 100);
                return (
                  <tr key={item.id} onClick={() => onItemSelect?.(item.id)} style={{ cursor: 'pointer', borderBottom: idx < items.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{item.name}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{item.category}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{item.currentLevel} {item.unit}</Text>
                      <div style={{ ...createProgressBarStyle(tokens, { percent: pct }).track, marginTop: 4 }}><div style={createProgressBarStyle(tokens, { percent: pct }).fill} /></div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.minLevel} / {item.maxLevel}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><span style={createBadgeStyle(tokens, STATUS_COLORS[item.status] as any)}>{item.status}</span></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>${(item.currentLevel * item.costPerUnit).toFixed(2)}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                      {(item.status === 'low' || item.status === 'critical') && (
                        <button onClick={(e) => { e.stopPropagation(); onReorder?.(item.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Reorder</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
