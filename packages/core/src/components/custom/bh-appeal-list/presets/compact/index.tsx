'use client';

/**
 * BhAppealList - Compact Preset
 * Condensed appeal list for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Scale, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,
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
    case 'under-review': return 'Review';
    case 'approved': return 'Approved';
    case 'denied': return 'Denied';
    default: return 'Pending';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_APPEALS: AppealListItem[] = [
  { id: 'a-1', candidateName: 'Sarah Johnson', positionTitle: 'Senior Frontend Engineer', status: 'pending', submittedAt: new Date(Date.now() - 3600000), priority: 'high' },
  { id: 'a-2', candidateName: 'Michael Chen', positionTitle: 'Staff Backend Developer', status: 'under-review', submittedAt: new Date(Date.now() - 86400000), priority: 'medium' },
  { id: 'a-3', candidateName: 'Emily Rodriguez', positionTitle: 'Data Scientist', status: 'approved', submittedAt: new Date(Date.now() - 172800000), priority: 'low' },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhAppealList = createPreset<BhAppealListProps>({
  name: 'BhAppealList.Compact',
  render: (ctx: PresetContext<BhAppealListProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      appeals = [],
      onAppealClick,
      selectedAppealId,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onAppealClick?.(id);
    }, [onAppealClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const pendingCount = useMemo(() => appeals.filter((a) => a.status === 'pending' || a.status === 'under-review').length, [appeals]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Scale size={16} color={t.colors.warningScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Appeals
            </Text>
          </Box>
          {pendingCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'warning'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{pendingCount}</Text>
            </Box>
          )}
        </Box>

        {/* List */}
        <Box role="list" aria-label="Appeals">
          {appeals.slice(0, 5).map((appeal) => {
            const appealId = appeal.id ?? '';
            const isSelected = selectedAppealId === appealId;
            return (
              <Box
                key={appealId}
                role="listitem"
                tabIndex={0}
                aria-label={`${appeal.candidateName ?? ''}: ${getStatusLabel(appeal.status)}`}
                onClick={() => handleClick(appealId)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(appealId); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {appeal.candidateName}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {appeal.positionTitle ?? ''} {formatDistanceToNow(appeal.submittedAt ?? new Date(), { addSuffix: true })}
                  </Text>
                </Box>
                <Box style={{
                  ...createBadgeStyle(t, getStatusBadgeKey(appeal.status)),
                  borderRadius: badgeRadius,
                  padding: `0px ${t.spacing[1]}px`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(appeal.status)}</Text>
                </Box>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
          {appeals.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No appeals
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
