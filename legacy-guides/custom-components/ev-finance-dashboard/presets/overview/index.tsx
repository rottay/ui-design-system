'use client';

/**
 * EvFinanceDashboard - Overview Preset
 * Finance KPI row, expense category breakdown with progress bars, recent invoices table, revenue by source
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvFinanceDashboardProps } from '../../core';

export const OverviewEvFinanceDashboard = createPreset<EvFinanceDashboardProps>({
  name: 'EvFinanceDashboard.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvFinanceDashboardProps>) => {
    const { Box, Text } = primitives;

    const {
      kpis,
      expenses,
      revenueEntries,
      invoices,
      onExpenseClick,
      onInvoiceClick,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const mockKpis = kpis?.length ? kpis : [
      { label: 'Revenue', value: 185000, currency: 'USD', trend: 'up' as const, trendValue: 12 },
      { label: 'Expenses', value: 92000, currency: 'USD', trend: 'up' as const, trendValue: 5 },
      { label: 'Profit', value: 93000, currency: 'USD', trend: 'up' as const, trendValue: 18 },
      { label: 'Pending', value: 24500, currency: 'USD', trend: 'down' as const, trendValue: 8 },
    ];

    const mockExpenses = expenses?.length ? expenses : [
      { id: 'e1', category: 'Venue & Production', description: 'Stage setup, sound, lighting', amount: 35000, date: new Date('2026-02-01'), status: 'paid' as const },
      { id: 'e2', category: 'Artist Fees', description: 'DJ Nova, Aurora Beats, The Velvet Band', amount: 28000, date: new Date('2026-02-03'), status: 'approved' as const },
      { id: 'e3', category: 'Marketing', description: 'Social media ads, flyers, PR', amount: 12500, date: new Date('2026-02-05'), status: 'paid' as const },
      { id: 'e4', category: 'Staff & Security', description: 'Event crew, bouncers, medics', amount: 9800, date: new Date('2026-02-06'), status: 'pending' as const },
      { id: 'e5', category: 'F&B Supplies', description: 'Bar stock, food vendors', amount: 6700, date: new Date('2026-02-07'), status: 'approved' as const },
    ];

    const mockRevenue = revenueEntries?.length ? revenueEntries : [
      { source: 'Ticket Sales', amount: 98500, percentage: 53, trend: 'up' as const },
      { source: 'Bar & F&B', amount: 42000, percentage: 23, trend: 'up' as const },
      { source: 'VIP Packages', amount: 28500, percentage: 15, trend: 'up' as const },
      { source: 'Sponsorships', amount: 12000, percentage: 7, trend: 'flat' as const },
      { source: 'Merch', amount: 4000, percentage: 2, trend: 'down' as const },
    ];

    const mockInvoices = invoices?.length ? invoices : [
      { id: 'i1', number: 'INV-2026-0042', vendor: 'SoundTech Pro', amount: 8500, dueDate: new Date('2026-02-15'), status: 'sent' as const },
      { id: 'i2', number: 'INV-2026-0043', vendor: 'LightWorks Inc', amount: 6200, dueDate: new Date('2026-02-20'), status: 'sent' as const },
      { id: 'i3', number: 'INV-2026-0041', vendor: 'Print Express', amount: 1800, dueDate: new Date('2026-02-10'), status: 'overdue' as const },
      { id: 'i4', number: 'INV-2026-0044', vendor: 'SecureGuard LLC', amount: 4500, dueDate: new Date('2026-02-28'), status: 'draft' as const },
      { id: 'i5', number: 'INV-2026-0040', vendor: 'DJ Nova Agency', amount: 3500, dueDate: new Date('2026-02-05'), status: 'paid' as const },
    ];

    const kpiIcons = ['💰', '📊', '📈', '⏳'];
    const kpiColors = [tokens.colors.successScale, tokens.colors.errorScale, tokens.colors.primaryScale, tokens.colors.warningScale];

    const expenseCategoryColors = [
      tokens.colors.primaryScale[500],
      tokens.colors.warningScale[500],
      tokens.colors.infoScale[500],
      tokens.colors.errorScale[500],
      tokens.colors.successScale[500],
    ];

    const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);

    const revScaleColors = ['primaryScale', 'successScale', 'warningScale', 'infoScale', 'errorScale'];

    const invoiceStatusColors: Record<string, { bg: string; text: string }> = {
      draft: { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] },
      sent: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      paid: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
      overdue: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] },
    };

    const expenseStatusColors: Record<string, { bg: string; text: string }> = {
      pending: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] },
      approved: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      paid: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
    };

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Finance Dashboard
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Revenue, expenses, and financial overview
            </Text>
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], cursor: 'pointer' }}>February 2026 ▾</button>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {mockKpis.map((kpi, idx) => {
            const scale = kpiColors[idx];
            return (
              <div key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: tokens.spacing[1] }}>{kpi.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>${(kpi.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.md, backgroundColor: scale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg }}>{kpiIcons[idx]}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: kpi.trend === 'up' ? tokens.colors.successScale[600] : kpi.trend === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>
                    {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} {kpi.trendValue}%
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: tokens.spacing[6] }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Expense Breakdown */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Expense Breakdown</Text>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Total: ${totalExpenses.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {mockExpenses.map((exp, idx) => {
                  const pct = Math.round((exp.amount / totalExpenses) * 100);
                  const sc = expenseStatusColors[exp.status];
                  return (
                    <div key={exp.id} onClick={() => onExpenseClick?.(exp.id)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: expenseCategoryColors[idx % expenseCategoryColors.length] }} />
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{exp.category}</span>
                          <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, padding: '1px 6px', borderRadius: tokens.borderRadius.sm, backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const }}>{exp.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${exp.amount.toLocaleString()}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], minWidth: 30, textAlign: 'right' as const }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: expenseCategoryColors[idx % expenseCategoryColors.length], borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Invoices */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Recent Invoices</Text>
                <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.primaryScale[200]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Invoice</button>
              </div>
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 100px 70px', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0`, marginBottom: tokens.spacing[1] }}>
                {['Invoice', 'Vendor', 'Amount', 'Due', 'Status'].map((h) => (
                  <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
                ))}
              </div>
              {mockInvoices.map((inv, idx) => {
                const sc = invoiceStatusColors[inv.status];
                return (
                  <div key={inv.id} onClick={() => onInvoiceClick?.(inv.id)} style={{
                    display: 'grid', gridTemplateColumns: '120px 1fr 100px 100px 70px', gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px 0`,
                    borderBottom: idx < mockInvoices.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                    cursor: 'pointer', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.primaryScale[600], fontFamily: 'monospace' }}>{inv.number}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{inv.vendor}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${inv.amount.toLocaleString()}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{inv.dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, padding: '1px 6px', borderRadius: tokens.borderRadius.sm, backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const, textAlign: 'center' as const }}>{inv.status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Revenue by Source */}
          <div style={cardBase}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Revenue by Source</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {mockRevenue.map((r, i) => {
                const c = revScaleColors[i % revScaleColors.length];
                const scale = (tokens.colors as any)[c];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: scale?.[500] ?? tokens.colors.primaryScale[500] }} />
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>{r.source}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${r.amount.toLocaleString()}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: r.trend === 'up' ? tokens.colors.successScale[600] : r.trend === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>
                          {r.trend === 'up' ? '↑' : r.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${r.percentage}%`, backgroundColor: scale?.[500] ?? tokens.colors.primaryScale[500], borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[4], paddingTop: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Total Revenue</span>
              <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${mockRevenue.reduce((s, r) => s + r.amount, 0).toLocaleString()}</span>
            </div>

            {/* Profit Margin */}
            <div style={{ marginTop: tokens.spacing[6], padding: tokens.spacing[4], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.successScale[50], border: `1px solid ${tokens.colors.successScale[200]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>Profit Margin</span>
                <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>50.3%</span>
              </div>
              <div style={{ height: 8, backgroundColor: tokens.colors.successScale[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '50.3%', backgroundColor: tokens.colors.successScale[500], borderRadius: tokens.borderRadius.full }} />
              </div>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600], display: 'block', marginTop: tokens.spacing[1] }}>↑ 6% vs last month</span>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
