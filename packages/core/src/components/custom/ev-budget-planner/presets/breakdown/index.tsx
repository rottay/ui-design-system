'use client';

/**
 * EvBudgetPlanner - Breakdown Preset
 * Detailed category breakdown with expandable subcategories and visual allocation bars
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

export const BreakdownEvBudgetPlanner = createPreset<EvBudgetPlannerProps>({
  name: 'EvBudgetPlanner.Breakdown',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvBudgetPlannerProps>) => {
    const { Box, Text } = primitives;
    const { categories: propCategories, summary, onCategoryClick, onEditBudget, className, style } = props;

    const categories = propCategories && propCategories.length > 0 ? propCategories : MOCK_CATEGORIES;

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'variance' | 'actual'>('variance');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalPlanned = useMemo(() => categories.reduce((s, c) => s + c.planned, 0), [categories]);
    const totalActual = useMemo(() => categories.reduce((s, c) => s + c.actual, 0), [categories]);

    const filteredAndSorted = useMemo(() => {
      let result = categories.filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (sortBy === 'variance') result = [...result].sort((a, b) => Math.abs(b.actual - b.planned) - Math.abs(a.actual - a.planned));
      else if (sortBy === 'actual') result = [...result].sort((a, b) => b.actual - a.actual);
      else result = [...result].sort((a, b) => a.name.localeCompare(b.name));
      return result;
    }, [categories, searchTerm, sortBy]);

    const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

    const getAllocationPct = (amount: number) => Math.round((amount / totalPlanned) * 100);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Budget Breakdown
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Detailed category-level allocation analysis
            </Text>
          </div>
        </div>

        {/* Total Budget Bar */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Total Budget Utilization</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{formatCurrency(totalActual)} / {formatCurrency(totalPlanned)}</Text>
          </div>
          {/* Stacked allocation bar */}
          <div style={{ display: 'flex', height: 28, borderRadius: tokens.borderRadius.md, overflow: 'hidden' as const, backgroundColor: tokens.colors.neutral[200] }}>
            {categories.map(cat => {
              const width = (cat.actual / totalPlanned) * 100;
              return (
                <div key={cat.id} title={`${cat.name}: ${formatCurrency(cat.actual)}`} style={{ width: `${width}%`, backgroundColor: cat.color, transition: 'width 0.3s ease', minWidth: width > 0 ? 2 : 0 }} />
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[3], marginTop: tokens.spacing[3] }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: cat.color }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{cat.name} ({getAllocationPct(cat.actual)}%)</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Sort */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {(['variance', 'actual', 'name'] as const).map(s => (
                <div key={s} onClick={() => setSortBy(s)} style={createFilterPillStyle(tokens, { active: sortBy === s })}>
                  {s === 'variance' ? '\u2195\uFE0F Variance' : s === 'actual' ? '\uD83D\uDCB0 Spend' : '\uD83D\uDD24 Name'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown Cards */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
          {filteredAndSorted.map(cat => {
            const variance = cat.actual - cat.planned;
            const variancePct = (variance / cat.planned) * 100;
            const spendPct = Math.min(Math.round((cat.actual / cat.planned) * 100), 150);
            const isOver = cat.actual > cat.planned;
            const isExpanded = expandedId === cat.id;
            const isHovered = hoveredRow === cat.id;
            const progressBar = createProgressBarStyle(tokens, { percent: Math.min(spendPct, 100), color: isOver ? tokens.colors.errorScale[500] : tokens.colors.successScale[500] });

            return (
              <div key={cat.id} style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, ...(isHovered ? getHoverTransform(tokens) : {}) }}>
                {/* Main row */}
                <div onClick={() => { setExpandedId(isExpanded ? null : cat.id); onCategoryClick?.(cat.id); }} onMouseEnter={() => setHoveredRow(cat.id)} onMouseLeave={() => setHoveredRow(null)} style={{ display: 'grid', gridTemplateColumns: '12px 2fr 1fr 1fr 1fr 120px', gap: tokens.spacing[3], padding: tokens.spacing[4], alignItems: 'center', cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white, transition: 'background-color 0.15s ease' }}>
                  <div style={{ width: 12, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: cat.color }} />
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{cat.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{getAllocationPct(cat.planned)}% of total budget {cat.subcategories ? `\u00B7 ${cat.subcategories.length} items` : ''}</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{formatCurrency(cat.planned)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{formatCurrency(cat.actual)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: isOver ? tokens.colors.errorScale[600] : tokens.colors.successScale[600] }}>
                    {variance > 0 ? '+' : ''}{formatCurrency(variance)} ({variancePct > 0 ? '+' : ''}{variancePct.toFixed(1)}%)
                  </Text>
                  <div>
                    <div style={progressBar.track}><div style={progressBar.fill} /></div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>{spendPct}%</Text>
                  </div>
                </div>

                {/* Expanded subcategories */}
                {isExpanded && cat.subcategories && (
                  <div style={{ padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.neutral[50], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    <div style={{ paddingTop: tokens.spacing[3] }}>
                      {cat.subcategories.map((sub, i) => {
                        const subVar = sub.actual - sub.planned;
                        const subPct = Math.min(Math.round((sub.actual / sub.planned) * 100), 150);
                        const subProgress = createProgressBarStyle(tokens, { percent: Math.min(subPct, 100), color: subVar > 0 ? tokens.colors.errorScale[400] : tokens.colors.successScale[400] });
                        return (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 120px', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px 0`, borderBottom: i < cat.subcategories!.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none', alignItems: 'center', marginLeft: tokens.spacing[6] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{sub.name}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{formatCurrency(sub.planned)}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{formatCurrency(sub.actual)}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: subVar > 0 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600] }}>
                              {subVar > 0 ? '+' : ''}{formatCurrency(subVar)}
                            </Text>
                            <div>
                              <div style={subProgress.track}><div style={subProgress.fill} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredAndSorted.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCB8'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No categories found</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search</Text>
          </div>
        )}

        {/* Summary Footer */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Biggest Overspend', value: (() => { const o = [...categories].sort((a, b) => (b.actual - b.planned) - (a.actual - a.planned))[0]; return o ? `${o.name} (+${formatCurrency(o.actual - o.planned)})` : 'None'; })(), icon: '\uD83D\uDD3A' },
            { label: 'Most Saved', value: (() => { const u = [...categories].sort((a, b) => (a.actual - a.planned) - (b.actual - b.planned))[0]; return u ? `${u.name} (${formatCurrency(u.actual - u.planned)})` : 'None'; })(), icon: '\uD83D\uDD3D' },
            { label: 'Total Variance', value: `${formatCurrency(totalActual - totalPlanned)}`, icon: '\uD83D\uDCCA' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const, flex: 1 }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.icon}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
