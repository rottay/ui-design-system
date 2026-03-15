'use client';

/**
 * EvExpenseTracker - List Preset
 * Expense table with description, category, amount, vendor, date, status, submitted by,
 * approve/reject buttons, receipt indicator, search/filter, KPI cards,
 * category summary, vendor breakdown, empty state
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvExpenseTrackerProps, Expense } from '../../core';

const MOCK_EXPENSES: Expense[] = [
  { id: 'ex1', description: 'DJ Equipment Rental', category: 'Production', amount: 3500, currency: 'USD', date: new Date('2026-02-06'), vendor: 'ProSound MX', status: 'approved', submittedBy: 'Carlos R.', receiptUrl: '/receipts/1.pdf' },
  { id: 'ex2', description: 'Security Uniforms', category: 'Security', amount: 1200, currency: 'USD', date: new Date('2026-02-07'), vendor: 'UniSafe Corp', status: 'pending', submittedBy: 'Maria S.' },
  { id: 'ex3', description: 'Promotional Flyers', category: 'Marketing', amount: 450, currency: 'USD', date: new Date('2026-02-05'), vendor: 'QuickPrint', status: 'paid', submittedBy: 'Ana L.', receiptUrl: '/receipts/3.pdf' },
  { id: 'ex4', description: 'Bar Stock - Premium Spirits', category: 'F&B', amount: 2800, currency: 'USD', date: new Date('2026-02-08'), vendor: 'BevDistributors', status: 'pending', submittedBy: 'Diego M.', receiptUrl: '/receipts/4.pdf' },
  { id: 'ex5', description: 'Stage Lighting Gels', category: 'Production', amount: 680, currency: 'USD', date: new Date('2026-02-04'), vendor: 'LightFX', status: 'rejected', submittedBy: 'Laura P.' },
  { id: 'ex6', description: 'First Aid Supplies', category: 'Safety', amount: 320, currency: 'USD', date: new Date('2026-02-07'), vendor: 'MedSupply Co', status: 'approved', submittedBy: 'Roberto G.', receiptUrl: '/receipts/6.pdf' },
  { id: 'ex7', description: 'Social Media Ads', category: 'Marketing', amount: 1500, currency: 'USD', date: new Date('2026-02-03'), vendor: 'Meta Ads', status: 'paid', submittedBy: 'Ana L.' },
  { id: 'ex8', description: 'Portable Generators', category: 'Production', amount: 2200, currency: 'USD', date: new Date('2026-02-08'), vendor: 'PowerRent', status: 'pending', submittedBy: 'Carlos R.', receiptUrl: '/receipts/8.pdf' },
  { id: 'ex9', description: 'Ice & Dry Ice', category: 'F&B', amount: 280, currency: 'USD', date: new Date('2026-02-06'), vendor: 'IceMasters', status: 'paid', submittedBy: 'Diego M.' },
  { id: 'ex10', description: 'Event Insurance', category: 'Operations', amount: 1800, currency: 'USD', date: new Date('2026-02-01'), vendor: 'CoverAll Insurance', status: 'approved', submittedBy: 'Laura P.', receiptUrl: '/receipts/10.pdf' },
];

export const ListEvExpenseTracker = createPreset<EvExpenseTrackerProps>({
  name: 'EvExpenseTracker.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvExpenseTrackerProps>) => {
    const { Box, Text } = primitives;
    const { expenses, onExpenseClick, onApprove, onReject, onUploadReceipt, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const data = expenses?.length ? expenses : MOCK_EXPENSES;
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return data.filter(e => {
        if (activeFilter && e.status !== activeFilter) return false;
        if (searchTerm && !e.description.toLowerCase().includes(searchTerm.toLowerCase()) && !e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) && !e.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      });
    }, [data, activeFilter, searchTerm]);

    const statusMap: Record<string, { badge: 'warning' | 'success' | 'error' | 'info'; label: string }> = {
      pending: { badge: 'warning', label: 'Pending' },
      approved: { badge: 'success', label: 'Approved' },
      rejected: { badge: 'error', label: 'Rejected' },
      paid: { badge: 'info', label: 'Paid' },
    };

    const totalPending = data.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
    const totalApproved = data.filter(e => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0);
    const totalAll = data.reduce((s, e) => s + e.amount, 0);
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
      const map: Record<string, { count: number; total: number }> = {};
      data.forEach(e => {
        if (!map[e.category]) map[e.category] = { count: 0, total: 0 };
        map[e.category].count++;
        map[e.category].total += e.amount;
      });
      return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [data]);

    const maxCatTotal = Math.max(...categoryBreakdown.map(([, d]) => d.total), 1);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Expense Tracker
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {data.length} expenses | {data.filter(e => e.status === 'pending').length} pending approval</Text>
          </div>
          <button onClick={() => onUploadReceipt?.('')} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
            + New Expense
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Expenses', value: `$${totalAll.toLocaleString()}`, color: tokens.colors.primaryScale[600] },
            { label: 'Pending', value: `$${totalPending.toLocaleString()}`, color: tokens.colors.warningScale[600] },
            { label: 'Approved/Paid', value: `$${totalApproved.toLocaleString()}`, color: tokens.colors.successScale[600] },
            { label: 'With Receipt', value: `${data.filter(e => e.receiptUrl).length}/${data.length}`, color: tokens.colors.infoScale[600] },
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
            <input type="text" placeholder="Search expenses, vendors, categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setActiveFilter(null)} style={createFilterPillStyle(tokens, { active: activeFilter === null })}>All</div>
              {['pending', 'approved', 'rejected', 'paid'].map(f => (
                <div key={f} onClick={() => setActiveFilter(activeFilter === f ? null : f)} style={createFilterPillStyle(tokens, { active: activeFilter === f })}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[4] }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Description', 'Category', 'Amount', 'Vendor', 'Date', 'Submitted By', 'Receipt', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => {
                const sm = statusMap[exp.status];
                const isHovered = hoveredRow === exp.id;
                return (
                  <tr key={exp.id} onClick={() => onExpenseClick?.(exp.id)} onMouseEnter={() => setHoveredRow(exp.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, maxWidth: 200, overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{exp.description}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}><span style={createBadgeStyle(tokens, 'primary')}>{exp.category}</span></td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>${exp.amount.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{exp.vendor}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{formatDate(exp.date)}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{exp.submittedBy}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'center' as const }}>
                      {exp.receiptUrl ? (
                        <span style={{ color: tokens.colors.successScale[500], fontSize: tokens.typography.fontSize.sm }}>{'\u2713'}</span>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); onUploadReceipt?.(exp.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Upload</button>
                      )}
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}><span style={createBadgeStyle(tokens, sm.badge)}>{sm.label}</span></td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {exp.status === 'pending' && (
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          <button onClick={e => { e.stopPropagation(); onApprove?.(exp.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>{'\u2713'}</button>
                          <button onClick={e => { e.stopPropagation(); onReject?.(exp.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>{'\u2717'}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCB0'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No expenses match your filters</Text>
          </div>
        )}

        {/* Category Summary */}
        <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>Spending by Category</Text>
          {categoryBreakdown.map(([cat, info], i) => {
            const pct = Math.round((info.total / maxCatTotal) * 100);
            const bar = createProgressBarStyle(tokens, { percent: pct, color: tokens.colors.primaryScale[400] });
            return (
              <div key={cat} style={{ marginBottom: i < categoryBreakdown.length - 1 ? tokens.spacing[3] : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{cat} ({info.count} expenses)</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${info.total.toLocaleString()}</Text>
                </div>
                <div style={bar.track}><div style={bar.fill} /></div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
