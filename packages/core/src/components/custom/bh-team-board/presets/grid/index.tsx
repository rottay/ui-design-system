'use client';

/**
 * BhTeamBoard - Grid Preset
 * Card-based grid layout with team overview cards, performance rings,
 * capacity bars, member avatars, and interactive view toggle.
 *
 * Design: Generous whitespace, tinted KPI badges, SVG performance rings,
 * hover lift, personality-aware accent bars, and modal form placeholder.
 */

import { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Briefcase,
  TrendingUp,
  Target,
  Zap,
  Activity,
  Award,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  createProgressBarStyle,
  createPersonalityAccentBar,
  createEntranceAnimation,
  createDividerStyle,
} from '../../../helpers';
import type {
  BhTeamBoardProps,
  TeamItem,
  TeamMember,
  TeamKpiData,
  SprintData,
  TeamTarget,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_TEAMS: TeamItem[] = [
  { id: 't1', name: 'Engineering Hiring', leadName: 'Sofia Martinez', memberCount: 6, activeJobs: 12, capacityUsed: 78, capacityTotal: 100, performanceScore: 88 },
  { id: 't2', name: 'Product & Design', leadName: 'James Chen', memberCount: 4, activeJobs: 8, capacityUsed: 65, capacityTotal: 100, performanceScore: 82 },
  { id: 't3', name: 'GTM Recruiting', leadName: 'Priya Sharma', memberCount: 5, activeJobs: 10, capacityUsed: 92, capacityTotal: 100, performanceScore: 74 },
  { id: 't4', name: 'Executive Search', leadName: 'Marcus Williams', memberCount: 3, activeJobs: 4, capacityUsed: 56, capacityTotal: 100, performanceScore: 91 },
  { id: 't5', name: 'Campus & Intern', leadName: 'Aisha Okafor', memberCount: 3, activeJobs: 6, capacityUsed: 42, capacityTotal: 80, performanceScore: 79 },
  { id: 't6', name: 'Remote Talent', leadName: 'Liam O\'Brien', memberCount: 4, activeJobs: 7, capacityUsed: 88, capacityTotal: 100, performanceScore: 85 },
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
  velocityTrend: [12, 14, 11, 16, 18, 15, 20, 22, 18, 24],
  slaCompliance: 87,
  satisfactionScore: 4.3,
};

const MOCK_SPRINT: SprintData = {
  total: 32,
  completed: 18,
  inProgress: 9,
  blocked: 5,
  burndownData: [32, 30, 28, 25, 22, 20, 18, 17, 15, 14, 12, 9],
};

const MOCK_TARGETS: TeamTarget[] = [
  { metric: 'Hires This Quarter', period: 'quarterly', value: 45, current: 32 },
  { metric: 'Avg Time-to-Fill', period: 'quarterly', value: 28, current: 24 },
  { metric: 'Monthly Offers', period: 'monthly', value: 12, current: 9 },
  { metric: 'Source Quality', period: 'monthly', value: 90, current: 84 },
];

/* ------------------------------------------------------------------ */
/*  SVG Helpers                                                        */
/* ------------------------------------------------------------------ */
function perfRing(score: number, radius: number) {
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score / 100, 1);
  return { dashArray: `${pct * circ} ${circ}`, pct };
}

function sparkPts(data: number[], w: number, h: number, pad = 2): string {
  if (data.length < 2) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  return data.map((v, i) => `${pad + i * step},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(' ');
}

function sparkArea(data: number[], w: number, h: number, pad = 2): string {
  if (data.length < 2) return '';
  const pts = sparkPts(data, w, h, pad);
  const lastX = pad + (data.length - 1) * ((w - pad * 2) / (data.length - 1));
  return `${pad},${h - pad} ${pts} ${lastX},${h - pad}`;
}

function clamp(val: number, total: number): number {
  return total <= 0 ? 0 : Math.min(Math.max((val / total) * 100, 0), 100);
}

/* ------------------------------------------------------------------ */
/*  Grid Preset                                                        */
/* ------------------------------------------------------------------ */
export const GridBhTeamBoard = createPreset<BhTeamBoardProps>({
  name: 'BhTeamBoard.Grid',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamBoardProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    /* -- Props with mock fallbacks ----------------------------------- */
    const {
      teams: teamsProp,
      selectedTeam: controlledSelected,
      onTeamSelect,
      members: membersProp,
      teamKpis: kpisProp,
      sprintData: sprintProp,
      targets: targetsProp,
      onAddTeam,
      onEditTeam,
      onAddMember,
      onRemoveMember,
      showAddModal: controlledModal,
      onAddModalToggle,
      viewMode: controlledView,
      onViewModeChange,
      targetPeriod: controlledPeriod,
      onTargetPeriodChange,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : MOCK_TEAMS;
    const members = membersProp?.length ? membersProp : MOCK_MEMBERS;
    const kpis = kpisProp ?? MOCK_KPIS;
    const sprint = sprintProp ?? MOCK_SPRINT;
    const targets = targetsProp?.length ? targetsProp : MOCK_TARGETS;

    /* -- Internal state ---------------------------------------------- */
    const [intSelected, setIntSelected] = useState<string | null>(teams[0]?.id ?? null);
    const [intModal, setIntModal] = useState(false);
    const [intView, setIntView] = useState<'grid' | 'list'>('grid');
    const [intPeriod, setIntPeriod] = useState<'monthly' | 'quarterly'>('quarterly');

    const selectedId = controlledSelected !== undefined ? controlledSelected : intSelected;
    const showModal = controlledModal !== undefined ? controlledModal : intModal;
    const viewMode = controlledView !== undefined ? controlledView : intView;
    const period = controlledPeriod !== undefined ? controlledPeriod : intPeriod;

    const selectTeam = (id: string) => { setIntSelected(id); onTeamSelect?.(id); };
    const toggleModal = (open: boolean) => { setIntModal(open); onAddModalToggle?.(open); };
    const switchView = (m: 'grid' | 'list') => { setIntView(m); onViewModeChange?.(m); };
    const switchPeriod = (p: 'monthly' | 'quarterly') => { setIntPeriod(p); onTargetPeriodChange?.(p); };

    /* -- Derived data ------------------------------------------------ */
    const activeTeam = useMemo(() => teams.find((team) => team.id === selectedId), [teams, selectedId]);
    const totalMembers = useMemo(() => teams.reduce((s, team) => s + team.memberCount, 0), [teams]);
    const filteredTargets = useMemo(
      () => targets.filter((tgt) => tgt.period === period || !tgt.period),
      [targets, period],
    );

    /* -- Styles ------------------------------------------------------ */
    const card = useMemo(() => createCardStyle(t, { padding: 28 }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const perfColor = (score: number) =>
      score >= 85 ? t.colors.successScale[500]
      : score >= 65 ? t.colors.warningScale[500]
      : t.colors.errorScale[500];

    const capColor = (pct: number) =>
      pct >= 90 ? t.colors.errorScale[500]
      : pct >= 70 ? t.colors.warningScale[500]
      : t.colors.successScale[500];

    /* ================================================================ */
    /*  Inner Components                                                 */
    /* ================================================================ */

    /* -- Section Header --------------------------------------------- */
    const SectionHeader = ({ icon, label, right }: { icon: React.ReactNode; label: string; right?: React.ReactNode }) => (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          <Box style={{ color: t.colors.primaryScale[500] }}>{icon}</Box>
          <Text style={{ ...sectionHdr, marginBottom: 0 }}>{label}</Text>
        </Box>
        {right}
      </Box>
    );

    /* -- Team Card -------------------------------------------------- */
    const TeamCard = ({ team, idx }: { team: TeamItem; idx: number }) => {
      const isSelected = selectedId === team.id;
      const capPct = clamp(team.capacityUsed, team.capacityTotal);
      const r = 22;
      const sw = 4;
      const sz = (r + sw) * 2;
      const ring = perfRing(team.performanceScore, r);
      const entrance = createEntranceAnimation(t, { index: idx });
      const accent = createPersonalityAccentBar(t, {
        color: isSelected ? t.colors.primaryScale[500] : t.colors.neutral[200],
      });
      const progressBar = createProgressBarStyle(t, { color: capColor(capPct), percent: capPct });

      return (
        <Box
          onClick={() => selectTeam(team.id)}
          style={{
            ...card,
            position: 'relative' as const,
            overflow: 'hidden',
            cursor: 'pointer',
            border: isSelected
              ? `2px solid ${t.colors.primaryScale[400]}`
              : `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
            backgroundColor: isSelected ? t.colors.primaryScale[50] : card.backgroundColor,
            display: 'flex',
            flexDirection: viewMode === 'list' ? 'row' as const : 'column' as const,
            gap: t.spacing[4],
            transition: `all ${t.motion.hover}`,
            ...entrance.initial,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
            const el = e.currentTarget;
            if (cardHover.hover.transform) el.style.transform = cardHover.hover.transform;
            if (cardHover.hover.boxShadow) el.style.boxShadow = cardHover.hover.boxShadow;
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
            const el = e.currentTarget;
            el.style.transform = 'none';
            el.style.boxShadow = (card.boxShadow as string) || '';
          }}
        >
          {accent && <Box style={{ ...accent, position: 'absolute' as const, top: 0, left: 0 }} />}

          {/* Header row: avatar + name + perf ring */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: viewMode === 'list' ? 1 : undefined }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={{
                ...createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] }),
                color: t.colors.primaryScale[700],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold }}>
                  {team.leadName.charAt(0).toUpperCase()}
                </Text>
              </Box>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                  {team.name}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Lead: {team.leadName}
                </Text>
              </Box>
            </Box>

            {/* Performance ring */}
            <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ flexShrink: 0 }}>
              <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth={sw} />
              <circle
                cx={sz / 2} cy={sz / 2} r={r} fill="none"
                stroke={perfColor(team.performanceScore)}
                strokeWidth={sw}
                strokeDasharray={ring.dashArray}
                strokeLinecap="round"
                transform={`rotate(-90 ${sz / 2} ${sz / 2})`}
                style={{ transition: `stroke-dasharray ${t.motion.hover}` }}
              />
              <text x={sz / 2} y={sz / 2} textAnchor="middle" dominantBaseline="central" fill={t.colors.neutral[900]} fontSize={t.typography.fontSize.xs} fontWeight={t.typography.fontWeight.bold}>
                {team.performanceScore}
              </text>
            </svg>
          </Box>

          {/* Stat badges */}
          <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' as const, flex: viewMode === 'list' ? 1 : undefined }}>
            <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} />
              <Text style={{ fontSize: 'inherit' }}>{team.memberCount} members</Text>
            </Box>
            <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Briefcase size={12} />
              <Text style={{ fontSize: 'inherit' }}>{team.activeJobs} jobs</Text>
            </Box>
          </Box>

          {/* Capacity bar */}
          <Box style={{ flex: viewMode === 'list' ? 1 : undefined }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Capacity</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                {team.capacityUsed}/{team.capacityTotal}
              </Text>
            </Box>
            <Box style={progressBar.track}>
              <Box style={progressBar.fill} />
            </Box>
          </Box>

          {/* Edit button in list mode */}
          {viewMode === 'list' && (
            <Box
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditTeam?.(team.id); }}
              style={{
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderRadius: t.borderRadius.md,
                border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                color: t.colors.neutral[600],
                fontSize: t.typography.fontSize.xs,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Pencil size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Edit</Text>
            </Box>
          )}
        </Box>
      );
    };

    /* -- KPI Mini Card ---------------------------------------------- */
    const KpiMini = ({ label, value, icon, scale }: { label: string; value: string; icon: React.ReactNode; scale: string }) => {
      const s = (t.colors as any)[scale];
      return (
        <Box style={{
          padding: t.spacing[4],
          borderRadius: t.borderRadius.lg,
          backgroundColor: s[50],
          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${s[200]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
            <Box style={{ color: s[600] }}>{icon}</Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: s[700], fontWeight: t.typography.fontWeight.medium }}>{label}</Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: s[800] }}>{value}</Text>
        </Box>
      );
    };

    /* ================================================================ */
    /*  Render                                                           */
    /* ================================================================ */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: t.colors.neutral[50],
          padding: t.spacing[7],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ---- Page Header ------------------------------------------ */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[7] }}>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block', marginBottom: t.spacing[1] }}>
              Team Management
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
              {teams.length} teams  &#183;  {totalMembers} total members
            </Text>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            {/* View toggle */}
            <Box style={{
              display: 'inline-flex',
              borderRadius: t.borderRadius.lg,
              border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
              overflow: 'hidden',
            }}>
              {([{ key: 'grid' as const, icon: <LayoutGrid size={14} /> }, { key: 'list' as const, icon: <List size={14} /> }]).map((m) => (
                <Box
                  key={m.key}
                  onClick={() => switchView(m.key)}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    backgroundColor: viewMode === m.key ? t.colors.primaryScale[50] : t.colors.common.white,
                    color: viewMode === m.key ? t.colors.primaryScale[700] : t.colors.neutral[500],
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: viewMode === m.key ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                  }}
                >
                  {m.icon}
                  <Text style={{ fontSize: t.typography.fontSize.sm, textTransform: 'capitalize' as const }}>{m.key}</Text>
                </Box>
              ))}
            </Box>

            {/* Add team button */}
            <Box
              onClick={() => { toggleModal(true); onAddTeam?.(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                borderRadius: t.borderRadius.lg,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <UserPlus size={16} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: 'inherit' }}>Add Team</Text>
            </Box>
          </Box>
        </Box>

        {/* ---- Team Cards Grid -------------------------------------- */}
        <Box style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : undefined,
          flexDirection: viewMode === 'list' ? 'column' as const : undefined,
          gap: t.spacing[5],
          marginBottom: t.spacing[7],
        }}>
          {teams.map((team, idx) => (
            <TeamCard key={team.id} team={team} idx={idx} />
          ))}
        </Box>

        {/* ---- Selected Team Detail --------------------------------- */}
        {activeTeam && (
          <>
            <Box style={divider} />
            <Box style={{ marginTop: t.spacing[6] }}>
              {/* Team detail header */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[6] }}>
                <Box style={{
                  ...createIconContainerStyle(t, { size: 48, color: t.colors.primaryScale[100] }),
                  color: t.colors.primaryScale[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Users size={24} />
                </Box>
                <Box>
                  <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                    {activeTeam.name}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                    Led by {activeTeam.leadName}  &#183;  {activeTeam.memberCount} members  &#183;  {activeTeam.activeJobs} active jobs
                  </Text>
                </Box>
              </Box>

              {/* KPI cards */}
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
                <KpiMini label="Hires vs Target" value={`${kpis.hiresVsTarget.actual}/${kpis.hiresVsTarget.target}`} icon={<Target size={14} />} scale="successScale" />
                <KpiMini label="SLA Compliance" value={`${kpis.slaCompliance}%`} icon={<CheckCircle2 size={14} />} scale="infoScale" />
                <KpiMini label="Satisfaction" value={`${kpis.satisfactionScore}/5`} icon={<Star size={14} />} scale="warningScale" />
                <KpiMini label="Performance" value={`${activeTeam.performanceScore}`} icon={<Award size={14} />} scale="primaryScale" />
              </Box>

              {/* Two-column: Members + Sprint */}
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: t.spacing[5], marginBottom: t.spacing[6] }}>
                {/* Members Table */}
                <Box style={{ ...card }}>
                  <SectionHeader icon={<Users size={16} />} label={`${activeTeam.name} Members`} right={
                    <Box
                      onClick={() => onAddMember?.()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                        padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.primaryScale[600],
                        color: t.colors.common.white,
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        cursor: 'pointer',
                      }}
                    >
                      <UserPlus size={12} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: 'inherit' }}>Add</Text>
                    </Box>
                  } />

                  {/* Table header */}
                  <Box style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 70px 70px 50px',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    backgroundColor: t.colors.neutral[50],
                    borderRadius: t.borderRadius.md,
                    marginBottom: t.spacing[2],
                  }}>
                    {['Member', 'Role', 'Allocation', 'Jobs', 'Hires', ''].map((col) => (
                      <Text key={col} style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{col}</Text>
                    ))}
                  </Box>

                  {/* Rows */}
                  {members.map((member) => {
                    const allocColor = member.allocationPercent >= 90 ? t.colors.errorScale[500] : member.allocationPercent >= 70 ? t.colors.warningScale[500] : t.colors.primaryScale[500];
                    const allocBar = createProgressBarStyle(t, { color: allocColor, percent: member.allocationPercent });

                    return (
                      <Box
                        key={member.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 70px 70px 50px',
                          gap: t.spacing[2],
                          padding: `${t.spacing[3]}px`,
                          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                          alignItems: 'center',
                          transition: `background-color ${t.motion.hover}`,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Box style={{
                            ...createIconContainerStyle(t, { size: 32, color: t.colors.secondaryScale[100] }),
                            color: t.colors.secondaryScale[700],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold }}>
                              {member.name.charAt(0)}
                            </Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                            {member.name}
                          </Text>
                        </Box>
                        <Box>
                          <Box style={{ ...createBadgeStyle(t, member.role === 'Team Lead' ? 'primary' : member.role.includes('Sr') ? 'success' : 'info'), borderRadius: badgeR }}>
                            <Text style={{ fontSize: 'inherit' }}>{member.role}</Text>
                          </Box>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Box style={{ ...allocBar.track, flex: 1 }}>
                            <Box style={allocBar.fill} />
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], minWidth: 30, textAlign: 'right' as const }}>
                            {member.allocationPercent}%
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], textAlign: 'center' as const }}>{member.activeJobs}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600], textAlign: 'center' as const }}>{member.hires}</Text>
                        <Box style={{ display: 'flex', gap: t.spacing[1], justifyContent: 'flex-end' }}>
                          <Box
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemoveMember?.(member.id); }}
                            style={{ width: 24, height: 24, borderRadius: t.borderRadius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.errorScale[400], cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}

                  {members.length === 0 && (
                    <Box style={{ padding: `${t.spacing[8]}px ${t.spacing[4]}px`, textAlign: 'center' as const }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No members assigned yet.</Text>
                    </Box>
                  )}
                </Box>

                {/* Sprint & Velocity sidebar */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
                  {/* Sprint progress */}
                  <Box style={{ ...card }}>
                    <SectionHeader icon={<Activity size={16} />} label="Sprint Progress" />
                    <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: t.spacing[4] }}>
                      {(() => {
                        const r2 = 40;
                        const sw2 = 7;
                        const sz2 = (r2 + sw2) * 2;
                        const ring2 = perfRing(sprint.completed / sprint.total * 100, r2);
                        return (
                          <svg width={sz2} height={sz2} viewBox={`0 0 ${sz2} ${sz2}`}>
                            <circle cx={sz2 / 2} cy={sz2 / 2} r={r2} fill="none" stroke={t.colors.neutral[100]} strokeWidth={sw2} />
                            <circle cx={sz2 / 2} cy={sz2 / 2} r={r2} fill="none" stroke={t.colors.successScale[500]} strokeWidth={sw2} strokeDasharray={ring2.dashArray} strokeLinecap="round" transform={`rotate(-90 ${sz2 / 2} ${sz2 / 2})`} />
                            <text x={sz2 / 2} y={sz2 / 2 - 6} textAnchor="middle" dominantBaseline="central" fill={t.colors.neutral[900]} fontSize={t.typography.fontSize.lg} fontWeight={t.typography.fontWeight.bold}>{Math.round(sprint.completed / sprint.total * 100)}%</text>
                            <text x={sz2 / 2} y={sz2 / 2 + 10} textAnchor="middle" dominantBaseline="central" fill={t.colors.neutral[500]} fontSize={t.typography.fontSize.xs}>done</text>
                          </svg>
                        );
                      })()}
                    </Box>
                    {[
                      { label: 'Completed', value: sprint.completed, color: t.colors.successScale[500] },
                      { label: 'In Progress', value: sprint.inProgress, color: t.colors.primaryScale[500] },
                      { label: 'Blocked', value: sprint.blocked, color: t.colors.errorScale[500] },
                    ].map((item) => {
                      const bar = createProgressBarStyle(t, { color: item.color, percent: clamp(item.value, sprint.total) });
                      return (
                        <Box key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], width: 80, flexShrink: 0 }}>{item.label}</Text>
                          <Box style={{ ...bar.track, flex: 1, height: 8 }}>
                            <Box style={bar.fill} />
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], width: 24, textAlign: 'right' as const }}>{item.value}</Text>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Velocity sparkline */}
                  {kpis.velocityTrend.length > 1 && (
                    <Box style={{ ...card }}>
                      <SectionHeader icon={<TrendingUp size={16} />} label="Velocity Trend" />
                      <svg width="100%" height="60" viewBox="0 0 160 60" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="tb-vel-g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={t.colors.primaryScale[400]} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={t.colors.primaryScale[400]} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon points={sparkArea(kpis.velocityTrend, 160, 60)} fill="url(#tb-vel-g)" />
                        <polyline points={sparkPts(kpis.velocityTrend, 160, 60)} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* ---- Targets ---------------------------------------- */}
              {filteredTargets.length > 0 && (
                <Box style={{ ...card }}>
                  <SectionHeader icon={<Target size={16} />} label="Team Targets" right={
                    <Box style={{
                      display: 'inline-flex',
                      borderRadius: t.borderRadius.lg,
                      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                      overflow: 'hidden',
                    }}>
                      {(['quarterly', 'monthly'] as const).map((p) => (
                        <Box
                          key={p}
                          onClick={() => switchPeriod(p)}
                          style={{
                            padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                            backgroundColor: period === p ? t.colors.primaryScale[50] : t.colors.common.white,
                            color: period === p ? t.colors.primaryScale[700] : t.colors.neutral[500],
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: period === p ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                            textTransform: 'capitalize' as const,
                          }}
                        >
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{p}</Text>
                        </Box>
                      ))}
                    </Box>
                  } />

                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: t.spacing[4] }}>
                    {filteredTargets.map((tgt, idx) => {
                      const pct = clamp(tgt.current, tgt.value);
                      const tColor = pct >= 100 ? t.colors.successScale[500] : pct >= 70 ? t.colors.primaryScale[500] : pct >= 40 ? t.colors.warningScale[500] : t.colors.errorScale[500];
                      const scaleName = pct >= 100 ? 'successScale' : pct >= 70 ? 'primaryScale' : pct >= 40 ? 'warningScale' : 'errorScale';
                      const cs = (t.colors as any)[scaleName];
                      const bar = createProgressBarStyle(t, { color: tColor, percent: pct });

                      return (
                        <Box key={idx} style={{
                          padding: t.spacing[4],
                          borderRadius: t.borderRadius.lg,
                          backgroundColor: cs[50],
                          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${cs[200]}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], display: 'block', marginBottom: t.spacing[2] }}>
                            {tgt.metric}
                          </Text>
                          <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{tgt.current}</Text>
                            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>/ {tgt.value}</Text>
                          </Box>
                          <Box style={bar.track}>
                            <Box style={bar.fill} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* ---- Add Team Modal --------------------------------------- */}
        {showModal && (
          <Box
            style={{
              position: 'fixed' as const,
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => toggleModal(false)}
          >
            <Box
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                ...card,
                width: 480,
                maxHeight: '80vh',
                overflow: 'auto',
                backgroundColor: t.colors.common.white,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[6] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  Add New Team
                </Text>
                <Box onClick={() => toggleModal(false)} style={{ cursor: 'pointer', color: t.colors.neutral[400], padding: t.spacing[1] }}>
                  <X size={18} />
                </Box>
              </Box>

              {[
                { label: 'Team Name', placeholder: 'e.g. Engineering Recruiting' },
                { label: 'Team Code', placeholder: 'e.g. ENG-REC' },
                { label: 'Team Lead', placeholder: 'Select team lead...' },
                { label: 'Max Capacity', placeholder: 'e.g. 50' },
              ].map((field) => (
                <Box key={field.label} style={{ marginBottom: t.spacing[4] }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], display: 'block', marginBottom: t.spacing[1] }}>
                    {field.label}
                  </Text>
                  <Box style={{
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[300]}`,
                    backgroundColor: t.colors.common.white,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>{field.placeholder}</Text>
                  </Box>
                </Box>
              ))}

              <Box style={{ ...divider, margin: `${t.spacing[4]}px 0` }} />

              <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: t.spacing[3] }}>
                <Box
                  onClick={() => toggleModal(false)}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white,
                    color: t.colors.neutral[600],
                    fontSize: t.typography.fontSize.sm,
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.sm }}>Cancel</Text>
                </Box>
                <Box
                  onClick={() => { toggleModal(false); onAddTeam?.(); }}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.primaryScale[600],
                    color: t.colors.common.white,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: 'inherit' }}>Create Team</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
