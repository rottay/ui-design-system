'use client';

/**
 * BhProviderHealth - Dashboard Preset
 * Full health monitoring dashboard with summary row, provider cards
 * with latency sparklines, circuit breaker states, and incident timeline.
 */

import { useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createBadgeStyle,
  createPersonalityAccentBar,
  createIconContainerStyle,
  getCardPadding,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getHoverTransform,
  createEntranceAnimation,
  createStaggerDelay,

  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhProviderHealthProps, ProviderHealthItem, HealthIncident } from '../../core';
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Server,
  Zap,
  Shield,
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

function sparklinePolygonPoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const line = sparklinePoints(data, width, height, padding);
  const lastX = padding + (data.length - 1) * ((width - padding * 2) / (data.length - 1 || 1));
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
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
/*  Dashboard Preset                                                   */
/* ------------------------------------------------------------------ */
export const DashboardBhProviderHealth = createPreset<BhProviderHealthProps>({
  name: 'BhProviderHealth.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BhProviderHealthProps>) => {
    const { Box, Text } = primitives;

    const {
      providers: rawProviders = [],
      summary: controlledSummary,
      selectedProvider,
      onProviderSelect,
      onRefresh,
      showIncidents = true,
      recentRequests: rawRecentRequests,
      refreshInterval,
      className,
      style,
    } = props;

    const providers = Array.isArray(rawProviders) ? rawProviders : [];

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = useMemo(() => getHoverTransform(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const emptyState = useMemo(() => createEmptyStateStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const handleSelect = useCallback((id: string) => {
      onProviderSelect?.(id);
    }, [onProviderSelect]);

    // Compute summary
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

    const allIncidents = useMemo(() => {
      return providers
        .flatMap((p) => p.incidents.map((inc, idx) => ({ ...inc, providerName: p.name })))
        .sort((a, b) => (b.startedAt?.getTime?.() ?? 0) - (a.startedAt?.getTime?.() ?? 0));
    }, [providers]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const statusConfig = useCallback((status: ProviderHealthItem['status']) => {
      switch (status) {
        case 'healthy': return { color: tokens.colors.successScale[600], bg: tokens.colors.successScale[50], icon: <CheckCircle2 size={16} strokeWidth={1.5} />, label: 'Healthy' };
        case 'degraded': return { color: tokens.colors.warningScale[600], bg: tokens.colors.warningScale[50], icon: <AlertTriangle size={16} strokeWidth={1.5} />, label: 'Degraded' };
        case 'down': return { color: tokens.colors.errorScale[600], bg: tokens.colors.errorScale[50], icon: <XCircle size={16} strokeWidth={1.5} />, label: 'Down' };
      }
    }, [tokens]);

    const severityBadge = useCallback((severity: HealthIncident['severity']): 'error' | 'warning' | 'info' => {
      switch (severity) {
        case 'critical': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
      }
    }, []);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);


    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
              fontWeight: typo.headingWeight,
              letterSpacing: typo.headingLetterSpacing,
              color: tokens.colors.neutral[900],
              display: 'block',
            }}>
              Provider Health
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {summary.totalProviders} providers monitored
              </Text>
              {refreshInterval !== undefined && (
                <Box style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  <RefreshCw size={10} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                    {refreshInterval >= 1000 ? `${Math.round(refreshInterval / 1000)}s` : `${refreshInterval}ms`}
                  </Text>
                </Box>
              )}
            </Box>
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
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              <Text>Refresh</Text>
            </Box>
          )}
        </Box>

        {/* Summary cards */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: tokens.spacing[4] }}>
          {[
            { label: 'Healthy', value: summary.healthyCount, color: tokens.colors.successScale, icon: <CheckCircle2 size={20} strokeWidth={1.5} /> },
            { label: 'Degraded', value: summary.degradedCount, color: tokens.colors.warningScale, icon: <AlertTriangle size={20} strokeWidth={1.5} /> },
            { label: 'Down', value: summary.downCount, color: tokens.colors.errorScale, icon: <XCircle size={20} strokeWidth={1.5} /> },
            { label: 'Avg Latency', value: `${summary.avgLatency}ms`, color: tokens.colors.infoScale, icon: <Zap size={20} strokeWidth={1.5} /> },
            { label: 'Avg Uptime', value: `${summary.avgUptime}%`, color: tokens.colors.primaryScale, icon: <TrendingUp size={20} strokeWidth={1.5} /> },
            { label: 'Open Incidents', value: summary.openIncidents, color: summary.openIncidents > 0 ? tokens.colors.warningScale : tokens.colors.successScale, icon: <Shield size={20} strokeWidth={1.5} /> },
          ].map((stat, i) => (
            <Box
              key={stat.label}
              style={{
                ...animStyle(i),
                ...cardBase,
                padding: padding,
                backgroundColor: stat.color[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${stat.color[200]}`,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: stat.color[700] }}>
                  {stat.label}
                </Text>
                <Box style={{ color: stat.color[500] }}>{stat.icon}</Box>
              </Box>
              <Text style={{
                fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: stat.color[800],
                display: 'block',
              }}>
                {stat.value}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Provider cards */}
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
            <Server size={16} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Providers</Text>
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: tokens.spacing[4] }}>
            {providers.map((provider, i) => {
              const sc = statusConfig(provider.status);
              const isSelected = selectedProvider === provider.id;

              return (
                <Box
                  key={provider.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${provider.name} - ${sc.label}`}
                  aria-pressed={isSelected}
                  onClick={() => handleSelect(provider.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(provider.id); } }}
                  style={{
                    ...animStyle(i),
                    ...cardBase,
                    padding: padding,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    border: isSelected
                      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`
                      : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    position: 'relative' as const,
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                    (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                  }}
                >
                  <Box style={accentBar ? { ...accentBar, backgroundColor: sc.color } : undefined} />

                  {/* Header */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{ color: sc.color }}>{sc.icon}</Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900] }}>
                        {provider.name}
                      </Text>
                    </Box>
                    <Box style={{ ...createBadgeStyle(tokens, provider.status === 'healthy' ? 'success' : provider.status === 'degraded' ? 'warning' : 'error'), fontSize: tokens.typography.fontSize.xs }}>
                      <Text>{sc.label}</Text>
                    </Box>
                  </Box>

                  {/* Stats row */}
                  <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Uptime</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{provider.uptimePercent}%</Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Latency</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: provider.latencyMs < 200 ? tokens.colors.successScale[600] : provider.latencyMs < 500 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                      }}>
                        {provider.latencyMs}ms
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Error Rate</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: provider.errorRate < 0.1 ? tokens.colors.successScale[600] : provider.errorRate < 1 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                      }}>
                        {provider.errorRate}%
                      </Text>
                    </Box>
                  </Box>

                  {/* Latency sparkline */}
                  {provider.latencyTrend.length > 1 && (
                    <Box style={{ marginBottom: tokens.spacing[3] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginBottom: tokens.spacing[1] }}>
                        Latency Trend
                      </Text>
                      <svg width="100%" height={40} viewBox="0 0 200 40" preserveAspectRatio="none" style={{ display: 'block' }} aria-hidden="true">
                        <defs>
                          <linearGradient id={`health-grad-${provider.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={sc.color} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={sc.color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon points={sparklinePolygonPoints(provider.latencyTrend, 200, 40, 2)} fill={`url(#health-grad-${provider.id})`} />
                        <polyline points={sparklinePoints(provider.latencyTrend, 200, 40, 2)} fill="none" stroke={sc.color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Box>
                  )}

                  {/* Circuit breaker + meta */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{
                        width: tokens.spacing[2],
                        height: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: provider.circuitBreaker === 'closed' ? tokens.colors.successScale[500] : provider.circuitBreaker === 'open' ? tokens.colors.errorScale[500] : tokens.colors.warningScale[500],
                      }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                        CB: {provider.circuitBreaker === 'closed' ? 'Closed' : provider.circuitBreaker === 'open' ? 'Open' : 'Half-Open'}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Clock size={12} strokeWidth={1.5} style={{ color: tokens.colors.neutral[400] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {formatRelativeTime(provider.lastChecked)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Active incidents */}
                  {provider.incidents.filter((i) => !i.resolvedAt).length > 0 && (
                    <Box style={{ marginTop: tokens.spacing[3], padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.warningScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}` }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <AlertTriangle size={12} strokeWidth={1.5} style={{ color: tokens.colors.warningScale[600] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700] }}>
                          {provider.incidents.filter((i) => !i.resolvedAt).length} active incident(s)
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Incident timeline */}
        {showIncidents && allIncidents.length > 0 && (
          <Box style={{ ...cardBase, padding: padding }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
              <Activity size={16} strokeWidth={1.5} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Recent Incidents</Text>
            </Box>
            <Box style={divider} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], marginTop: tokens.spacing[3] }}>
              {allIncidents.slice(0, 10).map((incident, i) => (
                <Box
                  key={incident.id}
                  style={{
                    ...animStyle(i),
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: tokens.colors.common.white,
                  }}
                >
                  <Box style={{
                    width: tokens.spacing[2],
                    height: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: incident.severity === 'critical' ? tokens.colors.errorScale[500] : incident.severity === 'warning' ? tokens.colors.warningScale[500] : tokens.colors.infoScale[500],
                    flexShrink: 0,
                    marginTop: tokens.spacing[1],
                  }} />
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                        {incident.title}
                      </Text>
                      <Box style={{ ...createBadgeStyle(tokens, severityBadge(incident.severity)), fontSize: tokens.typography.fontSize.xs }}>
                        <Text>{incident.severity}</Text>
                      </Box>
                      {incident.resolvedAt && (
                        <Box style={{ ...createBadgeStyle(tokens, 'success'), fontSize: tokens.typography.fontSize.xs }}>
                          <Text>Resolved</Text>
                        </Box>
                      )}
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {(incident as any).providerName} &#183; {formatRelativeTime(incident.startedAt)}
                      {incident.resolvedAt ? ` &#183; Resolved ${formatRelativeTime(incident.resolvedAt)}` : ''}
                    </Text>
                    {incident.description && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block'}}>
                        {incident.description}
                      </Text>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Recent Requests */}
        {rawRecentRequests && rawRecentRequests.length > 0 && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Recent Requests</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {rawRecentRequests.slice(0, 10).map((req: any, idx: number) => (
                <Box
                  key={req.id ?? idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{
                      width: 6,
                      height: 6,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: req.status === 'success' ? tokens.colors.successScale[500]
                        : req.status === 'error' ? tokens.colors.errorScale[500]
                        : tokens.colors.warningScale[500],
                    }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                      {req.providerId ?? 'Unknown'}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {req.model ?? req.endpoint ?? ''}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    {req.latencyMs !== undefined && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {req.latencyMs}ms
                      </Text>
                    )}
                    {req.tokensUsed !== undefined && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {req.tokensUsed} tokens
                      </Text>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
