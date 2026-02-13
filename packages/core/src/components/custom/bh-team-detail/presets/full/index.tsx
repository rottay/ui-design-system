'use client';

/**
 * BhTeamDetail - Full Preset
 * Complete team detail view with member table, position list,
 * and performance metrics grid.
 */

import { useMemo, useCallback } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Target,
  ChevronRight,
  UserCircle,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createProgressBarStyle,
  createDividerStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhTeamDetailProps, TeamPosition } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_MEMBERS = [
  { id: 'm1', name: 'Sofia Martinez', role: 'Team Lead', avatarInitial: 'S', hireDate: '2023-01-15' },
  { id: 'm2', name: 'Alex Kim', role: 'Sr. Recruiter', avatarInitial: 'A', hireDate: '2023-04-20' },
  { id: 'm3', name: 'Rachel Green', role: 'Recruiter', avatarInitial: 'R', hireDate: '2023-07-10' },
  { id: 'm4', name: 'Tom Baker', role: 'Jr. Recruiter', avatarInitial: 'T', hireDate: '2024-01-05' },
  { id: 'm5', name: 'Nina Patel', role: 'Sourcer', avatarInitial: 'N', hireDate: '2024-03-18' },
];

const MOCK_POSITIONS: TeamPosition[] = [
  { id: 'p1', title: 'Senior Frontend Engineer', status: 'open', assignee: 'Alex Kim' },
  { id: 'p2', title: 'Backend Engineer', status: 'open', assignee: 'Rachel Green' },
  { id: 'p3', title: 'DevOps Engineer', status: 'filled', assignee: 'Sofia Martinez' },
  { id: 'p4', title: 'QA Engineer', status: 'open' },
  { id: 'p5', title: 'Product Manager', status: 'closed' },
  { id: 'p6', title: 'Data Scientist', status: 'open', assignee: 'Tom Baker' },
];

const MOCK_METRICS = [
  { label: 'Hires This Quarter', value: 18, target: 24 },
  { label: 'Avg Time to Fill', value: 22, target: 30 },
  { label: 'Quality Score', value: 87, target: 90 },
  { label: 'Offer Acceptance', value: 92, target: 95 },
];

/* ------------------------------------------------------------------ */
/*  Full Preset                                                        */
/* ------------------------------------------------------------------ */
export const FullBhTeamDetail = createPreset<BhTeamDetailProps>({
  name: 'BhTeamDetail.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamDetailProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teamName = 'Engineering Hiring',
      department = 'Engineering',
      members: membersProp,
      positions: positionsProp,
      metrics: metricsProp,
      onMemberClick,
      onPositionClick,
      loading,
      className,
      style,
    } = props;

    const members = membersProp?.length ? membersProp : MOCK_MEMBERS;
    const positions = positionsProp?.length ? positionsProp : MOCK_POSITIONS;
    const metrics = metricsProp?.length ? metricsProp : MOCK_METRICS;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 24 }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);

    const handleMemberClick = useCallback((memberId: string) => { onMemberClick?.(memberId); }, [onMemberClick]);
    const handlePositionClick = useCallback((positionId: string) => { onPositionClick?.(positionId); }, [onPositionClick]);

    const positionStatusBadge = useCallback((status: TeamPosition['status']) => {
      switch (status) {
        case 'open': return 'warning';
        case 'filled': return 'success';
        case 'closed': return 'secondary';
        default: return 'info' as const;
      }
    }, []);

    const positionStatusIcon = useCallback((status: TeamPosition['status']) => {
      switch (status) {
        case 'open': return <Clock size={11} />;
        case 'filled': return <CheckCircle2 size={11} />;
        case 'closed': return <XCircle size={11} />;
        default: return <Clock size={11} />;
      }
    }, []);

    const openCount = useMemo(() => positions.filter((p) => p.status === 'open').length, [positions]);
    const filledCount = useMemo(() => positions.filter((p) => p.status === 'filled').length, [positions]);

    /* -- Loading --------------------------------------------------- */
    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading team details...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], width: '100%', ...style }}>
        {/* ---- Team Header ----------------------------------------- */}
        <Box style={{ ...card }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 52, color: t.colors.primaryScale[100] }),
              color: t.colors.primaryScale[700],
            }}>
              <Users size={24} />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing }}>
                {teamName}
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginTop: t.spacing[1] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Building2 size={13} style={{ color: t.colors.neutral[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{department}</Text>
                </Box>
                <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} />
                  <Text style={{ fontSize: 'inherit' }}>{members.length} members</Text>
                </Box>
                <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Briefcase size={11} />
                  <Text style={{ fontSize: 'inherit' }}>{openCount} open</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ---- Performance Metrics --------------------------------- */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: t.spacing[4] }}>
          {metrics.map((metric, idx) => {
            const pct = metric.target > 0 ? Math.min((metric.value / metric.target) * 100, 100) : 0;
            const color = pct >= 90 ? t.colors.successScale[500] : pct >= 70 ? t.colors.primaryScale[500] : pct >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];
            const bar = createProgressBarStyle(t, { color, percent: pct });
            const entrance = createEntranceAnimation(t, { index: idx });

            return (
              <Box key={metric.label} style={{ ...card, ...entrance.animate, display: 'flex', flexDirection: 'column' as const }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                  <Target size={14} style={{ color: t.colors.primaryScale[500] }} />
                  <Text style={{ ...sectionHdr, marginBottom: 0 }}>{metric.label}</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{metric.value}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>/ {metric.target}</Text>
                </Box>
                <Box style={bar.track}>
                  <Box style={bar.fill} />
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ---- Two Column: Members + Positions --------------------- */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[5] }}>
          {/* Members Table */}
          <Box style={{ ...card }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Box style={{ color: t.colors.primaryScale[500] }}>
                <Users size={16} />
              </Box>
              <Text style={{ ...sectionHdr, marginBottom: 0 }}>Team Members</Text>
            </Box>

            {/* Header row */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: t.borderRadius.md,
              marginBottom: t.spacing[2],
            }}>
              {['Member', 'Role', 'Hire Date'].map((col) => (
                <Text key={col} style={{ ...sectionHdr, marginBottom: 0 }}>{col}</Text>
              ))}
            </Box>

            {members.map((member, idx) => {
              const entrance = createEntranceAnimation(t, { index: idx });
              return (
                <Box
                  key={member.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View member ${member.name}`}
                  onClick={() => handleMemberClick(member.id)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMemberClick(member.id); }
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                    width: '100%',
                    ...entrance.animate,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      ...createIconContainerStyle(t, { size: 28, color: t.colors.secondaryScale[100] }),
                      color: t.colors.secondaryScale[700],
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{member.avatarInitial}</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                      {member.name}
                    </Text>
                  </Box>
                  <Box>
                    <Box style={{ ...createBadgeStyle(t, member.role.includes('Lead') ? 'primary' : member.role.includes('Sr') ? 'success' : 'info'), borderRadius: badgeR }}>
                      <Text style={{ fontSize: 'inherit' }}>{member.role}</Text>
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Calendar size={11} style={{ color: t.colors.neutral[400] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{member.hireDate}</Text>
                  </Box>
                </Box>
              );
            })}

            {members.length === 0 && (
              <Box style={emptyStyle}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No members yet.</Text>
              </Box>
            )}
          </Box>

          {/* Positions List */}
          <Box style={{ ...card }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Box style={{ color: t.colors.primaryScale[500] }}>
                  <Briefcase size={16} />
                </Box>
                <Text style={{ ...sectionHdr, marginBottom: 0 }}>Positions</Text>
              </Box>
              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR }}>
                  <Text style={{ fontSize: 'inherit' }}>{openCount} open</Text>
                </Box>
                <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeR }}>
                  <Text style={{ fontSize: 'inherit' }}>{filledCount} filled</Text>
                </Box>
              </Box>
            </Box>

            {positions.map((position, idx) => {
              const entrance = createEntranceAnimation(t, { index: idx });
              return (
                <Box
                  key={position.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View position ${position.title}`}
                  onClick={() => handlePositionClick(position.id)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePositionClick(position.id); }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
                    borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                    cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                    width: '100%',
                    ...entrance.animate,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], display: 'block' }}>
                      {position.title}
                    </Text>
                    {position.assignee && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                        <UserCircle size={11} style={{ color: t.colors.neutral[400] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{position.assignee}</Text>
                      </Box>
                    )}
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ ...createBadgeStyle(t, positionStatusBadge(position.status) as any), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {positionStatusIcon(position.status)}
                      <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{position.status}</Text>
                    </Box>
                    <ChevronRight size={14} style={{ color: t.colors.neutral[400] }} />
                  </Box>
                </Box>
              );
            })}

            {positions.length === 0 && (
              <Box style={emptyStyle}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No positions assigned.</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
