'use client';

/**
 * EvSupplierHub - Directory Preset
 * Supplier cards with name, contact info, rating stars, order count, total spent,
 * status badges, search/filter, KPI stats, and category breakdown
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvSupplierHubProps, Supplier } from '../../core';

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'BevCo Distributors', contactName: 'Maria Garcia', email: 'maria@bevco.com', phone: '+1 555-0101', status: 'active', rating: 4.8, orderCount: 45, totalSpent: 28500 },
  { id: 's2', name: 'FreshFarm Produce', contactName: 'Tom Wilson', email: 'tom@freshfarm.com', phone: '+1 555-0202', status: 'active', rating: 4.5, orderCount: 32, totalSpent: 12800 },
  { id: 's3', name: 'Spirit World Imports', contactName: 'James Chen', email: 'james@spiritworld.com', phone: '+1 555-0303', status: 'active', rating: 4.2, orderCount: 18, totalSpent: 35200 },
  { id: 's4', name: 'BarSupply Pro', contactName: 'Sarah Johnson', email: 'sarah@barsupply.com', phone: '+1 555-0404', status: 'inactive', rating: 3.8, orderCount: 8, totalSpent: 4500 },
  { id: 's5', name: 'CleanTech Services', contactName: 'Roberto Diaz', email: 'rob@cleantech.com', phone: '+1 555-0505', status: 'active', rating: 4.0, orderCount: 22, totalSpent: 9200 },
  { id: 's6', name: 'ProSound Equipment', contactName: 'Alex Kim', email: 'alex@prosound.com', phone: '+1 555-0606', status: 'suspended', rating: 2.5, orderCount: 3, totalSpent: 6800 },
  { id: 's7', name: 'Ice Masters Ltd', contactName: 'Diana Frost', email: 'diana@icemasters.com', phone: '+1 555-0707', status: 'active', rating: 4.6, orderCount: 38, totalSpent: 8400 },
  { id: 's8', name: 'Napkin & Paper Co', contactName: 'Paul Green', email: 'paul@napkinco.com', phone: '+1 555-0808', status: 'active', rating: 4.1, orderCount: 15, totalSpent: 3200 },
];

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error'> = { active: 'success', inactive: 'warning', suspended: 'error' };

export const DirectoryEvSupplierHub = createPreset<EvSupplierHubProps>({
  name: 'EvSupplierHub.Directory',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvSupplierHubProps>) => {
    const { Box, Text } = primitives;
    const { suppliers, onSupplierClick, onCreateOrder, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = suppliers?.length ? suppliers : MOCK_SUPPLIERS;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return data.filter(s => {
        if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.contactName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter && s.status !== statusFilter) return false;
        return true;
      });
    }, [data, searchTerm, statusFilter]);

    const activeCount = data.filter(s => s.status === 'active').length;
    const totalSpent = data.reduce((s, sup) => s + sup.totalSpent, 0);
    const totalOrders = data.reduce((s, sup) => s + sup.orderCount, 0);
    const avgRating = data.length > 0 ? (data.reduce((s, sup) => s + sup.rating, 0) / data.length).toFixed(1) : '0';
    const maxSpent = Math.max(...data.map(s => s.totalSpent), 1);

    const renderStars = (rating: number) => {
      const full = Math.floor(rating);
      const half = rating - full >= 0.5;
      let stars = '';
      for (let i = 0; i < full; i++) stars += '\u2605';
      if (half) stars += '\u00BD';
      for (let i = full + (half ? 1 : 0); i < 5; i++) stars += '\u2606';
      return stars;
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Supplier Directory</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {data.length} suppliers | {activeCount} active</Text>
          </div>
          <button onClick={onCreateOrder} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Order</button>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Suppliers', value: data.length.toString(), color: tokens.colors.primaryScale[600] },
            { label: 'Total Orders', value: totalOrders.toString(), color: tokens.colors.infoScale[600] },
            { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, color: tokens.colors.successScale[600] },
            { label: 'Avg Rating', value: `${avgRating}/5`, color: tokens.colors.warningScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[4], borderTop: `3px solid ${kpi.color}`, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <input type="text" placeholder="Search suppliers or contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All</div>
              {['active', 'inactive', 'suspended'].map(s => (
                <div key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {filtered.map(supplier => {
            const isHovered = hoveredId === supplier.id;
            const spentPct = Math.round((supplier.totalSpent / maxSpent) * 100);
            const spentBar = createProgressBarStyle(tokens, { percent: spentPct, color: tokens.colors.primaryScale[400] });
            return (
              <div key={supplier.id} onClick={() => onSupplierClick?.(supplier.id)} onMouseEnter={() => setHoveredId(supplier.id)} onMouseLeave={() => setHoveredId(null)} style={{ ...cardBase, padding: tokens.spacing[4], cursor: 'pointer', ...(isHovered ? getHoverTransform(tokens) : {}), transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[3] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                      {supplier.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{supplier.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{supplier.contactName}</Text>
                    </div>
                  </div>
                  <span style={createBadgeStyle(tokens, STATUS_COLORS[supplier.status] || 'warning')}>{supplier.status}</span>
                </div>

                {/* Rating */}
                <div style={{ marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[500] }}>{renderStars(supplier.rating)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>{supplier.rating}/5</Text>
                </div>

                {/* Contact */}
                <div style={{ marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block' }}>{supplier.email}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block' }}>{supplier.phone}</Text>
                </div>

                {/* Spend bar */}
                <div style={{ marginBottom: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total Spend</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${supplier.totalSpent.toLocaleString()}</Text>
                  </div>
                  <div style={spentBar.track}><div style={spentBar.fill} /></div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: tokens.spacing[4], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[3] }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>{supplier.orderCount}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Orders</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${Math.round(supplier.totalSpent / Math.max(supplier.orderCount, 1)).toLocaleString()}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Avg Order</Text>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFE2'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No suppliers match your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search criteria</Text>
          </div>
        )}

        {/* Summary Bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Active', value: activeCount.toString() },
            { label: 'Inactive', value: data.filter(s => s.status === 'inactive').length.toString() },
            { label: 'Suspended', value: data.filter(s => s.status === 'suspended').length.toString() },
            { label: 'Top Supplier', value: [...data].sort((a, b) => b.totalSpent - a.totalSpent)[0]?.name || 'N/A' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
