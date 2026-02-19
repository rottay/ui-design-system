'use client';

/**
 * BhAppealList - Table Preset
 * Full appeal list view with filtering, status badges,
 * priority indicators, and click-to-select interaction.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  Scale, Filter, ChevronRight, Clock,
  AlertTriangle, User, Briefcase,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createFilterPillStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,

  createPersonalityAccentBar,
  createDividerStyle,
} from '../../../helpers';
import type { BhAppealListProps, AppealListItem } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusBadgeKey(status: AppealListItem['status']): 'warning' | 'info' | 'success' | 'error' {
  switch (status) {
    case 'pending': return 'warning';
    case 'under-review': return 'info';
    case 'approved': return 'success';
    case 'denied': return 'error';
    default: return 'warning';
  }
}

function getStatusLabel(status: AppealListItem['status']): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'under-review': return 'Under Review';
    case 'approved': return 'Approved';
    case 'denied': return 'Denied';
    default: return 'Pending';
  }
}

function getPriorityBadgeKey(priority: AppealListItem['priority']): 'error' | 'warning' | 'success' {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'warning';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const FILTER_OPTIONS = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under-review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Denied', value: 'denied' },
];

/* ================================================================== */
/*  Table Preset                                                       */
/* ================================================================== */

export const TableBhAppealList = createPreset<BhAppealListProps>({
  name: 'BhAppealList.Table',
  render: (ctx: PresetContext<BhAppealListProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      appeals: rawAppeals = [],
      onAppealClick,
      selectedAppealId,
      filterStatus = null,
      onFilterChange,
      loading,
      className,
      style,
    } = props;

    const appeals = Array.isArray(rawAppeals) ? rawAppeals : [];

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onAppealClick?.(id);
    }, [onAppealClick]);

    const handleFilter = useCallback((status: string | null) => {
      onFilterChange?.(status);
    }, [onFilterChange]);

    const filteredAppeals = useMemo(() => {
      if (!filterStatus) return appeals;
      return appeals.filter(a => a.status === filterStatus);
    }, [appeals, filterStatus]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.warningScale[50] })}>
                <Scale size={22} color={t.colors.warningScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Appeals
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {filteredAppeals.length} appeal{filteredAppeals.length !== 1 ? 's' : ''}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Filters */}
          <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' }} role="tablist" aria-label="Filter appeals by status">
            {FILTER_OPTIONS.map((opt) => (
              <Box
                key={opt.label}
                role="tab"
                tabIndex={0}
                aria-selected={filterStatus === opt.value}
                aria-label={`Filter by ${opt.label}`}
                onClick={() => handleFilter(opt.value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilter(opt.value); } }}
                style={createFilterPillStyle(t, { active: filterStatus === opt.value })}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* List */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          <Box style={{ ...card, ...animStyle, padding: 0 }}>
            <Box role="list" aria-label="Appeals list">
              {filteredAppeals.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Scale size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No appeals found
                  </Text>
                </Box>
              )}
              {filteredAppeals.map((appeal, i) => {
                const appealId = appeal.id ?? '';
                const isHovered = hoveredId === appealId;
                const isSelected = selectedAppealId === appealId;

                return (
                  <Box
                    key={appealId}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${appeal.candidateName ?? ''} - ${appeal.positionTitle ?? ''}, ${getStatusLabel(appeal.status)}`}
                    onClick={() => handleClick(appealId)}
                    onMouseEnter={() => setHoveredId(appealId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(appealId); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                      padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? t.colors.primaryScale[50]
                        : isHovered
                          ? t.colors.neutral[50]
                          : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                      borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : `3px solid transparent`,
                    }}
                  >
                    <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.neutral[100] })}>
                      <User size={16} color={t.colors.neutral[500]} />
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {appeal.candidateName}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getPriorityBadgeKey(appeal.priority)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{appeal.priority}</Text>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {appeal.positionTitle}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatDistanceToNow(appeal.submittedAt ?? new Date(), { addSuffix: true })}
                        </Text>
                      </Box>
                    </Box>

                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                      <Box style={{
                        ...createBadgeStyle(t, getStatusBadgeKey(appeal.status)),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(appeal.status)}</Text>
                      </Box>
                      <ChevronRight size={14} color={t.colors.neutral[300]} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
