'use client';

/**
 * StaffPayrollTable - Summary Preset
 * Compact payroll summary cards
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffPayrollTableProps, PayrollLineItem } from '../../core';

const MOCK_ITEMS: PayrollLineItem[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', role: 'Bartender', period: '2024-08', regularHours: 160, overtimeHours: 12, hourlyRate: 25, overtimeRate: 37.5, grossPay: 4450, bonuses: 200, deductions: 890, netPay: 3760, currency: 'USD', status: 'approved' },
  { id: '2', staffId: '2', staffName: 'Carlos R.', role: 'Security', period: '2024-08', regularHours: 168, overtimeHours: 8, hourlyRate: 22, overtimeRate: 33, grossPay: 3960, bonuses: 0, deductions: 792, netPay: 3168, currency: 'USD', status: 'calculated' },
  { id: '3', staffId: '3', staffName: 'Ana L.', role: 'Server', period: '2024-08', regularHours: 120, overtimeHours: 0, hourlyRate: 20, overtimeRate: 30, grossPay: 2400, bonuses: 150, deductions: 510, netPay: 2040, currency: 'USD', status: 'paid' },
];

const STATUS_MAP: Record<string, string> = { draft: 'secondary', calculated: 'info', approved: 'warning', paid: 'success' };

export const SummaryStaffPayrollTable = createPreset<StaffPayrollTableProps>({
  name: 'StaffPayrollTable.Summary',
  render: ({ primitives, props, tokens }: PresetContext<StaffPayrollTableProps>) => {
    const { Box, Text } = primitives;
    const { items: propItems, onItemClick, onExport, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const items = propItems?.length ? propItems : MOCK_ITEMS;

    const totalNet = items.reduce((s, i) => s + i.netPay, 0);
    const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Payroll Summary</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Total: {fmt(totalNet)}</Text>
          </div>
          <button onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700] }}>Export</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
          {items.map(item => (
            <div key={item.id} onClick={() => onItemClick?.(item.id)} style={{ ...cardBase, padding: tokens.spacing[4], cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{item.staffName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.role}</Text>
                </div>
                <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[item.status] as any), fontSize: tokens.typography.fontSize.xs }}>{item.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2] }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Hours</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{item.regularHours + item.overtimeHours}h</Text>
                </div>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Gross</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{fmt(item.grossPay)}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Net</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{fmt(item.netPay)}</Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
