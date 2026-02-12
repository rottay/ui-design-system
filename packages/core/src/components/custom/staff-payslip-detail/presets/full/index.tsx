'use client';

/**
 * StaffPayslipDetail - Full Preset
 * Complete payslip with earnings and deductions breakdown
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
    { label: 'Holiday Bonus', amount: 200 },
    { label: 'Tips', amount: 320 },
  ],
  deductions: [
    { label: 'Federal Tax', amount: 596, type: 'tax' },
    { label: 'State Tax', amount: 199, type: 'tax' },
    { label: 'Health Insurance', amount: 85, type: 'insurance' },
    { label: 'Uniform Deduction', amount: 10, type: 'other' },
  ],
  grossPay: 4970, totalDeductions: 890, netPay: 4080, currency: 'USD', paymentMethod: 'Direct Deposit', referenceNumber: 'PAY-2024-08-001', status: 'paid',
};

const STATUS_MAP: Record<string, string> = { pending: 'warning', processing: 'info', paid: 'success', failed: 'error' };

export const FullStaffPayslipDetail = createPreset<StaffPayslipDetailProps>({
  name: 'StaffPayslipDetail.Full',
  render: ({ primitives, props, tokens }: PresetContext<StaffPayslipDetailProps>) => {
    const { Box, Text } = primitives;
    const { payslip: propPayslip, onBack, onDownload, onPrint, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const payslip = propPayslip ?? MOCK_PAYSLIP;
    const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], maxWidth: 700, margin: '0 auto', ...style }}>
        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <button onClick={onBack} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700] }}>← Back</button>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button onClick={onPrint} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700] }}>Print</button>
            <button onClick={onDownload} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>Download PDF</button>
          </div>
        </div>

        {/* Payslip Card */}
        <div style={{ ...cardBase, padding: tokens.spacing[6] }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[5], paddingBottom: tokens.spacing[5], borderBottom: `2px solid ${tokens.colors.neutral[200]}` }}>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Pay Slip</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginTop: tokens.spacing[1] }}>Period: {payslip.period}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block' }}>Pay Date: {formatDate(payslip.payDate)}</Text>
              {payslip.referenceNumber && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Ref: {payslip.referenceNumber}</Text>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[payslip.status] as any), fontSize: tokens.typography.fontSize.sm }}>{payslip.status}</span>
            </div>
          </div>

          {/* Employee Info */}
          <div style={{ marginBottom: tokens.spacing[5], padding: tokens.spacing[3], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{payslip.staffName}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{payslip.role} | Payment: {payslip.paymentMethod}</Text>
          </div>

          {/* Earnings */}
          <div style={{ marginBottom: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Earnings</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Description</th>
                  <th style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Hours</th>
                  <th style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Rate</th>
                  <th style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payslip.earnings.map((e, i) => (
                  <tr key={i}>
                    <td style={{ padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{e.label}</td>
                    <td style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{e.hours ?? '-'}</td>
                    <td style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{e.rate ? `$${e.rate}` : '-'}</td>
                    <td style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{fmt(e.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ padding: `${tokens.spacing[3]}px 0`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderTop: `1px solid ${tokens.colors.neutral[200]}` }}>Gross Pay</td>
                  <td style={{ textAlign: 'right', padding: `${tokens.spacing[3]}px 0`, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderTop: `1px solid ${tokens.colors.neutral[200]}` }}>{fmt(payslip.grossPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          <div style={{ marginBottom: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Deductions</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Description</th>
                  <th style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Type</th>
                  <th style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payslip.deductions.map((d, i) => (
                  <tr key={i}>
                    <td style={{ padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{d.label}</td>
                    <td style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0` }}>
                      <span style={{ ...createBadgeStyle(tokens, d.type === 'tax' ? 'error' : d.type === 'insurance' ? 'info' : ('secondary' as any)), fontSize: tokens.typography.fontSize.xs }}>{d.type}</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: `${tokens.spacing[2]}px 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[600] }}>-{fmt(d.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ padding: `${tokens.spacing[3]}px 0`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderTop: `1px solid ${tokens.colors.neutral[200]}` }}>Total Deductions</td>
                  <td style={{ textAlign: 'right', padding: `${tokens.spacing[3]}px 0`, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[600], borderTop: `1px solid ${tokens.colors.neutral[200]}` }}>-{fmt(payslip.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Pay */}
          <div style={{ padding: tokens.spacing[4], backgroundColor: tokens.colors.primaryScale[50], borderRadius: tokens.borderRadius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Net Pay</Text>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{fmt(payslip.netPay)}</Text>
          </div>
        </div>
      </Box>
    );
  },
});
