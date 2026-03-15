'use client';

/**
 * EvZoneCapacity - Dashboard Preset
 * Zone capacity monitoring with KPI stats, capacity bars, flow rate chart, threshold alerts
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
];

export const DashboardEvZoneCapacity = createPreset<EvZoneCapacityProps>({
  name: 'EvZoneCapacity.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvZoneCapacityProps>) => {
    const { Box, Text } = primitives;

    const zones = props.zones ?? MOCK_ZONES;
    const flowData = props.flowData ?? MOCK_FLOW;
    const { onZoneClick, onSetThreshold, className, style } = props;

    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [hoveredZone, setHoveredZone] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredZones = useMemo(() => {
      if (!statusFilter) return zones;
      return zones.filter(z => z.status === statusFilter);
    }, [zones, statusFilter]);

    const totalOccupancy = zones.reduce((s, z) => s + z.currentCount, 0);
    const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
    const overallPct = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
    const criticalZones = zones.filter(z => z.status === 'critical').length;
    const warningZones = zones.filter(z => z.status === 'warning').length;
    const totalNetFlow = flowData.reduce((s, f) => s + f.netFlow, 0);

    const statusColor = (s: string) => s === 'normal' ? tokens.colors.successScale : s === 'warning' ? tokens.colors.warningScale : s === 'critical' ? tokens.colors.errorScale : tokens.colors.neutral;
    const statusIcon = (s: string) => s === 'normal' ? '\uD83D\uDFE2' : s === 'warning' ? '\uD83D\uDFE1' : s === 'critical' ? '\uD83D\uDD34' : '\u26D4';

    // Flow chart mock
    const flowTimeline = [32, 45, 58, 72, 85, 78, 65, 72, 88, 82, 75, 68];
    const maxFlowVal = Math.max(...flowTimeline);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Zone Capacity Dashboard
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {totalOccupancy.toLocaleString()} / {totalCapacity.toLocaleString()} total occupancy ({overallPct}%)
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={createBadgeStyle(tokens, 'success')}>{'\u26A1'} Live</span>
            {criticalZones > 0 && <span style={createBadgeStyle(tokens, 'error')}>{'\u26A0\uFE0F'} {criticalZones} critical</span>}
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Occupancy', value: totalOccupancy.toLocaleString(), sub: `${overallPct}% full`, icon: '\uD83D\uDC65', color: tokens.colors.primaryScale },
            { label: 'Critical Zones', value: criticalZones.toString(), sub: `${warningZones} warnings`, icon: '\uD83D\uDD34', color: tokens.colors.errorScale },
            { label: 'Net Flow', value: `${totalNetFlow > 0 ? '+' : ''}${totalNetFlow}/min`, sub: 'entries - exits', icon: '\uD83D\uDCCA', color: totalNetFlow >= 0 ? tokens.colors.successScale : tokens.colors.warningScale },
            { label: 'Active Zones', value: `${zones.filter(z => z.status !== 'closed').length}/${zones.length}`, sub: 'zones open', icon: '\uD83C\uDFDF\uFE0F', color: tokens.colors.infoScale },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ width: 40, height: 40, borderRadius: tokens.borderRadius.lg, backgroundColor: stat.color[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg }}>
                {stat.icon}
              </div>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{stat.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{stat.sub}</Text>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Banner */}
        {criticalZones > 0 && (
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.errorScale[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`, marginBottom: tokens.spacing[4], display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg }}>{'\u26A0\uFE0F'}</Text>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[700], display: 'block' }}>Capacity Alert</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600] }}>
                {zones.filter(z => z.status === 'critical').map(z => z.name).join(', ')} at or near capacity
              </Text>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          <div onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: statusFilter === null })}>All Zones ({zones.length})</div>
          {['normal', 'warning', 'critical'].map(s => (
            <div key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>
              {statusIcon(s)} {s.charAt(0).toUpperCase() + s.slice(1)} ({zones.filter(z => z.status === s).length})
            </div>
          ))}
        </div>

        {/* Zone Capacity Bars */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Zone Capacity</Text>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {filteredZones.map((zone) => {
              const sc = statusColor(zone.status);
              const pb = createProgressBarStyle(tokens, { percent: zone.percentage, color: sc[500] });
              const flow = flowData.find(f => f.zoneId === zone.id);
              const isHovered = hoveredZone === zone.id;
              return (
                <div
                  key={zone.id}
                  onClick={() => onZoneClick?.(zone.id)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  style={{ cursor: onZoneClick ? 'pointer' : 'default', padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span>{statusIcon(zone.status)}</span>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{zone.name}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      {flow && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: flow.netFlow >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                          {flow.netFlow >= 0 ? '\u2191' : '\u2193'}{Math.abs(flow.netFlow)}/min
                        </Text>
                      )}
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                        {zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}
                      </Text>
                      <span style={createBadgeStyle(tokens, zone.status === 'critical' ? 'error' : zone.status === 'warning' ? 'warning' : 'success')}>{zone.percentage}%</span>
                    </div>
                  </div>
                  <div style={{ ...pb.track, height: 8 }}><div style={pb.fill} /></div>
                </div>
              );
            })}
          </div>

          {filteredZones.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, display: 'block' }}>No zones match this filter</Text>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[4] }}>
          {/* Flow Rate Chart */}
          <div style={{ ...cardBase }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Occupancy Trend (last hour)</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>% capacity</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height: 100 }}>
              {flowTimeline.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{v}%</Text>
                  <div style={{ width: '100%', height: `${(v / maxFlowVal) * 80}px`, backgroundColor: v >= 85 ? tokens.colors.errorScale[400] : v >= 70 ? tokens.colors.warningScale[400] : tokens.colors.primaryScale[400], borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`, transition: 'height 0.3s ease' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>12:00</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Now</Text>
            </div>
          </div>

          {/* Flow Data Table */}
          <div style={{ ...cardBase }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Zone Flow Rates</Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              {flowData.map(f => {
                const zone = zones.find(z => z.id === f.zoneId);
                if (!zone) return null;
                return (
                  <div key={f.zoneId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: f.netFlow > 3 ? tokens.colors.warningScale[50] : 'transparent' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], flex: 1 }}>{zone.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600], minWidth: 35, textAlign: 'right' as const }}>{'\u2191'}{f.entriesPerMinute}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600], minWidth: 35, textAlign: 'right' as const }}>{'\u2193'}{f.exitsPerMinute}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: f.netFlow >= 0 ? tokens.colors.successScale[700] : tokens.colors.errorScale[700], minWidth: 35, textAlign: 'right' as const }}>
                      {f.netFlow >= 0 ? '+' : ''}{f.netFlow}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
