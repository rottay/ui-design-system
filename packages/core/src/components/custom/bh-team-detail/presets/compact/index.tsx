'use client';

/**
 * BhTeamDetail - Compact Preset
 * Condensed team detail with inline member list and summary position counts.
 */

import { useMemo, useCallback } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Target,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createProgressBarStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhTeamDetailProps, TeamPosition } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhTeamDetail = createPreset<BhTeamDetailProps>({
  name: 'BhTeamDetail.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamDetailProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      team,
      members: membersProp,
      positions: positionsProp,
      metrics: metricsProp,
      onMemberClick,
      onPositionClick,
      loading,
      className,
      style,
    } = props;

    const teamName = team?.name ?? 'Engineering Hiring';
    const teamType = team?.type ?? 'general';

    const members = membersProp?.length ? membersProp : [];
    const positions = positionsProp?.length ? positionsProp : [];
    const metrics = metricsProp?.length ? metricsProp : [];

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 20 }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);

    const handleMemberClick = useCallback((memberId: string) => { onMemberClick?.(memberId); }, [onMemberClick]);
    const handlePositionClick = useCallback((positionId: string) => { onPositionClick?.(positionId); }, [onPositionClick]);

    const openCount = useMemo(() => positions.filter((p) => p.status === 'open').length, [positions]);
    const filledCount = useMemo(() => positions.filter((p) => p.status === 'filled').length, [positions]);
    const closedCount = useMemo(() => positions.filter((p) => p.status === 'closed').length, [positions]);

    if (loading) {
      return (
        <Box className={className} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
          <Loader2 size={18} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...card, width: '100%', ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
          <Box style={{
            ...createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[100] }),
            color: t.colors.primaryScale[700],
          }}>
            <Users size={18} />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing }}>
              {teamName}
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
              <Building2 size={11} style={{ color: t.colors.neutral[400] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>{teamType}</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR }}>
              <Text style={{ fontSize: 'inherit' }}>{members.length} members</Text>
            </Box>
          </Box>
        </Box>

        {/* Metrics row */}
        <Box style={{ display: 'flex', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
          {metrics.slice(0, 3).map((metric) => {
            const pct = metric.target > 0 ? Math.min((metric.value / metric.target) * 100, 100) : 0;
            const color = pct >= 90 ? t.colors.successScale[500] : pct >= 70 ? t.colors.primaryScale[500] : t.colors.warningScale[500];
            const bar = createProgressBarStyle(t, { color, percent: pct });

            return (
              <Box key={metric.label} style={{ flex: 1 }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{metric.label}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{metric.value}/{metric.target}</Text>
                </Box>
                <Box style={{ ...bar.track, height: 4 }}>
                  <Box style={bar.fill} />
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Members inline */}
        <Box style={{ marginBottom: t.spacing[4] }}>
          <Text style={{ ...sectionHdr }}>Members</Text>
          <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2] }}>
            {members.map((member) => (
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.neutral[50],
                  border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `background-color ${t.motion.hover}`,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.primaryScale[50]; }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
              >
                <Box style={{
                  ...createIconContainerStyle(t, { size: 22, color: t.colors.secondaryScale[100] }),
                  color: t.colors.secondaryScale[700],
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{member.avatarInitial}</Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                  {member.name}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Positions summary */}
        <Box>
          <Text style={{ ...sectionHdr }}>Positions</Text>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              <Text style={{ fontSize: 'inherit' }}>{openCount} open</Text>
            </Box>
            <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} />
              <Text style={{ fontSize: 'inherit' }}>{filledCount} filled</Text>
            </Box>
            <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <XCircle size={11} />
              <Text style={{ fontSize: 'inherit' }}>{closedCount} closed</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
