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
import type { BhPositionListProps, RecruiterPosition } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_POSITIONS: RecruiterPosition[] = [
  { id: 'pl-1', tenantId: 't', clientId: 'c1', code: 'FE-01', title: 'Senior Frontend Engineer', status: 'open', priority: 'high', openings: 1, filledCount: 0, createdAt: new Date(Date.now() - 12 * 86400000) } as any,
  { id: 'pl-2', tenantId: 't', clientId: 'c2', code: 'PM-01', title: 'Product Manager', status: 'open', priority: 'normal', openings: 1, filledCount: 0, createdAt: new Date(Date.now() - 25 * 86400000) } as any,
  { id: 'pl-3', tenantId: 't', clientId: 'c3', code: 'UX-01', title: 'UX Designer', status: 'on_hold', priority: 'low', openings: 1, filledCount: 0, createdAt: new Date(Date.now() - 45 * 86400000) } as any,
  { id: 'pl-4', tenantId: 't', clientId: 'c1', code: 'BE-01', title: 'Backend Developer', status: 'open', priority: 'high', openings: 2, filledCount: 0, createdAt: new Date(Date.now() - 5 * 86400000) } as any,
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDaysOpen(position: RecruiterPosition): number {
  const created = position.createdAt ? new Date(position.createdAt as any) : new Date();
  return Math.floor((Date.now() - created.getTime()) / 86400000);
}

function getStatusConfig(status: string | null | undefined, t: DesignTokens) {
  switch (status) {
    case 'open': return { label: 'Open', badge: 'success' as const };
    case 'filled': return { label: 'Filled', badge: 'info' as const };
    case 'closed':
    case 'cancelled':
    case 'archived': return { label: 'Closed', badge: 'secondary' as const };
    case 'on_hold': return { label: 'On Hold', badge: 'warning' as const };
    default: return { label: status ?? 'Draft', badge: 'secondary' as const };
  }
}

function getPriorityColor(priority: string | null | undefined, t: DesignTokens): string {
  switch (priority) {
    case 'high':
    case 'urgent':
    case 'critical': return t.colors.errorScale[500];
    case 'normal': return t.colors.warningScale[500];
    case 'low':
    default: return t.colors.neutral[400];
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
                aria-label={`${pos.title ?? ''}`}
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
                    {pos.title ?? ''}
                  </Text>
                  <Box style={{ ...createBadgeStyle(t, statusCfg.badge), borderRadius: badgeRadius }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{statusCfg.label}</Text>
                  </Box>
                </Box>

                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                    {pos.code ?? ''}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {pos.clientId ?? ''}
                  </Text>
                </Box>

                {(() => {
                  const daysOpen = getDaysOpen(pos);
                  return (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Users size={11} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{pos.openings ?? 0}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[600] }}>{daysOpen}d</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={11} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{pos.filledCount ?? 0}/{pos.openings ?? 0}</Text>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
