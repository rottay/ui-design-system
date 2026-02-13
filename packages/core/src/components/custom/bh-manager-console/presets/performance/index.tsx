'use client';

/**
 * BhManagerConsole - Performance Preset
 * Metrics-heavy analytics view focused on recruiter performance,
 * hiring velocity, goal tracking, and comparative benchmarks.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  ChevronDown,
  Star,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  createBadgeStyle,
  getPersonalityTypography,
  createEntranceAnimation,
} from '../../../helpers';
import type {
  BhManagerConsoleProps,
  Team,
  TeamKpi,
  RecruiterWorkload,
  SlaItem,
  PipelineStage,
  PerformanceAlert,
  SprintSummary,
  DateRangeOption,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Engineering Hiring', memberCount: 6, lead: 'Sofia Martinez' },
  { id: 't2', name: 'Product & Design', memberCount: 4, lead: 'James Chen' },
];

const MOCK_KPIS: TeamKpi[] = [
  { label: 'Hires This Quarter', value: 18, trend: 'up', trendValue: '+6', sparklineData: [8, 10, 12, 14, 16, 18] },
  { label: 'Avg Time to Fill', value: '26d', trend: 'down', trendValue: '-5d', sparklineData: [34, 31, 30, 28, 27, 26] },
  { label: 'Quality of Hire', value: '84%', trend: 'up', trendValue: '+3%', sparklineData: [78, 79, 80, 82, 83, 84] },
  { label: 'Recruiter Efficiency', value: '92%', trend: 'up', trendValue: '+2%', sparklineData: [86, 88, 89, 90, 91, 92] },
];

const MOCK_RECRUITERS: RecruiterWorkload[] = [
  { recruiterId: 'r1', name: 'Sofia Martinez', avatar: undefined, metrics: { Hires: 6, Screens: 28, 'Pass Rate': 72, 'Avg Days': 24, 'Quality': 88, 'Satisfaction': 4.6 } },
  { recruiterId: 'r2', name: 'James Chen', avatar: undefined, metrics: { Hires: 5, Screens: 22, 'Pass Rate': 68, 'Avg Days': 26, 'Quality': 84, 'Satisfaction': 4.4 } },
  { recruiterId: 'r3', name: 'Priya Sharma', avatar: undefined, metrics: { Hires: 4, Screens: 32, 'Pass Rate': 58, 'Avg Days': 32, 'Quality': 76, 'Satisfaction': 4.2 } },
  { recruiterId: 'r4', name: 'Marcus Williams', avatar: undefined, metrics: { Hires: 3, Screens: 18, 'Pass Rate': 82, 'Avg Days': 22, 'Quality': 90, 'Satisfaction': 4.8 } },
];

/* MOCK_PIPELINE is created inside render to use token colors */

const MOCK_ALERTS: PerformanceAlert[] = [
  { id: 'a1', recruiterName: 'Priya Sharma', metric: 'Time to Fill', threshold: 28, actual: 32, severity: 'warning' },
  { id: 'a2', recruiterName: 'Sofia Martinez', metric: 'Screen Completion', threshold: 85, actual: 72, severity: 'critical' },
];

const PERF_COLUMNS = ['Hires', 'Screens', 'Pass Rate', 'Avg Days', 'Quality', 'Satisfaction'];

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const PerformanceBhManagerConsole = createPreset<BhManagerConsoleProps>({
  name: 'BhManagerConsole.Performance',
  render: ({ primitives, props, tokens }: PresetContext<BhManagerConsoleProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teams: teamsProp,
      kpis: kpisProp,
      recruiters: recProp,
      pipeline: pipeProp,
      alerts: alertsProp,
      dateRange: drProp,
      onDateRangeChange,
      selectedTeamId: selTeamProp,
      onTeamChange,
      onRecruiterClick,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : MOCK_TEAMS;
    const kpis = kpisProp?.length ? kpisProp : MOCK_KPIS;
    const recruiters = recProp?.length ? recProp : MOCK_RECRUITERS;
    const pipeline = pipeProp?.length ? pipeProp : useMemo(() => ([
      { name: 'Applied', count: 342, percentage: 100, color: t.colors.primaryScale[500] },
      { name: 'Screened', count: 186, percentage: 54, color: t.colors.infoScale[500] },
      { name: 'Interviewed', count: 92, percentage: 27, color: t.colors.successScale[500] },
      { name: 'Offered', count: 28, percentage: 8, color: t.colors.warningScale[500] },
      { name: 'Hired', count: 18, percentage: 5, color: t.colors.errorScale[500] },
    ]), [t]);
    const alerts = alertsProp?.length ? alertsProp : MOCK_ALERTS;

    const [selectedTeam, setSelectedTeam] = useState(selTeamProp ?? teams[0]?.id);
    const [dateRange, setDateRange] = useState<DateRangeOption>(drProp ?? '30d');
    const [sortCol, setSortCol] = useState('Hires');
    const [sortAsc, setSortAsc] = useState(false);

    const sorted = useMemo(() => {
      return [...recruiters].sort((a, b) => {
        const va = a.metrics[sortCol] ?? 0;
        const vb = b.metrics[sortCol] ?? 0;
        return sortAsc ? va - vb : vb - va;
      });
    }, [recruiters, sortCol, sortAsc]);

    const handleSort = useCallback((col: string) => {
      if (sortCol === col) setSortAsc(!sortAsc);
      else { setSortCol(col); setSortAsc(false); }
    }, [sortCol, sortAsc]);

    const handleDateRangeChange = useCallback((opt: DateRangeOption) => {
      setDateRange(opt);
      onDateRangeChange?.(opt);
    }, [onDateRangeChange]);

    const handleRecruiterClick = useCallback((recruiterId: string) => {
      onRecruiterClick?.(recruiterId);
    }, [onRecruiterClick]);

    /* ---- Styles ---- */
    const card = useMemo(() => createCardStyle(t, { padding: 28 }), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const isGlass = t.surface.useGlass && !!t.glass;

    const rankColors = useMemo(() => [
      t.colors.warningScale[500],
      t.colors.neutral[400],
      t.colors.warningScale[300],
    ], [t]);

    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], padding: t.spacing[7], backgroundColor: t.colors.neutral[50], minHeight: '100%', ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}), ...style }}>

        {/* === Header === */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] })}>
              <Activity size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: personalityTypo.headingWeight, color: t.colors.neutral[900], letterSpacing: personalityTypo.headingLetterSpacing }}>
                Performance Analytics
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                {recruiters.length} recruiters -- {teams.find(tm => tm.id === selectedTeam)?.name ?? 'All'}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[1] }} role="tablist" aria-label="Date range">
            {(['7d', '14d', '30d', '90d'] as DateRangeOption[]).map(opt => (
              <Box
                key={opt}
                role="tab"
                aria-selected={dateRange === opt}
                tabIndex={0}
                onClick={() => handleDateRangeChange(opt)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleDateRangeChange(opt); }}
                style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  cursor: 'pointer',
                  backgroundColor: dateRange === opt ? t.colors.primaryScale[600] : t.colors.neutral[100],
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: dateRange === opt ? t.colors.common.white : t.colors.neutral[600] }}>
                  {opt}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* === KPI Cards === */}
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: t.spacing[4] }}>
          {kpis.map((kpi, i) => (
            <Box key={i} style={{ ...card, ...hoverStyles.base, ...createEntranceAnimation(t, { index: i }).animate }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>{kpi.label}</Text>
              <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[2] }}>
                <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {kpi.value}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  {kpi.trend === 'up' ? <TrendingUp size={14} color={t.colors.successScale[600]} /> : kpi.trend === 'down' ? <TrendingDown size={14} color={t.colors.errorScale[600]} /> : <Minus size={14} color={t.colors.neutral[500]} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: kpi.trend === 'up' ? t.colors.successScale[600] : kpi.trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
                    {kpi.trendValue}
                  </Text>
                </Box>
              </Box>
              {kpi.sparklineData.length > 1 && (
                <Box style={{ marginTop: t.spacing[2] }}>
                  <svg width={100} height={24} viewBox="0 0 100 24">
                    {(() => {
                      const max = Math.max(...kpi.sparklineData);
                      const min = Math.min(...kpi.sparklineData);
                      const range = max - min || 1;
                      const pts = kpi.sparklineData.map((v, idx) => `${(idx / (kpi.sparklineData.length - 1)) * 100},${22 - ((v - min) / range) * 20}`).join(' ');
                      return <polyline points={pts} fill="none" stroke={t.colors.primaryScale[400]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />;
                    })()}
                  </svg>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* === Recruiter Leaderboard === */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden' }} role="table" aria-label="Recruiter leaderboard">
          <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Award size={16} color={t.colors.primaryScale[600]} />
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Recruiter Leaderboard
              </Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              Click column headers to sort
            </Text>
          </Box>

          {/* Header */}
          <Box role="row" style={{ display: 'grid', gridTemplateColumns: `48px 180px repeat(${PERF_COLUMNS.length}, 1fr)`, gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50], alignItems: 'center' }}>
            <Box role="columnheader" style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textAlign: 'center' as const }}>#</Box>
            <Box role="columnheader" style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: personalityTypo.labelTransform, letterSpacing: personalityTypo.labelLetterSpacing }}>Recruiter</Box>
            {PERF_COLUMNS.map(col => (
              <Box
                key={col}
                role="columnheader"
                tabIndex={0}
                aria-sort={sortCol === col ? (sortAsc ? 'ascending' : 'descending') : undefined}
                onClick={() => handleSort(col)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleSort(col); }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, userSelect: 'none' as const }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: sortCol === col ? t.colors.primaryScale[600] : t.colors.neutral[500], textTransform: personalityTypo.labelTransform, letterSpacing: personalityTypo.labelLetterSpacing }}>
                  {col}
                </Text>
                {sortCol === col && <ArrowUpDown size={10} color={t.colors.primaryScale[600]} />}
              </Box>
            ))}
          </Box>

          {/* Rows */}
          {sorted.map((rec, idx) => {
            const rank = idx + 1;
            return (
              <Box
                key={rec.recruiterId}
                role="row"
                tabIndex={onRecruiterClick ? 0 : undefined}
                aria-label={`Rank ${rank}: ${rec.name}`}
                onClick={() => handleRecruiterClick(rec.recruiterId)}
                onKeyDown={onRecruiterClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleRecruiterClick(rec.recruiterId); } : undefined}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `48px 180px repeat(${PERF_COLUMNS.length}, 1fr)`,
                  gap: t.spacing[2],
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[100]}`,
                  cursor: onRecruiterClick ? 'pointer' : 'default',
                  transition: `background-color ${t.motion.hover}`,
                  alignItems: 'center',
                  backgroundColor: rank <= 3 ? t.colors.warningScale[50] : 'transparent',
                }}
              >
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  {rank <= 3 ? (
                    <Box style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, backgroundColor: t.colors.warningScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: rankColors[rank - 1] }}>{rank}</Text>
                    </Box>
                  ) : (
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>{rank}</Text>
                  )}
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>
                      {rec.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                    {rec.name}
                  </Text>
                </Box>
                {PERF_COLUMNS.map(col => {
                  const val = rec.metrics[col] ?? 0;
                  const isHighlight = col === sortCol;
                  return (
                    <Text key={col} style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: isHighlight ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                      color: isHighlight ? t.colors.primaryScale[700] : t.colors.neutral[700],
                      textAlign: 'center' as const,
                    }}>
                      {col === 'Pass Rate' || col === 'Quality' ? `${val}%` : col === 'Satisfaction' ? val.toFixed(1) : col === 'Avg Days' ? `${val}d` : val}
                    </Text>
                  );
                })}
              </Box>
            );
          })}
        </Box>

        {/* === Pipeline + Alerts === */}
        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.spacing[5] }}>
          {/* Velocity chart */}
          <Box style={{ ...card }} aria-label="Hiring velocity chart">
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Hiring Velocity</Text>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width={480} height={180} viewBox="0 0 480 180">
                {pipeline.map((stage, idx) => {
                  const barW = 60;
                  const x = 40 + idx * 90;
                  const maxCount = Math.max(...pipeline.map(p => p.count), 1);
                  const barH = (stage.count / maxCount) * 130;
                  const y = 150 - barH;
                  return (
                    <g key={stage.name}>
                      <rect x={x} y={y} width={barW} height={barH} rx={4} fill={stage.color} opacity={0.8} />
                      <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={t.colors.neutral[700]}>
                        {stage.count}
                      </text>
                      <text x={x + barW / 2} y={168} textAnchor="middle" fontSize={10} fill={t.colors.neutral[400]}>
                        {stage.name}
                      </text>
                      {idx < pipeline.length - 1 && (
                        <text x={x + barW + 15} y={90} textAnchor="middle" fontSize={9} fill={t.colors.neutral[400]}>
                          {Math.round((pipeline[idx + 1].count / stage.count) * 100)}%
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </Box>
          </Box>

          {/* Performance alerts */}
          <Box style={{ ...card }} role="alert" aria-label="Threshold alerts">
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Target size={16} color={t.colors.warningScale[600]} />
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Threshold Alerts
              </Text>
            </Box>
            {alerts.length === 0 && (
              <Box style={{ padding: t.spacing[4], textAlign: 'center' as const }}>
                <CheckCircle2 size={24} color={t.colors.successScale[400]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], marginTop: t.spacing[2] }}>
                  All metrics within thresholds
                </Text>
              </Box>
            )}
            {alerts.map(alert => {
              const isCritical = alert.severity === 'critical';
              return (
                <Box key={alert.id} style={{
                  padding: t.spacing[3],
                  marginBottom: t.spacing[2],
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${isCritical ? t.colors.errorScale[200] : t.colors.warningScale[200]}`,
                  backgroundColor: isCritical ? t.colors.errorScale[50] : t.colors.warningScale[50],
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                      {alert.recruiterName}
                    </Text>
                    <Box style={createBadgeStyle(t, isCritical ? 'error' : 'warning')}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{alert.severity}</Text>
                    </Box>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {alert.metric}: {alert.actual} (threshold: {alert.threshold})
                  </Text>
                  {/* Delta bar */}
                  <Box style={{ marginTop: t.spacing[2], height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden', position: 'relative' as const }}>
                    <Box style={{ height: '100%', width: `${Math.min((alert.actual / alert.threshold) * 100, 100)}%`, borderRadius: t.borderRadius.full, backgroundColor: isCritical ? t.colors.errorScale[500] : t.colors.warningScale[500], opacity: 0.7 }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
