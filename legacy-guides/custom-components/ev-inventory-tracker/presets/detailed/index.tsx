'use client';

/**
 * EvInventoryTracker - Detailed Preset
 * Full stock table (item/SKU/level/reorder/location/last counted), movement history,
 * search/filter, category & location breakdowns, expiry alerts, hover states
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createPanelHeaderStyle, createHoverStyle, createFilterPillStyle, createProgressBarStyle, getHoverTransform } from '../../../helpers';
import type { EvInventoryTrackerProps, StockItem, StockMovement } from '../../core';

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

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'mv1', itemName: 'Heineken Kegs', type: 'receipt', quantity: 10, date: new Date(Date.now() - 3600000), reference: 'PO-2024-042' },
  { id: 'mv2', itemName: 'Corona Bottles', type: 'sale', quantity: -24, date: new Date(Date.now() - 7200000) },
  { id: 'mv3', itemName: 'Tequila Silver', type: 'sale', quantity: -2, date: new Date(Date.now() - 14400000) },
  { id: 'mv4', itemName: 'Nachos Chips', type: 'waste', quantity: -3, date: new Date(Date.now() - 28800000), reference: 'Expired batch' },
  { id: 'mv5', itemName: 'Vodka Premium', type: 'transfer', quantity: 4, date: new Date(Date.now() - 43200000), reference: 'From warehouse' },
  { id: 'mv6', itemName: 'Rum White', type: 'sale', quantity: -3, date: new Date(Date.now() - 57600000) },
  { id: 'mv7', itemName: 'Mint Leaves', type: 'receipt', quantity: 8, date: new Date(Date.now() - 86400000), reference: 'PO-2024-041' },
  { id: 'mv8', itemName: 'Simple Syrup', type: 'adjustment', quantity: 2, date: new Date(Date.now() - 172800000), reference: 'Inventory recount' },
  { id: 'mv9', itemName: 'Orange Juice', type: 'receipt', quantity: 6, date: new Date(Date.now() - 259200000), reference: 'PO-2024-040' },
  { id: 'mv10', itemName: 'Lime', type: 'waste', quantity: -5, date: new Date(Date.now() - 345600000), reference: 'Spoiled batch' },
];

const MOVE_COLORS: Record<string, 'success' | 'error' | 'info' | 'warning' | 'primary'> = { receipt: 'success', sale: 'error', transfer: 'info', waste: 'warning', adjustment: 'primary' };
const CATEGORIES = ['All', 'Beer', 'Spirits', 'Mixers', 'Garnish', 'Food'];

export const DetailedEvInventoryTracker = createPreset<EvInventoryTrackerProps>({
  name: 'EvInventoryTracker.Detailed',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvInventoryTrackerProps>) => {
    const { Box, Text } = primitives;
    const { items: rawItems = MOCK_ITEMS, movements: rawMovements = MOCK_MOVEMENTS, onItemClick, className, style } = props;

    const items = Array.isArray(rawItems) ? rawItems : MOCK_ITEMS;
    const movements = Array.isArray(rawMovements) ? rawMovements : MOCK_MOVEMENTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [movementFilter, setMovementFilter] = useState<string>('all');

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);

    const filteredItems = useMemo(() => {
      let result = items;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        result = result.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
      }
      if (categoryFilter !== 'All') result = result.filter(i => i.category === categoryFilter);
      return result;
    }, [items, searchTerm, categoryFilter]);

    const filteredMovements = useMemo(() => {
      if (movementFilter === 'all') return movements;
      return movements.filter(m => m.type === movementFilter);
    }, [movements, movementFilter]);

    const lowStockCount = useMemo(() => items.filter(i => i.currentLevel <= i.reorderPoint).length, [items]);
    const expiringCount = useMemo(() => items.filter(i => i.expiryDate && i.expiryDate.getTime() - Date.now() < 172800000).length, [items]);
    const totalUnits = useMemo(() => items.reduce((s, i) => s + i.currentLevel, 0), [items]);
    const maxLevel = useMemo(() => Math.max(...items.map(i => i.currentLevel), 1), [items]);

    const locationBreakdown = useMemo(() => {
      const map: Record<string, number> = {};
      items.forEach(i => { map[i.location] = (map[i.location] || 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [items]);

    const thStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
    const tdStyle = { padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], borderBottom: `1px solid ${tokens.colors.neutral[100]}` };

    const formatDate = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 3600000);
      if (diff < 1) return 'Just now';
      if (diff < 24) return `${diff}h ago`;
      return `${Math.floor(diff / 24)}d ago`;
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Detailed Inventory</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{items.length} items tracked across {locationBreakdown.length} locations</Text>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Items', value: `${items.length}`, color: tokens.colors.primaryScale[600] },
            { label: 'Total Units', value: `${totalUnits}`, color: tokens.colors.infoScale[600] },
            { label: 'Low Stock', value: `${lowStockCount}`, color: tokens.colors.errorScale[600] },
            { label: 'Expiring Soon', value: `${expiringCount}`, color: tokens.colors.warningScale[600] },
          ].map((kpi, idx) => (
            <div key={idx} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          <input type="text" placeholder="Search by name, SKU, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: 200, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} style={{ ...createFilterPillStyle(tokens, { active: categoryFilter === cat }), cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Full Stock Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden', marginBottom: tokens.spacing[6] }}>
          <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Stock Table ({filteredItems.length})</Text>
            {searchTerm && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Filtered from {items.length}</Text>}
          </div>
          {filteredItems.length === 0 ? (
            <div style={{ padding: tokens.spacing[8], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.neutral[300], display: 'block', marginBottom: tokens.spacing[2] }}>No items found</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter</Text>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Item</th>
                    <th style={thStyle}>SKU</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Stock Level</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Counted</th>
                    <th style={thStyle}>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const isLow = item.currentLevel <= item.reorderPoint;
                    const isExpiring = item.expiryDate && item.expiryDate.getTime() - Date.now() < 172800000;
                    const ratio = item.currentLevel / maxLevel;
                    const isHovered = hoveredRow === item.id;
                    return (
                      <tr key={item.id} onClick={() => onItemClick?.(item.id)} onMouseEnter={() => setHoveredRow(item.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                        <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium }}>{item.name}</td>
                        <td style={{ ...tdStyle, color: tokens.colors.neutral[500], fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs }}>{item.sku}</td>
                        <td style={tdStyle}><span style={createBadgeStyle(tokens, 'primary')}>{item.category}</span></td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: isLow ? tokens.colors.errorScale[600] : tokens.colors.neutral[900], minWidth: 40 }}>{item.currentLevel}</Text>
                            <div style={{ flex: 1, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                              <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: isLow ? tokens.colors.errorScale[400] : tokens.colors.successScale[400], transition: 'width 0.3s ease' }} />
                            </div>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], minWidth: 30 }}>{item.unit}</Text>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={isLow ? createBadgeStyle(tokens, 'error') : createBadgeStyle(tokens, 'success')}>
                            {isLow ? 'Low' : 'OK'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: tokens.typography.fontSize.xs }}>{item.location}</td>
                        <td style={{ ...tdStyle, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatDate(item.lastCounted)}</td>
                        <td style={tdStyle}>
                          {item.expiryDate ? (
                            <span style={isExpiring ? createBadgeStyle(tokens, 'warning') : createBadgeStyle(tokens, 'info')}>
                              {Math.ceil((item.expiryDate.getTime() - Date.now()) / 86400000)}d
                            </span>
                          ) : (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300] }}>-</Text>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[5] }}>
          {/* Movement History */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
            <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Movement History</Text>
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {['all', 'receipt', 'sale', 'waste', 'transfer'].map(f => (
                  <button key={f} onClick={() => setMovementFilter(f)} style={{ ...createFilterPillStyle(tokens, { active: movementFilter === f }), cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Item</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Reference</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map(mv => (
                  <tr key={mv.id}>
                    <td style={tdStyle}>
                      <span style={createBadgeStyle(tokens, MOVE_COLORS[mv.type] || 'primary')}>
                        {mv.type}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium }}>{mv.itemName}</td>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, color: mv.quantity > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                      {mv.quantity > 0 ? '+' : ''}{mv.quantity}
                    </td>
                    <td style={{ ...tdStyle, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{mv.reference || '-'}</td>
                    <td style={{ ...tdStyle, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatDate(mv.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Location Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>By Location</Text></div>
              <div style={{ padding: tokens.spacing[3] }}>
                {locationBreakdown.map(([loc, count], idx) => {
                  const locMax = Math.max(...locationBreakdown.map(l => l[1]));
                  return (
                    <div key={loc} style={{ marginBottom: idx < locationBreakdown.length - 1 ? tokens.spacing[3] : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{loc}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{count}</Text>
                      </div>
                      {(() => { const pb = createProgressBarStyle(tokens, { percent: Math.round((count / locMax) * 100), color: tokens.colors.infoScale[500] }); return <div style={pb.track}><div style={pb.fill} /></div>; })()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expiry Alerts */}
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Expiry Alerts</Text></div>
              <div style={{ padding: tokens.spacing[3] }}>
                {items.filter(i => i.expiryDate).length === 0 ? (
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], padding: tokens.spacing[3], display: 'block', textAlign: 'center' as const }}>No expiry dates tracked</Text>
                ) : (
                  items.filter(i => i.expiryDate).sort((a, b) => (a.expiryDate?.getTime() || 0) - (b.expiryDate?.getTime() || 0)).map((item, idx) => {
                    const daysLeft = Math.ceil(((item.expiryDate?.getTime() || 0) - Date.now()) / 86400000);
                    const isUrgent = daysLeft <= 2;
                    return (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[2]}px 0`, borderBottom: idx < items.filter(i => i.expiryDate).length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none' }}>
                        <div>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>{item.name}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{item.currentLevel} {item.unit}</Text>
                        </div>
                        <span style={createBadgeStyle(tokens, isUrgent ? 'error' : 'warning')}>{daysLeft}d left</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], padding: tokens.spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.infoScale[50]})` }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Showing {filteredItems.length} of {items.length} items</Text>
          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Locations: <strong>{locationBreakdown.length}</strong></Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Movements: <strong>{filteredMovements.length}</strong></Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600], fontWeight: tokens.typography.fontWeight.bold }}>{lowStockCount} need reorder</Text>
          </div>
        </div>
      </Box>
    );
  },
});
