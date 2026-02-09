'use client';

/**
 * EvCheckInMonitor - Map Preset
 * Zone heatmap grid layout with real-time counters and capacity alerts
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createProgressBarStyle, createSectionHeaderStyle } from '../../../helpers';
import type { EvCheckInMonitorProps, ZoneHeat, EntryPoint } from '../../core';

const MOCK_ZONES: ZoneHeat[] = [
  { zoneId: '1', zoneName: 'Main Stage', currentCount: 1200, capacity: 1500, heatLevel: 'high' },
  { zoneId: '2', zoneName: 'VIP Lounge', currentCount: 380, capacity: 500, heatLevel: 'medium' },
  { zoneId: '3', zoneName: 'Food Court', currentCount: 620, capacity: 1000, heatLevel: 'low' },
  { zoneId: '4', zoneName: 'Backstage', currentCount: 147, capacity: 200, heatLevel: 'medium' },
  { zoneId: '5', zoneName: 'Parking Lot', currentCount: 760, capacity: 800, heatLevel: 'critical' },
  { zoneId: '6', zoneName: 'Merch Area', currentCount: 210, capacity: 400, heatLevel: 'low' },
];

const MOCK_ENTRIES: EntryPoint[] = [
  { id: '1', name: 'North Gate', entriesPerMinute: 8, status: 'active' },
  { id: '2', name: 'South Gate', entriesPerMinute: 5, status: 'active' },
  { id: '3', name: 'VIP Entrance', entriesPerMinute: 3, status: 'active' },
  { id: '4', name: 'Emergency Exit', entriesPerMinute: 0, status: 'closed' },
];

export const MapEvCheckInMonitor = createPreset<EvCheckInMonitorProps>({
  name: 'EvCheckInMonitor.Map',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvCheckInMonitorProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const zones = props.zones ?? MOCK_ZONES;
    const entryPoints = props.entryPoints ?? MOCK_ENTRIES;

    const totalIn = zones.reduce((s, z) => s + z.currentCount, 0);
    const totalCap = zones.reduce((s, z) => s + z.capacity, 0);

    const heatBg = (h: string) => h === 'low' ? tokens.colors.successScale[50] : h === 'medium' ? tokens.colors.warningScale[50] : h === 'high' ? tokens.colors.errorScale[50] : tokens.colors.errorScale[100];
    const heatBorder = (h: string) => h === 'low' ? tokens.colors.successScale[300] : h === 'medium' ? tokens.colors.warningScale[300] : h === 'high' ? tokens.colors.errorScale[300] : tokens.colors.errorScale[500];
    const heatText = (h: string) => h === 'low' ? tokens.colors.successScale[700] : h === 'medium' ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700];

    const criticalZones = zones.filter(z => z.heatLevel === 'critical' || z.heatLevel === 'high');

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Venue Map</h2>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Zone heatmap - {totalIn.toLocaleString()} / {totalCap.toLocaleString()} total</span>
          </div>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={createBadgeStyle(tokens, 'success')}>{'\u26A1'} Live</span>
            {criticalZones.length > 0 && <span style={createBadgeStyle(tokens, 'error')}>{'\u26A0\uFE0F'} {criticalZones.length} alert{criticalZones.length > 1 ? 's' : ''}</span>}
          </Box>
        </Box>

        {/* Alerts */}
        {criticalZones.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {criticalZones.map(z => {
              const pct = Math.round((z.currentCount / z.capacity) * 100);
              return (
                <Box key={z.zoneId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.errorScale[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span>{'\uD83D\uDD34'}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700] }}>{z.zoneName} at {pct}% capacity</span>
                  </Box>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[600] }}>{z.currentCount}/{z.capacity}</span>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Zone Heatmap Grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
          {zones.map((z) => {
            const pct = Math.round((z.currentCount / z.capacity) * 100);
            const pb = createProgressBarStyle(tokens, { percent: pct, color: heatText(z.heatLevel) });
            return (
              <Box key={z.zoneId} onClick={() => props.onZoneClick?.(z.zoneId)} style={{
                ...cardBase, backgroundColor: heatBg(z.heatLevel),
                border: `2px solid ${heatBorder(z.heatLevel)}`,
                cursor: props.onZoneClick ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', gap: tokens.spacing[2],
                transition: `all ${tokens.motion.hover}`,
              }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{z.zoneName}</span>
                  <span style={createBadgeStyle(tokens, z.heatLevel === 'critical' || z.heatLevel === 'high' ? 'error' : z.heatLevel === 'medium' ? 'warning' : 'success')}>{z.heatLevel}</span>
                </Box>
                <Box style={{ textAlign: 'center', padding: tokens.spacing[2] }}>
                  <div style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: heatText(z.heatLevel) }}>{z.currentCount.toLocaleString()}</div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>of {z.capacity.toLocaleString()}</div>
                </Box>
                <Box style={{ ...pb.track, height: 6 }}><Box style={pb.fill} /></Box>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textAlign: 'center' }}>{pct}% full - {z.capacity - z.currentCount} spots left</div>
              </Box>
            );
          })}
        </Box>

        {/* Legend + Entry Points */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: tokens.spacing[4] }}>
          <Box style={cardBase}>
            <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>Heat Legend</span>
            {['low', 'medium', 'high', 'critical'].map(h => (
              <Box key={h} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0` }}>
                <Box style={{ width: 16, height: 16, borderRadius: tokens.borderRadius.sm, backgroundColor: heatBg(h), border: `1px solid ${heatBorder(h)}` }} />
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], textTransform: 'capitalize' }}>{h}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginLeft: 'auto' }}>{h === 'low' ? '<50%' : h === 'medium' ? '50-75%' : h === 'high' ? '75-90%' : '>90%'}</span>
              </Box>
            ))}
          </Box>
          <Box style={cardBase}>
            <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[2] }}>Gate Activity</span>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[2] }}>
              {entryPoints.map(ep => (
                <Box key={ep.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white }}>
                  <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: ep.status === 'active' ? tokens.colors.successScale[500] : tokens.colors.neutral[400] }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{ep.name}</div>
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: ep.status === 'active' ? tokens.colors.neutral[900] : tokens.colors.neutral[400] }}>{ep.entriesPerMinute}/m</span>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
