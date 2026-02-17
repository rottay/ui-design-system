'use client';

/**
 * EvInventoryTracker - Overview Preset
 * Alert cards (low stock/expiring), color-coded stock bars, recent movements feed,
 * search/filter, category breakdown, location summary, empty state
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createHoverStyle,
  createFilterPillStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvInventoryTrackerProps, StockItem, StockAlert, StockMovement } from '../../core';

const MOCK_ITEMS: StockItem[] = [
  { id: 'i1', name: 'Heineken Kegs', sku: 'KEG-001', category: 'Beer', currentLevel: 8, reorderPoint: 5, unit: 'kegs', location: 'Walk-in Cooler', lastCounted: new Date(Date.now() - 86400000) },
  { id: 'i2', name: 'Corona Bottles', sku: 'BOT-001', category: 'Beer', currentLevel: 48, reorderPoint: 24, unit: 'bottles', location: 'Bar Fridge', lastCounted: new Date(Date.now() - 43200000) },
  { id: 'i3', name: 'Lime', sku: 'FRU-001', category: 'Garnish', currentLevel: 12, reorderPoint: 20, unit: 'pcs', location: 'Bar Counter', lastCounted: new Date(Date.now() - 7200000), expiryDate: new Date(Date.now() + 172800000) },
  { id: 'i4', name: 'Tequila Silver', sku: 'SPI-001', category: 'Spirits', currentLevel: 6, reorderPoint: 3, unit: 'bottles', location: 'Back Bar', lastCounted: new Date(Date.now() - 172800000) },
  { id: 'i5', name: 'Rum White', sku: 'SPI-002', category: 'Spirits', currentLevel: 2, reorderPoint: 4, unit: 'bottles', location: 'Back Bar', lastCounted: new Date(Date.now() - 3600000) },
  { id: 'i6', name: 'Orange Juice', sku: 'MIX-001', category: 'Mixers', currentLevel: 3, reorderPoint: 6, unit: 'cartons', location: 'Walk-in Cooler', lastCounted: new Date(Date.now() - 14400000), expiryDate: new Date(Date.now() + 86400000) },
  { id: 'i7', name: 'Simple Syrup', sku: 'MIX-002', category: 'Mixers', currentLevel: 10, reorderPoint: 4, unit: 'bottles', location: 'Bar Counter', lastCounted: new Date(Date.now() - 259200000) },
  { id: 'i8', name: 'Mint Leaves', sku: 'GAR-001', category: 'Garnish', currentLevel: 3, reorderPoint: 5, unit: 'bunches', location: 'Bar Fridge', lastCounted: new Date(Date.now() - 3600000), expiryDate: new Date(Date.now() + 43200000) },
  { id: 'i9', name: 'Vodka Premium', sku: 'SPI-003', category: 'Spirits', currentLevel: 9, reorderPoint: 3, unit: 'bottles', location: 'Back Bar', lastCounted: new Date(Date.now() - 86400000) },
  { id: 'i10', name: 'Nachos Chips', sku: 'FOO-001', category: 'Food', currentLevel: 25, reorderPoint: 10, unit: 'bags', location: 'Dry Storage', lastCounted: new Date(Date.now() - 172800000) },
];

const MOCK_ALERTS: StockAlert[] = [
  { id: 'a1', itemName: 'Rum White', type: 'low_stock', severity: 'high', currentLevel: 2, threshold: 4 },
  { id: 'a2', itemName: 'Orange Juice', type: 'low_stock', severity: 'high', currentLevel: 3, threshold: 6 },
  { id: 'a3', itemName: 'Mint Leaves', type: 'expiring', severity: 'medium', currentLevel: 3, threshold: 5 },
  { id: 'a4', itemName: 'Lime', type: 'low_stock', severity: 'medium', currentLevel: 12, threshold: 20 },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'mv1', itemName: 'Heineken Kegs', type: 'receipt', quantity: 10, date: new Date(Date.now() - 3600000), reference: 'PO-2024-042' },
  { id: 'mv2', itemName: 'Corona Bottles', type: 'sale', quantity: -24, date: new Date(Date.now() - 7200000) },
  { id: 'mv3', itemName: 'Tequila Silver', type: 'sale', quantity: -2, date: new Date(Date.now() - 14400000) },
  { id: 'mv4', itemName: 'Nachos Chips', type: 'waste', quantity: -3, date: new Date(Date.now() - 28800000), reference: 'Expired batch' },
  { id: 'mv5', itemName: 'Vodka Premium', type: 'transfer', quantity: 4, date: new Date(Date.now() - 43200000), reference: 'From warehouse' },
  { id: 'mv6', itemName: 'Rum White', type: 'sale', quantity: -3, date: new Date(Date.now() - 57600000) },
];

const SEV_COLORS: Record<string, 'error' | 'warning' | 'info'> = { high: 'error', medium: 'warning', low: 'info' };

export const OverviewEvInventoryTracker = createPreset<EvInventoryTrackerProps>({
  name: 'EvInventoryTracker.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvInventoryTrackerProps>) => {
    const { Box, Text } = primitives;
    const { items: rawItems = MOCK_ITEMS, alerts: rawAlerts = MOCK_ALERTS, movements: rawMovements = MOCK_MOVEMENTS, onItemClick, onAlertAcknowledge, className, style } = props;

    const items = Array.isArray(rawItems) ? rawItems : MOCK_ITEMS;
    const alerts = Array.isArray(rawAlerts) ? rawAlerts : MOCK_ALERTS;
    const movements = Array.isArray(rawMovements) ? rawMovements : MOCK_MOVEMENTS;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items]);

    const filteredItems = useMemo(() => {
      return items.filter(i => {
        if (searchTerm && !i.name.toLowerCase().includes(searchTerm.toLowerCase()) && !i.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (categoryFilter && i.category !== categoryFilter) return false;
        return true;
      });
    }, [items, searchTerm, categoryFilter]);

    const lowStock = items.filter(i => i.currentLevel <= i.reorderPoint).length;
    const healthy = items.filter(i => i.currentLevel > i.reorderPoint).length;
    const expiring = items.filter(i => i.expiryDate && i.expiryDate.getTime() - Date.now() < 172800000).length;

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 3600000);
      if (diff < 1) return 'Just now';
      if (diff < 24) return `${diff}h ago`;
      return `${Math.floor(diff / 24)}d ago`;
    };

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
      const map: Record<string, { count: number; lowCount: number }> = {};
      items.forEach(i => {
        if (!map[i.category]) map[i.category] = { count: 0, lowCount: 0 };
        map[i.category].count++;
        if (i.currentLevel <= i.reorderPoint) map[i.category].lowCount++;
      });
      return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
    }, [items]);

    // Location breakdown
    const locationBreakdown = useMemo(() => {
      const map: Record<string, number> = {};
      items.forEach(i => { map[i.location] = (map[i.location] || 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [items]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Inventory Overview</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filteredItems.length} of {items.length} items | {alerts.length} active alerts</Text>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Items', value: items.length.toString(), color: tokens.colors.infoScale[600] },
            { label: 'Healthy', value: healthy.toString(), color: tokens.colors.successScale[600] },
            { label: 'Low Stock', value: lowStock.toString(), color: tokens.colors.warningScale[600] },
            { label: 'Expiring Soon', value: expiring.toString(), color: tokens.colors.errorScale[600] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, textAlign: 'center' as const, padding: tokens.spacing[4], borderTop: `3px solid ${s.color}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <input type="text" placeholder="Search items or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setCategoryFilter(null)} style={createFilterPillStyle(tokens, { active: categoryFilter === null })}>All</div>
              {categories.map(cat => (
                <div key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)} style={createFilterPillStyle(tokens, { active: categoryFilter === cat })}>{cat}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* Alerts */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.errorScale[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700] }}>Active Alerts ({alerts.length})</Text>
            </div>
            {alerts.length === 0 ? (
              <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const }}><Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No active alerts</Text></div>
            ) : alerts.map((alert, idx) => (
              <div key={alert.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < alerts.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{alert.itemName}</Text>
                    <span style={createBadgeStyle(tokens, SEV_COLORS[alert.severity])}>{alert.severity}</span>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{alert.type === 'low_stock' ? 'Low Stock' : 'Expiring'}: {alert.currentLevel} / {alert.threshold}</Text>
                </div>
                <button onClick={() => onAlertAcknowledge?.(alert.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Dismiss</button>
              </div>
            ))}
          </div>

          {/* Recent Movements */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Recent Movements</Text>
            </div>
            {movements.map((mv, idx) => (
              <div key={mv.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < movements.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], display: 'block' }}>{mv.itemName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{mv.type} | {mv.reference || '-'} | {formatTime(mv.date)}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: mv.quantity > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>{mv.quantity > 0 ? '+' : ''}{mv.quantity}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Level Bars */}
        <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>Stock Levels</Text>
          {filteredItems.map((item, idx) => {
            const maxLevel = item.reorderPoint * 3;
            const pct = Math.min(100, (item.currentLevel / maxLevel) * 100);
            const isLow = item.currentLevel <= item.reorderPoint;
            const barColor = isLow ? tokens.colors.errorScale[400] : pct > 60 ? tokens.colors.successScale[400] : tokens.colors.warningScale[400];
            const bar = createProgressBarStyle(tokens, { percent: Math.round(pct), color: barColor });
            const isHovered = hoveredItem === item.id;
            return (
              <div key={item.id} onClick={() => onItemClick?.(item.id)} onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)} style={{ marginBottom: idx < filteredItems.length - 1 ? tokens.spacing[3] : 0, cursor: 'pointer', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: isHovered ? tokens.colors.neutral[100] : 'transparent', transition: 'background-color 0.15s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{item.name}</Text>
                    <span style={createBadgeStyle(tokens, isLow ? 'error' : 'success')}>{isLow ? 'Low' : 'OK'}</span>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isLow ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>{item.currentLevel} / {item.reorderPoint} {item.unit}</Text>
                </div>
                <div style={bar.track}><div style={bar.fill} /></div>
              </div>
            );
          })}
        </div>

        {/* Category + Location Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>By Category</Text>
            {categoryBreakdown.map(([cat, info], i) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[2]}px 0`, borderBottom: i < categoryBreakdown.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{cat}</Text>
                <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{info.count}</Text>
                  {info.lowCount > 0 && <span style={createBadgeStyle(tokens, 'warning')}>{info.lowCount} low</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>By Location</Text>
            {locationBreakdown.map(([loc, count], i) => (
              <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[2]}px 0`, borderBottom: i < locationBreakdown.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{loc}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{count} items</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No items match your filters</Text>
          </div>
        )}
      </Box>
    );
  },
});
