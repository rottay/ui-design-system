'use client';

/**
 * EvFinanceDashboard - Detailed Preset
 * Full expense table, invoice details, payment timeline
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

export const DetailedEvFinanceDashboard = createPreset<EvFinanceDashboardProps>({
  name: 'EvFinanceDashboard.Detailed',
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

    const [activeTab, setActiveTab] = useState<'expenses' | 'invoices'>('expenses');

    const mockExpenses = expenses?.length ? expenses : [
      { id: 'e1', category: 'Venue & Production', description: 'Main stage setup and rigging', amount: 18000, date: new Date('2026-02-01'), status: 'paid' as const },
      { id: 'e2', category: 'Venue & Production', description: 'Sound system rental - PK Trinity', amount: 12000, date: new Date('2026-02-01'), status: 'paid' as const },
      { id: 'e3', category: 'Venue & Production', description: 'Lighting rig - beam movers x24', amount: 5000, date: new Date('2026-02-02'), status: 'approved' as const },
      { id: 'e4', category: 'Artist Fees', description: 'DJ Nova - headliner slot', amount: 15000, date: new Date('2026-02-03'), status: 'approved' as const },
      { id: 'e5', category: 'Artist Fees', description: 'Aurora Beats - support set', amount: 8000, date: new Date('2026-02-03'), status: 'pending' as const },
      { id: 'e6', category: 'Artist Fees', description: 'The Velvet Band - opening', amount: 5000, date: new Date('2026-02-03'), status: 'paid' as const },
      { id: 'e7', category: 'Marketing', description: 'Instagram/TikTok campaign', amount: 7500, date: new Date('2026-02-04'), status: 'paid' as const },
      { id: 'e8', category: 'Marketing', description: 'Print materials - posters, flyers', amount: 2500, date: new Date('2026-02-05'), status: 'paid' as const },
      { id: 'e9', category: 'Staff & Security', description: 'Security team - 12 guards', amount: 6800, date: new Date('2026-02-06'), status: 'pending' as const },
      { id: 'e10', category: 'Staff & Security', description: 'Event crew - 8 staff', amount: 3000, date: new Date('2026-02-06'), status: 'approved' as const },
    ];

    const mockInvoices = invoices?.length ? invoices : [
      { id: 'i1', number: 'INV-2026-0042', vendor: 'SoundTech Pro', amount: 8500, dueDate: new Date('2026-02-15'), status: 'sent' as const },
      { id: 'i2', number: 'INV-2026-0043', vendor: 'LightWorks Inc', amount: 6200, dueDate: new Date('2026-02-20'), status: 'sent' as const },
      { id: 'i3', number: 'INV-2026-0041', vendor: 'Print Express', amount: 1800, dueDate: new Date('2026-02-10'), status: 'overdue' as const },
      { id: 'i4', number: 'INV-2026-0044', vendor: 'SecureGuard LLC', amount: 4500, dueDate: new Date('2026-02-28'), status: 'draft' as const },
      { id: 'i5', number: 'INV-2026-0040', vendor: 'DJ Nova Agency', amount: 3500, dueDate: new Date('2026-02-05'), status: 'paid' as const },
      { id: 'i6', number: 'INV-2026-0039', vendor: 'Catering Plus', amount: 4200, dueDate: new Date('2026-02-12'), status: 'paid' as const },
      { id: 'i7', number: 'INV-2026-0038', vendor: 'Venue Rentals Co', amount: 12000, dueDate: new Date('2026-02-01'), status: 'paid' as const },
    ];

    const expenseStatusColors: Record<string, { bg: string; text: string }> = {
      pending: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] },
      approved: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      paid: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
    };

    const invoiceStatusColors: Record<string, { bg: string; text: string }> = {
      draft: { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] },
      sent: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      paid: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
      overdue: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] },
    };

    const paymentTimeline = [
      { date: 'Feb 1', label: 'Venue deposit paid', amount: -12000, type: 'expense' },
      { date: 'Feb 3', label: 'Early bird ticket revenue', amount: 35000, type: 'income' },
      { date: 'Feb 5', label: 'DJ Nova fee processed', amount: -3500, type: 'expense' },
      { date: 'Feb 7', label: 'VIP package sales', amount: 12500, type: 'income' },
      { date: 'Feb 8', label: 'Marketing campaign', amount: -7500, type: 'expense' },
      { date: 'Feb 10', label: 'Second ticket batch', amount: 28000, type: 'income' },
    ];

    const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
    const paidExpenses = mockExpenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
    const pendingExpenses = mockExpenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

    const tabs = ['expenses', 'invoices'] as const;

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
              Finance Details
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Full expense tracking, invoices, and payment timeline
            </Text>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {[
            { label: 'Total Expenses', value: totalExpenses, icon: '📊', color: tokens.colors.neutral[900] },
            { label: 'Paid', value: paidExpenses, icon: '✅', color: tokens.colors.successScale[600] },
            { label: 'Pending Approval', value: pendingExpenses, icon: '⏳', color: tokens.colors.warningScale[600] },
          ].map((card, idx) => (
            <div key={idx} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ width: 44, height: 44, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xl, flexShrink: 0 }}>{card.icon}</div>
              <div>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em', display: 'block', marginBottom: 2 }}>{card.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: card.color }}>${card.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          {/* Left: Tabbed Table */}
          <div style={cardBase}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: tokens.spacing[4], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  border: 'none', borderBottom: activeTab === tab ? `2px solid ${tokens.colors.primaryScale[600]}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  fontSize: tokens.typography.fontSize.sm, fontWeight: activeTab === tab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  color: activeTab === tab ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                  cursor: 'pointer', textTransform: 'capitalize' as const,
                }}>
                  {tab} ({tab === 'expenses' ? mockExpenses.length : mockInvoices.length})
                </button>
              ))}
            </div>

            {activeTab === 'expenses' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 100px 80px 60px', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0`, marginBottom: tokens.spacing[1] }}>
                  {['Description', 'Category', 'Amount', 'Date', 'Status'].map((h) => (
                    <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
                  ))}
                </div>
                {mockExpenses.map((exp, idx) => {
                  const sc = expenseStatusColors[exp.status];
                  return (
                    <div key={exp.id} onClick={() => onExpenseClick?.(exp.id)} style={{
                      display: 'grid', gridTemplateColumns: '1fr 160px 100px 80px 60px', gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px 0`,
                      borderBottom: idx < mockExpenses.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                      cursor: 'pointer', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{exp.description}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{exp.category}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${exp.amount.toLocaleString()}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{exp.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span style={{ fontSize: 9, fontWeight: tokens.typography.fontWeight.bold, padding: '1px 6px', borderRadius: tokens.borderRadius.sm, backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const, textAlign: 'center' as const }}>{exp.status}</span>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 90px 90px 60px', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0`, marginBottom: tokens.spacing[1] }}>
                  {['Invoice #', 'Vendor', 'Amount', 'Due Date', 'Status'].map((h) => (
                    <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
                  ))}
                </div>
                {mockInvoices.map((inv, idx) => {
                  const sc = invoiceStatusColors[inv.status];
                  return (
                    <div key={inv.id} onClick={() => onInvoiceClick?.(inv.id)} style={{
                      display: 'grid', gridTemplateColumns: '110px 1fr 90px 90px 60px', gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px 0`,
                      borderBottom: idx < mockInvoices.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                      cursor: 'pointer', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.primaryScale[600], fontFamily: 'monospace' }}>{inv.number}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{inv.vendor}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>${inv.amount.toLocaleString()}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: inv.status === 'overdue' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>{inv.dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span style={{ fontSize: 9, fontWeight: tokens.typography.fontWeight.bold, padding: '1px 6px', borderRadius: tokens.borderRadius.sm, backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const, textAlign: 'center' as const }}>{inv.status}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Right: Payment Timeline */}
          <div style={cardBase}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Payment Timeline</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {paymentTimeline.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: tokens.spacing[3], paddingBottom: tokens.spacing[3], position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: tokens.borderRadius.full, flexShrink: 0,
                      backgroundColor: item.type === 'income' ? tokens.colors.successScale[500] : tokens.colors.errorScale[400],
                    }} />
                    {idx < paymentTimeline.length - 1 && (
                      <div style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], marginTop: 2 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: tokens.spacing[2] }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500] }}>{item.date}</span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold,
                        color: item.type === 'income' ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
                      }}>
                        {item.type === 'income' ? '+' : ''}{item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toLocaleString()}
                      </span>
                    </div>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[100]}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Net Cash Flow</span>
              <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>
                +${paymentTimeline.reduce((s, t) => s + t.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
