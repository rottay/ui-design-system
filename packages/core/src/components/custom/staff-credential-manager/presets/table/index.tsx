'use client';

/**
 * StaffCredentialManager - Table Preset
 * Tabular credential list with sortable columns
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffCredentialManagerProps, StaffCredential } from '../../core';

const MOCK_CREDENTIALS: StaffCredential[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', type: 'certification', name: 'Food Safety Handler', issuedBy: 'ServSafe', issuedAt: new Date('2024-01-10'), expiresAt: new Date('2027-01-10'), status: 'valid' },
  { id: '2', staffId: '1', staffName: 'Maria S.', type: 'license', name: 'Beverage Service', issuedBy: 'State Board', issuedAt: new Date('2023-06-15'), expiresAt: new Date('2025-03-15'), status: 'expiring-soon' },
  { id: '3', staffId: '2', staffName: 'Carlos R.', type: 'certification', name: 'CPR/First Aid', issuedBy: 'Red Cross', issuedAt: new Date('2023-01-20'), expiresAt: new Date('2024-01-20'), status: 'expired' },
];

const STATUS_MAP: Record<string, string> = { valid: 'success', 'expiring-soon': 'warning', expired: 'error', 'pending-verification': 'info' };

export const TableStaffCredentialManager = createPreset<StaffCredentialManagerProps>({
  name: 'StaffCredentialManager.Table',
  render: ({ primitives, props, tokens }: PresetContext<StaffCredentialManagerProps>) => {
    const { Box, Text } = primitives;
    const { credentials: propCreds, onCredentialClick, onVerify, onRenew, onAddCredential, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const creds = propCreds?.length ? propCreds : MOCK_CREDENTIALS;

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Credentials</Text>
          <button onClick={onAddCredential} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ Add</button>
        </div>

        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Staff', 'Credential', 'Type', 'Issued By', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: tokens.spacing[3], textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creds.map(c => (
                <tr key={c.id} onClick={() => onCredentialClick?.(c.id)} style={{ cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50]; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{c.staffName}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{c.name}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <span style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs, textTransform: 'capitalize' }}>{c.type}</span>
                  </td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{c.issuedBy}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{c.expiresAt ? formatDate(c.expiresAt) : 'N/A'}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[c.status] as any), fontSize: tokens.typography.fontSize.xs }}>{c.status.replace('-', ' ')}</span>
                  </td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      {c.status === 'pending-verification' && <button onClick={e => { e.stopPropagation(); onVerify?.(c.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.infoScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Verify</button>}
                      {c.status === 'expired' && <button onClick={e => { e.stopPropagation(); onRenew?.(c.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.warningScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Renew</button>}
                    </div>
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
