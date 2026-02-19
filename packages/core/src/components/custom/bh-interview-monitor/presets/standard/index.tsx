'use client';

/**
 * BhInterviewMonitor - Standard Preset
 * Real-time monitoring dashboard with live sessions hero,
 * session cards grid, provider health, SVG line chart, alert feed,
 * intervention controls, and recent completions.
 * Personality-driven, glass-aware, fully accessible.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhInterviewMonitorProps,
  ActiveSession,
  ProviderStatus,
  MonitorAlert,
} from '../../core';
import {
  Activity, Radio, AlertTriangle, CheckCircle, XCircle,
  BarChart3, RefreshCw, PhoneOff, UserCheck, RotateCcw,
  Shield, ShieldAlert, ShieldOff, Bell, Award, Timer, Server,
} from 'lucide-react';

const SESSION_STATUS_CONFIG: Record<ActiveSession['status'], { label: string; colorKey: 'success' | 'warning' | 'error' }> = {
  connected: { label: 'Connected', colorKey: 'success' },
  processing: { label: 'Processing', colorKey: 'warning' },
  error: { label: 'Error', colorKey: 'error' },
};

const PROVIDER_STATUS_CONFIG: Record<ProviderStatus['status'], { label: string; colorKey: 'success' | 'warning' | 'error' }> = {
  healthy: { label: 'Healthy', colorKey: 'success' },
  degraded: { label: 'Degraded', colorKey: 'warning' },
  down: { label: 'Down', colorKey: 'error' },
};

const CIRCUIT_BREAKER_CONFIG: Record<ProviderStatus['circuitBreaker'], { label: string; colorKey: 'success' | 'warning' | 'error' }> = {
  closed: { label: 'Closed', colorKey: 'success' },
  'half-open': { label: 'Half-Open', colorKey: 'warning' },
  open: { label: 'Open', colorKey: 'error' },
};

const ALERT_SEVERITY_CONFIG: Record<MonitorAlert['severity'], { colorKey: 'info' | 'warning' | 'error' }> = {
  info: { colorKey: 'info' },
  warning: { colorKey: 'warning' },
  error: { colorKey: 'error' },
};

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Stable empty array constants to prevent re-render loops
const EMPTY_SESSIONS: ActiveSession[] = [];
const EMPTY_PROVIDERS: ProviderStatus[] = [];
const EMPTY_ALERTS: MonitorAlert[] = [];
const EMPTY_COMPLETIONS: never[] = [];

const pulseKeyframes = `@keyframes bhMonitorPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`;

export const StandardBhInterviewMonitor = createPreset<BhInterviewMonitorProps>({
  name: 'BhInterviewMonitor.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewMonitorProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);


    const {
      activeSessions: rawSessions, providerHealth: rawProviderHealth,
      alerts: rawAlerts, metricsData,
      recentCompletions: rawRecentCompletions, onEndSession, onTransferToHuman, onRetryProvider,
      selectedSession: externalSelectedSession, onSessionSelect,
      autoRefresh: externalAutoRefresh = true, onAutoRefreshToggle,
      className, style,
    } = props;

    // Use props directly - no state duplication to avoid render loops from new array refs
    const activeSessions = Array.isArray(rawSessions) ? rawSessions : EMPTY_SESSIONS;
    const providerHealth = Array.isArray(rawProviderHealth) ? rawProviderHealth : EMPTY_PROVIDERS;
    const alerts = Array.isArray(rawAlerts) ? rawAlerts : EMPTY_ALERTS;
    const recentCompletions = Array.isArray(rawRecentCompletions) ? rawRecentCompletions : EMPTY_COMPLETIONS;

    const [selectedSession, setSelectedSession] = useState<string | null>(externalSelectedSession ?? null);
    const [autoRefresh, setAutoRefresh] = useState(externalAutoRefresh);

    useEffect(() => {
      if (externalSelectedSession !== undefined) setSelectedSession(externalSelectedSession);
    }, [externalSelectedSession]);

    const handleSessionSelect = useCallback((id: string | null) => {
      setSelectedSession(id);
      onSessionSelect?.(id);
    }, [onSessionSelect]);

    const handleAutoRefreshToggle = useCallback(() => {
      const next = !autoRefresh;
      setAutoRefresh(next);
      onAutoRefreshToggle?.(next);
    }, [autoRefresh, onAutoRefreshToggle]);

    const handleKeyNav = useCallback((e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    }, []);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const glassCard = useMemo(() =>
      isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {},
      [isGlass, t, bdr]
    );

    const cardBase = useMemo<React.CSSProperties>(() => ({
      ...createCardStyle(t, { elevation: 'sm', padding: 0 }),
      borderRadius: t.borderRadius.lg,
      border: `${bdr} ${t.colors.neutral[100]}`,
      padding: `${t.spacing[5]}px`,
      ...glassCard,
      // NOTE: accentBar sets width/height meant for a child element, not the card itself.
      // Using borderLeft instead to avoid collapsing the card width.
      ...(accentBar ? {
        borderLeftWidth: 4,
        borderLeftStyle: 'solid' as const,
        borderLeftColor: t.colors.primary,
      } : {}),
    }), [t, bdr, glassCard, accentBar]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box className={className} style={{
        padding: `${t.spacing[6]}px`, backgroundColor: t.colors.neutral[50],
        minHeight: '100%', width: '100%', ...style,
      }}>
        <style>{pulseKeyframes}</style>
        <Box style={{
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
          maxWidth: 1400, margin: '0 auto',
        }}>
          {/* Sessions Hero */}
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm', padding: 0 }),
            borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[100]}`,
            padding: `${t.spacing[6]}px`,
            background: `linear-gradient(135deg, ${t.colors.primaryScale[50]}, ${t.colors.primaryScale[100]})`,
            ...glassCard,
            ...animStyle(0),
          }} role="region" aria-label="Active sessions summary">
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                <Box style={{ ...createIconContainerStyle(t, { size: 56 }) }}>
                  <Radio size={28} color={t.colors.primaryScale[600]} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[2] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize['3xl'], fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], lineHeight: t.typography.lineHeight.tight,
                      letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      {activeSessions.length}
                    </Text>
                    {activeSessions.length > 0 && (
                      <Box style={{
                        width: 10, height: 10, borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.successScale[500],
                        animation: 'bhMonitorPulse 2s ease-in-out infinite',
                      }} aria-label="Live indicator" />
                    )}
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                    interviews in progress
                  </Text>
                </Box>
              </Box>

              <Box
                role="button"
                tabIndex={0}
                aria-label={autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
                aria-pressed={autoRefresh}
                onClick={handleAutoRefreshToggle}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, handleAutoRefreshToggle)}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.lg,
                  border: `${bdr} ${autoRefresh ? t.colors.successScale[300] : t.colors.neutral[200]}`,
                  backgroundColor: autoRefresh ? t.colors.successScale[50] : t.colors.common.white,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                }}
              >
                <RefreshCw
                  size={14}
                  color={autoRefresh ? t.colors.successScale[700] : t.colors.neutral[600]}
                  style={autoRefresh ? { animation: 'bhMonitorPulse 3s ease-in-out infinite' } : undefined}
                />
                <Text style={{
                  fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
                  color: autoRefresh ? t.colors.successScale[700] : t.colors.neutral[600],
                }}>
                  {autoRefresh ? 'Live' : 'Paused'}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Session Cards */}
          {activeSessions.length === 0 ? (
            <Box style={{
              ...cardBase,
              ...emptyState,
              padding: `${t.spacing[8]}px`,
              ...animStyle(1),
            }}>
              <Activity size={32} color={t.colors.neutral[300]} style={{ marginBottom: t.spacing[3] }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                No active interviews at this time
              </Text>
            </Box>
          ) : (
            <Box style={{ ...cardBase, ...animStyle(1) }} role="region" aria-label="Active interview sessions">
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Activity size={18} color={t.colors.neutral[600]} />
                <Text style={{
                  fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Active Sessions
                </Text>
                <Box style={{ ...createBadgeStyle(t, 'primary') }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{activeSessions.length}</Text>
                </Box>
              </Box>

              <Box style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: t.spacing[3],
              }}>
                {activeSessions.map((session, sIdx) => {
                  const statusCfg = SESSION_STATUS_CONFIG[session.status] || SESSION_STATUS_CONFIG.connected;
                  const isSelected = selectedSession === session.id;
                  const statusScale = t.colors[`${statusCfg.colorKey}Scale` as keyof typeof t.colors] as Record<number, string>;

                  return (
                    <Box
                      key={session.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Session for ${session.candidateName}, ${statusCfg.label}`}
                      aria-pressed={isSelected}
                      onClick={() => handleSessionSelect(isSelected ? null : session.id)}
                      onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => handleSessionSelect(isSelected ? null : session.id))}
                      style={{
                        padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                        backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                        border: `${bdr} ${isSelected ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                        borderLeftWidth: 4, borderLeftStyle: 'solid' as const, borderLeftColor: statusScale[500],
                        cursor: 'pointer', outline: 'none',
                        ...animStyle(sIdx + 2),
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                          color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                          overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '60%',
                        }}>
                          {session.candidateName}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Box style={{
                            width: 8, height: 8, borderRadius: t.borderRadius.full,
                            backgroundColor: statusScale[500],
                            animation: session.status === 'connected' ? 'bhMonitorPulse 2s ease-in-out infinite' : undefined,
                          }} />
                          <Text style={{
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                            color: statusScale[700],
                          }}>
                            {statusCfg.label}
                          </Text>
                        </Box>
                      </Box>

                      <Text style={{
                        fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500],
                        marginBottom: t.spacing[2],
                      }}>
                        {session.jobTitle} - {session.stageName}
                      </Text>

                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box style={{ ...createBadgeStyle(t, 'secondary'), fontSize: t.typography.fontSize.xs }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{session.providerName}</Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Timer size={12} color={t.colors.neutral[500]} />
                          <Text style={{
                            fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                            color: t.colors.neutral[700], fontVariantNumeric: 'tabular-nums',
                          }}>
                            {formatDuration(session.durationSeconds)}
                          </Text>
                        </Box>
                      </Box>

                      {/* Token cost and proctoring indicators */}
                      {(session.actualTokenCost != null || session.proctoringEnabled) && (
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[2],
                          marginTop: t.spacing[2], flexWrap: 'wrap' as const,
                        }}>
                          {session.actualTokenCost != null && (
                            <Box style={{
                              ...createBadgeStyle(t, 'info'),
                              borderRadius: badgeRadius,
                              fontSize: t.typography.fontSize.xs,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                                ${session.actualTokenCost.toFixed(2)} tokens
                              </Text>
                            </Box>
                          )}
                          {session.proctoringEnabled && (
                            <Box style={{
                              ...createBadgeStyle(t, session.proctoringViolations ? 'warning' : 'success'),
                              borderRadius: badgeRadius,
                              fontSize: t.typography.fontSize.xs,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                                Proctored{session.proctoringViolations ? ` (${session.proctoringViolations} violations)` : ''}
                              </Text>
                            </Box>
                          )}
                          {session.wasResumed && (
                            <Box style={{
                              ...createBadgeStyle(t, 'warning'),
                              borderRadius: badgeRadius,
                              fontSize: t.typography.fontSize.xs,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                                Resumed{session.resumeCount ? ` x${session.resumeCount}` : ''}
                              </Text>
                            </Box>
                          )}
                        </Box>
                      )}

                      {isSelected && (
                        <Box style={{
                          display: 'flex', gap: t.spacing[2],
                          marginTop: t.spacing[3], paddingTop: t.spacing[3],
                          borderTop: `${bdr} ${t.colors.neutral[100]}`,
                        }}>
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`End session for ${session.candidateName}`}
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEndSession?.(session.id); }}
                            onKeyDown={(e: React.KeyboardEvent) => { e.stopPropagation(); handleKeyNav(e, () => onEndSession?.(session.id)); }}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: t.spacing[1], padding: `${t.spacing[2]}px`,
                              borderRadius: t.borderRadius.lg, backgroundColor: t.colors.errorScale[50],
                              border: `${bdr} ${t.colors.errorScale[200]}`,
                              cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                            }}
                          >
                            <PhoneOff size={12} color={t.colors.errorScale[700]} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.errorScale[700] }}>End</Text>
                          </Box>
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`Transfer ${session.candidateName} to human interviewer`}
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onTransferToHuman?.(session.id); }}
                            onKeyDown={(e: React.KeyboardEvent) => { e.stopPropagation(); handleKeyNav(e, () => onTransferToHuman?.(session.id)); }}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: t.spacing[1], padding: `${t.spacing[2]}px`,
                              borderRadius: t.borderRadius.lg, backgroundColor: t.colors.warningScale[50],
                              border: `${bdr} ${t.colors.warningScale[200]}`,
                              cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                            }}
                          >
                            <UserCheck size={12} color={t.colors.warningScale[700]} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.warningScale[700] }}>Transfer</Text>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Provider Health */}
          {providerHealth.length > 0 && (() => {
            const maxLatency = Math.max(...providerHealth.map((p) => p.latencyMs), 500);

            return (
              <Box style={{ ...cardBase, ...animStyle(2) }} role="region" aria-label="Provider health status">
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                  <Server size={18} color={t.colors.neutral[600]} />
                  <Text style={{
                    fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                    color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                  }}>
                    Provider Health
                  </Text>
                </Box>

                <Box style={{
                  display: 'grid', gridTemplateColumns: `repeat(${Math.min(providerHealth.length, 4)}, 1fr)`,
                  gap: t.spacing[3],
                }}>
                  {providerHealth.map((provider, pIdx) => {
                    const statusCfg = PROVIDER_STATUS_CONFIG[provider.status] || PROVIDER_STATUS_CONFIG.healthy;
                    const cbCfg = CIRCUIT_BREAKER_CONFIG[provider.circuitBreaker] || CIRCUIT_BREAKER_CONFIG.closed;
                    const statusScale = t.colors[`${statusCfg.colorKey}Scale` as keyof typeof t.colors] as Record<number, string>;
                    const cbScale = t.colors[`${cbCfg.colorKey}Scale` as keyof typeof t.colors] as Record<number, string>;
                    const latencyPercent = Math.min(100, (provider.latencyMs / maxLatency) * 100);
                    const latencyColor = provider.latencyMs < 200
                      ? t.colors.successScale[500]
                      : provider.latencyMs < 400
                        ? t.colors.warningScale[500]
                        : t.colors.errorScale[500];

                    const CbIcon = provider.circuitBreaker === 'closed' ? Shield
                      : provider.circuitBreaker === 'half-open' ? ShieldAlert : ShieldOff;

                    return (
                      <Box key={provider.name} style={{
                        padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                        backgroundColor: t.colors.common.white,
                        border: `${bdr} ${t.colors.neutral[100]}`,
                        ...animStyle(pIdx + 3),
                      }} role="article" aria-label={`Provider ${provider.name}: ${statusCfg.label}`}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                            <Box style={{
                              width: 8, height: 8, borderRadius: t.borderRadius.full,
                              backgroundColor: statusScale[500],
                            }} />
                            <Text style={{
                              fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                              color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                            }}>
                              {provider.name}
                            </Text>
                          </Box>
                          {provider.status === 'down' && onRetryProvider && (
                            <Box
                              role="button"
                              tabIndex={0}
                              aria-label={`Retry provider ${provider.name}`}
                              onClick={() => onRetryProvider(provider.name)}
                              onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => onRetryProvider(provider.name))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                                borderRadius: badgeRadius,
                                backgroundColor: t.colors.primaryScale[50],
                                border: `${bdr} ${t.colors.primaryScale[200]}`,
                                cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
                              }}
                            >
                              <RotateCcw size={10} color={t.colors.primaryScale[700]} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700] }}>Retry</Text>
                            </Box>
                          )}
                        </Box>

                        <Box style={{ marginBottom: t.spacing[2] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Latency</Text>
                            <Text style={{
                              fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                              color: t.colors.neutral[700], fontVariantNumeric: 'tabular-nums',
                            }}>
                              {provider.latencyMs}ms
                            </Text>
                          </Box>
                          <Box style={{
                            height: 6, borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.neutral[100], overflow: 'hidden' as const,
                          }}>
                            <Box style={{
                              width: `${latencyPercent}%`, height: '100%',
                              borderRadius: t.borderRadius.full, backgroundColor: latencyColor,
                              transition: `width ${t.motion.hover}`,
                            }} />
                          </Box>
                        </Box>

                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <CbIcon size={12} color={cbScale[600]} />
                          <Text style={{
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                            color: cbScale[700],
                          }}>
                            CB: {cbCfg.label}
                          </Text>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })()}

          {/* Two-column: Metrics + Alerts */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: t.spacing[5] }}>
            {/* Metrics */}
            {metricsData && (() => {
              const { interviewsPerHour = [], avgDuration, completionRate } = metricsData;
              const maxValue = Math.max(...interviewsPerHour.map((d) => d.value), 1);
              const chartWidth = 400;
              const chartHeight = 100;
              const padding = 4;

              const points = interviewsPerHour.map((d, i) => ({
                x: padding + (i / Math.max(interviewsPerHour.length - 1, 1)) * (chartWidth - padding * 2),
                y: chartHeight - padding - (d.value / maxValue) * (chartHeight - padding * 2),
              }));

              const linePath = points.length > 0 ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}` : '';
              const areaPath = points.length > 0
                ? `${linePath} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`
                : '';

              return (
                <Box style={{ ...cardBase, ...animStyle(3) }} role="region" aria-label="Real-time metrics">
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                    <BarChart3 size={18} color={t.colors.neutral[600]} />
                    <Text style={{
                      fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      Real-Time Metrics
                    </Text>
                  </Box>

                  <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[4] }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      flex: 1, padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                      backgroundColor: t.colors.infoScale[50], border: `${bdr} ${t.colors.infoScale[200]}`,
                    }}>
                      <Text style={{ ...sectionLabel, color: t.colors.infoScale[600], marginBottom: t.spacing[1] }}>
                        Avg Duration
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xl, fontWeight: ptypo.headingWeight,
                        color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                      }}>
                        {avgDuration}m
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      flex: 1, padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                      backgroundColor: t.colors.successScale[50], border: `${bdr} ${t.colors.successScale[200]}`,
                    }}>
                      <Text style={{ ...sectionLabel, color: t.colors.successScale[600], marginBottom: t.spacing[1] }}>
                        Completion Rate
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xl, fontWeight: ptypo.headingWeight,
                        color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                      }}>
                        {completionRate}%
                      </Text>
                    </Box>
                  </Box>

                  {interviewsPerHour.length > 1 && (
                    <Box>
                      <Text style={{ ...sectionLabel, color: t.colors.neutral[500], marginBottom: t.spacing[2] }}>
                        Interviews / Hour (Last 4h)
                      </Text>
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight} style={{ display: 'block', overflow: 'visible' }} role="img" aria-label="Interviews per hour chart">
                        {[0.25, 0.5, 0.75, 1].map((frac) => (
                          <line key={frac}
                            x1={padding} y1={chartHeight - padding - frac * (chartHeight - padding * 2)}
                            x2={chartWidth - padding} y2={chartHeight - padding - frac * (chartHeight - padding * 2)}
                            stroke={t.colors.neutral[100]} strokeWidth="1" strokeDasharray="4,4"
                          />
                        ))}
                        <path d={areaPath} fill={t.colors.primaryScale[100]} opacity={0.5} />
                        <path d={linePath} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="3" fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth="2" />
                        ))}
                      </svg>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {interviewsPerHour[0]?.time ?? ''}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {interviewsPerHour[interviewsPerHour.length - 1]?.time ?? ''}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })()}

            {/* Alerts */}
            {alerts.length > 0 && (() => {
              const sortedAlerts = [...alerts].sort((a, b) => (b.time?.getTime?.() ?? 0) - (a.time?.getTime?.() ?? 0));

              return (
                <Box style={{ ...cardBase, ...animStyle(4) }} role="region" aria-label="System alerts">
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                    <Bell size={18} color={t.colors.neutral[600]} />
                    <Text style={{
                      fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      Alerts
                    </Text>
                    <Box style={{ ...createBadgeStyle(t, 'warning') }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{alerts.length}</Text>
                    </Box>
                  </Box>

                  <Box style={{
                    display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2],
                    maxHeight: 320, overflowY: 'auto' as const,
                  }}>
                    {sortedAlerts.map((alert) => {
                      const severityCfg = ALERT_SEVERITY_CONFIG[alert.severity] || ALERT_SEVERITY_CONFIG.info;
                      const scale = t.colors[`${severityCfg.colorKey}Scale` as keyof typeof t.colors] as Record<number, string>;
                      const AlertIcon = alert.severity === 'error' ? XCircle
                        : alert.severity === 'warning' ? AlertTriangle
                          : alert.type === 'completion' ? CheckCircle : Bell;

                      return (
                        <Box key={alert.id} style={{
                          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                          borderRadius: t.borderRadius.lg,
                          backgroundColor: t.colors.common.white,
                          border: `${bdr} ${t.colors.neutral[100]}`,
                          borderLeftWidth: 4, borderLeftStyle: 'solid' as const, borderLeftColor: scale[500],
                          display: 'flex', alignItems: 'flex-start', gap: t.spacing[3],
                        }} role="alert" aria-label={`${alert.severity} alert: ${alert.message}`}>
                          <AlertIcon size={16} color={scale[600]} style={{ flexShrink: 0, marginTop: t.spacing[1] }} />
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                            <Text style={{
                              fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800],
                              lineHeight: t.typography.lineHeight.normal,
                              wordBreak: 'break-word' as const,
                            }}>
                              {alert.message}
                            </Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400]}}>
                              {formatDistanceToNow(alert.time, { addSuffix: true })}
                            </Text>
                          </Box>
                          <Box style={{ ...createBadgeStyle(t, severityCfg.colorKey), fontSize: t.typography.fontSize.xs, flexShrink: 0 }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>{alert.type.replace('_', ' ')}</Text>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })()}
          </Box>

          {/* Recent Completions */}
          {recentCompletions.length > 0 && (
            <Box style={{ ...cardBase, ...animStyle(5) }} role="region" aria-label="Recently completed interviews">
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Award size={18} color={t.colors.neutral[600]} />
                <Text style={{
                  fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Recently Completed
                </Text>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {recentCompletions.slice(0, 10).map((completion, cIdx) => {
                  const scoreColor = completion.score >= 80
                    ? t.colors.successScale[500]
                    : completion.score >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];
                  const scoreTextColor = completion.score >= 80
                    ? t.colors.successScale[700]
                    : completion.score >= 50 ? t.colors.warningScale[700] : t.colors.errorScale[700];

                  return (
                    <Box key={completion.id} style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[3],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.lg,
                      backgroundColor: t.colors.common.white,
                      border: `${bdr} ${t.colors.neutral[100]}`,
                      ...animStyle(cIdx + 6),
                    }} role="article" aria-label={`${completion.candidateName}, score ${completion.score}%`}>
                      <Box style={{ ...createIconContainerStyle(t, { size: 36 }) }}>
                        <CheckCircle size={16} color={t.colors.successScale[600]} />
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[900],
                          overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        }}>
                          {completion.candidateName}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {completion.jobTitle}
                        </Text>
                      </Box>
                      <Box style={{ width: 72, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 2 }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs, fontWeight: ptypo.headingWeight,
                          color: scoreTextColor, fontVariantNumeric: 'tabular-nums',
                        }}>
                          {completion.score}%
                        </Text>
                        <Box style={{
                          width: '100%', height: 4, backgroundColor: t.colors.neutral[100],
                          borderRadius: t.borderRadius.full, overflow: 'hidden' as const,
                        }}>
                          <Box style={{
                            width: `${completion.score}%`, height: '100%',
                            borderRadius: t.borderRadius.full, backgroundColor: scoreColor,
                            transition: `width ${t.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400],
                        whiteSpace: 'nowrap' as const, flexShrink: 0,
                      }}>
                        {formatDistanceToNow(completion.completedAt, { addSuffix: true })}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
