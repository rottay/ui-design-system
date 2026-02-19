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
  createStaggerDelay,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createDividerStyle,
} from '../../../helpers';
import type { BhTeamListProps, RecruiterTeam } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getTeamMembers(team: RecruiterTeam): Array<{ id: string; name: string; role: string; avatarInitial: string }> {
  const members = team.members as Array<Record<string, any>> | null;
  if (!Array.isArray(members)) return [];
  return members.map((m: any, i) => ({
    id: m.id ?? '',
    name: m.name ?? '',
    role: m.role ?? 'member',
    avatarInitial: (m.name ?? '').charAt(0).toUpperCase(),
  }));
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

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
      filterStatus,
      filterType,
      loading,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : [];

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[5] }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const handleTeamClick = useCallback(
      (teamId: string) => {
        onTeamClick?.(teamId);
      },
      [onTeamClick],
    );

    /* -- Loading State --------------------------------------------- */
    if (loading) {
      const divider = useMemo(() => createDividerStyle(t), [t]);
      const isGlass = t.surface.useGlass;

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
          {(filterStatus || filterType) && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginLeft: t.spacing[2] }}>
              {filterStatus && (
                <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Status: {filterStatus}</Text>
                </Box>
              )}
              {filterType && (
                <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Type: {filterType}</Text>
                </Box>
              )}
            </Box>
          )}
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
                  ...animStyle(idx),
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
                      {(team.name || '').charAt(0)}
                    </Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                      {team.name}
                    </Text>
                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                      <Building2 size={11} style={{ color: t.colors.neutral[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>{team.type ?? 'general'}</Text>
                    </Box>
                  </Box>
                </Box>

                {/* Member avatars */}
                {(() => {
                  const memberDisplay = getTeamMembers(team);
                  const memberCount = team.activeMemberCount ?? 0;
                  return (
                    <Box style={{ display: 'flex', alignItems: 'center', marginBottom: t.spacing[4] }}>
                      {memberDisplay.slice(0, 4).map((member, mIdx) => (
                        <Box
                          key={member.id}
                          style={{
                            ...animStyle(mIdx),
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
                      {memberCount > 4 && (
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
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold }}>+{memberCount - 4}</Text>
                        </Box>
                      )}
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>
                        {memberCount} members
                      </Text>
                    </Box>
                  );
                })()}

                {/* Stats row */}
                <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                  <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Users size={11} />
                    <Text style={{ fontSize: 'inherit' }}>{team.activeMemberCount ?? 0}</Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, (team.currentActivePositions ?? 0) > 8 ? 'warning' : 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Briefcase size={11} />
                    <Text style={{ fontSize: 'inherit' }}>{team.currentActivePositions ?? 0} open</Text>
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
