'use client';

/**
 * BhManagerConsole - Overview Preset
 * Team manager dashboard with KPI ribbon, workload heatmap, SLA tracker,
 * task queue, pipeline funnel, and performance alerts.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Zap,
  Target,
  Flag,
  Bell,
  Download,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createProgressBarStyle,
  createPersonalityAccentBar,

  createDividerStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhManagerConsoleProps,
  Team,
  TeamKpi,
  RecruiterWorkload,
  SlaItem,
  TaskCard,
  PipelineStage,
  PerformanceAlert,
  SprintSummary,
  DateRangeOption,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const DATE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const OverviewBhManagerConsole = createPreset<BhManagerConsoleProps>({
  name: 'BhManagerConsole.Overview',
  render: ({ primitives, props, tokens }: PresetContext<BhManagerConsoleProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teams: teamsProp,
      kpis: kpisProp,
      recruiters: recProp,
      metricColumns: colsProp,
      slaItems: slaProp,
      tasks: tasksProp,
      pipeline: pipeProp,
      alerts: alertsProp,
      sprint: sprintProp,
      dateRange: drProp,
      onDateRangeChange,
      selectedTeamId: selTeamProp,
      onTeamChange,
      onRecruiterClick,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : [];
    const kpis = kpisProp?.length ? kpisProp : [];
    const recruiters = recProp?.length ? recProp : [];
    const columns = colsProp?.length ? colsProp : ['Open Reqs', 'Screens', 'Interviews', 'Offers', 'Hires', 'Time to Fill'];
    const slaItems = slaProp?.length ? slaProp : [];
    const tasks = tasksProp?.length ? tasksProp : [];
    const pipeline = pipeProp?.length ? pipeProp : useMemo(() => ([
      { name: 'Applied', count: 342, percentage: 100, color: t.colors.primaryScale[500] },
      { name: 'Screened', count: 186, percentage: 54, color: t.colors.infoScale[500] },
      { name: 'Interviewed', count: 92, percentage: 27, color: t.colors.successScale[500] },
      { name: 'Offered', count: 28, percentage: 8, color: t.colors.warningScale[500] },
      { name: 'Hired', count: 18, percentage: 5, color: t.colors.errorScale[500] },
    ]), [t]);
    const alerts = alertsProp?.length ? alertsProp : [];
    const sprint = sprintProp ?? {};

    const [selectedTeam, setSelectedTeam] = useState(selTeamProp ?? teams[0]?.id);
    const [dateRange, setDateRange] = useState<DateRangeOption>(drProp ?? '30d');

    const handleTeamChange = useCallback((id: string) => {
      setSelectedTeam(id);
      onTeamChange?.(id);
    }, [onTeamChange]);

    const handleDateRangeChange = useCallback((value: DateRangeOption) => {
      setDateRange(value);
      onDateRangeChange?.(value);
    }, [onDateRangeChange]);

    const handleRecruiterClick = useCallback((recruiterId: string) => {
      onRecruiterClick?.(recruiterId);
    }, [onRecruiterClick]);

    /* ---- Styles ---- */
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[7] }), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const isGlass = t.surface.useGlass && !!t.glass;

    const glassOverride = useMemo(() => {
      if (!isGlass || !t.glass) return {};
      return {
        backdropFilter: t.glass.blur,
        WebkitBackdropFilter: t.glass.blur,
      };
    }, [isGlass, t.glass]);

    const TrendIcon = ({ trend }: { trend: string }) => {
      if (trend === 'up') return <TrendingUp size={14} color={t.colors.successScale[600]} />;
      if (trend === 'down') return <TrendingDown size={14} color={t.colors.errorScale[600]} />;
      return <Minus size={14} color={t.colors.neutral[500]} />;
    };

    const priorityColors = useMemo(() => ({
      urgent: { bg: t.colors.errorScale[50], color: t.colors.errorScale[600] },
      high: { bg: t.colors.warningScale[50], color: t.colors.warningScale[600] },
      medium: { bg: t.colors.infoScale[50], color: t.colors.infoScale[600] },
      low: { bg: t.colors.neutral[100], color: t.colors.neutral[500] },
    }), [t]);

    const slaStatusColors = useMemo(() => ({
      green: { dot: t.colors.successScale[500], bg: t.colors.successScale[50] },
      yellow: { dot: t.colors.warningScale[500], bg: t.colors.warningScale[50] },
      red: { dot: t.colors.errorScale[500], bg: t.colors.errorScale[50] },
    }), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* ================================================================ */
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], padding: t.spacing[7], backgroundColor: t.colors.neutral[50], minHeight: '100%', ...glassOverride, ...style }}>
        {accentBar && <Box style={accentBar} />}

        {/* === Header === */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] })}>
              <LayoutDashboard size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: personalityTypo.headingWeight, color: t.colors.neutral[900], letterSpacing: personalityTypo.headingLetterSpacing }}>
                Manager Console
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                {teams.find(tm => tm.id === selectedTeam)?.name ?? 'All Teams'}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[3], alignItems: 'center' }} role="toolbar" aria-label="Console controls">
            {/* Team selector */}
            <Box style={{ display: 'flex', gap: t.spacing[1] }} role="tablist" aria-label="Team selector">
              {teams.map(tm => (
                <Box
                  key={tm.id}
                  role="tab"
                  aria-selected={selectedTeam === tm.id}
                  tabIndex={0}
                  onClick={() => handleTeamChange((tm.id ?? ''))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleTeamChange((tm.id ?? '')); }}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    cursor: 'pointer',
                    backgroundColor: selectedTeam === tm.id ? t.colors.primaryScale[600] : t.colors.neutral[100],
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: selectedTeam === tm.id ? t.colors.common.white : t.colors.neutral[600] }}>
                    {tm.name}
                  </Text>
                </Box>
              ))}
            </Box>
            {/* Date range */}
            <Box style={{ display: 'flex', gap: t.spacing[1] }} role="tablist" aria-label="Date range">
              {DATE_OPTIONS.map(opt => (
                <Box
                  key={opt.value}
                  role="tab"
                  aria-selected={dateRange === opt.value}
                  tabIndex={0}
                  onClick={() => handleDateRangeChange(opt.value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleDateRangeChange(opt.value); }}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    cursor: 'pointer',
                    backgroundColor: dateRange === opt.value ? t.colors.neutral[800] : t.colors.neutral[100],
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: dateRange === opt.value ? t.colors.common.white : t.colors.neutral[500] }}>
                    {opt.label}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* === KPI Ribbon === */}
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: t.spacing[4] }}>
          {kpis.map((kpi, i) => (
            <Box key={i} style={{ ...animStyle(i), ...card, ...hoverStyles.base, ...createEntranceAnimation(t, { index: i }).animate }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>{kpi.label ?? ''}</Text>
              <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[2] }}>
                <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {kpi.value ?? 0}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <TrendIcon trend={kpi.trend ?? 'flat'} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: kpi.trend === 'up' ? t.colors.successScale[600] : kpi.trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
                    {kpi.trendValue ?? ''}
                  </Text>
                </Box>
              </Box>
              {/* Mini sparkline */}
              {(kpi.sparklineData ?? []).length > 1 && (
                <Box style={{ marginTop: t.spacing[2] }} aria-hidden="true">
                  <svg width={100} height={24} viewBox="0 0 100 24">
                    {(() => {
                      const sparkData = kpi.sparklineData ?? [];
                      const max = Math.max(...sparkData);
                      const min = Math.min(...sparkData);
                      const range = max - min || 1;
                      const pts = sparkData.map((v, idx) => {
                        const x = (idx / (sparkData.length - 1)) * 100;
                        const y = 22 - ((v - min) / range) * 20;
                        return `${x},${y}`;
                      }).join(' ');
                      return <polyline points={pts} fill="none" stroke={t.colors.primaryScale[400]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />;
                    })()}
                  </svg>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* === Two-column: Workload + SLA/Tasks === */}
        <Box style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: t.spacing[5] }}>

          {/* Workload heatmap table */}
          <Box style={{ ...card, padding: 0, overflow: 'hidden' }} role="table" aria-label="Recruiter workload">
            <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[200]}` }}>
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Recruiter Workload
              </Text>
            </Box>
            {/* Table header */}
            <Box role="row" style={{ display: 'grid', gridTemplateColumns: `160px repeat(${columns.length}, 1fr)`, gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50] }}>
              <Box role="columnheader" style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: personalityTypo.labelTransform, letterSpacing: personalityTypo.labelLetterSpacing }}>
                Recruiter
              </Box>
              {columns.map(col => (
                <Box key={col} role="columnheader" style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: personalityTypo.labelTransform, letterSpacing: personalityTypo.labelLetterSpacing, textAlign: 'center' as const }}>
                  {col}
                </Box>
              ))}
            </Box>
            {/* Rows */}
            {recruiters.map(rec => (
              <Box
                key={rec.recruiterId}
                role="row"
                tabIndex={onRecruiterClick ? 0 : undefined}
                aria-label={`Recruiter ${rec.name}`}
                onClick={() => handleRecruiterClick((rec.recruiterId ?? ''))}
                onKeyDown={onRecruiterClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleRecruiterClick((rec.recruiterId ?? '')); } : undefined}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `160px repeat(${columns.length}, 1fr)`,
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[100]}`,
                  cursor: onRecruiterClick ? 'pointer' : 'default',
                  transition: `background-color ${t.motion.hover}`,
                  alignItems: 'center',
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{ width: 28, height: 28, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>
                      {(rec.name ?? '').split(' ').map(n => n?.[0] ?? '').join('')}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                    {rec.name}
                  </Text>
                </Box>
                {columns.map(col => {
                  const val = (rec.metrics as Record<string, number> | undefined)?.[col] ?? 0;
                  return (
                    <Box key={col} role="cell" style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], textAlign: 'center' as const }}>
                      {val}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>

          {/* Right column: SLA + Tasks + Alerts */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>

            {/* SLA mini */}
            <Box style={{ ...card }} aria-label="SLA Status">
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>SLA Status</Text>
              {(slaItems ?? []).map(sla => {
                const sc = slaStatusColors[sla.status ?? 'green'] ?? slaStatusColors.green;
                const pct = (sla.limitHours ?? 1) > 0 ? ((sla.avgHours ?? 0) / (sla.limitHours ?? 1)) * 100 : 0;
                return (
                  <Box key={sla.stage} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                    <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc.dot, flexShrink: 0 }} />
                    <Text style={{ width: 100, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], flexShrink: 0 }}>{sla.stage ?? ''}</Text>
                    <Box style={{ flex: 1, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${sla.stage} SLA progress`}>
                      <Box style={{ height: '100%', width: `${Math.min(pct, 100)}%`, borderRadius: t.borderRadius.full, backgroundColor: sc.dot, opacity: 0.7 }} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0, width: 60, textAlign: 'right' as const }}>
                      {sla.avgHours ?? 0}h/{sla.limitHours ?? 0}h
                    </Text>
                  </Box>
                );
              })}
            </Box>

            {/* Task queue */}
            <Box style={{ ...card }} aria-label="Priority tasks">
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Priority Tasks</Text>
              {(tasks ?? []).slice(0, 4).map(task => {
                const pc = priorityColors[(task.priority ?? 'low') as keyof typeof priorityColors] ?? priorityColors.low;
                return (
                  <Box key={task.id} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2], padding: t.spacing[2], borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[100]}` }}>
                    <Box style={{ padding: `2px ${t.spacing[2]}px`, borderRadius: badgeRadius, backgroundColor: pc.bg }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: pc.color, textTransform: 'uppercase' as const }}>
                        {task.priority ?? 'low'}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium }}>
                        {task.title ?? ''}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{task.assignee ?? ''}</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>
                      {task.dueDate ?? ''}
                    </Text>
                  </Box>
                );
              })}
            </Box>

            {/* Alerts */}
            {(alerts ?? []).length > 0 && (
              <Box style={{ ...card, borderLeft: `3px solid ${t.colors.errorScale[400]}` }} role="alert" aria-label="Performance alerts">
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Performance Alerts</Text>
                {(alerts ?? []).map(alert => (
                  <Box key={alert.id ?? ''} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                    <AlertTriangle size={14} color={(alert.severity ?? 'warning') === 'critical' ? t.colors.errorScale[600] : t.colors.warningScale[600]} />
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium }}>
                        {alert.recruiterName ?? ''}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {alert.metric ?? ''}: {alert.actual ?? 0} (threshold: {alert.threshold ?? 0})
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* === Pipeline Funnel + Sprint === */}
        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.spacing[5] }}>
          {/* Pipeline */}
          <Box style={{ ...card }} aria-label="Pipeline funnel">
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Pipeline Funnel</Text>
            {(pipeline ?? []).map((stage, idx) => (
              <Box key={stage.name ?? idx} style={{ ...animStyle(idx), display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
                <Text style={{ width: 80, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, flexShrink: 0 }}>
                  {stage.name ?? ''}
                </Text>
                <Box style={{ flex: 1, position: 'relative' as const, height: 24 }}>
                  <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.neutral[100] }} />
                  <Box style={{
                    position: 'absolute' as const, top: 0, left: 0, height: '100%',
                    width: `${stage.percentage ?? 0}%`,
                    borderRadius: t.borderRadius.sm,
                    backgroundColor: stage.color,
                    opacity: 0.8,
                    transition: `width ${t.motion.hover}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: (stage.percentage ?? 0) > 15 ? t.spacing[2] : 0,
                  }}>
                    {(stage.percentage ?? 0) > 15 && (
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>
                        {stage.count ?? 0}
                      </Text>
                    )}
                  </Box>
                </Box>
                {(stage.percentage ?? 0) <= 15 && (
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], flexShrink: 0 }}>
                    {stage.count ?? 0}
                  </Text>
                )}
                {idx < (pipeline ?? []).length - 1 && (
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0, width: 40, textAlign: 'right' as const }}>
                    {pipeline[idx + 1] ? `${(stage.count ?? 0) > 0 ? Math.round(((pipeline[idx + 1].count ?? 0) / (stage.count ?? 1)) * 100) : 0}%` : ''}
                  </Text>
                )}
              </Box>
            ))}
          </Box>

          {/* Sprint summary */}
          <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center' }} aria-label="Sprint progress">
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Sprint Progress</Text>
            <svg width={120} height={120} viewBox="0 0 120 120" aria-hidden="true">
              {(() => {
                const total = sprint.total || 1;
                const completedPct = (sprint.completed ?? 0) / total;
                const inProgressPct = (sprint.inProgress ?? 0) / total;
                const r = 48;
                const circumference = 2 * Math.PI * r;
                return (
                  <g>
                    <circle cx={60} cy={60} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth={10} />
                    <circle cx={60} cy={60} r={r} fill="none" stroke={t.colors.successScale[500]} strokeWidth={10}
                      strokeDasharray={`${completedPct * circumference} ${circumference}`}
                      strokeDashoffset={0}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                    <circle cx={60} cy={60} r={r} fill="none" stroke={t.colors.warningScale[500]} strokeWidth={10}
                      strokeDasharray={`${inProgressPct * circumference} ${circumference}`}
                      strokeDashoffset={-completedPct * circumference}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                    <text x={60} y={56} textAnchor="middle" fontSize={20} fontWeight={700} fill={t.colors.neutral[900]}>
                      {Math.round(((sprint.completed ?? 0) / total) * 100)}%
                    </text>
                    <text x={60} y={72} textAnchor="middle" fontSize={10} fill={t.colors.neutral[400]}>
                      complete
                    </text>
                  </g>
                );
              })()}
            </svg>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[3], marginTop: t.spacing[4], width: '100%' }}>
              {[
                { label: 'Done', value: sprint.completed ?? 0, color: t.colors.successScale[500] },
                { label: 'Active', value: sprint.inProgress ?? 0, color: t.colors.warningScale[500] },
                { label: 'Blocked', value: sprint.blocked ?? 0, color: t.colors.errorScale[500] },
              ].map(item => (
                <Box key={item.label} style={{ textAlign: 'center' as const }}>
                  <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: item.color, margin: '0 auto', marginBottom: t.spacing[1] }} />
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{item.value}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{item.label}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
