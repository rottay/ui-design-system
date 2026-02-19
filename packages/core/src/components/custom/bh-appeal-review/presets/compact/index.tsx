'use client';

/**
 * BhAppealReview - Compact Preset
 * Condensed appeal review card for sidebar or list view.
 */

import { useMemo, useCallback} from 'react';
import {
  Scale, CheckCircle, XCircle, User, Clock,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhAppealReviewProps, AppealData } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusBadgeKey(status: AppealData['status']): 'warning' | 'info' | 'success' | 'error' {
  switch (status) {
    case 'pending': return 'warning';
    case 'under-review': return 'info';
    case 'approved': return 'success';
    case 'denied': return 'error';
    default: return 'warning';
  }
}

function getStatusLabel(status: AppealData['status']): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'under-review': return 'Under Review';
    case 'approved': return 'Approved';
    case 'denied': return 'Denied';
    default: return 'Pending';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhAppealReview = createPreset<BhAppealReviewProps>({
  name: 'BhAppealReview.Compact',
  render: (ctx: PresetContext<BhAppealReviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      appeal: rawAppeal = {} as Partial<AppealData>,
      onApprove,
      onDeny,
      className,
      style,
    } = props;

    const appeal = rawAppeal as Partial<AppealData>;

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleApprove = useCallback(() => { onApprove?.(); }, [onApprove]);
    const handleDeny = useCallback(() => { onDeny?.(); }, [onDeny]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const isPending = appeal.status === 'pending' || appeal.status === 'under-review';

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
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
            <Scale size={16} color={t.colors.infoScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Review
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, getStatusBadgeKey(appeal.status)),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(appeal.status)}</Text>
          </Box>
        </Box>

        {/* Info */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
            <User size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
              {appeal.candidateName}
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[2] }}>
            {appeal.positionTitle}
          </Text>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[600],
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {appeal.reason}
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[2] }}>
            <Clock size={10} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {formatDistanceToNow(appeal.submittedAt ?? new Date(), { addSuffix: true })}
            </Text>
          </Box>
        </Box>

        {/* Actions */}
        {isPending && (
          <Box style={{
            display: 'flex',
            gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          }}>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Deny appeal"
              onClick={handleDeny}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDeny(); } }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                border: `1px solid ${t.colors.errorScale[200]}`,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                color: t.colors.errorScale[600],
                backgroundColor: t.colors.common.white,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <XCircle size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600] }}>Deny</Text>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Approve appeal"
              onClick={handleApprove}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleApprove(); } }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                backgroundColor: t.colors.successScale[600],
                color: t.colors.common.white,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <CheckCircle size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>Approve</Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
