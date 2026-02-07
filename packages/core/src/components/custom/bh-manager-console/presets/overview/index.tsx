'use client';

/**
 * BhManagerConsole - Overview Preset
 * Team manager dashboard with KPIs, workload heatmap, SLA tracker,
 * task reassignment, pipeline funnel, alerts, and sprint board
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { BhManagerConsoleProps, DateRangeOption, MetricViewMode, TaskPriority, SlaStatus, AlertSeverity, TrendDirection } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

function getTrendColor(trend: TrendDirection, tokens: DesignTokens): string {
  if (trend === 'up') return tokens.colors.successScale[600];
  if (trend === 'down') return tokens.colors.errorScale[600];
  return tokens.colors.neutral[500];
}

function getTrendArrow(trend: TrendDirection): string {
  if (trend === 'up') return '\u2191';
  if (trend === 'down') return '\u2193';
  return '\u2192';
}

function getPriorityColors(priority: TaskPriority, tokens: DesignTokens): { bg: string; text: string; border: string } {
  switch (priority) {
    case 'urgent':
      return { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[800], border: tokens.colors.errorScale[200] };
    case 'high':
      return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[800], border: tokens.colors.warningScale[200] };
    case 'medium':
      return { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[800], border: tokens.colors.infoScale[200] };
    case 'low':
    default:
      return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[700], border: tokens.colors.neutral[200] };
  }
}

function getSlaColors(status: SlaStatus, tokens: DesignTokens): { fill: string; bg: string; text: string } {
  switch (status) {
    case 'green':
      return { fill: tokens.colors.successScale[500], bg: tokens.colors.successScale[50], text: tokens.colors.successScale[700] };
    case 'yellow':
      return { fill: tokens.colors.warningScale[500], bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[700] };
    case 'red':
      return { fill: tokens.colors.errorScale[500], bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[700] };
  }
}

function getAlertColors(severity: AlertSeverity, tokens: DesignTokens): { bg: string; border: string; text: string; icon: string } {
  switch (severity) {
    case 'critical':
      return { bg: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200], text: tokens.colors.errorScale[800], icon: tokens.colors.errorScale[500] };
    case 'warning':
      return { bg: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200], text: tokens.colors.warningScale[800], icon: tokens.colors.warningScale[500] };
  }
}

function getHeatmapColor(value: number, max: number, tokens: DesignTokens): string {
  if (max === 0) return tokens.colors.neutral[50];
  const ratio = value / max;
  if (ratio >= 0.8) return tokens.colors.primaryScale[600];
  if (ratio >= 0.6) return tokens.colors.primaryScale[400];
  if (ratio >= 0.4) return tokens.colors.primaryScale[300];
  if (ratio >= 0.2) return tokens.colors.primaryScale[200];
  return tokens.colors.primaryScale[50];
}

function getHeatmapTextColor(value: number, max: number, tokens: DesignTokens): string {
  if (max === 0) return tokens.colors.neutral[400];
  const ratio = value / max;
  if (ratio >= 0.6) return tokens.colors.common.white;
  return tokens.colors.primaryScale[900];
}

const DATE_RANGE_OPTIONS: Array<{ value: DateRangeOption; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export const OverviewBhManagerConsole = createPreset<BhManagerConsoleProps>({
  name: 'BhManagerConsole.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhManagerConsoleProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const {
      teams,
      selectedTeamId: selectedTeamIdProp,
      onTeamChange,
      kpis = [],
      recruiters = [],
      metricColumns = ['Open Reqs', 'Screens', 'Interviews', 'Offers', 'Hires', 'Time to Fill'],
      slaItems = [],
      tasks = [],
      onTaskReassign,
      pipeline = [],
      alerts = [],
      onAlertDismiss,
      sprint,
      dateRange: dateRangeProp,
      onDateRangeChange,
      onRecruiterClick,
      onExport,
      title = 'Team Manager Console',
      loading,
      className,
      style,
    } = props;

    const [internalSelectedTeam, setInternalSelectedTeam] = useState<string>(selectedTeamIdProp ?? (teams.length > 0 ? teams[0].id : ''));
    const [internalDateRange, setInternalDateRange] = useState<DateRangeOption>(dateRangeProp ?? '30d');
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
    const [dragState, setDragState] = useState<{ taskId: string; fromRecruiter: string } | null>(null);
    const [expandedRecruiter, setExpandedRecruiter] = useState<string | null>(null);
    const [metricView, setMetricView] = useState<MetricViewMode>('heatmap');

    const selectedTeamId = selectedTeamIdProp ?? internalSelectedTeam;
    const currentDateRange = dateRangeProp ?? internalDateRange;

    const handleTeamChange = (teamId: string) => {
      setInternalSelectedTeam(teamId);
      onTeamChange?.(teamId);
    };

    const handleDateRange = (range: DateRangeOption) => {
      setInternalDateRange(range);
      onDateRangeChange?.(range);
    };

    const handleAlertDismiss = (alertId: string) => {
      setDismissedAlerts(prev => new Set(prev).add(alertId));
      onAlertDismiss?.(alertId);
    };

    const visibleAlerts = useMemo(
      () => alerts.filter(a => !dismissedAlerts.has(a.id)),
      [alerts, dismissedAlerts]
    );

    const maxMetricValue = useMemo(() => {
      let max = 0;
      recruiters.forEach(r => {
        Object.values(r.metrics).forEach(v => {
          if (v > max) max = v;
        });
      });
      return max;
    }, [recruiters]);

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const tasksByRecruiter = useMemo(() => {
      const map: Record<string, typeof tasks> = {};
      const recruiterNames = recruiters.map(r => r.name);
      recruiterNames.forEach(name => { map[name] = []; });
      tasks.forEach(task => {
        if (!map[task.assignee]) map[task.assignee] = [];
        map[task.assignee].push(task);
      });
      return map;
    }, [tasks, recruiters]);

    const totalPipelineCount = useMemo(() => pipeline.reduce((sum, s) => sum + s.count, 0), [pipeline]);
    const maxPipelineCount = useMemo(() => Math.max(...pipeline.map(s => s.count), 1), [pipeline]);

    const sprintProgress = sprint && sprint.total > 0 ? (sprint.completed / sprint.total) * 100 : 0;

    const glassCardStyle = isModern ? createCardStyle(tokens, { elevation: 'md', glass: true }) : createCardStyle(tokens, { elevation: 'sm' });
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

    const sectionTitleStyle: React.CSSProperties = {
      margin: 0,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[800],
      letterSpacing: '0.01em',
    };

    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: isModern ? 'transparent' : tokens.colors.neutral[50],
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          ...(isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <h1 style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {title}
            </h1>
            {selectedTeam && (
              <span style={{
                ...createBadgeStyle(tokens, 'primary'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {selectedTeam.memberCount} members &middot; Lead: {selectedTeam.lead}
              </span>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Date range selector */}
            <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md }}>
              {DATE_RANGE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleDateRange(opt.value)} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: 'none',
                  backgroundColor: currentDateRange === opt.value ? tokens.colors.common.white : 'transparent',
                  color: currentDateRange === opt.value ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: currentDateRange === opt.value ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  boxShadow: currentDateRange === opt.value ? tokens.shadows.sm : 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  {opt.label}
                </button>
              ))}
            </Box>
            {onExport && (
              <button onClick={onExport} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Export
              </button>
            )}
          </Box>
        </Box>

        {/* Team selector tabs */}
        <Box style={{
          display: 'flex',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          overflowX: 'auto',
        }}>
          {teams.map(team => {
            const isActive = team.id === selectedTeamId;
            return (
              <button key={team.id} onClick={() => handleTeamChange(team.id)} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
                whiteSpace: 'nowrap',
                ...(isActive ? { boxShadow: `inset 0 -2px 0 ${tokens.colors.primaryScale[500]}` } : {}),
              }}>
                {team.name}
                <span style={{
                  marginLeft: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: isActive ? tokens.colors.primaryScale[400] : tokens.colors.neutral[400],
                }}>
                  ({team.memberCount})
                </span>
              </button>
            );
          })}
        </Box>

        {/* Scrollable content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], maxWidth: 1400 }}>

            {/* Performance alerts */}
            {visibleAlerts.length > 0 && (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {visibleAlerts.map(alert => {
                  const alertColors = getAlertColors(alert.severity, tokens);
                  return (
                    <Box key={alert.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: alertColors.bg,
                      border: `1px solid ${alertColors.border}`,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.lg, color: alertColors.icon }}>
                          {alert.severity === 'critical' ? '\u26A0' : '\u25CB'}
                        </span>
                        <Box>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: alertColors.text }}>
                            {alert.recruiterName}
                          </span>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, color: alertColors.text, marginLeft: tokens.spacing[1] }}>
                            &mdash; {alert.metric}: {alert.actual} (threshold: {alert.threshold})
                          </span>
                        </Box>
                      </Box>
                      <button onClick={() => handleAlertDismiss(alert.id)} style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${alertColors.border}`,
                        backgroundColor: 'transparent',
                        color: alertColors.text,
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Dismiss
                      </button>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Team KPI row */}
            {kpis.length > 0 && (
              <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`, gap: tokens.spacing[3] }}>
                {kpis.map((kpi, idx) => {
                  const sparkMax = Math.max(...kpi.sparklineData, 1);
                  const sparkPoints = kpi.sparklineData.map((val, i) => {
                    const x = (i / Math.max(kpi.sparklineData.length - 1, 1)) * 80;
                    const y = 24 - (val / sparkMax) * 20;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <Box key={idx} style={{
                      ...glassCardStyle,
                      padding: tokens.spacing[4],
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[2],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[500],
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}>
                          {kpi.label}
                        </span>
                        <Box style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: getTrendColor(kpi.trend, tokens),
                        }}>
                          <span>{getTrendArrow(kpi.trend)}</span>
                          <span>{kpi.trendValue}</span>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                          lineHeight: tokens.typography.lineHeight.tight,
                        }}>
                          {kpi.value}
                        </span>
                        <svg width="80" height="24" viewBox="0 0 80 24" style={{ flexShrink: 0 }}>
                          <polyline
                            points={sparkPoints}
                            fill="none"
                            stroke={getTrendColor(kpi.trend, tokens)}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Two-column layout: Workload heatmap + SLA tracker */}
            <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[4] }}>
              {/* Recruiter workload heatmap */}
              <Box style={{
                ...glassCardStyle,
                padding: tokens.spacing[4],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <h3 style={sectionTitleStyle}>Recruiter Workload</h3>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm }}>
                    <button onClick={() => setMetricView('heatmap')} style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: 'none',
                      backgroundColor: metricView === 'heatmap' ? tokens.colors.common.white : 'transparent',
                      color: metricView === 'heatmap' ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: metricView === 'heatmap' ? tokens.shadows.sm : 'none',
                    }}>
                      Heatmap
                    </button>
                    <button onClick={() => setMetricView('list')} style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: 'none',
                      backgroundColor: metricView === 'list' ? tokens.colors.common.white : 'transparent',
                      color: metricView === 'list' ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: metricView === 'list' ? tokens.shadows.sm : 'none',
                    }}>
                      List
                    </button>
                  </Box>
                </Box>

                {metricView === 'heatmap' ? (
                  <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <thead>
                        <tr>
                          <th style={{
                            textAlign: 'left',
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[500],
                            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                            width: 140,
                          }}>
                            Recruiter
                          </th>
                          {metricColumns.map(col => (
                            <th key={col} style={{
                              textAlign: 'center',
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[1]}px`,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[500],
                              borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                            }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recruiters.map(recruiter => {
                          const isExpanded = expandedRecruiter === recruiter.recruiterId;
                          return (
                            <tr key={recruiter.recruiterId} style={{ cursor: 'pointer' }} onClick={() => {
                              setExpandedRecruiter(isExpanded ? null : recruiter.recruiterId);
                              onRecruiterClick?.(recruiter.recruiterId);
                            }}>
                              <td style={{
                                padding: `${tokens.spacing[2]}px`,
                                borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[2],
                              }}>
                                <Box style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: tokens.colors.primaryScale[100],
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.primaryScale[700],
                                  flexShrink: 0,
                                  overflow: 'hidden',
                                }}>
                                  {recruiter.avatar ? (
                                    <img src={recruiter.avatar} alt={recruiter.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }} />
                                  ) : (
                                    recruiter.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                                  )}
                                </Box>
                                <span style={{
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontWeight: tokens.typography.fontWeight.medium,
                                  color: tokens.colors.neutral[800],
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {recruiter.name}
                                </span>
                              </td>
                              {metricColumns.map(col => {
                                const val = recruiter.metrics[col] ?? 0;
                                return (
                                  <td key={col} style={{
                                    padding: tokens.spacing[1],
                                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                                    textAlign: 'center',
                                  }}>
                                    <Box style={{
                                      backgroundColor: getHeatmapColor(val, maxMetricValue, tokens),
                                      color: getHeatmapTextColor(val, maxMetricValue, tokens),
                                      borderRadius: tokens.borderRadius.sm,
                                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                      fontSize: tokens.typography.fontSize.xs,
                                      fontWeight: tokens.typography.fontWeight.semibold,
                                      transition: `all ${tokens.motion.hover}`,
                                      minWidth: 36,
                                      display: 'inline-block',
                                    }}>
                                      {val}
                                    </Box>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {recruiters.map(recruiter => (
                      <Box key={recruiter.recruiterId} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.neutral[100]}`,
                        cursor: 'pointer',
                        ...hoverStyle,
                      }} onClick={() => onRecruiterClick?.(recruiter.recruiterId)}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Box style={{
                            width: 32,
                            height: 32,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.primaryScale[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.primaryScale[700],
                            overflow: 'hidden',
                          }}>
                            {recruiter.avatar ? (
                              <img src={recruiter.avatar} alt={recruiter.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }} />
                            ) : (
                              recruiter.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                            )}
                          </Box>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {recruiter.name}
                          </span>
                        </Box>
                        <Box style={{ display: 'flex', gap: tokens.spacing[3] }}>
                          {metricColumns.slice(0, 4).map(col => (
                            <Box key={col} style={{ textAlign: 'center' }}>
                              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[1] }}>{col}</Box>
                              <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                                {recruiter.metrics[col] ?? 0}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* SLA compliance tracker */}
              <Box style={{
                ...glassCardStyle,
                padding: tokens.spacing[4],
              }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[3] }}>SLA Compliance</h3>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {slaItems.map((sla, idx) => {
                    const colors = getSlaColors(sla.status, tokens);
                    const pct = Math.min((sla.avgHours / sla.limitHours) * 100, 100);
                    const barWidth = 160;
                    const filledWidth = (pct / 100) * barWidth;

                    return (
                      <Box key={idx} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                            {sla.stage}
                          </span>
                          <span style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: colors.text,
                            ...createBadgeStyle(tokens, sla.status === 'green' ? 'success' : sla.status === 'yellow' ? 'warning' : 'error'),
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          }}>
                            {sla.avgHours}h / {sla.limitHours}h
                          </span>
                        </Box>
                        <svg width="100%" height="8" viewBox={`0 0 ${barWidth} 8`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                          <rect x="0" y="0" width={barWidth} height="8" rx="4" fill={tokens.colors.neutral[100]} />
                          <rect x="0" y="0" width={filledWidth} height="8" rx="4" fill={colors.fill} />
                        </svg>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Two-column: Task reassignment + Pipeline funnel */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
              {/* Task reassignment panel */}
              <Box style={{
                ...glassCardStyle,
                padding: tokens.spacing[4],
              }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[3] }}>Task Reassignment</h3>
                <Box style={{ display: 'flex', gap: tokens.spacing[3], overflowX: 'auto' }}>
                  {Object.entries(tasksByRecruiter).map(([recruiterName, recruiterTasks]) => (
                    <Box key={recruiterName} style={{
                      minWidth: 200,
                      flex: '1 0 200px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[2],
                    }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[600],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        backgroundColor: tokens.colors.neutral[50],
                        borderRadius: tokens.borderRadius.sm,
                        textAlign: 'center',
                      }}>
                        {recruiterName} ({recruiterTasks.length})
                      </Box>
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: tokens.spacing[2],
                          minHeight: 80,
                          padding: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.md,
                          border: `1px dashed ${dragState ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                          backgroundColor: dragState ? tokens.colors.primaryScale[50] : 'transparent',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                        onDragOver={(e: React.DragEvent) => { e.preventDefault(); }}
                        onDrop={(e: React.DragEvent) => {
                          e.preventDefault();
                          if (dragState && dragState.fromRecruiter !== recruiterName) {
                            onTaskReassign?.(dragState.taskId, dragState.fromRecruiter, recruiterName);
                          }
                          setDragState(null);
                        }}
                      >
                        {recruiterTasks.map(task => {
                          const prioColors = getPriorityColors(task.priority, tokens);
                          return (
                            <Box
                              key={task.id}
                              draggable
                              onDragStart={() => setDragState({ taskId: task.id, fromRecruiter: recruiterName })}
                              onDragEnd={() => setDragState(null)}
                              style={{
                                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                                borderRadius: tokens.borderRadius.md,
                                backgroundColor: tokens.colors.common.white,
                                border: `1px solid ${tokens.colors.neutral[200]}`,
                                boxShadow: tokens.shadows.sm,
                                cursor: 'grab',
                                transition: `all ${tokens.motion.hover}`,
                              }}
                            >
                              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                                <span style={{
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontWeight: tokens.typography.fontWeight.medium,
                                  color: tokens.colors.neutral[800],
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 120,
                                }}>
                                  {task.title}
                                </span>
                                <span style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  backgroundColor: prioColors.bg,
                                  color: prioColors.text,
                                  border: `1px solid ${prioColors.border}`,
                                  borderRadius: tokens.borderRadius.full,
                                  padding: `0 ${tokens.spacing[2]}px`,
                                  lineHeight: '1.6',
                                }}>
                                  {task.priority}
                                </span>
                              </Box>
                              <span style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                              }}>
                                Due: {task.dueDate}
                              </span>
                            </Box>
                          );
                        })}
                        {recruiterTasks.length === 0 && (
                          <Box style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 60,
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                          }}>
                            Drop tasks here
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Pipeline aggregated funnel */}
              <Box style={{
                ...glassCardStyle,
                padding: tokens.spacing[4],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <h3 style={sectionTitleStyle}>Pipeline Overview</h3>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    {totalPipelineCount} total candidates
                  </span>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {pipeline.map((stage, idx) => {
                    const barWidth = 240;
                    const stageWidth = (stage.count / maxPipelineCount) * barWidth;

                    return (
                      <Box key={idx} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                            {stage.name}
                          </span>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {stage.count}
                            </span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              {stage.percentage}%
                            </span>
                          </Box>
                        </Box>
                        <svg width="100%" height="12" viewBox={`0 0 ${barWidth} 12`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full }}>
                          <rect x="0" y="0" width={barWidth} height="12" rx="6" fill={tokens.colors.neutral[100]} />
                          <rect x="0" y="0" width={stageWidth} height="12" rx="6" fill={stage.color || tokens.colors.primaryScale[500]} />
                        </svg>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Team sprint mini-board */}
            {sprint && (
              <Box style={{
                ...glassCardStyle,
                padding: tokens.spacing[4],
              }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[3] }}>Current Sprint</h3>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[5] }}>
                  {/* Progress ring SVG */}
                  <Box style={{ flexShrink: 0 }}>
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="8" />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke={tokens.colors.primaryScale[500]}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - sprintProgress / 100)}`}
                        transform="rotate(-90 48 48)"
                        style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                      />
                      <text x="48" y="44" textAnchor="middle" style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, fill: tokens.colors.neutral[900] }}>
                        {Math.round(sprintProgress)}%
                      </text>
                      <text x="48" y="58" textAnchor="middle" style={{ fontSize: tokens.typography.fontSize.xs, fill: tokens.colors.neutral[400] }}>
                        complete
                      </text>
                    </svg>
                  </Box>

                  {/* Sprint summary stats */}
                  <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3], flex: 1 }}>
                    <Box style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      textAlign: 'center',
                    }}>
                      <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {sprint.total}
                      </Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                        Total Tasks
                      </Box>
                    </Box>
                    <Box style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.successScale[50],
                      textAlign: 'center',
                    }}>
                      <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>
                        {sprint.completed}
                      </Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600], marginTop: tokens.spacing[1] }}>
                        Completed
                      </Box>
                    </Box>
                    <Box style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.infoScale[50],
                      textAlign: 'center',
                    }}>
                      <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[700] }}>
                        {sprint.inProgress}
                      </Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[600], marginTop: tokens.spacing[1] }}>
                        In Progress
                      </Box>
                    </Box>
                    <Box style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.errorScale[50],
                      textAlign: 'center',
                    }}>
                      <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[700] }}>
                        {sprint.blocked}
                      </Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600], marginTop: tokens.spacing[1] }}>
                        Blocked
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

          </Box>
        </Box>
      </Box>
    );
  },
});
