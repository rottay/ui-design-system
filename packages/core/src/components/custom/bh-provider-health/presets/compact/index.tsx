'use client';

/**
 * BhProviderHealth - Compact Preset
 * Widget-sized summary showing provider health at a glance.
 * Header with overall status badge, provider rows with
 * status dot, uptime %, and latency.
 *
 * Design: Dense, sidebar-friendly layout with personality-driven
 * styling, glass support, and entrance animations.
 */

import { useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createDividerStyle,
  createBadgeStyle,
  createPersonalityAccentBar,
  getCardPadding,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhProviderHealthProps, ProviderHealthItem } from '../../core';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline                                                  */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Helper: relative time                                              */
/* ------------------------------------------------------------------ */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(Math.abs(diffMs) / 1000);
  const suffix = diffMs >= 0 ? ' ago' : ' from now';
  if (seconds < 60) return `${seconds}s${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${suffix}`;
  const days = Math.floor(hours / 24);
  return `${days}d${suffix}`;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhProviderHealth = createPreset<BhProviderHealthProps>({
  name: 'BhProviderHealth.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhProviderHealthProps>) => {
    const { Box, Text } = primitives;

    const {
      providers: rawProviders = [],
      summary: controlledSummary,
      selectedProvider,
      onProviderSelect,
      onRefresh,
      recentRequests: rawRecentRequests,
      refreshInterval,
      className,
      style,
    } = props;

    const providers = Array.isArray(rawProviders) ? rawProviders : [];

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const handleSelect = useCallback((id: string) => {
      onProviderSelect?.(id);
    }, [onProviderSelect]);

    /* ---- Compute summary ---- */
    const summary = useMemo(() => {
      if (controlledSummary) return controlledSummary;
      const healthy = providers.filter((p) => p.status === 'healthy').length;
      const degraded = providers.filter((p) => p.status === 'degraded').length;
      const down = providers.filter((p) => p.status === 'down').length;
      const avgLatency = providers.length ? Math.round(providers.reduce((s, p) => s + p.latencyMs, 0) / providers.length) : 0;
      const avgUptime = providers.length ? +(providers.reduce((s, p) => s + p.uptimePercent, 0) / providers.length).toFixed(2) : 0;
      const openIncidents = providers.reduce((s, p) => s + p.incidents.filter((i) => !i.resolvedAt).length, 0);
      return { totalProviders: providers.length, healthyCount: healthy, degradedCount: degraded, downCount: down, avgLatency, avgUptime, openIncidents };
    }, [providers, controlledSummary]);

    /* ---- Overall status ---- */
    const overallStatus = useMemo(() => {
      if (summary.downCount > 0) return 'down';
      if (summary.degradedCount > 0) return 'degraded';
      return 'healthy';
    }, [summary]);

    const overallBadgeType = useMemo(() => {
      if (overallStatus === 'down') return 'error' as const;
      if (overallStatus === 'degraded') return 'warning' as const;
      return 'success' as const;
    }, [overallStatus]);

    const overallLabel = useMemo(() => {
      if (overallStatus === 'down') return 'Outage';
      if (overallStatus === 'degraded') return 'Degraded';
      return 'All Healthy';
    }, [overallStatus]);

    const overallIcon = useMemo(() => {
      if (overallStatus === 'down') return <XCircle size={12} strokeWidth={1.5} />;
      if (overallStatus === 'degraded') return <AlertTriangle size={12} strokeWidth={1.5} />;
      return <CheckCircle2 size={12} strokeWidth={1.5} />;
    }, [overallStatus]);

    /* ---- Status config helper ---- */
    const getStatusDotColor = useCallback((status: ProviderHealthItem['status']): string => {
      switch (status) {
        case 'healthy': return tokens.colors.successScale[500];
        case 'degraded': return tokens.colors.warningScale[500];
        case 'down': return tokens.colors.errorScale[500];
      }
    }, [tokens]);

    /* ---- Entrance animation keyframes ---- */
    const entranceDelay = useCallback((index: number): React.CSSProperties => ({
      opacity: 1,
      transform: 'translateY(0)',
      transition: `all ${tokens.motion.hover}`,
      transitionDelay: `${index * 50}ms`,
    }), [tokens]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          fontFamily: 'inherit',
          ...style,
        }}
      >
        <Box
          style={{
            ...cardBase,
            padding: 0,
            overflow: 'hidden',
            position: 'relative' as const,
            ...(isGlass ? {
              backdropFilter: tokens.glass?.blur,
              WebkitBackdropFilter: tokens.glass?.blur,
              backgroundColor: tokens.glass?.bg,
            } : {}),
          }}
        >
          <Box style={accentBar || undefined} />

          {/* ---- Header ---- */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Activity size={14} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: typo.headingWeight,
                letterSpacing: typo.headingLetterSpacing,
                color: tokens.colors.neutral[900],
              }}>
                Provider Health
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box
                style={{
                  ...createBadgeStyle(tokens, overallBadgeType),
                  fontSize: tokens.typography.fontSize.xs,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `0 ${tokens.spacing[2]}px`,
                }}
              >
                {overallIcon}
                <Text>{overallLabel}</Text>
              </Box>
              {onRefresh && (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Refresh health data"
                  onClick={onRefresh}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRefresh(); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[6],
                    height: tokens.spacing[6],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: 'transparent',
                    color: tokens.colors.neutral[400],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    border: 'none',
                  }}
                >
                  <RefreshCw size={12} strokeWidth={1.5} />
                </Box>
              )}
            </Box>
          </Box>

          {/* ---- Summary row ---- */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}
          >
            {refreshInterval !== undefined && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <RefreshCw size={9} style={{ color: tokens.colors.neutral[400] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {refreshInterval >= 1000 ? `${Math.round(refreshInterval / 1000)}s` : `${refreshInterval}ms`}
                </Text>
              </Box>
            )}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Uptime</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                {summary.avgUptime}%
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Zap size={10} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Avg</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                {summary.avgLatency}ms
              </Text>
            </Box>
            {summary.openIncidents > 0 && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginLeft: 'auto' }}>
                <AlertTriangle size={10} strokeWidth={1.5} style={{ color: tokens.colors.warningScale[600] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700] }}>
                  {summary.openIncidents}
                </Text>
              </Box>
            )}
          </Box>

          {/* ---- Provider rows ---- */}
          <Box role="list" aria-label="Provider health status" style={{ display: 'flex', flexDirection: 'column' as const }}>
            {providers.map((provider, index) => {
              const isSelected = selectedProvider === provider.id;
              const dotColor = getStatusDotColor(provider.status);

              return (
                <Box
                  key={provider.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${provider.name}: ${provider.status}, uptime ${provider.uptimePercent}%, latency ${provider.latencyMs}ms`}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(provider.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(provider.id); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    ...entranceDelay(index),
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.common.white;
                  }}
                >
                  {/* Status dot */}
                  <Box
                    style={{
                      width: tokens.spacing[2],
                      height: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: dotColor,
                      flexShrink: 0,
                      boxShadow: `0 0 0 2px ${dotColor}30`,
                    }}
                  />

                  {/* Provider name */}
                  <Text style={{
                    flex: 1,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                    minWidth: 0,
                  }}>
                    {provider.name}
                  </Text>

                  {/* Sparkline (mini) */}
                  {provider.latencyTrend.length > 1 && (
                    <Box style={{ flexShrink: 0 }}>
                      <svg width={40} height={16} viewBox="0 0 40 16" style={{ display: 'block' }} aria-hidden="true">
                        <polyline
                          points={sparklinePoints(provider.latencyTrend, 40, 16, 1)}
                          fill="none"
                          stroke={dotColor}
                          strokeWidth={1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>
                  )}

                  {/* Uptime */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: provider.uptimePercent >= 99.9 ? tokens.colors.successScale[600] : provider.uptimePercent >= 99 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                    flexShrink: 0,
                    minWidth: 42,
                    textAlign: 'right' as const,
                  }}>
                    {provider.uptimePercent}%
                  </Text>

                  {/* Latency */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: provider.latencyMs < 200 ? tokens.colors.successScale[600] : provider.latencyMs < 500 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                    fontWeight: tokens.typography.fontWeight.medium,
                    flexShrink: 0,
                    minWidth: 42,
                    textAlign: 'right' as const,
                  }}>
                    {provider.latencyMs}ms
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* ---- Footer: last checked ---- */}
          {providers.length > 0 && (
            <Box
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: tokens.spacing[1],
              }}
            >
              {rawRecentRequests && rawRecentRequests.length > 0 && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginRight: tokens.spacing[2] }}>
                  {rawRecentRequests.length} recent requests
                </Text>
              )}
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                Updated {formatRelativeTime(providers[0].lastChecked)}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
