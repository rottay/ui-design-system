'use client';

/**
 * BhInterviewMonitor - Standard Preset
 * Slite-inspired real-time monitoring dashboard with live sessions hero,
 * session cards grid, provider health, SVG line chart, alert feed,
 * intervention controls, and recent completions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';
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

const pulseKeyframes = `@keyframes bhMonitorPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`;

export const StandardBhInterviewMonitor = createPreset<BhInterviewMonitorProps>({
  name: 'BhInterviewMonitor.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewMonitorProps>) => {
    const { Box, Text } = primitives;

    const {
      activeSessions: externalSessions = [], providerHealth: externalProviderHealth = [],
      alerts: externalAlerts = [], metricsData: externalMetrics,
      recentCompletions = [], onEndSession, onTransferToHuman, onRetryProvider,
      selectedSession: externalSelectedSession, onSessionSelect,
      autoRefresh: externalAutoRefresh = true, onAutoRefreshToggle,
      className, style,
    } = props;

    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(externalSessions);
    const [selectedSession, setSelectedSession] = useState<string | null>(externalSelectedSession ?? null);
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

    const handleSessionSelect = useCallback((id: string | null) => {
      setSelectedSession(id);
      onSessionSelect?.(id);
    }, [onSessionSelect]);

    const handleAutoRefreshToggle = useCallback(() => {
      const next = !autoRefresh;
      setAutoRefresh(next);
      onAutoRefreshToggle?.(next);
    }, [autoRefresh, onAutoRefreshToggle]);

    const cardBase: React.CSSProperties = {
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      padding: `${tokens.spacing[5]}px`,
    };

    return (
      <Box className={className} style={{
        padding: `${tokens.spacing[6]}px`, backgroundColor: tokens.colors.neutral[50],
        minHeight: '100%', ...style,
      }}>
        <style>{pulseKeyframes}</style>
        <Box style={{
          display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5],
          maxWidth: 1400, margin: '0 auto',
        }}>
          {/* Sessions Hero */}
          <Box style={{
            ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
            borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`,
            padding: `${tokens.spacing[6]}px`,
            background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.primaryScale[100]})`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                <Box style={{
                  width: 56, height: 56, borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primaryScale[200],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Radio size={28} color={tokens.colors.primaryScale[600]} />
                </Box>
                <Box>
                  <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight,
                    }}>
                      {activeSessions.length}
                    </Text>
                    {activeSessions.length > 0 && (
                      <Box style={{
                        width: 10, height: 10, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.successScale[500],
                        animation: 'bhMonitorPulse 2s ease-in-out infinite',
                      }} />
                    )}
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    interviews in progress
                  </Text>
                </Box>
              </Box>

              <Box
                onClick={handleAutoRefreshToggle}
                style={{
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  border: `1px solid ${autoRefresh ? tokens.colors.successScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: autoRefresh ? tokens.colors.successScale[50] : tokens.colors.common.white,
                  cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                }}
              >
                <RefreshCw
                  size={14}
                  color={autoRefresh ? tokens.colors.successScale[700] : tokens.colors.neutral[600]}
                  style={autoRefresh ? { animation: 'bhMonitorPulse 3s ease-in-out infinite' } : undefined}
                />
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                  color: autoRefresh ? tokens.colors.successScale[700] : tokens.colors.neutral[600],
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
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              justifyContent: 'center', padding: `${tokens.spacing[8]}px`, textAlign: 'center' as const,
            }}>
              <Activity size={32} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[3] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                No active interviews at this time
              </Text>
            </Box>
          ) : (
            <Box style={cardBase}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                <Activity size={18} color={tokens.colors.neutral[600]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  Active Sessions
                </Text>
                <Box style={{ ...createBadgeStyle(tokens, 'primary') }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{activeSessions.length}</Text>
                </Box>
              </Box>

              <Box style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: tokens.spacing[3],
              }}>
                {activeSessions.map((session) => {
                  const statusCfg = SESSION_STATUS_CONFIG[session.status];
                  const isSelected = selectedSession === session.id;
                  const statusScale = tokens.colors[`${statusCfg.colorKey}Scale` as const] as any;

                  return (
                    <Box
                      key={session.id}
                      onClick={() => handleSessionSelect(isSelected ? null : session.id)}
                      style={{
                        padding: `${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.lg,
                        borderLeft: `4px solid ${statusScale[500]}`,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        border: `1px solid ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
                        borderLeftWidth: 4, borderLeftStyle: 'solid' as const, borderLeftColor: statusScale[500],
                        cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '60%',
                        }}>
                          {session.candidateName}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <Box style={{
                            width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                            backgroundColor: statusScale[500],
                            animation: session.status === 'connected' ? 'bhMonitorPulse 2s ease-in-out infinite' : undefined,
                          }} />
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                            color: statusScale[700],
                          }}>
                            {statusCfg.label}
                          </Text>
                        </Box>
                      </Box>

                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[2],
                      }}>
                        {session.jobTitle} - {session.stageName}
                      </Text>

                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box style={{ ...createBadgeStyle(tokens, 'secondary'), fontSize: tokens.typography.fontSize.xs }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{session.providerName}</Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <Timer size={12} color={tokens.colors.neutral[500]} />
                          <Text style={{
                            fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[700], fontVariantNumeric: 'tabular-nums',
                          }}>
                            {formatDuration(session.durationSeconds)}
                          </Text>
                        </Box>
                      </Box>

                      {isSelected && (
                        <Box style={{
                          display: 'flex', gap: tokens.spacing[2],
                          marginTop: tokens.spacing[3], paddingTop: tokens.spacing[3],
                          borderTop: `1px solid ${tokens.colors.neutral[100]}`,
                        }}>
                          <Box
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEndSession?.(session.id); }}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.errorScale[50],
                              border: `1px solid ${tokens.colors.errorScale[200]}`,
                              cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            <PhoneOff size={12} color={tokens.colors.errorScale[700]} />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.errorScale[700] }}>End</Text>
                          </Box>
                          <Box
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onTransferToHuman?.(session.id); }}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.warningScale[50],
                              border: `1px solid ${tokens.colors.warningScale[200]}`,
                              cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            <UserCheck size={12} color={tokens.colors.warningScale[700]} />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.warningScale[700] }}>Transfer</Text>
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
              <Box style={cardBase}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Server size={18} color={tokens.colors.neutral[600]} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}>
                    Provider Health
                  </Text>
                </Box>

                <Box style={{
                  display: 'grid', gridTemplateColumns: `repeat(${Math.min(providerHealth.length, 4)}, 1fr)`,
                  gap: tokens.spacing[3],
                }}>
                  {providerHealth.map((provider) => {
                    const statusCfg = PROVIDER_STATUS_CONFIG[provider.status];
                    const cbCfg = CIRCUIT_BREAKER_CONFIG[provider.circuitBreaker];
                    const statusScale = tokens.colors[`${statusCfg.colorKey}Scale` as const] as any;
                    const cbScale = tokens.colors[`${cbCfg.colorKey}Scale` as const] as any;
                    const latencyPercent = Math.min(100, (provider.latencyMs / maxLatency) * 100);
                    const latencyColor = provider.latencyMs < 200
                      ? tokens.colors.successScale[500]
                      : provider.latencyMs < 400
                        ? tokens.colors.warningScale[500]
                        : tokens.colors.errorScale[500];

                    const CbIcon = provider.circuitBreaker === 'closed' ? Shield
                      : provider.circuitBreaker === 'half-open' ? ShieldAlert : ShieldOff;

                    return (
                      <Box key={provider.name} style={{
                        padding: `${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.lg,
                        backgroundColor: tokens.colors.common.white,
                        border: `1px solid ${tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Box style={{
                              width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                              backgroundColor: statusScale[500],
                            }} />
                            <Text style={{
                              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}>
                              {provider.name}
                            </Text>
                          </Box>
                          {provider.status === 'down' && onRetryProvider && (
                            <Box
                              onClick={() => onRetryProvider(provider.name)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.lg,
                                backgroundColor: tokens.colors.primaryScale[50],
                                border: `1px solid ${tokens.colors.primaryScale[200]}`,
                                cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                              }}
                            >
                              <RotateCcw size={10} color={tokens.colors.primaryScale[700]} />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.primaryScale[700] }}>Retry</Text>
                            </Box>
                          )}
                        </Box>

                        <Box style={{ marginBottom: tokens.spacing[2] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Latency</Text>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[700], fontVariantNumeric: 'tabular-nums',
                            }}>
                              {provider.latencyMs}ms
                            </Text>
                          </Box>
                          <Box style={{
                            height: 6, borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' as const,
                          }}>
                            <Box style={{
                              width: `${latencyPercent}%`, height: '100%',
                              borderRadius: tokens.borderRadius.full, backgroundColor: latencyColor,
                            }} />
                          </Box>
                        </Box>

                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <CbIcon size={12} color={cbScale[600]} />
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
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
          <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: tokens.spacing[5] }}>
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
                <Box style={cardBase}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <BarChart3 size={18} color={tokens.colors.neutral[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      Real-Time Metrics
                    </Text>
                  </Box>

                  <Box style={{ display: 'flex', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
                    <Box style={{
                      flex: 1, padding: `${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.infoScale[50], border: `1px solid ${tokens.colors.infoScale[200]}`,
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.infoScale[600], textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em', marginBottom: tokens.spacing[1],
                      }}>
                        Avg Duration
                      </Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}>
                        {avgDuration}m
                      </Text>
                    </Box>
                    <Box style={{
                      flex: 1, padding: `${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.successScale[50], border: `1px solid ${tokens.colors.successScale[200]}`,
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.successScale[600], textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em', marginBottom: tokens.spacing[1],
                      }}>
                        Completion Rate
                      </Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}>
                        {completionRate}%
                      </Text>
                    </Box>
                  </Box>

                  {interviewsPerHour.length > 1 && (
                    <Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[500], textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em', marginBottom: tokens.spacing[2],
                      }}>
                        Interviews / Hour (Last 4h)
                      </Text>
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight} style={{ display: 'block', overflow: 'visible' }}>
                        {[0.25, 0.5, 0.75, 1].map((frac) => (
                          <line key={frac}
                            x1={padding} y1={chartHeight - padding - frac * (chartHeight - padding * 2)}
                            x2={chartWidth - padding} y2={chartHeight - padding - frac * (chartHeight - padding * 2)}
                            stroke={tokens.colors.neutral[100]} strokeWidth="1" strokeDasharray="4,4"
                          />
                        ))}
                        <path d={areaPath} fill={tokens.colors.primaryScale[100]} opacity={0.5} />
                        <path d={linePath} fill="none" stroke={tokens.colors.primaryScale[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="3" fill={tokens.colors.common.white} stroke={tokens.colors.primaryScale[500]} strokeWidth="2" />
                        ))}
                      </svg>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {interviewsPerHour[0]?.time ?? ''}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
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
              const sortedAlerts = [...alerts].sort((a, b) => b.time.getTime() - a.time.getTime());

              return (
                <Box style={cardBase}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <Bell size={18} color={tokens.colors.neutral[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      Alerts
                    </Text>
                    <Box style={{ ...createBadgeStyle(tokens, 'warning') }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{alerts.length}</Text>
                    </Box>
                  </Box>

                  <Box style={{
                    display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2],
                    maxHeight: 320, overflowY: 'auto' as const,
                  }}>
                    {sortedAlerts.map((alert) => {
                      const severityCfg = ALERT_SEVERITY_CONFIG[alert.severity];
                      const scale = tokens.colors[`${severityCfg.colorKey}Scale` as const] as any;
                      const AlertIcon = alert.severity === 'error' ? XCircle
                        : alert.severity === 'warning' ? AlertTriangle
                          : alert.type === 'completion' ? CheckCircle : Bell;

                      return (
                        <Box key={alert.id} style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: tokens.colors.common.white,
                          borderLeft: `4px solid ${scale[500]}`,
                          border: `1px solid ${tokens.colors.neutral[100]}`,
                          borderLeftWidth: 4, borderLeftStyle: 'solid' as const, borderLeftColor: scale[500],
                          display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3],
                        }}>
                          <AlertIcon size={16} color={scale[600]} style={{ flexShrink: 0, marginTop: 2 }} />
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800],
                              lineHeight: tokens.typography.lineHeight.normal,
                            }}>
                              {alert.message}
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                              {formatDistanceToNow(alert.time, { addSuffix: true })}
                            </Text>
                          </Box>
                          <Box style={{ ...createBadgeStyle(tokens, severityCfg.colorKey as any), fontSize: tokens.typography.fontSize.xs, flexShrink: 0 }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{alert.type.replace('_', ' ')}</Text>
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
            <Box style={cardBase}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                <Award size={18} color={tokens.colors.neutral[600]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  Recently Completed
                </Text>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {recentCompletions.slice(0, 10).map((completion) => {
                  const scoreColor = completion.score >= 80
                    ? tokens.colors.successScale[500]
                    : completion.score >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
                  const scoreTextColor = completion.score >= 80
                    ? tokens.colors.successScale[700]
                    : completion.score >= 50 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700];

                  return (
                    <Box key={completion.id} style={{
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.common.white,
                      border: `1px solid ${tokens.colors.neutral[100]}`,
                    }}>
                      <Box style={{
                        width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                        backgroundColor: tokens.colors.successScale[50],
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <CheckCircle size={16} color={tokens.colors.successScale[600]} />
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                          overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        }}>
                          {completion.candidateName}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {completion.jobTitle}
                        </Text>
                      </Box>
                      <Box style={{ width: 72, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 2 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                          color: scoreTextColor, fontVariantNumeric: 'tabular-nums',
                        }}>
                          {completion.score}%
                        </Text>
                        <Box style={{
                          width: '100%', height: 4, backgroundColor: tokens.colors.neutral[100],
                          borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const,
                        }}>
                          <Box style={{
                            width: `${completion.score}%`, height: '100%',
                            borderRadius: tokens.borderRadius.full, backgroundColor: scoreColor,
                          }} />
                        </Box>
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400],
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
