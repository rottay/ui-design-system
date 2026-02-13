'use client';

/**
 * BhTeamList - Cards Preset
 * Card-based grid layout with team summary tiles, member avatars,
 * and visual indicators for open positions.
 */

import { useMemo, useCallback } from 'react';
import {
  Users,
  Briefcase,
  Building2,
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
  createEmptyStateStyle,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhTeamListProps, TeamSummary } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_TEAMS: TeamSummary[] = [
  {
    id: 't1',
    name: 'Engineering Hiring',
    memberCount: 6,
    members: [
      { id: 'm1', name: 'Sofia Martinez', role: 'Team Lead', avatarInitial: 'S' },
      { id: 'm2', name: 'Alex Kim', role: 'Sr. Recruiter', avatarInitial: 'A' },
      { id: 'm3', name: 'Rachel Green', role: 'Recruiter', avatarInitial: 'R' },
    ],
    openPositions: 12,
    department: 'Engineering',
  },
  {
    id: 't2',
    name: 'Product & Design',
    memberCount: 4,
    members: [
      { id: 'm4', name: 'James Chen', role: 'Team Lead', avatarInitial: 'J' },
      { id: 'm5', name: 'Priya Sharma', role: 'Recruiter', avatarInitial: 'P' },
    ],
    openPositions: 8,
    department: 'Product',
  },
  {
    id: 't3',
    name: 'GTM Recruiting',
    memberCount: 5,
    members: [
      { id: 'm6', name: 'Marcus Williams', role: 'Team Lead', avatarInitial: 'M' },
      { id: 'm7', name: 'Aisha Okafor', role: 'Sr. Recruiter', avatarInitial: 'A' },
      { id: 'm8', name: 'Liam O\'Brien', role: 'Recruiter', avatarInitial: 'L' },
    ],
    openPositions: 10,
    department: 'Sales',
  },
  {
    id: 't4',
    name: 'Executive Search',
    memberCount: 3,
    members: [
      { id: 'm9', name: 'Nina Patel', role: 'Team Lead', avatarInitial: 'N' },
      { id: 'm10', name: 'Dave Johnson', role: 'Recruiter', avatarInitial: 'D' },
    ],
    openPositions: 4,
    department: 'Executive',
  },
];

/* ------------------------------------------------------------------ */
/*  Cards Preset                                                       */
/* ------------------------------------------------------------------ */
export const CardsBhTeamList = createPreset<BhTeamListProps>({
  name: 'BhTeamList.Cards',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamListProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teams: teamsProp,
      onTeamClick,
      selectedTeamId,
      loading,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : MOCK_TEAMS;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 20 }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);

    const handleTeamClick = useCallback(
      (teamId: string) => {
        onTeamClick?.(teamId);
      },
      [onTeamClick],
    );

    /* -- Loading State --------------------------------------------- */
    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading teams...</Text>
        </Box>
      );
    }

    /* -- Empty State ------------------------------------------------ */
    if (teams.length === 0) {
      return (
        <Box className={className} style={style}>
          <Box style={emptyStyle}>
            <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}>
              <Users size={40} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>
              No teams found
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              Teams will appear here once created.
            </Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ width: '100%', ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
          <Box style={{ color: t.colors.primaryScale[500] }}>
            <Users size={18} />
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
            Teams
          </Text>
          <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, marginLeft: t.spacing[1] }}>
            <Text style={{ fontSize: 'inherit' }}>{teams.length}</Text>
          </Box>
        </Box>

        {/* Cards Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: t.spacing[4],
          }}
        >
          {teams.map((team, idx) => {
            const isSelected = selectedTeamId === team.id;
            const entrance = createEntranceAnimation(t, { index: idx });
            const accent = createPersonalityAccentBar(t, {
              color: isSelected ? t.colors.primaryScale[500] : t.colors.neutral[200],
            });

            return (
              <Box
                key={team.id}
                role="button"
                tabIndex={0}
                aria-label={`View team ${team.name}`}
                aria-selected={isSelected}
                onClick={() => handleTeamClick(team.id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTeamClick(team.id);
                  }
                }}
                style={{
                  ...card,
                  position: 'relative' as const,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected
                    ? `2px solid ${t.colors.primaryScale[400]}`
                    : `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : card.backgroundColor,
                  transition: `all ${t.motion.hover}`,
                  ...entrance.animate,
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

                {/* Team name + department */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
                  <Box style={{
                    ...createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[100] }),
                    color: t.colors.primaryScale[700],
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold }}>
                      {team.name.charAt(0)}
                    </Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                      {team.name}
                    </Text>
                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                      <Building2 size={11} style={{ color: t.colors.neutral[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{team.department}</Text>
                    </Box>
                  </Box>
                </Box>

                {/* Member avatars */}
                <Box style={{ display: 'flex', alignItems: 'center', marginBottom: t.spacing[4] }}>
                  {team.members.slice(0, 4).map((member, mIdx) => (
                    <Box
                      key={member.id}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: [t.colors.primaryScale[100], t.colors.successScale[100], t.colors.warningScale[100], t.colors.infoScale[100]][mIdx % 4],
                        color: [t.colors.primaryScale[700], t.colors.successScale[700], t.colors.warningScale[700], t.colors.infoScale[700]][mIdx % 4],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${t.colors.common.white}`,
                        marginLeft: mIdx > 0 ? -8 : 0,
                        zIndex: 5 - mIdx,
                        position: 'relative' as const,
                      }}
                    >
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{member.avatarInitial}</Text>
                    </Box>
                  ))}
                  {team.memberCount > 4 && (
                    <Box
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.neutral[100],
                        color: t.colors.neutral[600],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${t.colors.common.white}`,
                        marginLeft: -8,
                        position: 'relative' as const,
                      }}
                    >
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold }}>+{team.memberCount - 4}</Text>
                    </Box>
                  )}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>
                    {team.memberCount} members
                  </Text>
                </Box>

                {/* Stats row */}
                <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                  <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} />
                    <Text style={{ fontSize: 'inherit' }}>{team.memberCount}</Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, team.openPositions > 8 ? 'warning' : 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Briefcase size={11} />
                    <Text style={{ fontSize: 'inherit' }}>{team.openPositions} open</Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
