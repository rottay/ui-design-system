'use client';

/**
 * EvTicketScanner - Kiosk Preset
 * Full-screen scan area with large status display and minimal UI
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { EvTicketScannerProps, ScanResult, ScanStats } from '../../core';

const MOCK_LAST: ScanResult = { ticketId: 'TK-4821', attendeeName: 'Sarah Connor', ticketType: 'VIP', status: 'valid', zone: 'Zone A', scannedAt: new Date(Date.now() - 5000) };
const MOCK_STATS: ScanStats = { totalScans: 847, validScans: 812, invalidScans: 28, duplicateScans: 7 };

export const KioskEvTicketScanner = createPreset<EvTicketScannerProps>({
  name: 'EvTicketScanner.Kiosk',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTicketScannerProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);

    const lastScan = props.lastScan ?? MOCK_LAST;
    const stats = props.stats ?? MOCK_STATS;

    const statusConfig: Record<string, { bg: string; color: string; icon: string; label: string }> = {
      valid: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[600], icon: '\u2705', label: 'ACCESS GRANTED' },
      invalid: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[600], icon: '\u274C', label: 'ACCESS DENIED' },
      used: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[600], icon: '\u26A0\uFE0F', label: 'ALREADY USED' },
      expired: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], icon: '\u23F0', label: 'EXPIRED TICKET' },
    };

    const cfg = statusConfig[lastScan.status] ?? statusConfig.invalid;
    const validRate = stats.totalScans > 0 ? Math.round((stats.validScans / stats.totalScans) * 100) : 0;

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.neutral[900], ...props.style }}>
        {/* Top bar */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[700]}` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.lg }}>{'\uD83C\uDFAB'}</span>
            <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>Kiosk Scanner</span>
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
            {[
              { label: 'Scanned', value: stats.totalScans },
              { label: 'Valid', value: `${validRate}%` },
            ].map((s, i) => (
              <Box key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{s.label}</div>
                <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{s.value}</div>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Main content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[6], padding: tokens.spacing[6] }}>
          {/* Large scan area */}
          <Box style={{ width: 260, height: 260, border: `4px dashed ${tokens.colors.primaryScale[400]}`, borderRadius: tokens.borderRadius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: tokens.spacing[3], position: 'relative' }}>
            <span style={{ fontSize: '4rem' }}>{'\uD83D\uDCF7'}</span>
            <span style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>Scan QR Code</span>
            {/* Corner markers */}
            {[{ t: 0, l: 0 }, { t: 0, r: 0 }, { b: 0, l: 0 }, { b: 0, r: 0 }].map((pos, i) => (
              <Box key={i} style={{ position: 'absolute', width: 24, height: 24, borderColor: tokens.colors.primaryScale[500], borderStyle: 'solid', borderWidth: 0, ...{ top: pos.t, left: pos.l, right: (pos as any).r, bottom: (pos as any).b }, ...(i === 0 ? { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: tokens.borderRadius.md } : i === 1 ? { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: tokens.borderRadius.md } : i === 2 ? { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: tokens.borderRadius.md } : { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: tokens.borderRadius.md }) }} />
            ))}
          </Box>

          {/* Large status display */}
          <Box style={{ width: '100%', maxWidth: 400, padding: tokens.spacing[6], borderRadius: tokens.borderRadius.lg, backgroundColor: cfg.bg, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[3] }}>
            <span style={{ fontSize: '3rem' }}>{cfg.icon}</span>
            <div style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: cfg.color }}>{cfg.label}</div>
            <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{lastScan.attendeeName}</div>
            <Box style={{ display: 'flex', gap: tokens.spacing[3] }}>
              <span style={createBadgeStyle(tokens, lastScan.status === 'valid' ? 'success' : lastScan.status === 'invalid' ? 'error' : 'warning')}>{lastScan.ticketType}</span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{lastScan.ticketId}</span>
              {lastScan.zone && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{lastScan.zone}</span>}
            </Box>
          </Box>
        </Box>

        {/* Bottom stats bar */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${tokens.colors.neutral[700]}` }}>
          {[
            { label: 'Total', value: stats.totalScans, color: tokens.colors.common.white },
            { label: 'Valid', value: stats.validScans, color: tokens.colors.successScale[400] },
            { label: 'Invalid', value: stats.invalidScans, color: tokens.colors.errorScale[400] },
            { label: 'Duplicate', value: stats.duplicateScans, color: tokens.colors.warningScale[400] },
          ].map((s, i) => (
            <Box key={i} style={{ textAlign: 'center', padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`, borderRight: i < 3 ? `1px solid ${tokens.colors.neutral[700]}` : 'none' }}>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</div>
              <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color }}>{s.value}</div>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
