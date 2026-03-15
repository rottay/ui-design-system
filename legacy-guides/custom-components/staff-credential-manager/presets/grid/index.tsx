'use client';

/**
 * StaffCredentialManager - Grid Preset
 * Card grid of credentials with visual expiry indicators
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { StaffCredentialManagerProps, StaffCredential } from '../../core';

const MOCK_CREDENTIALS: StaffCredential[] = [
  { id: '1', staffId: '1', staffName: 'Maria S.', type: 'certification', name: 'Food Safety Handler', issuedBy: 'ServSafe', issuedAt: new Date('2024-01-10'), expiresAt: new Date('2027-01-10'), status: 'valid', verifiedBy: 'Admin' },
  { id: '2', staffId: '1', staffName: 'Maria S.', type: 'license', name: 'Responsible Beverage Service', issuedBy: 'State Board', issuedAt: new Date('2023-06-15'), expiresAt: new Date('2025-03-15'), status: 'expiring-soon' },
  { id: '3', staffId: '2', staffName: 'Carlos R.', type: 'certification', name: 'CPR/First Aid', issuedBy: 'Red Cross', issuedAt: new Date('2023-01-20'), expiresAt: new Date('2024-01-20'), status: 'expired' },
  { id: '4', staffId: '2', staffName: 'Carlos R.', type: 'license', name: 'Security Guard License', issuedBy: 'State Authority', issuedAt: new Date('2024-03-01'), expiresAt: new Date('2026-03-01'), status: 'valid', verifiedBy: 'Admin' },
  { id: '5', staffId: '3', staffName: 'Diego M.', type: 'training', name: 'Audio Engineering Cert', issuedBy: 'Audio Institute', issuedAt: new Date('2023-09-01'), status: 'valid' },
  { id: '6', staffId: '4', staffName: 'Ana L.', type: 'badge', name: 'VIP Access Badge', issuedBy: 'Internal', issuedAt: new Date('2024-07-01'), status: 'pending-verification' },
];

const STATUS_MAP: Record<string, string> = { valid: 'success', 'expiring-soon': 'warning', expired: 'error', 'pending-verification': 'info' };
const TYPE_ICONS: Record<string, string> = { certification: '[C]', license: '[L]', training: '[T]', badge: '[B]' };

export const GridStaffCredentialManager = createPreset<StaffCredentialManagerProps>({
  name: 'StaffCredentialManager.Grid',
  render: ({ primitives, props, tokens }: PresetContext<StaffCredentialManagerProps>) => {
    const { Box, Text } = primitives;
    const { credentials: propCreds, onCredentialClick, onVerify, onRenew, onAddCredential, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const creds = propCreds?.length ? propCreds : MOCK_CREDENTIALS;

    const [typeFilter, setTypeFilter] = useState('all');
    const filtered = useMemo(() => typeFilter === 'all' ? creds : creds.filter(c => c.type === typeFilter), [creds, typeFilter]);

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const daysUntilExpiry = (d?: Date) => d ? Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

    const expiring = creds.filter(c => c.status === 'expiring-soon').length;
    const expired = creds.filter(c => c.status === 'expired').length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Credential Manager</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {creds.length} credentials {expiring > 0 ? `| ${expiring} expiring soon` : ''} {expired > 0 ? `| ${expired} expired` : ''}
            </Text>
          </div>
          <button onClick={onAddCredential} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ Add Credential</button>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          {['all', 'certification', 'license', 'training', 'badge'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, border: typeFilter === t ? 'none' : `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: typeFilter === t ? tokens.colors.primaryScale[600] : tokens.colors.common.white, color: typeFilter === t ? tokens.colors.common.white : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
          {filtered.map(cred => {
            const days = daysUntilExpiry(cred.expiresAt);
            return (
              <div
                key={cred.id}
                onClick={() => onCredentialClick?.(cred.id)}
                style={{ ...cardBase, ...hoverStyle, padding: tokens.spacing[4], cursor: 'pointer', borderLeft: `4px solid ${cred.status === 'valid' ? tokens.colors.successScale[500] : cred.status === 'expiring-soon' ? tokens.colors.warningScale[500] : cred.status === 'expired' ? tokens.colors.errorScale[500] : tokens.colors.infoScale[500]}` }}
                onMouseEnter={e => { Object.assign(e.currentTarget.style, getHoverTransform(tokens)); }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{TYPE_ICONS[cred.type]} {cred.type}</Text>
                  <span style={{ ...createBadgeStyle(tokens, STATUS_MAP[cred.status] as any), fontSize: tokens.typography.fontSize.xs }}>{cred.status.replace('-', ' ')}</span>
                </div>

                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{cred.name}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{cred.staffName}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginBottom: tokens.spacing[2] }}>Issued by {cred.issuedBy} | {formatDate(cred.issuedAt)}</Text>

                {cred.expiresAt && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: days !== null && days < 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>
                    Expires: {formatDate(cred.expiresAt)} {days !== null && days > 0 ? `(${days}d)` : days !== null && days <= 0 ? '(EXPIRED)' : ''}
                  </Text>
                )}

                {/* QR Code placeholder */}
                <div style={{ width: 48, height: 48, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>QR</Text>
                </div>

                <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                  {cred.status === 'pending-verification' && (
                    <button onClick={e => { e.stopPropagation(); onVerify?.(cred.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.infoScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Verify</button>
                  )}
                  {cred.status === 'expired' && (
                    <button onClick={e => { e.stopPropagation(); onRenew?.(cred.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.warningScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Renew</button>
                  )}
                  {cred.verifiedBy && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>✓ Verified</Text>}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
