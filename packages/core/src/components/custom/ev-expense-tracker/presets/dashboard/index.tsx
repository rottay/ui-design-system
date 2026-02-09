'use client';

/**
 * EvExpenseTracker - Dashboard Preset
 * Category breakdown visualization, pending approvals, monthly trend bars,
 * top vendors, status distribution, submitter breakdown, recent expense feed
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { EvExpenseTrackerProps, Expense, ExpenseCategory } from '../../core';

const MOCK_EXPENSES: Expense[] = [
  { id: 'ex1', description: 'DJ Equipment Rental', category: 'Production', amount: 3500, currency: 'USD', date: new Date('2026-02-06'), vendor: 'ProSound MX', status: 'approved', submittedBy: 'Carlos R.', receiptUrl: '/receipts/1.pdf' },
  { id: 'ex2', description: 'Security Uniforms', category: 'Security', amount: 1200, currency: 'USD', date: new Date('2026-02-07'), vendor: 'UniSafe Corp', status: 'pending', submittedBy: 'Maria S.' },
  { id: 'ex3', description: 'Promotional Flyers', category: 'Marketing', amount: 450, currency: 'USD', date: new Date('2026-02-05'), vendor: 'QuickPrint', status: 'paid', submittedBy: 'Ana L.', receiptUrl: '/receipts/3.pdf' },
  { id: 'ex4', description: 'Bar Stock - Premium Spirits', category: 'F&B', amount: 2800, currency: 'USD', date: new Date('2026-02-08'), vendor: 'BevDistributors', status: 'pending', submittedBy: 'Diego M.', receiptUrl: '/receipts/4.pdf' },
  { id: 'ex5', description: 'Stage Lighting Gels', category: 'Production', amount: 680, currency: 'USD', date: new Date('2026-02-04'), vendor: 'LightFX', status: 'rejected', submittedBy: 'Laura P.' },
  { id: 'ex6', description: 'First Aid Supplies', category: 'Safety', amount: 320, currency: 'USD', date: new Date('2026-02-07'), vendor: 'MedSupply Co', status: 'approved', submittedBy: 'Roberto G.', receiptUrl: '/receipts/6.pdf' },
  { id: 'ex7', description: 'Social Media Ads', category: 'Marketing', amount: 1500, currency: 'USD', date: new Date('2026-02-03'), vendor: 'Meta Ads', status: 'paid', submittedBy: 'Ana L.' },
  { id: 'ex8', description: 'Portable Generators', category: 'Production', amount: 2200, currency: 'USD', date: new Date('2026-02-08'), vendor: 'PowerRent', status: 'pending', submittedBy: 'Carlos R.', receiptUrl: '/receipts/8.pdf' },
  { id: 'ex9', description: 'Ice Delivery', category: 'F&B', amount: 180, currency: 'USD', date: new Date('2026-02-06'), vendor: 'IceMasters', status: 'paid', submittedBy: 'Diego M.' },
  { id: 'ex10', description: 'Wristbands & Lanyards', category: 'Operations', amount: 750, currency: 'USD', date: new Date('2026-02-02'), vendor: 'EventGear', status: 'approved', submittedBy: 'Laura P.', receiptUrl: '/receipts/10.pdf' },
];

const MOCK_CATEGORIES: ExpenseCategory[] = [
  { name: 'Production', total: 6380, percentage: 45, color: '#6366f1' },
  { name: 'F&B', total: 2980, percentage: 21, color: '#10b981' },
  { name: 'Marketing', total: 1950, percentage: 14, color: '#f59e0b' },
  { name: 'Security', total: 1200, percentage: 8, color: '#ef4444' },
  { name: 'Operations', total: 750, percentage: 5, color: '#8b5cf6' },
  { name: 'Safety', total: 320, percentage: 2, color: '#06b6d4' },
];

const MONTHLY_TREND = [
  { month: 'Sep', amount: 4200 },
  { month: 'Oct', amount: 6800 },
  { month: 'Nov', amount: 5100 },
  { month: 'Dec', amount: 8900 },
  { month: 'Jan', amount: 11200 },
  { month: 'Feb', amount: 13580 },
];

export const DashboardEvExpenseTracker = createPreset<EvExpenseTrackerProps>({
  name: 'EvExpenseTracker.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvExpenseTrackerProps>) => {
    const { Box, Text } = primitives;
    const { expenses, categories, onApprove, onReject, onExpenseClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const data = expenses?.length ? expenses : MOCK_EXPENSES;
    const cats = categories?.length ? categories : MOCK_CATEGORIES;
    const totalSpent = data.reduce((s, e) => s + e.amount, 0);
    const pending = data.filter(e => e.status === 'pending');
    const maxCat = Math.max(...cats.map(c => c.total), 1);
    const maxTrend = Math.max(...MONTHLY_TREND.map(m => m.amount), 1);
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    // Top vendors
    const vendorTotals = useMemo(() => {
      const map: Record<string, number> = {};
      data.forEach(e => { map[e.vendor] = (map[e.vendor] || 0) + e.amount; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [data]);

    // Submitter breakdown
    const submitterTotals = useMemo(() => {
      const map: Record<string, { count: number; total: number }> = {};
      data.forEach(e => {
        if (!map[e.submittedBy]) map[e.submittedBy] = { count: 0, total: 0 };
        map[e.submittedBy].count++;
        map[e.submittedBy].total += e.amount;
      });
      return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [data]);

    // Status distribution
    const statusCounts = useMemo(() => ({
      pending: data.filter(e => e.status === 'pending').length,
      approved: data.filter(e => e.status === 'approved').length,
      paid: data.filter(e => e.status === 'paid').length,
      rejected: data.filter(e => e.status === 'rejected').length,
    }), [data]);

    const statusColors: Record<string, string> = {
      pending: tokens.colors.warningScale[500],
      approved: tokens.colors.successScale[500],
      paid: tokens.colors.infoScale[500],
      rejected: tokens.colors.errorScale[500],
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
            Expense Dashboard
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{data.length} expenses tracked | {cats.length} categories</Text>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, bg: tokens.colors.primaryScale[50], accent: tokens.colors.primaryScale[600] },
            { label: 'Pending Approval', value: `$${pending.reduce((s, e) => s + e.amount, 0).toLocaleString()}`, bg: tokens.colors.warningScale[50], accent: tokens.colors.warningScale[600] },
            { label: 'Avg per Expense', value: `$${Math.round(totalSpent / Math.max(data.length, 1)).toLocaleString()}`, bg: tokens.colors.infoScale[50], accent: tokens.colors.infoScale[600] },
            { label: 'With Receipt', value: `${data.filter(e => e.receiptUrl).length}/${data.length}`, bg: tokens.colors.successScale[50], accent: tokens.colors.successScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' as const, borderTop: `3px solid ${kpi.accent}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.accent, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Monthly Trend + Status Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Monthly Spending Trend</Text>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[2], height: 160 }}>
              {MONTHLY_TREND.map(m => {
                const h = Math.round((m.amount / maxTrend) * 140);
                const isHovered = hoveredBar === m.month;
                return (
                  <div key={m.month} onMouseEnter={() => setHoveredBar(m.month)} onMouseLeave={() => setHoveredBar(null)} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Text style={{ fontSize: 9, color: isHovered ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500], fontWeight: isHovered ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.normal, whiteSpace: 'nowrap' as const }}>${(m.amount / 1000).toFixed(1)}K</Text>
                    <div style={{ width: '100%', height: h, borderRadius: `${tokens.borderRadius.sm}px ${tokens.borderRadius.sm}px 0 0`, backgroundColor: isHovered ? tokens.colors.primaryScale[600] : tokens.colors.primaryScale[300], transition: 'height 0.3s ease, background-color 0.15s ease' }} />
                    <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>{m.month}</Text>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Status Distribution</Text>
            {Object.entries(statusCounts).map(([key, count]) => {
              const pct = Math.round((count / data.length) * 100);
              const bar = createProgressBarStyle(tokens, { percent: pct, color: statusColors[key] });
              return (
                <div key={key} style={{ marginBottom: tokens.spacing[3] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: statusColors[key] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], textTransform: 'capitalize' as const }}>{key}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{count} ({pct}%)</Text>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* Category Breakdown */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Category Breakdown</Text>
            {cats.map(cat => {
              const bar = createProgressBarStyle(tokens, { percent: Math.round((cat.total / maxCat) * 100), color: cat.color });
              return (
                <div key={cat.name} style={{ marginBottom: tokens.spacing[3] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: cat.color }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{cat.name}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${cat.total.toLocaleString()} ({cat.percentage}%)</Text>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                </div>
              );
            })}
          </div>

          {/* Top Vendors + Submitters */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Top Vendors</Text>
              {vendorTotals.map(([vendor, total], i) => (
                <div key={vendor} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderBottom: i < vendorTotals.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: tokens.typography.fontWeight.bold as number, color: tokens.colors.primaryScale[700] }}>{i + 1}</div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{vendor}</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${total.toLocaleString()}</Text>
                </div>
              ))}
            </div>

            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>By Submitter</Text>
              {submitterTotals.map(([name, info], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderBottom: i < submitterTotals.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.infoScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: tokens.typography.fontWeight.bold as number, color: tokens.colors.infoScale[700] }}>{name.split(' ').map(n => n[0]).join('')}</div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{name}</Text>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>${info.total.toLocaleString()}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{info.count} expenses</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.warningScale[50], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700] }}>Pending Approvals ({pending.length})</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[700] }}>${pending.reduce((s, e) => s + e.amount, 0).toLocaleString()}</Text>
          </div>
          {pending.map((exp, i) => (
            <div key={exp.id} onClick={() => onExpenseClick?.(exp.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < pending.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', cursor: 'pointer', transition: 'background-color 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50]; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{exp.description}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{exp.vendor} | {exp.category} | Submitted by {exp.submittedBy}</Text>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginRight: tokens.spacing[3] }}>${exp.amount.toLocaleString()}</Text>
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                <button onClick={e => { e.stopPropagation(); onApprove?.(exp.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>Approve</button>
                <button onClick={e => { e.stopPropagation(); onReject?.(exp.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No pending approvals</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
