'use client';

/**
 * EvBudgetPlanner - Overview Preset
 * Full budget dashboard with KPI cards, category allocation bars, variance indicators
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
import type { EvBudgetPlannerProps, BudgetCategory } from '../../core';

const MOCK_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Venue & Production', planned: 45000, actual: 42300, currency: 'USD', color: '#6366f1', subcategories: [{ name: 'Venue Rental', planned: 25000, actual: 24000 }, { name: 'Stage & Lighting', planned: 12000, actual: 11800 }, { name: 'Sound Equipment', planned: 8000, actual: 6500 }] },
  { id: '2', name: 'Artist Fees', planned: 35000, actual: 38500, currency: 'USD', color: '#ec4899', subcategories: [{ name: 'Headliner', planned: 20000, actual: 22000 }, { name: 'Support Acts', planned: 15000, actual: 16500 }] },
  { id: '3', name: 'Marketing & Promo', planned: 15000, actual: 13200, currency: 'USD', color: '#f59e0b', subcategories: [{ name: 'Digital Ads', planned: 8000, actual: 7200 }, { name: 'Print & Flyers', planned: 4000, actual: 3500 }, { name: 'PR Agency', planned: 3000, actual: 2500 }] },
  { id: '4', name: 'Food & Beverage', planned: 12000, actual: 11800, currency: 'USD', color: '#10b981', subcategories: [{ name: 'Bar Stock', planned: 7000, actual: 6900 }, { name: 'Food Vendors', planned: 5000, actual: 4900 }] },
  { id: '5', name: 'Security & Safety', planned: 8000, actual: 7600, currency: 'USD', color: '#ef4444', subcategories: [{ name: 'Security Staff', planned: 5000, actual: 4800 }, { name: 'First Aid', planned: 3000, actual: 2800 }] },
  { id: '6', name: 'Staffing & Operations', planned: 10000, actual: 9400, currency: 'USD', color: '#8b5cf6', subcategories: [{ name: 'Event Staff', planned: 6000, actual: 5600 }, { name: 'Equipment Hire', planned: 4000, actual: 3800 }] },
  { id: '7', name: 'Insurance & Permits', planned: 5000, actual: 5000, currency: 'USD', color: '#06b6d4' },
  { id: '8', name: 'Contingency', planned: 8000, actual: 2200, currency: 'USD', color: '#64748b' },
];

const HEALTH_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; label: string }> = {
  under: { color: 'success', label: 'Under Budget' },
  on_track: { color: 'info' as 'success', label: 'On Track' },
  over: { color: 'error', label: 'Over Budget' },
};

export const OverviewEvBudgetPlanner = createPreset<EvBudgetPlannerProps>({
  name: 'EvBudgetPlanner.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvBudgetPlannerProps>) => {
    const { Box, Text } = primitives;
    const { categories: propCategories, summary, onCategoryClick, onEditBudget, className, style } = props;

    const categories = propCategories && propCategories.length > 0 ? propCategories : MOCK_CATEGORIES;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totals = useMemo(() => {
      const totalPlanned = categories.reduce((s, c) => s + c.planned, 0);
      const totalActual = categories.reduce((s, c) => s + c.actual, 0);
      return { totalPlanned, totalActual, remaining: totalPlanned - totalActual, variance: ((totalActual - totalPlanned) / totalPlanned) * 100 };
    }, [categories]);

    const filteredCategories = useMemo(() => {
      return categories.filter(cat => {
        if (searchTerm && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeFilter === 'over' && cat.actual <= cat.planned) return false;
        if (activeFilter === 'under' && cat.actual >= cat.planned) return false;
        if (activeFilter === 'on_track' && Math.abs(cat.actual - cat.planned) / cat.planned > 0.05) return false;
        return true;
      });
    }, [categories, searchTerm, activeFilter]);

    const formatCurrency = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
      return `$${n.toLocaleString()}`;
    };

    const getVarianceColor = (planned: number, actual: number) => {
      const pct = ((actual - planned) / planned) * 100;
      if (pct > 5) return tokens.colors.errorScale[600];
      if (pct < -5) return tokens.colors.successScale[600];
      return tokens.colors.warningScale[600];
    };

    const getHealthStatus = (planned: number, actual: number) => {
      const pct = ((actual - planned) / planned) * 100;
      if (pct > 5) return 'over';
      if (pct < -5) return 'under';
      return 'on_track';
    };

    const filters = ['over', 'under', 'on_track'];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Budget Overview
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredCategories.length} of {categories.length} categories shown
            </Text>
          </div>
          <div onClick={onEditBudget ? () => onEditBudget('', 0) : undefined} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
            + Adjust Budget
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Budget', value: formatCurrency(totals.totalPlanned), icon: '\uD83D\uDCB0', bg: tokens.colors.primaryScale[50], accent: tokens.colors.primaryScale[600] },
            { label: 'Total Spent', value: formatCurrency(totals.totalActual), icon: '\uD83D\uDCB3', bg: tokens.colors.warningScale[50], accent: tokens.colors.warningScale[600] },
            { label: 'Remaining', value: formatCurrency(totals.remaining), icon: '\uD83D\uDCCA', bg: totals.remaining >= 0 ? tokens.colors.successScale[50] : tokens.colors.errorScale[50], accent: totals.remaining >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] },
            { label: 'Variance', value: `${totals.variance > 0 ? '+' : ''}${totals.variance.toFixed(1)}%`, icon: '\uD83D\uDCC8', bg: totals.variance > 5 ? tokens.colors.errorScale[50] : tokens.colors.successScale[50], accent: totals.variance > 5 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600] },
          ].map((kpi, i) => (
            <div key={i} style={{ ...cardBase, padding: tokens.spacing[4], borderLeft: `3px solid ${kpi.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{kpi.label}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.accent }}>{kpi.value}</Text>
                </div>
                <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{kpi.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All</div>
              {filters.map(f => (
                <div key={f} onClick={() => setActiveFilter(activeFilter === f ? null : f)} style={createFilterPillStyle(tokens, { active: activeFilter === f })}>
                  {f === 'over' ? '\u26A0\uFE0F Over' : f === 'under' ? '\u2705 Under' : '\u2696\uFE0F On Track'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[5] }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[100], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            {['Category', 'Planned', 'Actual', 'Variance', 'Progress', 'Status'].map(h => (
              <Text key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</Text>
            ))}
          </div>
          {/* Table rows */}
          {filteredCategories.map(cat => {
            const variance = cat.actual - cat.planned;
            const variancePct = (variance / cat.planned) * 100;
            const spendPct = Math.min(Math.round((cat.actual / cat.planned) * 100), 150);
            const progressColor = spendPct > 100 ? tokens.colors.errorScale[500] : spendPct > 85 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500];
            const progressBar = createProgressBarStyle(tokens, { percent: Math.min(spendPct, 100), color: progressColor });
            const health = getHealthStatus(cat.planned, cat.actual);
            const isHovered = hoveredRow === cat.id;

            return (
              <div key={cat.id} onClick={() => onCategoryClick?.(cat.id)} onMouseEnter={() => setHoveredRow(cat.id)} onMouseLeave={() => setHoveredRow(null)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white, transition: 'background-color 0.15s ease', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <div style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: cat.color }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{cat.name}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>${cat.planned.toLocaleString()}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${cat.actual.toLocaleString()}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: getVarianceColor(cat.planned, cat.actual) }}>
                  {variance > 0 ? '+' : ''}{formatCurrency(variance)} ({variancePct > 0 ? '+' : ''}{variancePct.toFixed(1)}%)
                </Text>
                <div>
                  <div style={progressBar.track}><div style={progressBar.fill} /></div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>{spendPct}% spent</Text>
                </div>
                <span style={createBadgeStyle(tokens, health === 'over' ? 'error' : health === 'under' ? 'success' : 'warning')}>
                  {health === 'over' ? 'Over' : health === 'under' ? 'Under' : 'On Track'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCB8'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No categories match your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
          </div>
        )}

        {/* Summary Bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Categories', value: categories.length.toString(), icon: '\uD83D\uDDC2\uFE0F' },
            { label: 'Over Budget', value: categories.filter(c => c.actual > c.planned).length.toString(), icon: '\u26A0\uFE0F' },
            { label: 'Under Budget', value: categories.filter(c => c.actual < c.planned).length.toString(), icon: '\u2705' },
            { label: 'Utilization', value: `${Math.round((totals.totalActual / totals.totalPlanned) * 100)}%`, icon: '\uD83D\uDCCA' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.icon}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
