'use client';

/**
 * EvAnalyticsHub - Realtime Preset
 * Live metrics grid with sparklines, predictions panel, live event pulse
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvAnalyticsHubProps } from '../../core';

export const RealtimeEvAnalyticsHub = createPreset<EvAnalyticsHubProps>({
  name: 'EvAnalyticsHub.Realtime',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAnalyticsHubProps>) => {
    const { Box, Text } = primitives;

    const {
      realtimeMetrics,
      charts,
      predictions,
      benchmarks,
      onChartClick,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

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

    const metricIcons = ['👥', '🎫', '🍺', '💰'];
    const metricColors = [
      tokens.colors.primaryScale,
      tokens.colors.successScale,
      tokens.colors.warningScale,
      tokens.colors.infoScale,
    ];

    const livePulse = [
      { zone: 'Main Floor', metric: 'Energy Level', value: 92, max: 100, icon: '🔥' },
      { zone: 'VIP Lounge', metric: 'Satisfaction', value: 88, max: 100, icon: '⭐' },
      { zone: 'Beer Garden', metric: 'Traffic Flow', value: 65, max: 100, icon: '🚶' },
      { zone: 'Entry Gates', metric: 'Queue Length', value: 24, max: 100, icon: '🚪' },
    ];

    const liveActivity = [
      { time: 'now', event: 'VIP table 12 ordered bottle service', type: 'revenue' },
      { time: '1m', event: '15 new check-ins at Gate A', type: 'checkin' },
      { time: '2m', event: 'Main Stage set change starting', type: 'operations' },
      { time: '3m', event: 'Beer Garden bar 2 queue cleared', type: 'operations' },
      { time: '5m', event: 'Merch booth sold out size L hoodies', type: 'alert' },
    ];

    const activityTypeColors: Record<string, { dot: string; text: string }> = {
      revenue: { dot: tokens.colors.successScale[500], text: tokens.colors.successScale[700] },
      checkin: { dot: tokens.colors.infoScale[500], text: tokens.colors.infoScale[700] },
      operations: { dot: tokens.colors.primaryScale[500], text: tokens.colors.primaryScale[700] },
      alert: { dot: tokens.colors.warningScale[500], text: tokens.colors.warningScale[700] },
    };

    const renderSparkline = (data: number[], color: string) => {
      const max = Math.max(...data);
      const min = Math.min(...data);
      const range = max - min || 1;
      const w = 80;
      const h = 28;
      const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width={w} height={h} style={{ display: 'block' }}>
          <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
      );
    };

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
              Analytics Hub
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Real-time event intelligence
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700],
              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500] }} />
              LIVE
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {mockMetrics.map((metric, idx) => {
            const scale = metricColors[idx];
            return (
              <div key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: tokens.spacing[1] }}>{metric.label}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1] }}>
                      <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{typeof metric.value === 'number' && metric.value >= 1000 ? metric.value.toLocaleString() : metric.value}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{metric.unit}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.lg }}>{metricIcons[idx]}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                    color: metric.trend === 'up' ? tokens.colors.successScale[600] : metric.trend === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                  }}>
                    {metric.trend === 'up' ? '↑ Rising' : metric.trend === 'down' ? '↓ Falling' : '→ Stable'}
                  </span>
                  {metric.sparklineData && renderSparkline(metric.sparklineData, scale[400])}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          {/* Left: Predictions + Live Pulse */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Predictions */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>AI Predictions</Text>
                <span style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs }}>ML-powered</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                {mockPredictions.map((pred) => (
                  <div key={pred.id} style={{
                    padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                  }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{pred.metric}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
                      {typeof pred.predicted === 'number' && pred.predicted >= 1000 ? pred.predicted.toLocaleString() : pred.predicted}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{pred.timeframe}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <div style={{ width: 30, height: 4, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pred.confidence}%`,
                            backgroundColor: pred.confidence >= 85 ? tokens.colors.successScale[500] : pred.confidence >= 70 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
                            borderRadius: tokens.borderRadius.full,
                          }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: pred.confidence >= 85 ? tokens.colors.successScale[600] : pred.confidence >= 70 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600] }}>{pred.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Event Pulse */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Live Event Pulse
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                {livePulse.map((item, idx) => {
                  const color = item.value >= 80 ? tokens.colors.successScale[500] : item.value >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
                  return (
                    <div key={idx} style={{
                      padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <div>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{item.zone}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.metric}</span>
                        </div>
                        <span style={{ fontSize: tokens.typography.fontSize.lg }}>{item.icon}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div style={{ flex: 1, height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.value}%`, backgroundColor: color, borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color, minWidth: 30, textAlign: 'right' as const }}>{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Activity Feed */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Live Activity</Text>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Auto-updating</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {liveActivity.map((item, idx) => {
                const ac = activityTypeColors[item.type];
                return (
                  <div key={idx} style={{
                    padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    borderLeft: `3px solid ${ac.dot}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, textTransform: 'uppercase' as const, color: ac.text }}>{item.type}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{item.time === 'now' ? 'Just now' : `${item.time} ago`}</span>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], display: 'block' }}>{item.event}</Text>
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
