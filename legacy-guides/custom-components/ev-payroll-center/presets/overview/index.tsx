'use client';

/**
 * EvPayrollCenter - Overview Preset
 * Payroll summary KPIs, settlement list, payroll records table with search/filter,
 * role breakdown bars, overtime tracking, rate comparison
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

const MOCK_RECORDS: PayrollRecord[] = [
  { id: 'pr1', staffName: 'Maria S.', role: 'Bartender', scheduledHours: 8, workedHours: 8.5, hourlyRate: 25, grossPay: 212.50, deductions: 31.88, netPay: 180.62, status: 'approved' },
  { id: 'pr2', staffName: 'Carlos R.', role: 'Security', scheduledHours: 10, workedHours: 10, hourlyRate: 22, grossPay: 220, deductions: 33, netPay: 187, status: 'paid' },
  { id: 'pr3', staffName: 'Ana L.', role: 'Server', scheduledHours: 6, workedHours: 6, hourlyRate: 20, grossPay: 120, deductions: 18, netPay: 102, status: 'pending' },
  { id: 'pr4', staffName: 'Diego M.', role: 'Sound Tech', scheduledHours: 8, workedHours: 9, hourlyRate: 30, grossPay: 270, deductions: 40.50, netPay: 229.50, status: 'approved' },
  { id: 'pr5', staffName: 'Laura P.', role: 'Stage Manager', scheduledHours: 12, workedHours: 12, hourlyRate: 28, grossPay: 336, deductions: 50.40, netPay: 285.60, status: 'pending' },
  { id: 'pr6', staffName: 'Roberto G.', role: 'Event Coord', scheduledHours: 8, workedHours: 7.5, hourlyRate: 26, grossPay: 195, deductions: 29.25, netPay: 165.75, status: 'paid' },
  { id: 'pr7', staffName: 'Elena R.', role: 'Bartender', scheduledHours: 8, workedHours: 8, hourlyRate: 25, grossPay: 200, deductions: 30, netPay: 170, status: 'approved' },
  { id: 'pr8', staffName: 'Pedro K.', role: 'Security', scheduledHours: 10, workedHours: 10, hourlyRate: 22, grossPay: 220, deductions: 33, netPay: 187, status: 'pending' },
];

const MOCK_SETTLEMENTS: SettlementInfo[] = [
  { id: 's1', settlementNumber: 'SET-2026-008', periodStart: new Date('2026-02-01'), periodEnd: new Date('2026-02-08'), totalAmount: 1773.50, staffCount: 8, status: 'draft' },
  { id: 's2', settlementNumber: 'SET-2026-007', periodStart: new Date('2026-01-25'), periodEnd: new Date('2026-01-31'), totalAmount: 3420.00, staffCount: 12, status: 'completed' },
  { id: 's3', settlementNumber: 'SET-2026-006', periodStart: new Date('2026-01-18'), periodEnd: new Date('2026-01-24'), totalAmount: 2890.00, staffCount: 10, status: 'completed' },
];

export const OverviewEvPayrollCenter = createPreset<EvPayrollCenterProps>({
  name: 'EvPayrollCenter.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvPayrollCenterProps>) => {
    const { Box, Text } = primitives;
    const { payrollRecords, settlements, onApprovePayroll, onGenerateSettlement, onRecordClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const records = payrollRecords?.length ? payrollRecords : MOCK_RECORDS;
    const settles = settlements?.length ? settlements : MOCK_SETTLEMENTS;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return records.filter(r => {
        if (searchTerm && !r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) && !r.role.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        return true;
      });
    }, [records, searchTerm, statusFilter]);

    const totalGross = records.reduce((s, r) => s + r.grossPay, 0);
    const totalNet = records.reduce((s, r) => s + r.netPay, 0);
    const totalDeductions = records.reduce((s, r) => s + r.deductions, 0);
    const totalHours = records.reduce((s, r) => s + r.workedHours, 0);
    const overtimeRecords = records.filter(r => r.workedHours > r.scheduledHours);
    const totalOvertimeHours = overtimeRecords.reduce((s, r) => s + (r.workedHours - r.scheduledHours), 0);

    const statusMap: Record<string, { badge: 'warning' | 'success' | 'info'; label: string }> = {
      pending: { badge: 'warning', label: 'Pending' },
      approved: { badge: 'success', label: 'Approved' },
      paid: { badge: 'info', label: 'Paid' },
    };

    const settlementStatusMap: Record<string, { badge: 'warning' | 'success' | 'info'; label: string }> = {
      draft: { badge: 'warning', label: 'Draft' },
      approved: { badge: 'success', label: 'Approved' },
      processing: { badge: 'info', label: 'Processing' },
      completed: { badge: 'success', label: 'Completed' },
    };

    // Role breakdown
    const roleBreakdown = useMemo(() => {
      const map: Record<string, { count: number; totalNet: number; totalHours: number }> = {};
      records.forEach(r => {
        if (!map[r.role]) map[r.role] = { count: 0, totalNet: 0, totalHours: 0 };
        map[r.role].count++;
        map[r.role].totalNet += r.netPay;
        map[r.role].totalHours += r.workedHours;
      });
      return Object.entries(map).sort((a, b) => b[1].totalNet - a[1].totalNet);
    }, [records]);

    const maxRoleNet = Math.max(...roleBreakdown.map(([, d]) => d.totalNet), 1);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Payroll Center
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{records.length} staff | {filtered.length} shown | Current period</Text>
          </div>
          <button onClick={onGenerateSettlement} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
            Generate Settlement
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Gross Pay', value: `$${totalGross.toFixed(2)}`, color: tokens.colors.primaryScale[600] },
            { label: 'Net Pay', value: `$${totalNet.toFixed(2)}`, color: tokens.colors.successScale[600] },
            { label: 'Deductions', value: `$${totalDeductions.toFixed(2)}`, color: tokens.colors.errorScale[600] },
            { label: 'Total Hours', value: totalHours.toFixed(1), color: tokens.colors.infoScale[600] },
            { label: 'Overtime', value: `${totalOvertimeHours.toFixed(1)}h (${overtimeRecords.length} staff)`, color: tokens.colors.warningScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[3], borderTop: `3px solid ${kpi.color}`, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Settlements + Role Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Settlements</Text>
            </div>
            {settles.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < settles.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{s.settlementNumber}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {s.periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | {s.staffCount} staff</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${s.totalAmount.toLocaleString()}</Text>
                  <span style={createBadgeStyle(tokens, settlementStatusMap[s.status].badge)}>{settlementStatusMap[s.status].label}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[3] }}>Pay by Role</Text>
            {roleBreakdown.map(([role, data], i) => {
              const pct = Math.round((data.totalNet / maxRoleNet) * 100);
              const bar = createProgressBarStyle(tokens, { percent: pct, color: tokens.colors.primaryScale[400] });
              return (
                <div key={role} style={{ marginBottom: i < roleBreakdown.length - 1 ? tokens.spacing[3] : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{role} ({data.count} staff, {data.totalHours}h)</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${data.totalNet.toFixed(2)}</Text>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <input type="text" placeholder="Search by name or role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All</div>
              {['pending', 'approved', 'paid'].map(f => (
                <div key={f} onClick={() => setStatusFilter(statusFilter === f ? null : f)} style={createFilterPillStyle(tokens, { active: statusFilter === f })}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Payroll Records Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[4] }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Staff', 'Role', 'Scheduled', 'Worked', 'Rate', 'Gross', 'Deductions', 'Net', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(rec => {
                const sm = statusMap[rec.status];
                const overtime = rec.workedHours > rec.scheduledHours;
                const isHovered = hoveredRow === rec.id;
                return (
                  <tr key={rec.id} onClick={() => onRecordClick?.(rec.id)} onMouseEnter={() => setHoveredRow(rec.id)} onMouseLeave={() => setHoveredRow(null)} style={{ cursor: 'pointer', backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{rec.staffName}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}><span style={createBadgeStyle(tokens, 'primary')}>{rec.role}</span></td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{rec.scheduledHours}h</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: overtime ? tokens.colors.warningScale[600] : tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{rec.workedHours}h {overtime ? '(OT)' : ''}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>${rec.hourlyRate}/h</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>${rec.grossPay.toFixed(2)}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>-${rec.deductions.toFixed(2)}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>${rec.netPay.toFixed(2)}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}><span style={createBadgeStyle(tokens, sm.badge)}>{sm.label}</span></td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {rec.status === 'pending' && (
                        <button onClick={e => { e.stopPropagation(); onApprovePayroll?.(rec.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Approve</button>
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
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No payroll records match your filters</Text>
          </div>
        )}
      </Box>
    );
  },
});
