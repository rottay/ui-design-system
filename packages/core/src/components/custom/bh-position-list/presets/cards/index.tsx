'use client';

/**
 * BhPositionList - Cards Preset
 * Grid card view of positions with status and priority.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Briefcase, Users, Clock, User, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhPositionListProps, PositionListItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_POSITIONS: PositionListItem[] = [
  { id: 'pl-1', title: 'Senior Frontend Engineer', clientName: 'Acme Corp', department: 'Engineering', status: 'open', priority: 'high', candidates: 15, daysOpen: 12, assignee: 'Sarah Kim' },
  { id: 'pl-2', title: 'Product Manager', clientName: 'Horizon Labs', department: 'Product', status: 'open', priority: 'medium', candidates: 8, daysOpen: 25, assignee: 'Tom Walsh' },
  { id: 'pl-3', title: 'UX Designer', clientName: 'Nova Ventures', department: 'Design', status: 'on-hold', priority: 'low', candidates: 3, daysOpen: 45, assignee: 'Emily Chen' },
  { id: 'pl-4', title: 'Backend Developer', clientName: 'Acme Corp', department: 'Engineering', status: 'open', priority: 'high', candidates: 22, daysOpen: 5, assignee: 'Sarah Kim' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: PositionListItem['status'], t: DesignTokens) {
  switch (status) {
    case 'open': return { label: 'Open', badge: 'success' as const };
    case 'filled': return { label: 'Filled', badge: 'info' as const };
    case 'closed': return { label: 'Closed', badge: 'secondary' as const };
    case 'on-hold': return { label: 'On Hold', badge: 'warning' as const };
  }
}

function getPriorityColor(priority: PositionListItem['priority'], t: DesignTokens): string {
  switch (priority) {
    case 'high': return t.colors.errorScale[500];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.neutral[400];
  }
}

/* ================================================================== */
/*  Cards Preset                                                       */
/* ================================================================== */

export const CardsBhPositionList = createPreset<BhPositionListProps>({
  name: 'BhPositionList.Cards',
  render: (ctx: PresetContext<BhPositionListProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      positions = MOCK_POSITIONS,
      onPositionClick,
      selectedPositionId,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const handleClick = useCallback((id: string) => {
      onPositionClick?.(id);
    }, [onPositionClick]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], width: '100%', ...style }}>
        {positions.length === 0 && (
          <Box style={{ ...card, ...createEmptyStateStyle(t) }}>
            <Briefcase size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              No positions found
            </Text>
          </Box>
        )}

        <Box
          role="list"
          aria-label="Positions grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: t.spacing[4],
          }}
        >
          {positions.map((pos, idx) => {
            const statusCfg = getStatusConfig(pos.status, t);
            const priorityColor = getPriorityColor(pos.priority, t);
            const isSelected = selectedPositionId === pos.id;
            const isHovered = hoveredId === pos.id;

            return (
              <Box
                key={pos.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${pos.title} at ${pos.clientName}`}
                onClick={() => handleClick(pos.id)}
                onMouseEnter={() => setHoveredId(pos.id)}
                onMouseLeave={() => setHoveredId(null)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(pos.id); } }}
                style={{
                  ...card,
                  ...animStyle(idx),
                  ...hoverStyles.base,
                  padding: t.spacing[4],
                  borderLeft: `3px solid ${priorityColor}`,
                  borderColor: isSelected ? t.colors.primaryScale[300] : undefined,
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : isHovered ? t.colors.neutral[50] : t.colors.common.white,
                  cursor: 'pointer',
                  ...(isHovered ? hoverStyles.hover : {}),
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[900],
                  }}>
                    {pos.title}
                  </Text>
                  <Box style={{ ...createBadgeStyle(t, statusCfg.badge), borderRadius: badgeRadius }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{statusCfg.label}</Text>
                  </Box>
                </Box>

                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                    {pos.clientName}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {pos.department}
                  </Text>
                </Box>

                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Users size={11} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{pos.candidates}</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: pos.daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[600] }}>{pos.daysOpen}d</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <User size={11} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{pos.assignee}</Text>
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
