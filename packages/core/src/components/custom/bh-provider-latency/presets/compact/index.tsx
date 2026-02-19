'use client';

/**
 * BhProviderLatency - Compact Preset
 * Mini sparkline per provider with current p50/p95/p99 values.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { BhProviderLatencyProps, LatencyDataPoint } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Activity, Clock } from 'lucide-react';

function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

export const CompactBhProviderLatency = createPreset<BhProviderLatencyProps>({
  name: 'BhProviderLatency.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhProviderLatencyProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      data: rawData = [],
      providers: rawProviders = [],
      targetLatency = 500,
      onProviderChange,
      loading = false,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : [];
    const providers = Array.isArray(rawProviders) ? rawProviders : [];

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    // Group data by provider
    const providerStats = useMemo(() => {
      return providers.map(provider => {
        const provData = data.filter(d => d.provider === provider);
        const latest = provData[provData.length - 1];
        const p50Values = provData.map(d => d.p50);
        return {
          provider,
          latest,
          p50Values,
          isOverTarget: latest ? latest.p95 > targetLatency : false,
        };
      });
    }, [data, providers, targetLatency]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <Clock size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
            Latency
          </Text>
          {targetLatency && (
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
              Target: {targetLatency}ms
            </Text>
          )}
        </Box>

        {/* Provider rows */}
        {providerStats.length === 0 ? (
          <Box style={{ ...emptyState, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No data</Text>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            {providerStats.map((ps, index) => (
              <Box
                key={ps.provider}
                role="button"
                tabIndex={0}
                aria-label={`${ps.provider} latency`}
                onClick={() => onProviderChange?.(ps.provider)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[3],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderBottom: index < providerStats.length - 1
                    ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                    : 'none',
                  cursor: 'pointer',
                  transition: `background-color ${t.motion.hover}`,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Provider name */}
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], width: 80, flexShrink: 0 }}>
                  {ps.provider}
                </Text>

                {/* Sparkline */}
                <Box style={{ flex: 1, minWidth: 60 }}>
                  {ps.p50Values.length > 1 && (
                    <svg width="100%" height={24} viewBox="0 0 120 24" preserveAspectRatio="none" style={{ display: 'block' }}>
                      <polyline
                        points={sparklinePoints(ps.p50Values, 120, 24, 2)}
                        fill="none"
                        stroke={ps.isOverTarget ? t.colors.errorScale[400] : t.colors.primaryScale[400]}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Box>

                {/* Current values */}
                {ps.latest && (
                  <Box style={{ display: 'flex', gap: t.spacing[2], flexShrink: 0 }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'right' as const }}>
                      <Text style={{ fontSize: 9, color: t.colors.neutral[400], display: 'block' }}>p50</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600] }}>
                        {ps.latest.p50}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'right' as const }}>
                      <Text style={{ fontSize: 9, color: t.colors.neutral[400], display: 'block' }}>p95</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.warningScale[600] }}>
                        {ps.latest.p95}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'right' as const }}>
                      <Text style={{ fontSize: 9, color: t.colors.neutral[400], display: 'block' }}>p99</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: ps.isOverTarget ? t.colors.errorScale[600] : t.colors.neutral[600] }}>
                        {ps.latest.p99}
                      </Text>
                    </Box>
                  </Box>
                )}

                {/* Over target indicator */}
                {ps.isOverTarget && (
                  <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.errorScale[500], flexShrink: 0 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  },
});
