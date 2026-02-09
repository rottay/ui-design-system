'use client';

/**
 * EvVenueManager - Analytics Preset
 * Charts area, occupancy trends, peak hours, zone comparison
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvVenueManagerProps } from '../../core';

export const AnalyticsEvVenueManager = createPreset<EvVenueManagerProps>({
  name: 'EvVenueManager.Analytics',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvVenueManagerProps>) => {
    const { Box, Text } = primitives;

    const {
      venue,
      zones,
      stages,
      alerts,
      onZoneClick,
      onAlertDismiss,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const [selectedPeriod, setSelectedPeriod] = useState('today');

    const mockVenue = venue || {
      id: 'v1', name: 'Arena Complex', address: '1200 Festival Blvd, Austin TX 78701',
      totalCapacity: 4400, currentOccupancy: 2975, zonesCount: 4, status: 'open' as const,
    };

    const mockZones = zones?.length ? zones : [
      { id: 'z1', name: 'Main Floor', capacity: 3000, currentCount: 2100, accessLevel: 'General', isActive: true },
      { id: 'z2', name: 'VIP Lounge', capacity: 500, currentCount: 380, accessLevel: 'VIP', isActive: true },
      { id: 'z3', name: 'Beer Garden', capacity: 800, currentCount: 450, accessLevel: 'General', isActive: true },
      { id: 'z4', name: 'Backstage', capacity: 100, currentCount: 45, accessLevel: 'Staff Only', isActive: true },
    ];

    const periods = ['today', '7d', '30d', '90d'];

    const occupancyTrend = [
      { hour: '14:00', value: 18 }, { hour: '15:00', value: 25 }, { hour: '16:00', value: 35 },
      { hour: '17:00', value: 42 }, { hour: '18:00', value: 55 }, { hour: '19:00', value: 68 },
      { hour: '20:00', value: 78 }, { hour: '21:00', value: 85 }, { hour: '22:00', value: 67 },
      { hour: '23:00', value: 52 },
    ];

    const peakHours = [
      { hour: '20:00-21:00', avgOccupancy: 85, peakZone: 'Main Floor', events: 12 },
      { hour: '21:00-22:00', avgOccupancy: 82, peakZone: 'Main Floor', events: 11 },
      { hour: '19:00-20:00', avgOccupancy: 78, peakZone: 'VIP Lounge', events: 10 },
      { hour: '22:00-23:00', avgOccupancy: 67, peakZone: 'Beer Garden', events: 9 },
      { hour: '18:00-19:00', avgOccupancy: 55, peakZone: 'Main Floor', events: 8 },
    ];

    const kpis = [
      { label: 'Avg Occupancy', value: '68%', trend: 'up', trendVal: 5, icon: '📊' },
      { label: 'Peak Today', value: '85%', trend: 'up', trendVal: 3, icon: '📈' },
      { label: 'Dwell Time', value: '3.2h', trend: 'up', trendVal: 12, icon: '⏱️' },
      { label: 'Turnover Rate', value: '1.4x', trend: 'down', trendVal: 8, icon: '🔄' },
    ];

    const zoneScaleColors = [
      tokens.colors.primaryScale[500],
      tokens.colors.successScale[500],
      tokens.colors.warningScale[500],
      tokens.colors.infoScale[500],
    ];

    const chartMax = Math.max(...occupancyTrend.map(d => d.value));
    const barChartHeight = 140;

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              📊 {mockVenue.name} Analytics
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Occupancy trends, peak hours, and zone performance
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${selectedPeriod === p ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                  backgroundColor: selectedPeriod === p ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: selectedPeriod === p ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: selectedPeriod === p ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {kpis.map((stat, idx) => (
            <div key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: tokens.spacing[1] }}>{stat.label}</span>
                  <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</span>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg }}>{stat.icon}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: stat.trend === 'up' ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.trendVal}%
                </span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>vs prev period</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: tokens.spacing[6] }}>
          {/* Left: Occupancy Trend Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Occupancy Trend
              </Text>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height: barChartHeight, paddingBottom: tokens.spacing[6], position: 'relative' }}>
                {/* Y-axis labels */}
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} style={{
                    position: 'absolute', left: 0, bottom: tokens.spacing[6],
                    top: `${(1 - val / 100) * barChartHeight}px`,
                    fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400],
                    width: 30, textAlign: 'right' as const,
                  }}>
                    {val}%
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], flex: 1, marginLeft: 36, height: '100%' }}>
                  {occupancyTrend.map((d, i) => {
                    const h = (d.value / 100) * barChartHeight;
                    const color = d.value >= 80 ? tokens.colors.errorScale[400] : d.value >= 60 ? tokens.colors.warningScale[400] : tokens.colors.primaryScale[400];
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: 10, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>{d.value}%</span>
                        <div style={{
                          width: '100%', maxWidth: 32, height: h, backgroundColor: color,
                          borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                          transition: 'height 0.3s ease',
                        }} />
                        <span style={{ fontSize: 10, color: tokens.colors.neutral[400], marginTop: 2 }}>{d.hour.split(':')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Zone Comparison */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Zone Comparison
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {mockZones.map((zone, idx) => {
                  const pct = Math.round((zone.currentCount / zone.capacity) * 100);
                  const color = zoneScaleColors[idx % zoneScaleColors.length];
                  return (
                    <div key={zone.id} onClick={() => onZoneClick?.(zone.id)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: color }} />
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{zone.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], minWidth: 36, textAlign: 'right' as const }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[4], paddingTop: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Total Capacity Used</span>
                <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>
                  {Math.round((mockZones.reduce((s, z) => s + z.currentCount, 0) / mockZones.reduce((s, z) => s + z.capacity, 0)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right: Peak Hours + Zone Heat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Peak Hours */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Peak Hours
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {peakHours.map((peak, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: idx === 0 ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                    borderLeft: idx === 0 ? `3px solid ${tokens.colors.primaryScale[500]}` : `3px solid transparent`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{peak.hour}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{peak.peakZone} - {peak.events} events</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div style={{ width: 40, height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${peak.avgOccupancy}%`, backgroundColor: peak.avgOccupancy >= 80 ? tokens.colors.errorScale[400] : tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.full }} />
                      </div>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], minWidth: 32, textAlign: 'right' as const }}>{peak.avgOccupancy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Heatmap Summary */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Zone Heat Summary
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[2] }}>
                {mockZones.map((zone, idx) => {
                  const pct = Math.round((zone.currentCount / zone.capacity) * 100);
                  const heat = pct >= 80 ? tokens.colors.errorScale[100] : pct >= 60 ? tokens.colors.warningScale[100] : tokens.colors.successScale[100];
                  const heatText = pct >= 80 ? tokens.colors.errorScale[700] : pct >= 60 ? tokens.colors.warningScale[700] : tokens.colors.successScale[700];
                  const heatLabel = pct >= 80 ? 'HOT' : pct >= 60 ? 'WARM' : 'COOL';
                  return (
                    <div key={zone.id} style={{
                      padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                      backgroundColor: heat, textAlign: 'center' as const,
                    }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: heatText, display: 'block', marginBottom: tokens.spacing[1] }}>{zone.name}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: heatText, display: 'block' }}>{pct}%</span>
                      <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: heatText, textTransform: 'uppercase' as const }}>{heatLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>
                Session Summary
              </Text>
              {[
                { label: 'Total Check-ins Today', value: '3,412', icon: '🎫' },
                { label: 'Average Wait Time', value: '4.2 min', icon: '⏳' },
                { label: 'Re-entry Count', value: '287', icon: '🔁' },
                { label: 'VIP Conversions', value: '34', icon: '⭐' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px 0`,
                  borderBottom: idx < 3 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm }}>{item.icon}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
