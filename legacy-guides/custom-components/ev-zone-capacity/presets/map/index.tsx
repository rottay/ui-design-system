'use client';

/**
 * EvZoneCapacity - Map Preset
 * Visual zone grid with heatmap colors, flow indicators, capacity badges, threshold alerts, legend
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvZoneCapacityProps, ZoneInfo, FlowData } from '../../core';

const MOCK_ZONES: ZoneInfo[] = [
  { id: 'z1', name: 'Main Stage', currentCount: 1280, capacity: 1500, percentage: 85, status: 'warning', color: '#FF9800' },
  { id: 'z2', name: 'VIP Lounge', currentCount: 180, capacity: 200, percentage: 90, status: 'critical', color: '#F44336' },
  { id: 'z3', name: 'Food Court', currentCount: 420, capacity: 1000, percentage: 42, status: 'normal', color: '#4CAF50' },
  { id: 'z4', name: 'Backstage', currentCount: 85, capacity: 150, percentage: 57, status: 'normal', color: '#4CAF50' },
  { id: 'z5', name: 'Parking Lot', currentCount: 720, capacity: 800, percentage: 90, status: 'critical', color: '#F44336' },
  { id: 'z6', name: 'Merch Area', currentCount: 310, capacity: 400, percentage: 78, status: 'warning', color: '#FF9800' },
  { id: 'z7', name: 'Beer Garden', currentCount: 250, capacity: 600, percentage: 42, status: 'normal', color: '#4CAF50' },
  { id: 'z8', name: 'Dance Floor', currentCount: 890, capacity: 1000, percentage: 89, status: 'warning', color: '#FF9800' },
  { id: 'z9', name: 'Chill Zone', currentCount: 65, capacity: 300, percentage: 22, status: 'normal', color: '#4CAF50' },
];

const MOCK_FLOW: FlowData[] = [
  { zoneId: 'z1', entriesPerMinute: 12, exitsPerMinute: 8, netFlow: 4 },
  { zoneId: 'z2', entriesPerMinute: 5, exitsPerMinute: 2, netFlow: 3 },
  { zoneId: 'z3', entriesPerMinute: 15, exitsPerMinute: 18, netFlow: -3 },
  { zoneId: 'z4', entriesPerMinute: 2, exitsPerMinute: 3, netFlow: -1 },
  { zoneId: 'z5', entriesPerMinute: 8, exitsPerMinute: 3, netFlow: 5 },
  { zoneId: 'z6', entriesPerMinute: 10, exitsPerMinute: 7, netFlow: 3 },
  { zoneId: 'z7', entriesPerMinute: 6, exitsPerMinute: 4, netFlow: 2 },
  { zoneId: 'z8', entriesPerMinute: 14, exitsPerMinute: 10, netFlow: 4 },
  { zoneId: 'z9', entriesPerMinute: 3, exitsPerMinute: 2, netFlow: 1 },
];

export const MapEvZoneCapacity = createPreset<EvZoneCapacityProps>({
  name: 'EvZoneCapacity.Map',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvZoneCapacityProps>) => {
    const { Box, Text } = primitives;

    const zones = props.zones ?? MOCK_ZONES;
    const flowData = props.flowData ?? MOCK_FLOW;
    const { onZoneClick, onSetThreshold, className, style } = props;

    const [hoveredZone, setHoveredZone] = useState<string | null>(null);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalIn = zones.reduce((s, z) => s + z.currentCount, 0);
    const totalCap = zones.reduce((s, z) => s + z.capacity, 0);
    const overallPct = totalCap > 0 ? Math.round((totalIn / totalCap) * 100) : 0;

    const criticalZones = zones.filter(z => z.status === 'critical');
    const warningZones = zones.filter(z => z.status === 'warning');

    const heatBg = (s: string) => s === 'normal' ? tokens.colors.successScale[50] : s === 'warning' ? tokens.colors.warningScale[50] : s === 'critical' ? tokens.colors.errorScale[50] : tokens.colors.neutral[100];
    const heatBorder = (s: string) => s === 'normal' ? tokens.colors.successScale[300] : s === 'warning' ? tokens.colors.warningScale[300] : s === 'critical' ? tokens.colors.errorScale[500] : tokens.colors.neutral[300];
    const heatText = (s: string) => s === 'normal' ? tokens.colors.successScale[700] : s === 'warning' ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700];
    const statusIcon = (s: string) => s === 'normal' ? '\uD83D\uDFE2' : s === 'warning' ? '\uD83D\uDFE1' : s === 'critical' ? '\uD83D\uDD34' : '\u26D4';

    const selectedZoneData = selectedZone ? zones.find(z => z.id === selectedZone) : null;
    const selectedZoneFlow = selectedZone ? flowData.find(f => f.zoneId === selectedZone) : null;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Venue Map
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Zone heatmap - {totalIn.toLocaleString()} / {totalCap.toLocaleString()} total ({overallPct}%)
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={createBadgeStyle(tokens, 'success')}>{'\u26A1'} Live</span>
            {criticalZones.length > 0 && <span style={createBadgeStyle(tokens, 'error')}>{'\u26A0\uFE0F'} {criticalZones.length} alert{criticalZones.length > 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Alerts */}
        {criticalZones.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
            {criticalZones.map(z => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.errorScale[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span>{'\uD83D\uDD34'}</span>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700] }}>{z.name} at {z.percentage}% capacity</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.errorScale[600] }}>{z.currentCount}/{z.capacity}</Text>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selectedZoneData ? '2fr 1fr' : '1fr', gap: tokens.spacing[5] }}>
          {/* Zone Heatmap Grid */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
              {zones.map((zone) => {
                const isHovered = hoveredZone === zone.id;
                const isSelected = selectedZone === zone.id;
                const flow = flowData.find(f => f.zoneId === zone.id);
                const pb = createProgressBarStyle(tokens, { percent: zone.percentage, color: heatText(zone.status) });
                return (
                  <div
                    key={zone.id}
                    onClick={() => { setSelectedZone(selectedZone === zone.id ? null : zone.id); onZoneClick?.(zone.id); }}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    style={{
                      ...cardBase,
                      backgroundColor: heatBg(zone.status),
                      border: `2px solid ${isSelected ? tokens.colors.primaryScale[500] : heatBorder(zone.status)}`,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2],
                      ...hoverStyle,
                      ...(isHovered ? getHoverTransform(tokens) : {}),
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{zone.name}</Text>
                      <span style={createBadgeStyle(tokens, zone.status === 'critical' ? 'error' : zone.status === 'warning' ? 'warning' : 'success')}>{zone.status}</span>
                    </div>
                    <div style={{ textAlign: 'center' as const, padding: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: heatText(zone.status), display: 'block' }}>{zone.currentCount.toLocaleString()}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>of {zone.capacity.toLocaleString()}</Text>
                    </div>
                    <div style={{ ...pb.track, height: 6 }}><div style={pb.fill} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{zone.percentage}% full</Text>
                      {flow && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: flow.netFlow >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                          {flow.netFlow >= 0 ? '\u2191' : '\u2193'}{Math.abs(flow.netFlow)}/min
                        </Text>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ ...cardBase }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Heat Legend</Text>
                <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
                  {[
                    { label: 'Normal (<60%)', status: 'normal' },
                    { label: 'Warning (60-85%)', status: 'warning' },
                    { label: 'Critical (>85%)', status: 'critical' },
                  ].map(item => (
                    <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <div style={{ width: 14, height: 14, borderRadius: tokens.borderRadius.sm, backgroundColor: heatBg(item.status), border: `1px solid ${heatBorder(item.status)}` }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{item.label}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Zone Detail Panel */}
          {selectedZoneData && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              <div style={{ ...cardBase, borderLeft: `4px solid ${heatText(selectedZoneData.status)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{selectedZoneData.name}</Text>
                  <span style={createBadgeStyle(tokens, selectedZoneData.status === 'critical' ? 'error' : selectedZoneData.status === 'warning' ? 'warning' : 'success')}>
                    {statusIcon(selectedZoneData.status)} {selectedZoneData.status}
                  </span>
                </div>

                {/* Capacity */}
                <div style={{ textAlign: 'center' as const, padding: tokens.spacing[4], backgroundColor: heatBg(selectedZoneData.status), borderRadius: tokens.borderRadius.md, marginBottom: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: heatText(selectedZoneData.status), display: 'block' }}>{selectedZoneData.percentage}%</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {selectedZoneData.currentCount.toLocaleString()} / {selectedZoneData.capacity.toLocaleString()}
                  </Text>
                </div>

                {/* Progress */}
                {(() => {
                  const pb = createProgressBarStyle(tokens, { percent: selectedZoneData.percentage, color: heatText(selectedZoneData.status) });
                  return (
                    <div style={{ marginBottom: tokens.spacing[3] }}>
                      <div style={{ ...pb.track, height: 10 }}><div style={pb.fill} /></div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>
                        {selectedZoneData.capacity - selectedZoneData.currentCount} spots remaining
                      </Text>
                    </div>
                  );
                })()}

                {/* Flow data */}
                {selectedZoneFlow && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2] }}>
                    <div style={{ textAlign: 'center' as const, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.successScale[50] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600], display: 'block' }}>In</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>{selectedZoneFlow.entriesPerMinute}/m</Text>
                    </div>
                    <div style={{ textAlign: 'center' as const, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.errorScale[50] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600], display: 'block' }}>Out</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[700] }}>{selectedZoneFlow.exitsPerMinute}/m</Text>
                    </div>
                    <div style={{ textAlign: 'center' as const, padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: selectedZoneFlow.netFlow >= 0 ? tokens.colors.warningScale[50] : tokens.colors.infoScale[50] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block' }}>Net</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: selectedZoneFlow.netFlow >= 0 ? tokens.colors.warningScale[700] : tokens.colors.infoScale[700] }}>
                        {selectedZoneFlow.netFlow >= 0 ? '+' : ''}{selectedZoneFlow.netFlow}/m
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {/* Threshold control */}
              <div style={{ ...cardBase }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Threshold Settings</Text>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                  {[
                    { label: 'Warning', value: 75, color: tokens.colors.warningScale },
                    { label: 'Critical', value: 90, color: tokens.colors.errorScale },
                  ].map(t => (
                    <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: t.color[50] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: t.color[700] }}>{t.label}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: t.color[700] }}>{t.value}%</Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ ...cardBase }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Quick Actions</Text>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                  <div onClick={() => onSetThreshold?.(selectedZoneData.id, 80)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], cursor: 'pointer', ...hoverStyle }}>
                    Set Warning at 80%
                  </div>
                  <div onClick={() => onSetThreshold?.(selectedZoneData.id, 95)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], cursor: 'pointer', ...hoverStyle }}>
                    Set Critical at 95%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Occupancy', value: `${overallPct}%`, emoji: '\uD83D\uDC65' },
            { label: 'Normal Zones', value: zones.filter(z => z.status === 'normal').length.toString(), emoji: '\uD83D\uDFE2' },
            { label: 'Warning Zones', value: warningZones.length.toString(), emoji: '\uD83D\uDFE1' },
            { label: 'Critical Zones', value: criticalZones.length.toString(), emoji: '\uD83D\uDD34' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
