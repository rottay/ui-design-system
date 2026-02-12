'use client';

/**
 * EvAnalyticsHub - Realtime Preset
 * Composes PatternPageShell + PatternStatsGrid + PatternTimeline
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternStatsGrid,
  PatternTimeline,
} from '../../../../patterns';
import type { StatDef, TimelineItem } from '../../../../patterns';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { EvAnalyticsHubProps } from '../../core';

export const RealtimeEvAnalyticsHub = createPreset<EvAnalyticsHubProps>({
  name: 'EvAnalyticsHub.Realtime',
  render: ({ primitives, props, tokens }: PresetContext<EvAnalyticsHubProps>) => {
    const { Box, Text } = primitives;
    const { realtimeMetrics, predictions, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const mockMetrics = realtimeMetrics?.length ? realtimeMetrics : [
      { label: 'Active Attendees', value: 2847, unit: 'people', trend: 'up' as const, sparklineData: [2100, 2200, 2350, 2500, 2600, 2700, 2750, 2800, 2847] },
      { label: 'Check-in Rate', value: 42, unit: '/min', trend: 'up' as const, sparklineData: [30, 35, 38, 40, 42, 45, 40, 38, 42] },
      { label: 'Bar Orders', value: 18, unit: '/min', trend: 'flat' as const, sparklineData: [15, 18, 20, 16, 14, 18, 22, 19, 18] },
      { label: 'Revenue/Hour', value: 4250, unit: '$/hr', trend: 'up' as const, sparklineData: [3200, 3400, 3600, 3800, 3950, 4100, 4200, 4250, 4250] },
    ];

    const mockPredictions = predictions?.length ? predictions : [
      { id: 'p1', metric: 'Peak Attendance', predicted: 3200, confidence: 87, timeframe: 'Next 2 hours' },
      { id: 'p2', metric: 'Bar Revenue', predicted: 28000, confidence: 92, timeframe: 'End of night' },
      { id: 'p3', metric: 'Exit Wave', predicted: 800, confidence: 74, timeframe: '23:30-00:00' },
      { id: 'p4', metric: 'VIP Upgrades', predicted: 45, confidence: 68, timeframe: 'Remaining' },
    ];

    const metricStats = useMemo((): StatDef[] => mockMetrics.map((m, idx) => ({
      key: `metric-${idx}`,
      label: m.label,
      value: typeof m.value === 'number' && m.value >= 1000 ? m.value.toLocaleString() : m.value,
      suffix: ` ${m.unit}`,
      changeType: m.trend === 'up' ? 'increase' as const : m.trend === 'down' ? 'decrease' as const : 'neutral' as const,
      sparklineData: m.sparklineData,
    })), [mockMetrics]);

    const predictionStats = useMemo((): StatDef[] => mockPredictions.map(p => ({
      key: p.id,
      label: p.metric,
      value: typeof p.predicted === 'number' && p.predicted >= 1000 ? p.predicted.toLocaleString() : p.predicted,
      description: `${p.timeframe} | ${p.confidence}% confidence`,
    })), [mockPredictions]);

    const liveActivity = useMemo((): TimelineItem[] => [
      { key: 'a1', timestamp: new Date(), title: 'VIP table 12 ordered bottle service', type: 'success' },
      { key: 'a2', timestamp: new Date(Date.now() - 60000), title: '15 new check-ins at Gate A', type: 'info' },
      { key: 'a3', timestamp: new Date(Date.now() - 120000), title: 'Main Stage set change starting', type: 'default' },
      { key: 'a4', timestamp: new Date(Date.now() - 180000), title: 'Beer Garden bar 2 queue cleared', type: 'default' },
      { key: 'a5', timestamp: new Date(Date.now() - 300000), title: 'Merch booth sold out size L hoodies', type: 'warning' },
    ], []);

    const pulseStats = useMemo((): StatDef[] => [
      { key: 'main-floor', label: 'Main Floor - Energy Level', value: 92, suffix: '%', color: tokens.colors.successScale[500] },
      { key: 'vip', label: 'VIP Lounge - Satisfaction', value: 88, suffix: '%', color: tokens.colors.warningScale[500] },
      { key: 'garden', label: 'Beer Garden - Traffic Flow', value: 65, suffix: '%', color: tokens.colors.primaryScale[500] },
      { key: 'gates', label: 'Entry Gates - Queue Length', value: 24, suffix: '%', color: tokens.colors.infoScale[500] },
    ], [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Analytics Hub
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Real-time event intelligence
            </Text>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
            <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500] }} />
            LIVE
          </span>
        </div>

        {/* Live Metrics */}
        <PatternStatsGrid stats={metricStats} columns={4} sparkline style={{ marginBottom: tokens.spacing[6] }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Predictions */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>AI Predictions</Text>
                <span style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs }}>ML-powered</span>
              </div>
              <PatternStatsGrid stats={predictionStats} columns={2} variant="outlined" />
            </div>

            {/* Live Event Pulse */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Live Event Pulse
              </Text>
              <PatternStatsGrid stats={pulseStats} columns={2} variant="outlined" />
            </div>
          </div>

          {/* Live Activity Feed */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Live Activity</Text>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Auto-updating</span>
            </div>
            <PatternTimeline items={liveActivity} showTimestamp />
          </div>
        </div>
      </Box>
    );
  },
});
