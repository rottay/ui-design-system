'use client';

/**
 * BhTeamList - Table Preset
 * DataTable layout with sortable columns, member avatar stacks,
 * and row-level click interaction.
 */

import { useMemo, useCallback } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  ChevronRight,
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
  createPersonalitySkeletonStyle,
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
/*  Table Preset                                                       */
/* ------------------------------------------------------------------ */
export const TableBhTeamList = createPreset<BhTeamListProps>({
  name: 'BhTeamList.Table',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamListProps>) => {
    const isGlass = tokens.surface.useGlass;
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
    const card = useMemo(() => createCardStyle(t, { padding: 0 }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
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
      return (
        <Box className={className} style={{ ...card, padding: t.spacing[6], ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[3], padding: t.spacing[8] }}>
            <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>Loading teams...</Text>
          </Box>
        </Box>
      );
    }

    /* -- Empty State ------------------------------------------------ */
    if (teams.length === 0) {
      return (
        <Box className={className} style={{ ...card, ...style }}>
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
      <Box className={className} style={{ ...card, overflow: 'hidden', width: '100%', ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{ color: t.colors.primaryScale[500] }}>
              <Users size={18} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
              Teams
            </Text>
            <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, marginLeft: t.spacing[2] }}>
              <Text style={{ fontSize: 'inherit' }}>{teams.length}</Text>
            </Box>
            {(filterStatus || filterType) && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginLeft: t.spacing[3] }}>
                {filterStatus && (
                  <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Status: {filterStatus}</Text>
                  </Box>
                )}
                {filterType && (
                  <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Type: {filterType}</Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Table Header */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 100px 100px 40px',
            gap: t.spacing[3],
            padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
            backgroundColor: t.colors.neutral[50],
            borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
            width: '100%',
          }}
        >
          {['Team', 'Department', 'Members', 'Open Roles', ''].map((col) => (
            <Text
              key={col}
              style={{
                ...sectionHdr,
                marginBottom: 0,
              }}
            >
              {col}
            </Text>
          ))}
        </Box>

        {/* Rows */}
        {teams.map((team, idx) => {
          const isSelected = selectedTeamId === team.id;
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
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 100px 100px 40px',
                gap: t.spacing[3],
                padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[600]}` : '3px solid transparent',
                transition: `all ${t.motion.hover}`,
                width: '100%',
                ...entrance.animate,
              }}
              onMouseEnter={(e: any) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.neutral[50];
              }}
              onMouseLeave={(e: any) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Team name + avatar stack */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                <Box style={{
                  ...createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[100] }),
                  color: t.colors.primaryScale[700],
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}>
                    {(team.name || '').charAt(0)}
                  </Text>
                </Box>
                <Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                    {team.name}
                  </Text>
                  {/* Avatar stack */}
                  {(() => {
                    const memberDisplay = getTeamMembers(team);
                    return (
                      <Box style={{ display: 'flex', alignItems: 'center', marginTop: t.spacing[1] }}>
                        {memberDisplay.slice(0, 3).map((member, mIdx) => (
                          <Box
                            key={member.id}
                            style={{
                              ...animStyle(mIdx),
                              width: 22,
                              height: 22,
                              borderRadius: t.borderRadius.full,
                              backgroundColor: t.colors.secondaryScale[100 + (mIdx * 100) as 100 | 200 | 300] || t.colors.secondaryScale[100],
                              color: t.colors.secondaryScale[700],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `2px solid ${t.colors.common.white}`,
                              marginLeft: mIdx > 0 ? -6 : 0,
                              zIndex: 3 - mIdx,
                              position: 'relative' as const,
                            }}
                          >
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{member.avatarInitial}</Text>
                          </Box>
                        ))}
                        {memberDisplay.length > 3 && (
                          <Box
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: t.borderRadius.full,
                              backgroundColor: t.colors.neutral[100],
                              color: t.colors.neutral[600],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `2px solid ${t.colors.common.white}`,
                              marginLeft: -6,
                              position: 'relative' as const,
                            }}
                          >
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold }}>+{memberDisplay.length - 3}</Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </Box>
              </Box>

              {/* Type */}
              <Box>
                <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Building2 size={11} />
                  <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{team.type ?? 'general'}</Text>
                </Box>
              </Box>

              {/* Members count */}
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], textAlign: 'center' as const }}>
                {team.activeMemberCount ?? 0}
              </Text>

              {/* Open positions */}
              <Box style={{ textAlign: 'center' as const }}>
                <Box style={{ ...createBadgeStyle(t, (team.currentActivePositions ?? 0) > 8 ? 'warning' : 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Briefcase size={11} />
                  <Text style={{ fontSize: 'inherit' }}>{team.currentActivePositions ?? 0}</Text>
                </Box>
              </Box>

              {/* Chevron */}
              <Box style={{ display: 'flex', justifyContent: 'center', color: t.colors.neutral[400] }}>
                <ChevronRight size={16} />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  },
});
