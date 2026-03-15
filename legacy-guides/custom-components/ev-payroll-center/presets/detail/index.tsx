'use client';

/**
 * EvPayrollCenter - Detail Preset
 * Single settlement view with all records, approval flow, payment breakdown,
 * hours comparison chart, deduction breakdown, staff avatars, export actions
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { EvPayrollCenterProps, PayrollRecord, SettlementInfo } from '../../core';

const MOCK_SETTLEMENT: SettlementInfo = {
  id: 's1', settlementNumber: 'SET-2026-008', periodStart: new Date('2026-02-01'), periodEnd: new Date('2026-02-08'), totalAmount: 1773.50, staffCount: 8, status: 'draft',
};

const MOCK_RECORDS: PayrollRecord[] = [
  { id: 'pr1', staffName: 'Maria S.', role: 'Bartender', scheduledHours: 8, workedHours: 8.5, hourlyRate: 25, grossPay: 212.50, deductions: 31.88, netPay: 180.62, status: 'approved' },
  { id: 'pr2', staffName: 'Carlos R.', role: 'Security', scheduledHours: 10, workedHours: 10, hourlyRate: 22, grossPay: 220, deductions: 33, netPay: 187, status: 'approved' },
  { id: 'pr3', staffName: 'Ana L.', role: 'Server', scheduledHours: 6, workedHours: 6, hourlyRate: 20, grossPay: 120, deductions: 18, netPay: 102, status: 'pending' },
  { id: 'pr4', staffName: 'Diego M.', role: 'Sound Tech', scheduledHours: 8, workedHours: 9, hourlyRate: 30, grossPay: 270, deductions: 40.50, netPay: 229.50, status: 'approved' },
  { id: 'pr5', staffName: 'Laura P.', role: 'Stage Manager', scheduledHours: 12, workedHours: 12, hourlyRate: 28, grossPay: 336, deductions: 50.40, netPay: 285.60, status: 'pending' },
  { id: 'pr6', staffName: 'Roberto G.', role: 'Event Coord', scheduledHours: 8, workedHours: 7.5, hourlyRate: 26, grossPay: 195, deductions: 29.25, netPay: 165.75, status: 'approved' },
  { id: 'pr7', staffName: 'Elena R.', role: 'Bartender', scheduledHours: 8, workedHours: 8, hourlyRate: 25, grossPay: 200, deductions: 30, netPay: 170, status: 'approved' },
  { id: 'pr8', staffName: 'Pedro K.', role: 'Security', scheduledHours: 10, workedHours: 11, hourlyRate: 22, grossPay: 242, deductions: 36.30, netPay: 205.70, status: 'pending' },
];

export const DetailEvPayrollCenter = createPreset<EvPayrollCenterProps>({
  name: 'EvPayrollCenter.Detail',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvPayrollCenterProps>) => {
    const { Box, Text } = primitives;
    const { payrollRecords, settlements, onApprovePayroll, onRecordClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const settlement = settlements?.[0] || MOCK_SETTLEMENT;
    const records = payrollRecords?.length ? payrollRecords : MOCK_RECORDS;
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filtered = useMemo(() => {
      if (!statusFilter) return records;
      return records.filter(r => r.status === statusFilter);
    }, [records, statusFilter]);

    const totalGross = records.reduce((s, r) => s + r.grossPay, 0);
    const totalNet = records.reduce((s, r) => s + r.netPay, 0);
    const totalDeductions = records.reduce((s, r) => s + r.deductions, 0);
    const approvedCount = records.filter(r => r.status === 'approved' || r.status === 'paid').length;
    const approvalPct = Math.round((approvedCount / records.length) * 100);
    const approvalBar = createProgressBarStyle(tokens, { percent: approvalPct, color: approvalPct === 100 ? tokens.colors.successScale[500] : tokens.colors.warningScale[500] });
    const maxGross = Math.max(...records.map(r => r.grossPay), 1);

    const statusMap: Record<string, { badge: 'warning' | 'success' | 'info'; label: string }> = {
      pending: { badge: 'warning', label: 'Pending' },
      approved: { badge: 'success', label: 'Approved' },
      paid: { badge: 'info', label: 'Paid' },
    };

    // Role summary
    const roleSummary = useMemo(() => {
      const map: Record<string, { count: number; total: number; hours: number }> = {};
      records.forEach(r => {
        if (!map[r.role]) map[r.role] = { count: 0, total: 0, hours: 0 };
        map[r.role].count++;
        map[r.role].total += r.netPay;
        map[r.role].hours += r.workedHours;
      });
      return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [records]);

    // Deduction rate
    const deductionRate = totalGross > 0 ? ((totalDeductions / totalGross) * 100).toFixed(1) : '0';

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{'\u2190'} Back to Overview</Text>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Settlement {settlement.settlementNumber}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {settlement.periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {settlement.periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {records.length} staff
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            <span style={createBadgeStyle(tokens, settlement.status === 'completed' ? 'success' : settlement.status === 'draft' ? 'warning' : 'info')}>{settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}</span>
            <button style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>Export PDF</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Gross', value: `$${totalGross.toFixed(2)}`, color: tokens.colors.primaryScale[600] },
            { label: 'Deductions', value: `-$${totalDeductions.toFixed(2)}`, color: tokens.colors.errorScale[600] },
            { label: 'Net Payout', value: `$${totalNet.toFixed(2)}`, color: tokens.colors.successScale[600] },
            { label: 'Staff Count', value: records.length.toString(), color: tokens.colors.infoScale[600] },
            { label: 'Deduction Rate', value: `${deductionRate}%`, color: tokens.colors.warningScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const, borderTop: `3px solid ${kpi.color}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Approval Progress + Role Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Approval Progress</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{approvedCount} of {records.length} approved</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{approvalPct}%</Text>
            </div>
            <div style={{ ...approvalBar.track, height: 12 }}><div style={{ ...approvalBar.fill, height: '100%' }} /></div>
            <div style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[4] }}>
              {[
                { label: 'Pending', count: records.filter(r => r.status === 'pending').length, color: tokens.colors.warningScale[500] },
                { label: 'Approved', count: records.filter(r => r.status === 'approved').length, color: tokens.colors.successScale[500] },
                { label: 'Paid', count: records.filter(r => r.status === 'paid').length, color: tokens.colors.infoScale[500] },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: s.color }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{s.label}: {s.count}</Text>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>By Role</Text>
            {roleSummary.map(([role, data], i) => {
              const pct = Math.round((data.total / totalNet) * 100);
              const bar = createProgressBarStyle(tokens, { percent: pct, color: tokens.colors.primaryScale[400] });
              return (
                <div key={role} style={{ marginBottom: i < roleSummary.length - 1 ? tokens.spacing[2] : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={createBadgeStyle(tokens, 'primary')}>{role}</span>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{data.count} staff, {data.hours}h</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${data.total.toFixed(2)} ({pct}%)</Text>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: tokens.spacing[1], marginBottom: tokens.spacing[4] }}>
          <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All ({records.length})</div>
          {['pending', 'approved', 'paid'].map(f => (
            <div key={f} onClick={() => setStatusFilter(statusFilter === f ? null : f)} style={createFilterPillStyle(tokens, { active: statusFilter === f })}>{f.charAt(0).toUpperCase() + f.slice(1)} ({records.filter(r => r.status === f).length})</div>
          ))}
        </div>

        {/* Detailed Records */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[4] }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>All Records ({filtered.length})</Text>
          </div>
          {filtered.map((rec, i) => {
            const sm = statusMap[rec.status];
            const isHovered = hoveredRow === rec.id;
            const overtime = rec.workedHours > rec.scheduledHours;
            const payPct = Math.round((rec.grossPay / maxGross) * 100);
            const payBar = createProgressBarStyle(tokens, { percent: payPct, color: tokens.colors.primaryScale[300] });
            return (
              <div key={rec.id} onClick={() => onRecordClick?.(rec.id)} onMouseEnter={() => setHoveredRow(rec.id)} onMouseLeave={() => setHoveredRow(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < filtered.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700], flexShrink: 0 }}>
                    {rec.staffName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{rec.staffName}</Text>
                      <span style={createBadgeStyle(tokens, 'primary')}>{rec.role}</span>
                      {overtime && <span style={createBadgeStyle(tokens, 'warning')}>OT +{(rec.workedHours - rec.scheduledHours).toFixed(1)}h</span>}
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{rec.workedHours}h @ ${rec.hourlyRate}/h</Text>
                    <div style={{ ...payBar.track, height: 4, marginTop: tokens.spacing[1] }}><div style={{ ...payBar.fill, height: '100%' }} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                  <div style={{ textAlign: 'right' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${rec.netPay.toFixed(2)}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>gross: ${rec.grossPay.toFixed(2)} | -${rec.deductions.toFixed(2)}</Text>
                  </div>
                  <span style={createBadgeStyle(tokens, sm.badge)}>{sm.label}</span>
                  {rec.status === 'pending' && (
                    <button onClick={e => { e.stopPropagation(); onApprovePayroll?.(rec.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Approve</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Avg Net Pay', value: `$${(totalNet / records.length).toFixed(2)}` },
            { label: 'Total Hours', value: `${records.reduce((s, r) => s + r.workedHours, 0).toFixed(1)}h` },
            { label: 'Avg Rate', value: `$${(records.reduce((s, r) => s + r.hourlyRate, 0) / records.length).toFixed(2)}/h` },
            { label: 'Overtime Staff', value: records.filter(r => r.workedHours > r.scheduledHours).length.toString() },
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
