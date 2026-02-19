'use client';

/**
 * BhTeamBoard - Detail Preset
 * Split panel focused view with team list on left and full detail on right.
 * Shows members, KPIs, sprint burndown, and target progress.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ChevronRight,
  Target,
  Zap,
  BarChart3,
  TrendingUp,
  Award,
  Star,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Settings,
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
  createStaggerDelay,
  createProgressBarStyle,
  createPersonalityAccentBar,
} from '../../../helpers';
import type {
  BhTeamBoardProps,
  RecruiterTeam,
  TeamMember,
  TeamKpiData,
  SprintData,
  TeamTarget,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getTeamLeadName(team: RecruiterTeam): string {
  return (team as any).leaderName ?? 'Unassigned';
}

function getTeamPerformanceScore(team: RecruiterTeam): number {
  const perf = team.performanceMetrics as Record<string, any> | null;
  return perf?.score ?? perf?.performanceScore ?? 0;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const DetailBhTeamBoard = createPreset<BhTeamBoardProps>({
  name: 'BhTeamBoard.Detail',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamBoardProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teams: teamsProp,
      selectedTeam: selProp,
      onTeamSelect,
      members: memProp,
      teamKpis: kpiProp,
      sprintData: sprintProp,
      targets: targetsProp,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : [];
    const members = memProp?.length ? memProp : [];
    const teamKpis = kpiProp ?? {} as Partial<TeamKpiData>;
    const sprintData = sprintProp ?? {} as Partial<SprintData>;
    const targets = targetsProp?.length ? targetsProp : [];

    const [selectedTeam, setSelectedTeam] = useState(selProp ?? teams[0]?.id);

    const handleTeamSelect = useCallback((id: string) => {
      setSelectedTeam(id);
      onTeamSelect?.(id);
    }, [onTeamSelect]);

    const activeTeam = teams.find(tm => tm.id === selectedTeam) ?? teams[0];

    /* ---- Styles ---- */
    const card = useMemo(() => createCardStyle(t, { padding: 24 }), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const isGlass = t.surface.useGlass && !!t.glass;

    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: t.colors.neutral[50], ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}), ...style }}>
        {accentBar && <Box style={accentBar} />}

        {/* === Left sidebar: team list === */}
        <Box style={{
          width: 280,
          flexShrink: 0,
          borderRight: `1px solid ${t.colors.neutral[200]}`,
          overflow: 'auto',
          backgroundColor: t.colors.common.white,
        }}>
          <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[4]}px ${t.spacing[3]}px` }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <Users size={18} color={t.colors.primaryScale[600]} />
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                Teams
              </Text>
            </Box>
            <Text style={{ ...sectionLabel }}>{teams.length} teams</Text>
          </Box>

          {teams.map(tm => {
            const isSelected = selectedTeam === tm.id;
            const capPct = tm.currentUtilization ?? 0;
            const capColor = capPct >= 90 ? t.colors.errorScale[500] : capPct >= 70 ? t.colors.warningScale[500] : t.colors.successScale[500];
            return (
              <Box
                key={tm.id}
                role="button"
                tabIndex={0}
                aria-label={`Select team: ${tm.name}`}
                aria-pressed={isSelected}
                onClick={() => handleTeamSelect(tm.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleTeamSelect(tm.id); }}
                style={{
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                  borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                  borderBottom: `1px solid ${t.colors.neutral[100]}`,
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, color: isSelected ? t.colors.primaryScale[700] : t.colors.neutral[800] }}>
                    {tm.name}
                  </Text>
                  <ChevronRight size={14} color={t.colors.neutral[400]} />
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: t.spacing[1], display: 'block' }}>
                  {tm.activeMemberCount ?? 0} members -- {tm.currentActivePositions ?? 0} jobs
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[2] }}>
                  <Box style={{ flex: 1, height: 4, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                    <Box style={{ height: '100%', width: `${capPct}%`, borderRadius: t.borderRadius.full, backgroundColor: capColor, opacity: 0.7 }} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>{capPct.toFixed(0)}%</Text>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* === Right: Team detail === */}
        <Box style={{ flex: 1, overflow: 'auto', padding: t.spacing[6] }}>
          {activeTeam && (
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>

              {/* Team header */}
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: personalityTypo.headingWeight, color: t.colors.neutral[900], letterSpacing: personalityTypo.headingLetterSpacing }}>
                    {activeTeam.name}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                    Led by {getTeamLeadName(activeTeam)} -- Performance: {getTeamPerformanceScore(activeTeam)}/100
                  </Text>
                </Box>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: getTeamPerformanceScore(activeTeam) >= 85 ? t.colors.successScale[50] : getTeamPerformanceScore(activeTeam) >= 70 ? t.colors.warningScale[50] : t.colors.errorScale[50],
                }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.bold,
                    color: getTeamPerformanceScore(activeTeam) >= 85 ? t.colors.successScale[600] : getTeamPerformanceScore(activeTeam) >= 70 ? t.colors.warningScale[600] : t.colors.errorScale[600],
                  }}>
                    {getTeamPerformanceScore(activeTeam)}
                  </Text>
                </Box>
              </Box>

              {/* KPI row */}
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...card }}>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[1], display: 'block' }}>Hires vs Target</Text>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                    {teamKpis.hiresVsTarget?.actual ?? 0}/{teamKpis.hiresVsTarget?.target ?? 0}
                  </Text>
                  <Box style={{ marginTop: t.spacing[2], height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden', width: '100%' }}>
                    <Box style={{ height: '100%', width: `${((teamKpis.hiresVsTarget?.actual ?? 0) / (teamKpis.hiresVsTarget?.target || 1)) * 100}%`, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[500] }} />
                  </Box>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...card }}>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[1], display: 'block' }}>SLA Compliance</Text>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                    {teamKpis.slaCompliance ?? 0}%
                  </Text>
                </Box>
                <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const }}>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[1], display: 'block' }}>Satisfaction</Text>
                  <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                      {(teamKpis.satisfactionScore ?? 0).toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>/5.0</Text>
                  </Box>
                </Box>
                <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const }}>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[1], display: 'block' }}>Velocity</Text>
                  {(teamKpis.velocityTrend ?? []).length > 1 && (
                    <svg width={100} height={32} viewBox="0 0 100 32">
                      {(() => {
                        const vt = teamKpis.velocityTrend ?? [];
                        const max = Math.max(...vt);
                        const min = Math.min(...vt);
                        const range = max - min || 1;
                        const pts = vt.map((v: number, i: number) => `${(i / (vt.length - 1)) * 100},${30 - ((v - min) / range) * 26}`).join(' ');
                        return <polyline points={pts} fill="none" stroke={t.colors.primaryScale[400]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
                      })()}
                    </svg>
                  )}
                </Box>
              </Box>

              {/* Members table + Targets */}
              <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.spacing[5] }}>
                {/* Members */}
                <Box style={{ ...card, padding: 0, overflow: 'hidden' }}>
                  <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[200]}` }}>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                      Team Members ({members.length})
                    </Text>
                  </Box>
                  {members.map(mem => {
                    const allocColor = mem.allocationPercent >= 90 ? t.colors.errorScale[500] : mem.allocationPercent >= 70 ? t.colors.warningScale[500] : t.colors.successScale[500];
                    const isEditing = props.editingMember === mem.id;
                    return (
                      <Box key={mem.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[3],
                        padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                        borderBottom: `1px solid ${t.colors.neutral[100]}`,
                        backgroundColor: isEditing ? t.colors.primaryScale[50] : 'transparent',
                        borderLeft: isEditing ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                      }}>
                        <Box style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>
                            {mem.name.split(' ').map(n => n[0]).join('')}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{mem.name}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{mem.role}</Text>
                        </Box>
                        <Box style={{ textAlign: 'center' as const, width: 50, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{mem.activeJobs}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>jobs</Text>
                        </Box>
                        <Box style={{ textAlign: 'center' as const, width: 50, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{mem.hires}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>hires</Text>
                        </Box>
                        <Box style={{ width: 80, display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Box style={{ flex: 1, height: 4, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                            <Box style={{ height: '100%', width: `${mem.allocationPercent}%`, borderRadius: t.borderRadius.full, backgroundColor: allocColor }} />
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>{mem.allocationPercent}%</Text>
                        </Box>
                        {props.onMemberEdit && (
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`Edit ${mem.name}`}
                            onClick={() => props.onMemberEdit?.(isEditing ? null : mem.id)}
                            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); props.onMemberEdit?.(isEditing ? null : mem.id); } }}
                            style={{
                              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                              borderRadius: t.borderRadius.md,
                              border: `1px solid ${isEditing ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                              backgroundColor: isEditing ? t.colors.primaryScale[50] : t.colors.common.white,
                              color: isEditing ? t.colors.primaryScale[600] : t.colors.neutral[500],
                              fontSize: t.typography.fontSize.xs,
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Settings size={12} />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Targets */}
                <Box style={{ ...card, display: 'flex', flexDirection: 'column' as const }}>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[4], display: 'block' }}>Quarterly Targets</Text>
                  {targets.map((tgt, idx) => {
                    const pct = (tgt.current / Math.max(tgt.value, 1)) * 100;
                    const isOnTrack = pct >= 75;
                    return (
                      <Box key={idx} style={{ ...animStyle(idx), marginBottom: t.spacing[4] }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                            {tgt.metric}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: isOnTrack ? t.colors.successScale[600] : t.colors.warningScale[600] }}>
                            {tgt.current}/{tgt.value}
                          </Text>
                        </Box>
                        <Box style={{ height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                          <Box style={{
                            height: '100%',
                            width: `${Math.min(pct, 100)}%`,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: isOnTrack ? t.colors.successScale[500] : t.colors.warningScale[500],
                            opacity: 0.7,
                            transition: `width ${t.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                    );
                  })}

                  {/* Sprint ring */}
                  <Box style={{ borderTop: `1px solid ${t.colors.neutral[100]}`, paddingTop: t.spacing[4], marginTop: t.spacing[2] }}>
                    <Text style={{ ...sectionLabel, marginBottom: t.spacing[3], display: 'block' }}>Sprint</Text>
                    <Box style={{ display: 'flex', justifyContent: 'center' }}>
                      <svg width={100} height={100} viewBox="0 0 100 100">
                        {(() => {
                          const total = sprintData.total || 1;
                          const pct = (sprintData.completed ?? 0) / total;
                          const r = 38;
                          const circ = 2 * Math.PI * r;
                          return (
                            <g>
                              <circle cx={50} cy={50} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth={8} />
                              <circle cx={50} cy={50} r={r} fill="none" stroke={t.colors.successScale[500]} strokeWidth={8}
                                strokeDasharray={`${pct * circ} ${circ}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                              <text x={50} y={48} textAnchor="middle" fontSize={16} fontWeight={700} fill={t.colors.neutral[900]}>{Math.round(pct * 100)}%</text>
                              <text x={50} y={62} textAnchor="middle" fontSize={9} fill={t.colors.neutral[400]}>done</text>
                            </g>
                          );
                        })()}
                      </svg>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
