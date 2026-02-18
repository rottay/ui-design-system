'use client';

/**
 * BhApprovalCenter - Compact Preset
 * Condensed approval list for sidebar/widget usage.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Shield, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { BhApprovalCenterProps, ApprovalItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriorityColor(priority: ApprovalItem['priority'] | undefined, t: DesignTokens): string {
  switch (priority) {
    case 'high': return t.colors.errorScale[500];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.neutral[400];
    default: return t.colors.neutral[400];
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhApprovalCenter = createPreset<BhApprovalCenterProps>({
  name: 'BhApprovalCenter.Compact',
  render: (ctx: PresetContext<BhApprovalCenterProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      approvals: rawApprovals = [],
      onApprovalClick,
      className,
      style,
    } = props;

    const approvals = Array.isArray(rawApprovals) ? rawApprovals : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const pendingItems = useMemo(
      () => approvals.filter(a => a.status === 'pending'),
      [approvals],
    );

    const highPriorityCount = useMemo(
      () => pendingItems.filter(a => a.priority === 'high').length,
      [pendingItems],
    );

    const handleClick = useCallback((id: string) => {
      onApprovalClick?.(id);
    }, [onApprovalClick]);

    return (
      <Box
        className={className}
        style={{ ...card, ...animStyle, padding: 0, overflow: 'hidden', ...style }}
      >
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Shield size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Approvals
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {highPriorityCount > 0 && (
              <Box style={{
                ...createBadgeStyle(t, 'error'),
                borderRadius: badgeRadius,
                padding: `1px ${t.spacing[2]}px`,
              }}>
                <AlertTriangle size={10} style={{ marginRight: t.spacing[1] }} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{highPriorityCount}</Text>
              </Box>
            )}
            <Box style={{
              ...createBadgeStyle(t, 'warning'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{pendingItems.length}</Text>
            </Box>
          </Box>
        </Box>

        <Box role="list" aria-label="Pending approvals">
          {pendingItems.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No pending approvals</Text>
            </Box>
          )}
          {pendingItems.map((approval) => {
            const priorityColor = getPriorityColor(approval.priority, t);

            return (
              <Box
                key={approval.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${approval.entityTitle}, ${approval.priority} priority`}
                onClick={() => handleClick(approval.id ?? '')}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(approval.id ?? ''); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: `2px solid ${priorityColor}`,
                  cursor: 'pointer',
                  backgroundColor: t.colors.common.white,
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
                    {approval.entityTitle ?? ''}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {approval.entityType ?? ''} - {approval.requestedAt ? formatDistanceToNow(approval.requestedAt, { addSuffix: true }) : ''}
                  </Text>
                </Box>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
