'use client';

/**
 * EvStaffCredentials - Scanner Preset
 * QR scan area with scan result display, recent scan history,
 * zone access matrix with search, and scan statistics
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

const ZONES = ['Main Floor', 'VIP', 'Backstage', 'Entry', 'Bar'];

const MOCK_CREDENTIALS: Credential[] = [
  { id: 'c1', staffName: 'Maria S.', credentialCode: 'EV-2026-0451', zones: ['Main Floor', 'VIP', 'Bar'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c2', staffName: 'Carlos R.', credentialCode: 'EV-2026-0452', zones: ['Main Floor', 'VIP', 'Backstage', 'Entry'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c3', staffName: 'Ana L.', credentialCode: 'EV-2026-0453', zones: ['Main Floor', 'Bar'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c4', staffName: 'Diego M.', credentialCode: 'EV-2026-0454', zones: ['Backstage', 'Main Floor'], status: 'suspended', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c5', staffName: 'Laura P.', credentialCode: 'EV-2026-0455', zones: ['Main Floor', 'VIP', 'Backstage', 'Entry'], status: 'active', validFrom: new Date('2026-02-01'), validUntil: new Date('2026-03-01') },
  { id: 'c6', staffName: 'Roberto G.', credentialCode: 'EV-2026-0456', zones: ['Main Floor'], status: 'expired', validFrom: new Date('2025-12-01'), validUntil: new Date('2026-01-31') },
];

const RECENT_SCANS = [
  { name: 'Maria S.', code: 'EV-2026-0451', zone: 'VIP', result: 'granted', time: '8:45 PM' },
  { name: 'Diego M.', code: 'EV-2026-0454', zone: 'VIP', result: 'denied', time: '8:42 PM' },
  { name: 'Carlos R.', code: 'EV-2026-0452', zone: 'Backstage', result: 'granted', time: '8:38 PM' },
  { name: 'Unknown', code: 'INVALID', zone: 'VIP', result: 'denied', time: '8:35 PM' },
  { name: 'Laura P.', code: 'EV-2026-0455', zone: 'Entry', result: 'granted', time: '8:30 PM' },
  { name: 'Ana L.', code: 'EV-2026-0453', zone: 'Bar', result: 'granted', time: '8:28 PM' },
];

export const ScannerEvStaffCredentials = createPreset<EvStaffCredentialsProps>({
  name: 'EvStaffCredentials.Scanner',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffCredentialsProps>) => {
    const { Box, Text } = primitives;
    const { credentials, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = credentials?.length ? credentials : MOCK_CREDENTIALS;

    const [lastScan] = useState(data[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredScan, setHoveredScan] = useState<number | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      if (!searchTerm) return data;
      return data.filter(c => c.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || c.credentialCode.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [data, searchTerm]);

    const grantedCount = RECENT_SCANS.filter(s => s.result === 'granted').length;
    const deniedCount = RECENT_SCANS.filter(s => s.result === 'denied').length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'📷'} Credential Scanner</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{RECENT_SCANS.length} recent scans {'·'} {grantedCount} granted {'·'} {deniedCount} denied</Text>
          </div>
        </div>

        {/* Scan Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Scans', value: RECENT_SCANS.length, color: tokens.colors.primaryScale[500] },
            { label: 'Granted', value: grantedCount, color: tokens.colors.successScale[500] },
            { label: 'Denied', value: deniedCount, color: tokens.colors.errorScale[500] },
            { label: 'Success Rate', value: `${Math.round((grantedCount / RECENT_SCANS.length) * 100)}%`, color: tokens.colors.infoScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* QR Scan Area */}
          <div style={{ ...cardBase, padding: tokens.spacing[5], display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
            <div style={{ width: 180, height: 180, border: `3px dashed ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.lg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing[4], position: 'relative' as const }}>
              {[{ top: -2, left: -2 }, { top: -2, right: -2 }, { bottom: -2, left: -2 }, { bottom: -2, right: -2 }].map((pos, i) => (
                <div key={i} style={{ position: 'absolute' as const, ...pos, width: 24, height: 24, borderColor: tokens.colors.primaryScale[500], borderStyle: 'solid', borderWidth: 0, ...(i < 2 ? { borderTopWidth: 3 } : { borderBottomWidth: 3 }), ...(i % 2 === 0 ? { borderLeftWidth: 3 } : { borderRightWidth: 3 }) } as any} />
              ))}
              <Text style={{ fontSize: '48px', display: 'block', marginBottom: tokens.spacing[2] }}>{'📱'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Scan QR Code</Text>
            </div>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Point camera at staff credential badge</Text>
          </div>

          {/* Last Scan Result */}
          <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Last Scan Result</Text>
            {lastScan && (
              <div style={{ backgroundColor: lastScan.status === 'active' ? tokens.colors.successScale[50] : tokens.colors.errorScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${lastScan.status === 'active' ? tokens.colors.successScale[200] : tokens.colors.errorScale[200]}`, borderRadius: tokens.borderRadius.md, padding: tokens.spacing[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                  <span style={{ fontSize: '24px' }}>{lastScan.status === 'active' ? '✅' : '❌'}</span>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: lastScan.status === 'active' ? tokens.colors.successScale[700] : tokens.colors.errorScale[700] }}>
                    {lastScan.status === 'active' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </Text>
                </div>
                {[
                  { label: 'Name', value: lastScan.staffName },
                  { label: 'Code', value: lastScan.credentialCode },
                  { label: 'Status', value: lastScan.status.toUpperCase() },
                  { label: 'Zones', value: lastScan.zones.join(', ') },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[1]}px 0`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${lastScan.status === 'active' ? tokens.colors.successScale[100] : tokens.colors.errorScale[100]}` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{item.label}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{item.value}</Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Scan History */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[4] }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{'📋'} Recent Scans</Text>
          </div>
          {RECENT_SCANS.map((scan, i) => {
            const isHovered = hoveredScan === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredScan(i)}
                onMouseLeave={() => setHoveredScan(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.md }}>{scan.result === 'granted' ? '✅' : '❌'}</span>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{scan.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{scan.code}</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span style={createBadgeStyle(tokens, 'info')}>{scan.zone}</span>
                  <span style={createBadgeStyle(tokens, scan.result === 'granted' ? 'success' : 'error')}>{scan.result}</span>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], minWidth: 50, textAlign: 'right' as const }}>{scan.time}</Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone Access Matrix */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{'🗺️'} Zone Access Matrix</Text>
            <div style={{ flex: 1, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr>
                <th style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>Staff</th>
                {ZONES.map(z => (
                  <th key={z} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{z}</th>
                ))}
                <th style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(c => {
                const isHovered = hoveredRow === c.id;
                return (
                  <tr
                    key={c.id}
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent', transition: `background-color ${tokens.motion.hover}` }}
                  >
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{c.staffName}</td>
                    {ZONES.map(z => (
                      <td key={z} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        {c.zones.includes(z) ? (
                          <span style={{ color: tokens.colors.successScale[500], fontSize: tokens.typography.fontSize.lg }}>{'✓'}</span>
                        ) : (
                          <span style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.lg }}>{'—'}</span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, c.status === 'active' ? 'success' : c.status === 'suspended' ? 'warning' : 'secondary')}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No staff match your search</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
