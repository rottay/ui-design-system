'use client';

/**
 * BhManagerConsole - Performance Preset
 * Metrics-heavy analytics view focused on recruiter performance,
 * comparison charts, trend analysis, and goal tracking
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BhManagerConsoleProps, DateRangeOption, RecruiterWorkload, TrendDirection, AlertSeverity } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

type PerformanceTab = 'overview' | 'comparison' | 'trends' | 'goals';
type SortField = 'name' | string;
type SortDir = 'asc' | 'desc';

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

function getAlertSeverityColors(severity: AlertSeverity, tokens: DesignTokens): { bg: string; border: string; text: string; dot: string } {
  switch (severity) {
    case 'critical':
      return { bg: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200], text: tokens.colors.errorScale[800], dot: tokens.colors.errorScale[500] };
    case 'warning':
      return { bg: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200], text: tokens.colors.warningScale[800], dot: tokens.colors.warningScale[500] };
  }
}

function getPerformanceRating(value: number, maxValue: number): { label: string; level: 'high' | 'medium' | 'low' } {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  if (ratio >= 0.7) return { label: 'High Performer', level: 'high' };
  if (ratio >= 0.4) return { label: 'On Track', level: 'medium' };
  return { label: 'Needs Attention', level: 'low' };
}

function getRatingColors(level: 'high' | 'medium' | 'low', tokens: DesignTokens): { bg: string; text: string; border: string } {
  switch (level) {
    case 'high':
      return { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700], border: tokens.colors.successScale[200] };
    case 'medium':
      return { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] };
    case 'low':
      return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] };
  }
}

const DATE_RANGE_OPTIONS: Array<{ value: DateRangeOption; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export const PerformanceBhManagerConsole = createPreset<BhManagerConsoleProps>({
  name: 'BhManagerConsole.Performance',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhManagerConsoleProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
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
      pipeline = [],
      alerts = [],
      onAlertDismiss,
      sprint,
      dateRange: dateRangeProp,
      onDateRangeChange,
      onRecruiterClick,
      onExport,
      title = 'Performance Analytics',
      loading,
      className,
      style,
    } = props;

    const [internalSelectedTeam, setInternalSelectedTeam] = useState<string>(selectedTeamIdProp ?? (teams.length > 0 ? teams[0].id : ''));
    const [internalDateRange, setInternalDateRange] = useState<DateRangeOption>(dateRangeProp ?? '30d');
    const [activeTab, setActiveTab] = useState<PerformanceTab>('overview');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

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

    const handleSort = (field: SortField) => {
      if (sortField === field) {
        setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    };

    const handleAlertDismiss = (alertId: string) => {
      setDismissedAlerts(prev => new Set(prev).add(alertId));
      onAlertDismiss?.(alertId);
    };

    const visibleAlerts = useMemo(
      () => alerts.filter(a => !dismissedAlerts.has(a.id)),
      [alerts, dismissedAlerts]
    );

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const metricTotals = useMemo(() => {
      const totals: Record<string, number> = {};
      metricColumns.forEach(col => { totals[col] = 0; });
      recruiters.forEach(r => {
        metricColumns.forEach(col => {
          totals[col] = (totals[col] || 0) + (r.metrics[col] || 0);
        });
      });
      return totals;
    }, [recruiters, metricColumns]);

    const metricAverages = useMemo(() => {
      const avgs: Record<string, number> = {};
      const count = recruiters.length || 1;
      metricColumns.forEach(col => {
        avgs[col] = Math.round((metricTotals[col] || 0) / count);
      });
      return avgs;
    }, [metricTotals, recruiters.length, metricColumns]);

    const maxMetricValues = useMemo(() => {
      const maxes: Record<string, number> = {};
      metricColumns.forEach(col => {
        maxes[col] = Math.max(...recruiters.map(r => r.metrics[col] || 0), 1);
      });
      return maxes;
    }, [recruiters, metricColumns]);

    const sortedRecruiters = useMemo(() => {
      const arr = [...recruiters];
      arr.sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else {
          cmp = (a.metrics[sortField] || 0) - (b.metrics[sortField] || 0);
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
      return arr;
    }, [recruiters, sortField, sortDir]);

    const selectedRecruiter = recruiters.find(r => r.recruiterId === selectedRecruiterId);

    const glassCardStyle = useMemo(() => isModern ? createCardStyle(tokens, { elevation: 'md', glass: true }) : createCardStyle(tokens, { glass: isGlass, elevation: 'sm' }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const sectionTitleStyle: React.CSSProperties = {
      margin: 0,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[800],
      letterSpacing: '0.01em',
    };

    const perfTabs: Array<{ key: PerformanceTab; label: string }> = [
      { key: 'overview', label: 'Overview' },
      { key: 'comparison', label: 'Comparison' },
      { key: 'trends', label: 'Trends' },
      { key: 'goals', label: 'Goals' },
    ];

    const renderOverviewTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {/* KPI summary row */}
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
                <Box key={idx} style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                      {kpi.label}
                    </span>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: getTrendColor(kpi.trend, tokens) }}>
                      <span>{getTrendArrow(kpi.trend)}</span>
                      <span>{kpi.trendValue}</span>
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>
                      {kpi.value}
                    </span>
                    <svg width="80" height="24" viewBox="0 0 80 24" style={{ flexShrink: 0 }}>
                      <polyline points={sparkPoints} fill="none" stroke={getTrendColor(kpi.trend, tokens)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Team aggregate metrics */}
        <Box style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[3] }}>Team Aggregate Metrics</h3>
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(metricColumns.length, 6)}, 1fr)`, gap: tokens.spacing[3] }}>
            {metricColumns.map(col => (
              <Box key={col} style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                textAlign: 'center',
              }}>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1], textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
                  {col}
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {metricTotals[col]}
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                  Avg: {metricAverages[col]}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Alert summary */}
        {visibleAlerts.length > 0 && (
          <Box style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <h3 style={sectionTitleStyle}>Performance Alerts</h3>
              <span style={{
                ...createBadgeStyle(tokens, 'error'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {visibleAlerts.length} active
              </span>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {visibleAlerts.map(alert => {
                const colors = getAlertSeverityColors(alert.severity, tokens);
                return (
                  <Box key={alert.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: colors.bg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{
                        width: 8,
                        height: 8,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: colors.dot,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: colors.text }}>
                        {alert.recruiterName}
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: colors.text }}>
                        {alert.metric}: {alert.actual} / {alert.threshold}
                      </span>
                    </Box>
                    <button onClick={() => handleAlertDismiss(alert.id)} style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                      backgroundColor: 'transparent',
                      color: colors.text,
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      fontFamily: 'inherit',
                    }}>
                      Dismiss
                    </button>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );

    const renderComparisonTab = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {/* Recruiter comparison table */}
        <Box style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[3] }}>Recruiter Comparison</h3>
          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{
                    textAlign: 'left',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    userSelect: 'none',
                  }}>
                    Recruiter {sortField === 'name' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                  </th>
                  {metricColumns.map(col => (
                    <th key={col} onClick={() => handleSort(col)} style={{
                      textAlign: 'right',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      userSelect: 'none',
                    }}>
                      {col} {sortField === col ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                    </th>
                  ))}
                  <th style={{
                    textAlign: 'center',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecruiters.map(recruiter => {
                  const totalMetric = metricColumns.reduce((sum, col) => sum + (recruiter.metrics[col] || 0), 0);
                  const maxTotal = metricColumns.reduce((sum, col) => sum + (maxMetricValues[col] || 0), 0);
                  const rating = getPerformanceRating(totalMetric, maxTotal);
                  const ratingColors = getRatingColors(rating.level, tokens);
                  const isSelected = selectedRecruiterId === recruiter.recruiterId;

                  return (
                    <tr key={recruiter.recruiterId}
                      onClick={() => {
                        setSelectedRecruiterId(isSelected ? null : recruiter.recruiterId);
                        onRecruiterClick?.(recruiter.recruiterId);
                      }}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
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
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {recruiter.name}
                          </span>
                        </Box>
                      </td>
                      {metricColumns.map(col => {
                        const val = recruiter.metrics[col] || 0;
                        const maxVal = maxMetricValues[col];
                        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                        return (
                          <td key={col} style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            textAlign: 'right',
                          }}>
                            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: tokens.spacing[1] }}>
                              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                                {val}
                              </span>
                              <Box style={{ width: '100%', maxWidth: 60 }}>
                                <svg width="100%" height="4" viewBox="0 0 60 4" preserveAspectRatio="none">
                                  <rect x="0" y="0" width="60" height="4" rx="2" fill={tokens.colors.neutral[100]} />
                                  <rect x="0" y="0" width={(pct / 100) * 60} height="4" rx="2" fill={tokens.colors.primaryScale[400]} />
                                </svg>
                              </Box>
                            </Box>
                          </td>
                        );
                      })}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        textAlign: 'center',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: ratingColors.bg,
                          color: ratingColors.text,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${ratingColors.border}`,
                        }}>
                          {rating.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* Selected recruiter detail */}
        {selectedRecruiter && (
          <Box style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              <Box style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[700],
                overflow: 'hidden',
              }}>
                {selectedRecruiter.avatar ? (
                  <img src={selectedRecruiter.avatar} alt={selectedRecruiter.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }} />
                ) : (
                  selectedRecruiter.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                )}
              </Box>
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                  {selectedRecruiter.name}
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Detailed performance breakdown
                </Box>
              </Box>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(metricColumns.length, 3)}, 1fr)`, gap: tokens.spacing[3] }}>
              {metricColumns.map(col => {
                const val = selectedRecruiter.metrics[col] || 0;
                const avg = metricAverages[col];
                const maxVal = maxMetricValues[col];
                const pctOfMax = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
                const vsAvg = avg > 0 ? Math.round(((val - avg) / avg) * 100) : 0;
                const circumference = 2 * Math.PI * 30;
                const dashOffset = circumference * (1 - pctOfMax / 100);

                return (
                  <Box key={col} style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>
                      {col}
                    </span>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="5" />
                      <circle
                        cx="36" cy="36" r="30"
                        fill="none"
                        stroke={vsAvg >= 0 ? tokens.colors.successScale[500] : tokens.colors.warningScale[500]}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 36 36)"
                        style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                      />
                      <text x="36" y="34" textAnchor="middle" style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, fill: tokens.colors.neutral[900] }}>
                        {val}
                      </text>
                      <text x="36" y="46" textAnchor="middle" style={{ fontSize: '9px', fill: tokens.colors.neutral[400] }}>
                        /{maxVal}
                      </text>
                    </svg>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: vsAvg >= 0 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600],
                    }}>
                      {vsAvg >= 0 ? '+' : ''}{vsAvg}% vs avg
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );

    const renderTrendsTab = () => {
      const chartHeight = 160;
      const chartWidth = 400;
      const dataLen = kpis.length > 0 ? kpis[0].sparklineData.length : 0;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
          {/* Trend charts */}
          {kpis.map((kpi, kpiIdx) => {
            const sparkMax = Math.max(...kpi.sparklineData, 1);
            const points = kpi.sparklineData.map((val, i) => {
              const x = dataLen > 1 ? (i / (dataLen - 1)) * chartWidth : chartWidth / 2;
              const y = chartHeight - (val / sparkMax) * (chartHeight - 20) - 10;
              return { x, y, val };
            });
            const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
            const areaPoints = `0,${chartHeight} ${polylinePoints} ${chartWidth},${chartHeight}`;

            return (
              <Box key={kpiIdx} style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <Box>
                    <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[1] }}>{kpi.label}</h3>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {kpi.value}
                      </span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: getTrendColor(kpi.trend, tokens),
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}>
                        {getTrendArrow(kpi.trend)} {kpi.trendValue}
                      </span>
                    </Box>
                  </Box>
                </Box>
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const y = chartHeight - pct * (chartHeight - 20) - 10;
                    return (
                      <line key={pct} x1="0" y1={y} x2={chartWidth} y2={y} stroke={tokens.colors.neutral[100]} strokeWidth="1" />
                    );
                  })}
                  {/* Area fill */}
                  <polygon points={areaPoints} fill={getTrendColor(kpi.trend, tokens)} opacity="0.08" />
                  {/* Line */}
                  <polyline points={polylinePoints} fill="none" stroke={getTrendColor(kpi.trend, tokens)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data points */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill={tokens.colors.common.white} stroke={getTrendColor(kpi.trend, tokens)} strokeWidth="2" />
                  ))}
                </svg>
              </Box>
            );
          })}
        </Box>
      );
    };

    const renderGoalsTab = () => {
      const slaCompliance = slaItems.length > 0
        ? Math.round((slaItems.filter(s => s.status === 'green').length / slaItems.length) * 100)
        : 0;

      const pipelineTotal = pipeline.reduce((s, p) => s + p.count, 0);

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
          {/* Goal progress cards */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            {/* SLA compliance goal */}
            <Box style={{ ...glassCardStyle, padding: tokens.spacing[4], textAlign: 'center' as const }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                SLA Compliance
              </Box>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin: '0 auto', display: 'block' }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke={slaCompliance >= 80 ? tokens.colors.successScale[500] : slaCompliance >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500]}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - slaCompliance / 100)}`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                />
                <text x="40" y="38" textAnchor="middle" style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, fill: tokens.colors.neutral[900] }}>
                  {slaCompliance}%
                </text>
                <text x="40" y="50" textAnchor="middle" style={{ fontSize: '9px', fill: tokens.colors.neutral[400] }}>
                  target 95%
                </text>
              </svg>
            </Box>

            {/* Pipeline health goal */}
            <Box style={{ ...glassCardStyle, padding: tokens.spacing[4], textAlign: 'center' as const }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                Pipeline Health
              </Box>
              <Box style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[1] }}>
                {pipelineTotal}
              </Box>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[3] }}>
                candidates in pipeline
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                {pipeline.map((stage, idx) => (
                  <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: stage.color || tokens.colors.primaryScale[500], flexShrink: 0 }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], flex: 1, textAlign: 'left' as const }}>{stage.name}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stage.count}</span>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Sprint progress goal */}
            {sprint && (
              <Box style={{ ...glassCardStyle, padding: tokens.spacing[4], textAlign: 'center' as const }}>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                  Sprint Progress
                </Box>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin: '0 auto', display: 'block' }}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke={tokens.colors.primaryScale[500]}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - (sprint.completed / Math.max(sprint.total, 1)))}`}
                    transform="rotate(-90 40 40)"
                    style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                  />
                  <text x="40" y="38" textAnchor="middle" style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, fill: tokens.colors.neutral[900] }}>
                    {sprint.completed}/{sprint.total}
                  </text>
                  <text x="40" y="50" textAnchor="middle" style={{ fontSize: '9px', fill: tokens.colors.neutral[400] }}>
                    tasks done
                  </text>
                </svg>
                <Box style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.infoScale[500] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{sprint.inProgress} active</span>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[500] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{sprint.blocked} blocked</span>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* SLA breakdown */}
          <Box style={{ ...glassCardStyle, padding: tokens.spacing[4] }}>
            <h3 style={{ ...sectionTitleStyle, marginBottom: tokens.spacing[3] }}>SLA Breakdown by Stage</h3>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {slaItems.map((sla, idx) => {
                const pct = Math.min((sla.avgHours / sla.limitHours) * 100, 100);
                const barW = 300;
                const fillW = (pct / 100) * barW;
                const statusColor = sla.status === 'green' ? tokens.colors.successScale[500]
                  : sla.status === 'yellow' ? tokens.colors.warningScale[500]
                    : tokens.colors.errorScale[500];

                return (
                  <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], width: 120, flexShrink: 0 }}>
                      {sla.stage}
                    </span>
                    <Box style={{ flex: 1 }}>
                      <svg width="100%" height="10" viewBox={`0 0 ${barW} 10`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full }}>
                        <rect x="0" y="0" width={barW} height="10" rx="5" fill={tokens.colors.neutral[100]} />
                        <rect x="0" y="0" width={fillW} height="10" rx="5" fill={statusColor} />
                        {/* Limit marker */}
                        <line x1={barW * 0.95} y1="0" x2={barW * 0.95} y2="10" stroke={tokens.colors.neutral[400]} strokeWidth="1" strokeDasharray="2 2" />
                      </svg>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], minWidth: 90 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                        {sla.avgHours}h
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        / {sla.limitHours}h
                      </span>
                    </Box>
                    <Box style={{
                      width: 8,
                      height: 8,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusColor,
                      flexShrink: 0,
                    }} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      );
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
                ...createBadgeStyle(tokens, 'secondary'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {selectedTeam.name}
              </span>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Team selector */}
            <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md }}>
              {teams.map(team => (
                <button key={team.id} onClick={() => handleTeamChange(team.id)} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: 'none',
                  backgroundColor: selectedTeamId === team.id ? tokens.colors.common.white : 'transparent',
                  color: selectedTeamId === team.id ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: selectedTeamId === team.id ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  boxShadow: selectedTeamId === team.id ? tokens.shadows.sm : 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  {team.name}
                </button>
              ))}
            </Box>
            {/* Date range */}
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

        {/* Performance tabs */}
        <Box style={{
          display: 'flex',
          gap: tokens.spacing[1],
          padding: `0 ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          {perfTabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                border: 'none',
                backgroundColor: 'transparent',
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderBottom: isActive ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                transition: `all ${tokens.motion.hover}`,
                marginBottom: -1,
              }}>
                {tab.label}
              </button>
            );
          })}
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>
          <Box style={{ maxWidth: 1400 }}>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'comparison' && renderComparisonTab()}
            {activeTab === 'trends' && renderTrendsTab()}
            {activeTab === 'goals' && renderGoalsTab()}
          </Box>
        </Box>
      </Box>
    );
  },
});
