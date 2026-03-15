'use client';

/**
 * StaffPayrollTable - Detailed Preset
 * Full payroll table with all columns
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffPayrollTableProps, PayrollLineItem } from '../../core';

const MOCK_ITEMS: PayrollLineItem[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', period: '2024-08', regularHours: 160, overtimeHours: 12, hourlyRate: 25, overtimeRate: 37.5, grossPay: 4450, bonuses: 200, deductions: 890, netPay: 3760, currency: 'USD', status: 'approved' },
  { id: '2', staffId: '2', staffName: 'Carlos R.', role: 'Security', period: '2024-08', regularHours: 168, overtimeHours: 8, hourlyRate: 22, overtimeRate: 33, grossPay: 3960, bonuses: 0, deductions: 792, netPay: 3168, currency: 'USD', status: 'calculated' },
  { id: '3', staffId: '3', staffName: 'Ana L.', role: 'Server', period: '2024-08', regularHours: 120, overtimeHours: 0, hourlyRate: 20, overtimeRate: 30, grossPay: 2400, bonuses: 150, deductions: 510, netPay: 2040, currency: 'USD', status: 'draft' },
  { id: '4', staffId: '4', staffName: 'Diego M.', role: 'Sound Tech', period: '2024-08', regularHours: 80, overtimeHours: 4, hourlyRate: 35, overtimeRate: 52.5, grossPay: 3010, bonuses: 0, deductions: 602, netPay: 2408, currency: 'USD', status: 'paid' },
  { id: '5', staffId: '5', staffName: 'Laura P.', role: 'Coordinator', period: '2024-08', regularHours: 160, overtimeHours: 0, hourlyRate: 30, overtimeRate: 45, grossPay: 4800, bonuses: 500, deductions: 1060, netPay: 4240, currency: 'USD', status: 'approved' },
];

const STATUS_MAP: Record<string, string> = { draft: 'secondary', calculated: 'info', approved: 'warning', paid: 'success' };

export const DetailedStaffPayrollTable = createPreset<StaffPayrollTableProps>({
  name: 'StaffPayrollTable.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<StaffPayrollTableProps>) => {
    const { Box, Text } = primitives;
    const { items: propItems, period, onItemClick, onApprove, onApproveAll, onExport, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const items = propItems?.length ? propItems : MOCK_ITEMS;

    const totals = useMemo(() => ({
      grossPay: items.reduce((s, i) => s + i.grossPay, 0),
      bonuses: items.reduce((s, i) => s + i.bonuses, 0),
      deductions: items.reduce((s, i) => s + i.deductions, 0),
      netPay: items.reduce((s, i) => s + i.netPay, 0),
    }), [items]);

    const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Payroll</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Period: {period || items[0]?.period || 'N/A'} | {items.length} employees</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700] }}>Export</button>
            <button onClick={onApproveAll} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>Approve All</button>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Gross Pay', value: fmt(totals.grossPay), color: tokens.colors.neutral[900] },
            { label: 'Bonuses', value: fmt(totals.bonuses), color: tokens.colors.successScale[600] },
            { label: 'Deductions', value: fmt(totals.deductions), color: tokens.colors.errorScale[600] },
            { label: 'Net Pay', value: fmt(totals.netPay), color: tokens.colors.primaryScale[600] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{s.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color }}>{s.value}</Text>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Employee', 'Role', 'Regular Hrs', 'OT Hrs', 'Rate', 'Gross', 'Bonus', 'Deductions', 'Net Pay', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: tokens.spacing[3], textAlign: h === '' ? 'right' : 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', borderBottom: `1px solid ${tokens.colors.neutral[200]}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => onItemClick?.(item.id)} style={{ cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50]; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{item.staffName}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{item.role}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{item.regularHours}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: item.overtimeHours > 0 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500] }}>{item.overtimeHours}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>${item.hourlyRate}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{fmt(item.grossPay)}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.successScale[600] }}>{item.bonuses > 0 ? `+${fmt(item.bonuses)}` : '-'}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[600] }}>-{fmt(item.deductions)}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{fmt(item.netPay)}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[item.status] as any), fontSize: tokens.typography.fontSize.xs }}>{item.status}</span>
                  </td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, textAlign: 'right' }}>
                    {(item.status === 'calculated' || item.status === 'draft') && (
                      <button onClick={e => { e.stopPropagation(); onApprove?.(item.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
