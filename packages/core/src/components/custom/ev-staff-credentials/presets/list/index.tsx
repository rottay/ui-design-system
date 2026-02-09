'use client';

/**
 * EvStaffCredentials - List Preset
 * Credentials table with status badges, zone chips, action buttons,
 * search input, status filter pills, and hover interactions
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvStaffCredentialsProps, Credential } from '../../core';

const MOCK_CREDENTIALS: Credential[] = [
  { id: 'c1', staffName: 'Maria S.', credentialCode: 'EV-2026-0451', zones: ['Main Floor', 'VIP', 'Bar'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c2', staffName: 'Carlos R.', credentialCode: 'EV-2026-0452', zones: ['Main Floor', 'VIP', 'Backstage', 'Entry'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c3', staffName: 'Ana L.', credentialCode: 'EV-2026-0453', zones: ['Main Floor', 'Bar'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c4', staffName: 'Diego M.', credentialCode: 'EV-2026-0454', zones: ['Backstage', 'Main Floor'], status: 'suspended', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c5', staffName: 'Laura P.', credentialCode: 'EV-2026-0455', zones: ['Main Floor', 'VIP', 'Backstage', 'Entry'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c6', staffName: 'Roberto G.', credentialCode: 'EV-2026-0456', zones: ['Main Floor'], status: 'expired', validFrom: new Date('2025-12-01'), validUntil: new Date('2026-01-31') },
  { id: 'c7', staffName: 'Sofia T.', credentialCode: 'EV-2026-0457', zones: ['Main Floor', 'Bar', 'VIP'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c8', staffName: 'Pedro K.', credentialCode: 'EV-2026-0458', zones: ['Main Floor', 'Entry'], status: 'revoked', validFrom: new Date('2026-01-15'), validUntil: new Date('2026-02-15') },
];

const STATUS_OPTIONS = ['all', 'active', 'suspended', 'expired', 'revoked'];

export const ListEvStaffCredentials = createPreset<EvStaffCredentialsProps>({
  name: 'EvStaffCredentials.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffCredentialsProps>) => {
    const { Box, Text } = primitives;
    const { credentials, onActivate, onSuspend, onRevoke, onGenerate, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = credentials?.length ? credentials : MOCK_CREDENTIALS;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      return data.filter(c => {
        if (searchTerm && !c.staffName.toLowerCase().includes(searchTerm.toLowerCase()) && !c.credentialCode.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return true;
      });
    }, [data, searchTerm, statusFilter]);

    const activeCount = data.filter(c => c.status === 'active').length;
    const suspendedCount = data.filter(c => c.status === 'suspended').length;
    const expiredCount = data.filter(c => c.status === 'expired').length;
    const revokedCount = data.filter(c => c.status === 'revoked').length;

    const statusConfig: Record<string, { color: 'success' | 'warning' | 'error' | 'secondary'; label: string }> = {
      active: { color: 'success', label: 'Active' },
      suspended: { color: 'warning', label: 'Suspended' },
      revoked: { color: 'error', label: 'Revoked' },
      expired: { color: 'secondary', label: 'Expired' },
    };

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'🎫'} Staff Credentials</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{activeCount} active of {data.length} total {'·'} {filteredData.length} shown</Text>
          </div>
          <div onClick={() => onGenerate?.('')} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
            + Generate Credential
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Active', count: activeCount, color: tokens.colors.successScale[500] },
            { label: 'Suspended', count: suspendedCount, color: tokens.colors.warningScale[500] },
            { label: 'Expired', count: expiredCount, color: tokens.colors.neutral[400] },
            { label: 'Revoked', count: revokedCount, color: tokens.colors.errorScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.count}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input type="text" placeholder="Search name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {STATUS_OPTIONS.map(st => (
                <div key={st} onClick={() => setStatusFilter(st)} style={createFilterPillStyle(tokens, { active: statusFilter === st })}>
                  {st === 'all' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Staff', 'Code', 'Zones', 'Valid Until', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(c => {
                const sc = statusConfig[c.status];
                const isHovered = hoveredRow === c.id;
                return (
                  <tr
                    key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent', transition: `background-color ${tokens.motion.hover}` }}
                  >
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div style={{ width: 30, height: 30, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>
                          {c.staffName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{c.staffName}</Text>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontFamily: 'monospace' }}>{c.credentialCode}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                        {c.zones.map(z => <span key={z} style={{ fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700] }}>{z}</span>)}
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{formatDate(c.validUntil)}</td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}><span style={createBadgeStyle(tokens, sc.color)}>{sc.label}</span></td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                        {c.status === 'suspended' && <div onClick={() => onActivate?.(c.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[300]}`, backgroundColor: tokens.colors.successScale[50], color: tokens.colors.successScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>Activate</div>}
                        {c.status === 'active' && <div onClick={() => onSuspend?.(c.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[300]}`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>Suspend</div>}
                        {c.status !== 'revoked' && <div onClick={() => onRevoke?.(c.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>Revoke</div>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'🎫'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No credentials match your filters</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
