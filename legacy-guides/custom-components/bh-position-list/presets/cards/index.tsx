'use client';

/**
 * BhPositionList - Cards Preset
 * Grid card view of positions with status and priority.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo} from 'react';
import {
  Briefcase, Users, Clock, User, ChevronRight, Filter, ChevronDown,
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
  createPersonalityAccentBar,

  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,

  createDividerStyle,
} from '../../../helpers';
import type { BhPositionListProps, RecruiterPosition } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDaysOpen(position: RecruiterPosition): number {
  const created = position.createdAt ? new Date(String(position.createdAt)) : new Date();
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
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      positions: rawPositions = [],
      onPositionClick,
      selectedPositionId,
      statusFilterOptions,
      statusFilter: statusFilterProp,
      onStatusFilterChange,
      urgencyFilter: urgencyFilterProp,
      onUrgencyFilterChange,
      departmentFilter: departmentFilterProp,
      onDepartmentFilterChange,
      departments: departmentsProp,
      teamFilter: teamFilterProp,
      onTeamFilterChange,
      teams: teamsProp,
      className,
      style,
    } = props;

    const positions = Array.isArray(rawPositions) ? rawPositions : [];
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const handleClick = useCallback((id: string) => {
      onPositionClick?.(id);
    }, [onPositionClick]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4], width: '100%', ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Filter bar */}
        {(statusFilterOptions || departmentsProp || teamsProp || urgencyFilterProp !== undefined) && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            flexWrap: 'wrap',
          }} role="toolbar" aria-label="Position filters">
            <Filter size={13} color={t.colors.neutral[400]} />
            {statusFilterOptions && statusFilterOptions.length > 0 && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${statusFilterProp && statusFilterProp !== 'all' ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: statusFilterProp && statusFilterProp !== 'all' ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: statusFilterProp && statusFilterProp !== 'all' ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {statusFilterProp && statusFilterProp !== 'all' ? statusFilterProp.replace('_', ' ') : 'All Statuses'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by status"
                    value={statusFilterProp ?? 'all'}
                    onChange={(e: any) => onStatusFilterChange?.(e.target.value)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    {statusFilterOptions.map(s => (
                      <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            {departmentsProp && departmentsProp.length > 0 && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${departmentFilterProp ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: departmentFilterProp ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: departmentFilterProp ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {departmentFilterProp ?? 'All Departments'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by department"
                    value={departmentFilterProp ?? ''}
                    onChange={(e: any) => onDepartmentFilterChange?.(e.target.value || null)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    <option value="">All Departments</option>
                    {departmentsProp.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            {teamsProp && teamsProp.length > 0 && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${teamFilterProp ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: teamFilterProp ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: teamFilterProp ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {teamFilterProp ?? 'All Teams'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by team"
                    value={teamFilterProp ?? ''}
                    onChange={(e: any) => onTeamFilterChange?.(e.target.value || null)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    <option value="">All Teams</option>
                    {teamsProp.map(tm => (
                      <option key={tm} value={tm}>{tm}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            {urgencyFilterProp !== undefined && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${urgencyFilterProp ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: urgencyFilterProp ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: urgencyFilterProp ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {urgencyFilterProp ? `${urgencyFilterProp} urgency` : 'All Urgencies'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by urgency"
                    value={urgencyFilterProp ?? ''}
                    onChange={(e: any) => onUrgencyFilterChange?.(e.target.value || null)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    <option value="">All Urgencies</option>
                    {(['low', 'normal', 'high', 'urgent', 'critical'] as const).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
          </Box>
        )}

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
