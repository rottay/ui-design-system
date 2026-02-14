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
  createProgressBarStyle,
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
const MOCK_TEAMS: RecruiterTeam[] = [
  { id: 't1', tenantId: 't', companyId: 'c', name: 'Engineering Hiring', code: 'ENG', type: 'technical', description: null, leaderId: 'l1', managerId: null, directorId: null, members: [], activeMemberCount: 6, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 12, currentUtilization: 78, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 88 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't2', tenantId: 't', companyId: 'c', name: 'Product & Design', code: 'PD', type: 'general', description: null, leaderId: 'l2', managerId: null, directorId: null, members: [], activeMemberCount: 4, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 8, currentUtilization: 65, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 82 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't3', tenantId: 't', companyId: 'c', name: 'GTM Recruiting', code: 'GTM', type: 'volume', description: null, leaderId: 'l3', managerId: null, directorId: null, members: [], activeMemberCount: 5, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 10, currentUtilization: 92, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 74 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't4', tenantId: 't', companyId: 'c', name: 'Executive Search', code: 'EXEC', type: 'executive', description: null, leaderId: 'l4', managerId: null, directorId: null, members: [], activeMemberCount: 3, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 4, currentUtilization: 56, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 91 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
];

const MOCK_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Sofia Martinez', role: 'Team Lead', allocationPercent: 80, activeJobs: 4, hires: 6 },
  { id: 'm2', name: 'Alex Kim', role: 'Sr. Recruiter', allocationPercent: 95, activeJobs: 5, hires: 4 },
  { id: 'm3', name: 'Rachel Green', role: 'Recruiter', allocationPercent: 70, activeJobs: 3, hires: 3 },
  { id: 'm4', name: 'Tom Baker', role: 'Jr. Recruiter', allocationPercent: 60, activeJobs: 2, hires: 2 },
  { id: 'm5', name: 'Nina Patel', role: 'Sourcer', allocationPercent: 85, activeJobs: 3, hires: 2 },
  { id: 'm6', name: 'Dave Johnson', role: 'Coordinator', allocationPercent: 40, activeJobs: 1, hires: 1 },
];

const MOCK_KPIS: TeamKpiData = {
  hiresVsTarget: { actual: 18, target: 24 },
  velocityTrend: [12, 14, 13, 16, 15, 18],
  slaCompliance: 87,
  satisfactionScore: 4.5,
};

const MOCK_SPRINT: SprintData = { total: 36, completed: 22, inProgress: 8, blocked: 6, burndownData: [36, 32, 28, 26, 24, 22] };

const MOCK_TARGETS: TeamTarget[] = [
  { metric: 'Engineering Hires', period: 'Q1 2026', value: 24, current: 18 },
  { metric: 'Time to Fill Target', period: 'Q1 2026', value: 25, current: 28 },
  { metric: 'Candidate NPS', period: 'Q1 2026', value: 80, current: 76 },
  { metric: 'Offer Accept Rate', period: 'Q1 2026', value: 90, current: 87 },
];

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

    const teams = teamsProp?.length ? teamsProp : MOCK_TEAMS;
    const members = memProp?.length ? memProp : MOCK_MEMBERS;
    const teamKpis = kpiProp ?? MOCK_KPIS;
    const sprintData = sprintProp ?? MOCK_SPRINT;
    const targets = targetsProp?.length ? targetsProp : MOCK_TARGETS;

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
    const isGlass = t.surface.useGlass && !!t.glass;

    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: t.colors.neutral[50], ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}), ...style }}>

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
                    {teamKpis.hiresVsTarget.actual}/{teamKpis.hiresVsTarget.target}
                  </Text>
                  <Box style={{ marginTop: t.spacing[2], height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden', width: '100%' }}>
                    <Box style={{ height: '100%', width: `${(teamKpis.hiresVsTarget.actual / teamKpis.hiresVsTarget.target) * 100}%`, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[500] }} />
                  </Box>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...card }}>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[1], display: 'block' }}>SLA Compliance</Text>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                    {teamKpis.slaCompliance}%
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
                  {teamKpis.velocityTrend.length > 1 && (
                    <svg width={100} height={32} viewBox="0 0 100 32">
                      {(() => {
                        const max = Math.max(...teamKpis.velocityTrend);
                        const min = Math.min(...teamKpis.velocityTrend);
                        const range = max - min || 1;
                        const pts = teamKpis.velocityTrend.map((v, i) => `${(i / (teamKpis.velocityTrend.length - 1)) * 100},${30 - ((v - min) / range) * 26}`).join(' ');
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
                    return (
                      <Box key={mem.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[3],
                        padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                        borderBottom: `1px solid ${t.colors.neutral[100]}`,
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
                      <Box key={idx} style={{ marginBottom: t.spacing[4] }}>
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
                          const pct = sprintData.completed / total;
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
