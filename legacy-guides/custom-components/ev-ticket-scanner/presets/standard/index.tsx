'use client';

/**
 * EvTicketScanner - Standard Preset
 * Large scan area, last scan result, recent scans list, scan stats
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createSectionHeaderStyle, createStatusDotStyle } from '../../../helpers';
import type { EvTicketScannerProps, ScanResult, ScanStats } from '../../core';

const MOCK_RECENT: ScanResult[] = [
  { ticketId: 'TK-4821', attendeeName: 'Sarah Connor', ticketType: 'VIP', status: 'valid', zone: 'Zone A', scannedAt: new Date(Date.now() - 30000) },
  { ticketId: 'TK-3917', attendeeName: 'John Reese', ticketType: 'GA', status: 'valid', zone: 'Zone B', scannedAt: new Date(Date.now() - 120000) },
  { ticketId: 'TK-2205', attendeeName: 'Kyle Smith', ticketType: 'Backstage', status: 'used', zone: 'Zone A', scannedAt: new Date(Date.now() - 180000) },
  { ticketId: 'TK-1088', attendeeName: 'Elena Diaz', ticketType: 'VIP', status: 'valid', zone: 'Zone C', scannedAt: new Date(Date.now() - 300000) },
  { ticketId: 'TK-0914', attendeeName: 'Marcus Lee', ticketType: 'GA', status: 'invalid', zone: 'Zone B', scannedAt: new Date(Date.now() - 420000) },
  { ticketId: 'TK-7763', attendeeName: 'Ava Chen', ticketType: 'Early Bird', status: 'valid', zone: 'Zone A', scannedAt: new Date(Date.now() - 600000) },
  { ticketId: 'TK-5501', attendeeName: 'Derek Miles', ticketType: 'GA', status: 'expired', zone: 'Zone D', scannedAt: new Date(Date.now() - 780000) },
  { ticketId: 'TK-3342', attendeeName: 'Nina Patel', ticketType: 'VIP', status: 'valid', zone: 'Zone A', scannedAt: new Date(Date.now() - 900000) },
];

const MOCK_STATS: ScanStats = { totalScans: 847, validScans: 812, invalidScans: 28, duplicateScans: 7 };

export const StandardEvTicketScanner = createPreset<EvTicketScannerProps>({
  name: 'EvTicketScanner.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTicketScannerProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const recentScans = props.recentScans ?? MOCK_RECENT;
    const lastScan = props.lastScan ?? recentScans[0];
    const stats = props.stats ?? MOCK_STATS;
    const [manualCode, setManualCode] = useState('');

    const statusColor = (s: string) => s === 'valid' ? tokens.colors.successScale : s === 'invalid' ? tokens.colors.errorScale : s === 'used' ? tokens.colors.warningScale : tokens.colors.neutral;
    const statusIcon = (s: string) => s === 'valid' ? '\u2705' : s === 'invalid' ? '\u274C' : s === 'used' ? '\u26A0\uFE0F' : '\u23F0';
    const statusBadge = (s: string): 'success' | 'error' | 'warning' | 'info' => s === 'valid' ? 'success' : s === 'invalid' ? 'error' : s === 'used' ? 'warning' : 'info';

    const timeSince = (d: Date) => {
      const s = Math.floor((Date.now() - d.getTime()) / 1000);
      if (s < 60) return `${s}s ago`;
      return `${Math.floor(s / 60)}m ago`;
    };

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        <div>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Ticket Scanner</h2>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Scan tickets at entry gates</span>
        </div>

        {/* Stats Row */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          {[
            { label: 'Total Scans', value: stats.totalScans, icon: '\uD83D\uDCF1', color: tokens.colors.primaryScale },
            { label: 'Valid', value: stats.validScans, icon: '\u2705', color: tokens.colors.successScale },
            { label: 'Invalid', value: stats.invalidScans, icon: '\u274C', color: tokens.colors.errorScale },
            { label: 'Duplicates', value: stats.duplicateScans, icon: '\uD83D\uDD04', color: tokens.colors.warningScale },
          ].map((s, i) => (
            <Box key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xl }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</div>
                <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{s.value.toLocaleString()}</div>
              </div>
            </Box>
          ))}
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          {/* Scan Area + Last Result */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {/* Scan Area */}
            <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
              <Box style={{ width: 140, height: 140, border: `3px dashed ${tokens.colors.primaryScale[400]}`, borderRadius: tokens.borderRadius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <span style={{ fontSize: '2rem' }}>{'\uD83D\uDCF7'}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], textAlign: 'center' }}>Point camera at QR code</span>
              </Box>
              <Box style={{ position: 'absolute', top: tokens.spacing[2], right: tokens.spacing[2] }}>
                <span style={{ ...createBadgeStyle(tokens, 'success') }}>{'\u26A1'} Live</span>
              </Box>
            </Box>

            {/* Manual Entry */}
            <Box style={cardBase}>
              <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>Manual Entry</span>
              <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Enter ticket code..." style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', backgroundColor: tokens.colors.common.white }} />
                <button onClick={() => { props.onManualEntry?.(manualCode); setManualCode(''); }} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Verify</button>
              </Box>
            </Box>

            {/* Last Scan Result */}
            {lastScan && (
              <Box style={{ ...cardBase, borderLeft: `4px solid ${statusColor(lastScan.status)[500]}` }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{lastScan.attendeeName}</div>
                    <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{lastScan.ticketType} \u2022 {lastScan.ticketId}</div>
                    {lastScan.zone && <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>{lastScan.zone}</div>}
                  </div>
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: tokens.spacing[1] }}>
                    <span style={createBadgeStyle(tokens, statusBadge(lastScan.status))}>{statusIcon(lastScan.status)} {lastScan.status.toUpperCase()}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{timeSince(lastScan.scannedAt)}</span>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Recent Scans */}
          <Box style={cardBase}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
              <span style={sectionHeader}>Recent Scans</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{recentScans.length} scans</span>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentScans.map((scan, idx) => {
                const sc = statusColor(scan.status);
                return (
                  <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px 0`, borderBottom: idx < recentScans.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                    <span style={createStatusDotStyle(tokens, sc[500])} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.attendeeName}</div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{scan.ticketType} \u2022 {scan.ticketId}</div>
                    </div>
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ ...createBadgeStyle(tokens, statusBadge(scan.status)), fontSize: tokens.typography.fontSize.xs, padding: `0 ${tokens.spacing[1]}px` }}>{scan.status}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>{timeSince(scan.scannedAt)}</span>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
