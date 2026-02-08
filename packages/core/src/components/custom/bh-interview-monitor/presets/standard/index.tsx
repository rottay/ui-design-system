'use client';

/**
 * BhInterviewMonitor - Standard Preset
 * Real-time interview monitoring dashboard with live sessions, provider health,
 * metrics charts, alert feed, intervention controls, and recent completions.
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhInterviewMonitorProps,
  ActiveSession,
  ProviderStatus,
  MonitorAlert,
  MetricsDataPoint,
  RecentCompletion,
} from '../../core';
import {
  Activity,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw,
  PhoneOff,
  UserCheck,
  RotateCcw,
  Zap,
  Shield,
  ShieldAlert,
  ShieldOff,
  Bell,
  Eye,
  ChevronRight,
  Timer,
  Award,
  ArrowRight,
  Server,
} from 'lucide-react';

const SESSION_STATUS_CONFIG: Record<
  ActiveSession['status'],
  { label: string; colorKey: 'success' | 'warning' | 'error' }
> = {
  connected: { label: 'Connected', colorKey: 'success' },
  processing: { label: 'Processing', colorKey: 'warning' },
  error: { label: 'Error', colorKey: 'error' },
};

const PROVIDER_STATUS_CONFIG: Record<
  ProviderStatus['status'],
  { label: string; colorKey: 'success' | 'warning' | 'error' }
> = {
  healthy: { label: 'Healthy', colorKey: 'success' },
  degraded: { label: 'Degraded', colorKey: 'warning' },
  down: { label: 'Down', colorKey: 'error' },
};

const CIRCUIT_BREAKER_CONFIG: Record<
  ProviderStatus['circuitBreaker'],
  { label: string; colorKey: 'success' | 'warning' | 'error' }
> = {
  closed: { label: 'Closed', colorKey: 'success' },
  'half-open': { label: 'Half-Open', colorKey: 'warning' },
  open: { label: 'Open', colorKey: 'error' },
};

const ALERT_SEVERITY_CONFIG: Record<
  MonitorAlert['severity'],
  { colorKey: 'info' | 'warning' | 'error' }
> = {
  info: { colorKey: 'info' },
  warning: { colorKey: 'warning' },
  error: { colorKey: 'error' },
};

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const StandardBhInterviewMonitor = createPreset<BhInterviewMonitorProps>({
  name: 'BhInterviewMonitor.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewMonitorProps>) => {
    const { Box, Stack } = primitives;

    const {
      activeSessions: externalSessions = [],
      providerHealth: externalProviderHealth = [],
      alerts: externalAlerts = [],
      metricsData: externalMetrics,
      recentCompletions = [],
      onEndSession,
      onTransferToHuman,
      onRetryProvider,
      selectedSession: externalSelectedSession,
      onSessionSelect,
      autoRefresh: externalAutoRefresh = true,
      onAutoRefreshToggle,
      className,
      style,
    } = props;

    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(externalSessions);
    const [selectedSession, setSelectedSession] = useState<string | null>(
      externalSelectedSession ?? null
    );
    const [alerts, setAlerts] = useState<MonitorAlert[]>(externalAlerts);
    const [providerHealth, setProviderHealth] = useState<ProviderStatus[]>(externalProviderHealth);
    const [metricsData, setMetricsData] = useState(externalMetrics);
    const [autoRefresh, setAutoRefresh] = useState(externalAutoRefresh);

    useEffect(() => { setActiveSessions(externalSessions); }, [externalSessions]);
    useEffect(() => { setAlerts(externalAlerts); }, [externalAlerts]);
    useEffect(() => { setProviderHealth(externalProviderHealth); }, [externalProviderHealth]);
    useEffect(() => { setMetricsData(externalMetrics); }, [externalMetrics]);
    useEffect(() => {
      if (externalSelectedSession !== undefined) setSelectedSession(externalSelectedSession);
    }, [externalSelectedSession]);

    const handleSessionSelect = useCallback(
      (id: string | null) => {
        setSelectedSession(id);
        onSessionSelect?.(id);
      },
      [onSessionSelect]
    );

    const handleAutoRefreshToggle = useCallback(() => {
      const next = !autoRefresh;
      setAutoRefresh(next);
      onAutoRefreshToggle?.(next);
    }, [autoRefresh, onAutoRefreshToggle]);

    const isGlass = engine === 'modern';

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
      interactive: true,
    }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    const pulseKeyframes = `
      @keyframes bhMonitorPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;

    /* ---- Active Sessions Hero ---- */
    const renderSessionsHero = () => {
      const heroStyle: React.CSSProperties = {
        ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
        padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
        background:
          isGlass && tokens.glass
            ? tokens.glass.bg
            : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.primaryScale[100]})`,
        position: 'relative' as const,
        overflow: 'hidden',
      };

      return (
        <div style={heroStyle}>
          <style>{pulseKeyframes}</style>
          {isGlass && tokens.glass && (
            <div
              style={{
                position: 'absolute' as const,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: tokens.glass.blur,
                WebkitBackdropFilter: tokens.glass.blur,
                pointerEvents: 'none' as const,
              }}
            />
          )}
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ position: 'relative' as const, zIndex: 1 }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[4]}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primaryScale[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Radio size={28} color={tokens.colors.primaryScale[600]} />
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: tokens.spacing[2],
                  }}
                >
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize['3xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      lineHeight: tokens.typography.lineHeight.tight,
                    }}
                  >
                    {activeSessions.length}
                  </span>
                  {activeSessions.length > 0 && (
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.successScale[500],
                        display: 'inline-block',
                        animation: 'bhMonitorPulse 2s ease-in-out infinite',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
                <p
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    margin: 0,
                  }}
                >
                  interviews in progress
                </p>
              </div>
            </Stack>

            <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
              <button
                onClick={handleAutoRefreshToggle}
                style={{
                  ...hoverTransition,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    autoRefresh
                      ? tokens.colors.successScale[300]
                      : tokens.colors.neutral[200]
                  }`,
                  backgroundColor: autoRefresh
                    ? tokens.colors.successScale[50]
                    : tokens.colors.common.white,
                  color: autoRefresh
                    ? tokens.colors.successScale[700]
                    : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <RefreshCw
                  size={14}
                  style={
                    autoRefresh
                      ? { animation: 'bhMonitorPulse 3s ease-in-out infinite' }
                      : undefined
                  }
                />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
            </Stack>
          </Stack>
        </div>
      );
    };

    /* ---- Session Cards Grid ---- */
    const renderSessionCards = () => {
      if (activeSessions.length === 0) {
        return (
          <div
            style={{
              ...cardBase,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
              textAlign: 'center' as const,
            }}
          >
            <Activity
              size={32}
              color={tokens.colors.neutral[300]}
              style={{ marginBottom: tokens.spacing[3] }}
            />
            <p
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                margin: 0,
              }}
            >
              No active interviews at this time
            </p>
          </div>
        );
      }

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Activity size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Active Sessions</h3>
            <span style={createBadgeStyle(tokens, 'primary')}>
              {activeSessions.length}
            </span>
          </Stack>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {activeSessions.map((session) => {
              const statusCfg = SESSION_STATUS_CONFIG[session.status];
              const isSelected = selectedSession === session.id;
              const statusScale = tokens.colors[`${statusCfg.colorKey}Scale` as const] as any;

              return (
                <div
                  key={session.id}
                  onClick={() =>
                    handleSessionSelect(isSelected ? null : session.id)
                  }
                  style={{
                    ...cardInteractive,
                    padding: tokens.spacing[4],
                    borderLeft: `4px solid ${statusScale[500]}`,
                    backgroundColor: isSelected
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.common.white,
                    border: isSelected
                      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                      : undefined,
                    borderLeftWidth: 4,
                    borderLeftStyle: 'solid' as const,
                    borderLeftColor: statusScale[500],
                  }}
                >
                  <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                    style={{ marginBottom: tokens.spacing[3] }}
                  >
                    <p
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                        maxWidth: '60%',
                      }}
                    >
                      {session.candidateName}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: statusScale[500],
                          animation:
                            session.status === 'connected'
                              ? 'bhMonitorPulse 2s ease-in-out infinite'
                              : undefined,
                        }}
                      />
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: statusScale[700],
                        }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </Stack>

                  <p
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      margin: `0 0 ${tokens.spacing[2]}px 0`,
                    }}
                  >
                    {session.jobTitle} &middot; {session.stageName}
                  </p>

                  <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                  >
                    <span
                      style={{
                        ...createBadgeStyle(tokens, 'secondary'),
                        fontSize: tokens.typography.fontSize.xs,
                      }}
                    >
                      {session.providerName}
                    </span>
                    <Stack
                      direction="horizontal"
                      align="center"
                      gap={tokens.spacing[1]}
                    >
                      <Timer size={12} color={tokens.colors.neutral[500]} />
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatDuration(session.durationSeconds)}
                      </span>
                    </Stack>
                  </Stack>

                  {/* Intervention controls */}
                  {isSelected && (
                    <Stack
                      direction="horizontal"
                      gap={tokens.spacing[2]}
                      style={{
                        marginTop: tokens.spacing[3],
                        paddingTop: tokens.spacing[3],
                        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEndSession?.(session.id);
                        }}
                        style={{
                          ...hoverTransition,
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.errorScale[50],
                          color: tokens.colors.errorScale[700],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        <PhoneOff size={12} />
                        End
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransferToHuman?.(session.id);
                        }}
                        style={{
                          ...hoverTransition,
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.warningScale[50],
                          color: tokens.colors.warningScale[700],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        <UserCheck size={12} />
                        Transfer
                      </button>
                    </Stack>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Provider Health Row ---- */
    const renderProviderHealth = () => {
      if (providerHealth.length === 0) return null;

      const maxLatency = Math.max(...providerHealth.map((p) => p.latencyMs), 500);

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Server size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Provider Health</h3>
          </Stack>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(providerHealth.length, 4)}, 1fr)`,
              gap: tokens.spacing[3],
            }}
          >
            {providerHealth.map((provider) => {
              const statusCfg = PROVIDER_STATUS_CONFIG[provider.status];
              const cbCfg = CIRCUIT_BREAKER_CONFIG[provider.circuitBreaker];
              const statusScale = tokens.colors[
                `${statusCfg.colorKey}Scale` as const
              ] as any;
              const cbScale = tokens.colors[
                `${cbCfg.colorKey}Scale` as const
              ] as any;
              const latencyPercent = Math.min(
                100,
                (provider.latencyMs / maxLatency) * 100
              );
              const latencyColor =
                provider.latencyMs < 200
                  ? tokens.colors.successScale[500]
                  : provider.latencyMs < 400
                  ? tokens.colors.warningScale[500]
                  : tokens.colors.errorScale[500];

              const CbIcon =
                provider.circuitBreaker === 'closed'
                  ? Shield
                  : provider.circuitBreaker === 'half-open'
                  ? ShieldAlert
                  : ShieldOff;

              return (
                <div
                  key={provider.name}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                    style={{ marginBottom: tokens.spacing[3] }}
                  >
                    <Stack
                      direction="horizontal"
                      align="center"
                      gap={tokens.spacing[2]}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: statusScale[500],
                        }}
                      />
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {provider.name}
                      </span>
                    </Stack>
                    {provider.status === 'down' && onRetryProvider && (
                      <button
                        onClick={() => onRetryProvider(provider.name)}
                        style={{
                          ...hoverTransition,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[700],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        <RotateCcw size={10} />
                        Retry
                      </button>
                    )}
                  </Stack>

                  {/* Latency bar */}
                  <div style={{ marginBottom: tokens.spacing[2] }}>
                    <Stack
                      direction="horizontal"
                      align="center"
                      justify="space-between"
                      style={{ marginBottom: tokens.spacing[1] }}
                    >
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        Latency
                      </span>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {provider.latencyMs}ms
                      </span>
                    </Stack>
                    <svg
                      width="100%"
                      height="6"
                      style={{ display: 'block', borderRadius: tokens.borderRadius.full }}
                    >
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="6"
                        rx="3"
                        fill={tokens.colors.neutral[100]}
                      />
                      <rect
                        x="0"
                        y="0"
                        width={`${latencyPercent}%`}
                        height="6"
                        rx="3"
                        fill={latencyColor}
                      />
                    </svg>
                  </div>

                  {/* Circuit breaker */}
                  <Stack
                    direction="horizontal"
                    align="center"
                    gap={tokens.spacing[1]}
                  >
                    <CbIcon size={12} color={cbScale[600]} />
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: cbScale[700],
                      }}
                    >
                      CB: {cbCfg.label}
                    </span>
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Real-Time Metrics ---- */
    const renderMetrics = () => {
      if (!metricsData) return null;

      const { interviewsPerHour = [], avgDuration, completionRate } = metricsData;
      const maxValue = Math.max(...interviewsPerHour.map((d) => d.value), 1);
      const chartWidth = 400;
      const chartHeight = 100;
      const padding = 4;

      const points = interviewsPerHour.map((d, i) => {
        const x =
          padding +
          (i / Math.max(interviewsPerHour.length - 1, 1)) *
            (chartWidth - padding * 2);
        const y =
          chartHeight -
          padding -
          (d.value / maxValue) * (chartHeight - padding * 2);
        return { x, y };
      });

      const linePath =
        points.length > 0
          ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
          : '';
      const areaPath =
        points.length > 0
          ? `${linePath} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`
          : '';

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <BarChart3 size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Real-Time Metrics</h3>
          </Stack>

          {/* Metric summary row */}
          <Stack
            direction="horizontal"
            gap={tokens.spacing[4]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <div
              style={{
                flex: 1,
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
              }}
            >
              <p
                style={{
                  ...sectionHeader,
                  color: tokens.colors.infoScale[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Avg Duration
              </p>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}
              >
                {avgDuration}m
              </p>
            </div>
            <div
              style={{
                flex: 1,
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.successScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
              }}
            >
              <p
                style={{
                  ...sectionHeader,
                  color: tokens.colors.successScale[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Completion Rate
              </p>
              <p
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                }}
              >
                {completionRate}%
              </p>
            </div>
          </Stack>

          {/* Line chart */}
          {interviewsPerHour.length > 1 && (
            <div>
              <p
                style={{
                  ...sectionHeader,
                  marginBottom: tokens.spacing[2],
                }}
              >
                Interviews / Hour (Last 4h)
              </p>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                width="100%"
                height={chartHeight}
                style={{
                  display: 'block',
                  overflow: 'visible',
                }}
              >
                {/* Grid lines */}
                {[0.25, 0.5, 0.75, 1].map((frac) => (
                  <line
                    key={frac}
                    x1={padding}
                    y1={
                      chartHeight -
                      padding -
                      frac * (chartHeight - padding * 2)
                    }
                    x2={chartWidth - padding}
                    y2={
                      chartHeight -
                      padding -
                      frac * (chartHeight - padding * 2)
                    }
                    stroke={tokens.colors.neutral[100]}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}
                {/* Area fill */}
                <path
                  d={areaPath}
                  fill={tokens.colors.primaryScale[100]}
                  opacity={0.5}
                />
                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={tokens.colors.primaryScale[500]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill={tokens.colors.common.white}
                    stroke={tokens.colors.primaryScale[500]}
                    strokeWidth="2"
                  />
                ))}
              </svg>
              <Stack
                direction="horizontal"
                justify="space-between"
                style={{ marginTop: tokens.spacing[1] }}
              >
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  {interviewsPerHour[0]?.time ?? ''}
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  {interviewsPerHour[interviewsPerHour.length - 1]?.time ?? ''}
                </span>
              </Stack>
            </div>
          )}
        </div>
      );
    };

    /* ---- Alert Feed ---- */
    const renderAlertFeed = () => {
      if (alerts.length === 0) return null;

      const sortedAlerts = [...alerts].sort(
        (a, b) => b.time.getTime() - a.time.getTime()
      );

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Bell size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Alerts</h3>
            <span style={createBadgeStyle(tokens, 'warning')}>
              {alerts.length}
            </span>
          </Stack>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[2],
              maxHeight: 320,
              overflowY: 'auto' as const,
            }}
          >
            {sortedAlerts.map((alert) => {
              const severityCfg = ALERT_SEVERITY_CONFIG[alert.severity];
              const scale = tokens.colors[
                `${severityCfg.colorKey}Scale` as const
              ] as any;

              const AlertIcon =
                alert.severity === 'error'
                  ? XCircle
                  : alert.severity === 'warning'
                  ? AlertTriangle
                  : alert.type === 'completion'
                  ? CheckCircle
                  : Bell;

              return (
                <div
                  key={alert.id}
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.common.white,
                    borderLeft: `4px solid ${scale[500]}`,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    borderLeftWidth: 4,
                    borderLeftStyle: 'solid' as const,
                    borderLeftColor: scale[500],
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                  }}
                >
                  <AlertIcon
                    size={16}
                    color={scale[600]}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                        margin: 0,
                        lineHeight: tokens.typography.lineHeight.normal,
                      }}
                    >
                      {alert.message}
                    </p>
                    <p
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        margin: `${tokens.spacing[1]}px 0 0`,
                      }}
                    >
                      {formatDistanceToNow(alert.time, { addSuffix: true })}
                    </p>
                  </div>
                  <span
                    style={{
                      ...createBadgeStyle(tokens, severityCfg.colorKey as any),
                      fontSize: tokens.typography.fontSize.xs,
                      flexShrink: 0,
                    }}
                  >
                    {alert.type.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Recently Completed ---- */
    const renderRecentCompletions = () => {
      if (recentCompletions.length === 0) return null;

      const displayed = recentCompletions.slice(0, 10);

      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            gap={tokens.spacing[2]}
            style={{ marginBottom: tokens.spacing[4] }}
          >
            <Award size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Recently Completed</h3>
          </Stack>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[2],
            }}
          >
            {displayed.map((completion) => {
              const scoreColor =
                completion.score >= 80
                  ? tokens.colors.successScale[500]
                  : completion.score >= 50
                  ? tokens.colors.warningScale[500]
                  : tokens.colors.errorScale[500];
              const scoreTextColor =
                completion.score >= 80
                  ? tokens.colors.successScale[700]
                  : completion.score >= 50
                  ? tokens.colors.warningScale[700]
                  : tokens.colors.errorScale[700];

              return (
                <div
                  key={completion.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.successScale[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle
                      size={16}
                      color={tokens.colors.successScale[600]}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {completion.candidateName}
                    </p>
                    <p
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        margin: 0,
                      }}
                    >
                      {completion.jobTitle}
                    </p>
                  </div>

                  {/* Score bar */}
                  <div
                    style={{
                      width: 72,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'flex-end',
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: scoreTextColor,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {completion.score}%
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: 4,
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${completion.score}%`,
                          height: '100%',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: scoreColor,
                        }}
                      />
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      whiteSpace: 'nowrap' as const,
                      flexShrink: 0,
                    }}
                  >
                    {formatDistanceToNow(completion.completedAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Main Layout ---- */
    return (
      <div className={className} style={containerStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {/* Hero */}
          {renderSessionsHero()}

          {/* Session Cards */}
          {renderSessionCards()}

          {/* Provider Health Row */}
          {renderProviderHealth()}

          {/* Two-column layout: Metrics + Alerts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
              gap: tokens.spacing[5],
            }}
          >
            {renderMetrics()}
            {renderAlertFeed()}
          </div>

          {/* Recently Completed */}
          {renderRecentCompletions()}
        </div>
      </div>
    );
  },
});
