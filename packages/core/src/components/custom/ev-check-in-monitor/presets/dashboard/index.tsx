'use client';

/**
 * EvCheckInMonitor - Dashboard Preset
 * Live stats, zone capacity bars, entry point cards, flow rate chart
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createProgressBarStyle, createSectionHeaderStyle, createStatusDotStyle } from '../../../helpers';
import type { EvCheckInMonitorProps, CheckInStat, ZoneHeat, EntryPoint } from '../../core';

const MOCK_STATS: CheckInStat[] = [
  { label: 'Checked In', value: 2847, total: 5000, rate: 12 },
  { label: 'Rate', value: 12, total: 20, rate: 12 },
  { label: 'Zones Active', value: 4, total: 5, rate: 0 },
  { label: 'Avg Wait', value: 3, total: 10, rate: -2 },
];

const MOCK_ZONES: ZoneHeat[] = [
  { zoneId: '1', zoneName: 'Main Stage', currentCount: 1200, capacity: 1500, heatLevel: 'high' },
  { zoneId: '2', zoneName: 'VIP Lounge', currentCount: 380, capacity: 500, heatLevel: 'medium' },
  { zoneId: '3', zoneName: 'Food Court', currentCount: 620, capacity: 1000, heatLevel: 'low' },
  { zoneId: '4', zoneName: 'Backstage', currentCount: 147, capacity: 200, heatLevel: 'medium' },
  { zoneId: '5', zoneName: 'Parking Lot', currentCount: 500, capacity: 800, heatLevel: 'critical' },
];

const MOCK_ENTRIES: EntryPoint[] = [
  { id: '1', name: 'North Gate', entriesPerMinute: 8, status: 'active' },
  { id: '2', name: 'South Gate', entriesPerMinute: 5, status: 'active' },
  { id: '3', name: 'VIP Entrance', entriesPerMinute: 3, status: 'active' },
  { id: '4', name: 'Staff Gate', entriesPerMinute: 1, status: 'active' },
  { id: '5', name: 'Emergency Exit', entriesPerMinute: 0, status: 'closed' },
];

export const DashboardEvCheckInMonitor = createPreset<EvCheckInMonitorProps>({
  name: 'EvCheckInMonitor.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvCheckInMonitorProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const stats = props.stats ?? MOCK_STATS;
    const zones = props.zones ?? MOCK_ZONES;
    const entryPoints = props.entryPoints ?? MOCK_ENTRIES;

    const heatColor = (h: string) => h === 'low' ? tokens.colors.successScale : h === 'medium' ? tokens.colors.warningScale : h === 'high' ? tokens.colors.errorScale : tokens.colors.errorScale;
    const heatIcon = (h: string) => h === 'low' ? '\uD83D\uDFE2' : h === 'medium' ? '\uD83D\uDFE1' : h === 'high' ? '\uD83D\uDFE0' : '\uD83D\uDD34';
    const entryStatusColor = (s: string) => s === 'active' ? tokens.colors.successScale[500] : s === 'idle' ? tokens.colors.warningScale[500] : tokens.colors.neutral[400];

    // Flow chart mock data
    const flowData = [4, 6, 8, 12, 15, 12, 10, 8, 11, 14, 12, 9];
    const maxFlow = Math.max(...flowData);

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Check-In Monitor</h2>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Real-time attendance tracking</span>
          </div>
          <span style={createBadgeStyle(tokens, 'success')}>{'\u26A1'} Live</span>
        </Box>

        {/* Stats Row */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          {stats.map((s, i) => {
            const pct = Math.round((s.value / s.total) * 100);
            const pbar = createProgressBarStyle(tokens, { percent: pct, color: pct > 80 ? tokens.colors.errorScale[500] : pct > 50 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500] });
            return (
              <Box key={i} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>{s.label}</span>
                <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1] }}>
                  <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{s.value.toLocaleString()}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>/ {s.total.toLocaleString()}{i === 1 ? '/min' : i === 3 ? ' min' : ''}</span>
                </Box>
                <Box style={pbar.track}><Box style={pbar.fill} /></Box>
              </Box>
            );
          })}
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[4] }}>
          {/* Zone Capacity */}
          <Box style={cardBase}>
            <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>Zone Capacity</span>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {zones.map((z) => {
                const pct = Math.round((z.currentCount / z.capacity) * 100);
                const hc = heatColor(z.heatLevel);
                const pb = createProgressBarStyle(tokens, { percent: pct, color: hc[500] });
                return (
                  <Box key={z.zoneId} onClick={() => props.onZoneClick?.(z.zoneId)} style={{ cursor: props.onZoneClick ? 'pointer' : 'default' }}>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span>{heatIcon(z.heatLevel)}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{z.zoneName}</span>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{z.currentCount} / {z.capacity}</span>
                        <span style={createBadgeStyle(tokens, z.heatLevel === 'critical' ? 'error' : z.heatLevel === 'high' ? 'error' : z.heatLevel === 'medium' ? 'warning' : 'success')}>{pct}%</span>
                      </Box>
                    </Box>
                    <Box style={{ ...pb.track, height: 8 }}><Box style={pb.fill} /></Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Entry Points */}
          <Box style={cardBase}>
            <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>Entry Points</span>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {entryPoints.map((ep) => (
                <Box key={ep.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={createStatusDotStyle(tokens, entryStatusColor(ep.status))} />
                    <div>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{ep.name}</div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ep.status}</div>
                    </div>
                  </Box>
                  <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: ep.status === 'active' ? tokens.colors.neutral[900] : tokens.colors.neutral[400] }}>{ep.entriesPerMinute}/min</span>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Flow Rate Chart */}
        <Box style={cardBase}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
            <span style={sectionHeader}>Entry Flow Rate (last hour)</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>entries/min</span>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height: 80 }}>
            {flowData.map((v, i) => (
              <Box key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{v}</span>
                <Box style={{ width: '100%', height: `${(v / maxFlow) * 60}px`, backgroundColor: v > 12 ? tokens.colors.errorScale[400] : v > 8 ? tokens.colors.warningScale[400] : tokens.colors.primaryScale[400], borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`, transition: 'height 0.3s ease' }} />
              </Box>
            ))}
          </Box>
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>12:00</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Now</span>
          </Box>
        </Box>
      </Box>
    );
  },
});
