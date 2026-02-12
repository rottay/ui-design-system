'use client';

/**
 * StaffPayslipDetail - Compact Preset
 * Condensed payslip summary
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffPayslipDetailProps, PayslipData } from '../../core';

const MOCK_PAYSLIP: PayslipData = {
  id: '1', staffId: '1', staffName: 'Maria Santos', role: 'Bartender', period: 'August 2024', payDate: new Date('2024-08-31'),
  earnings: [
    { label: 'Regular Hours', hours: 160, rate: 25, amount: 4000 },
    { label: 'Overtime', hours: 12, rate: 37.5, amount: 450 },
  ],
  deductions: [
    { label: 'Taxes', amount: 795, type: 'tax' },
    { label: 'Insurance', amount: 85, type: 'insurance' },
  ],
  grossPay: 4450, totalDeductions: 880, netPay: 3570, currency: 'USD', paymentMethod: 'Direct Deposit', status: 'paid',
};

const STATUS_MAP: Record<string, string> = { pending: 'warning', processing: 'info', paid: 'success', failed: 'error' };

export const CompactStaffPayslipDetail = createPreset<StaffPayslipDetailProps>({
  name: 'StaffPayslipDetail.Compact',
  render: ({ primitives, props, tokens }: PresetContext<StaffPayslipDetailProps>) => {
    const { Box, Text } = primitives;
    const { payslip: propPayslip, onBack, onDownload, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const payslip = propPayslip ?? MOCK_PAYSLIP;
    const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], maxWidth: 400, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
          <button onClick={onBack} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', color: tokens.colors.neutral[600] }}>← Back</button>
          <button onClick={onDownload} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Download</button>
        </div>

        <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3], paddingBottom: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{payslip.staffName}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{payslip.period}</Text>
            </div>
            <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[payslip.status] as any), fontSize: tokens.typography.fontSize.xs }}>{payslip.status}</span>
          </div>

          {/* Earnings */}
          {payslip.earnings.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{e.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{fmt(e.amount)}</Text>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderTop: `1px solid ${tokens.colors.neutral[100]}`, marginTop: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Gross</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{fmt(payslip.grossPay)}</Text>
          </div>

          {/* Deductions */}
          {payslip.deductions.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{d.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[600] }}>-{fmt(d.amount)}</Text>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderTop: `1px solid ${tokens.colors.neutral[100]}`, marginTop: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Deductions</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[600] }}>-{fmt(payslip.totalDeductions)}</Text>
          </div>

          {/* Net Pay */}
          <div style={{ padding: tokens.spacing[3], backgroundColor: tokens.colors.primaryScale[50], borderRadius: tokens.borderRadius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Net Pay</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{fmt(payslip.netPay)}</Text>
          </div>
        </div>
      </Box>
    );
  },
});
