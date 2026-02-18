'use client';

/**
 * BhAppealReview - Review Preset
 * Full appeal review panel with appeal details, evidence,
 * reviewer notes, and approve/deny actions.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Scale, User, Briefcase, FileText, Clock,
  CheckCircle, XCircle, X, MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  formatDistanceToNow,
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
/*  Review Preset                                                      */
/* ================================================================== */

export const ReviewBhAppealReview = createPreset<BhAppealReviewProps>({
  name: 'BhAppealReview.Review',
  render: (ctx: PresetContext<BhAppealReviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      appeal: rawAppeal = {} as Partial<AppealData>,
      onApprove,
      onDeny,
      onAddNote,
      onClose,
      loading,
      className,
      style,
    } = props;

    const appeal = rawAppeal as Partial<AppealData>;

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleApprove = useCallback(() => { onApprove?.(); }, [onApprove]);
    const handleDeny = useCallback(() => { onDeny?.(); }, [onDeny]);
    const handleClose = useCallback(() => { onClose?.(); }, [onClose]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const isPending = appeal.status === 'pending' || appeal.status === 'under-review';

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
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.infoScale[50] })}>
                <Scale size={22} color={t.colors.infoScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Appeal Review
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{
                    ...createBadgeStyle(t, getStatusBadgeKey(appeal.status)),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(appeal.status)}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {formatDistanceToNow(appeal.submittedAt ?? new Date(), { addSuffix: true })}
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Close review panel"
              onClick={handleClose}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClose(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <X size={18} color={t.colors.neutral[500]} />
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          <Box style={{ ...card, ...animStyle, ...accentLayout.outer }}>
            {accentBar && <Box style={accentBar} />}
            <Box style={accentLayout.inner}>

            {/* Appeal Info */}
            <Box style={{ marginBottom: t.spacing[6] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Appeal Details</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <User size={16} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                    {appeal.candidateName}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Briefcase size={16} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                    {appeal.positionTitle}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <AlertCircle size={16} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                    Original Decision: {appeal.originalDecision}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Clock size={16} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                    Submitted {formatDistanceToNow(appeal.submittedAt ?? new Date(), { addSuffix: true })}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Reason */}
            <Box style={{ marginBottom: t.spacing[6] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>Reason</Text>
              <Box style={{
                padding: t.spacing[4],
                backgroundColor: t.colors.neutral[50],
                borderRadius: t.borderRadius.md,
                borderLeft: `3px solid ${t.colors.warningScale[400]}`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.6 }}>
                  {appeal.reason}
                </Text>
              </Box>
            </Box>

            {/* Evidence */}
            <Box style={{ marginBottom: t.spacing[6] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>Evidence</Text>
              <Box style={{
                padding: t.spacing[4],
                backgroundColor: t.colors.neutral[50],
                borderRadius: t.borderRadius.md,
                borderLeft: `3px solid ${t.colors.infoScale[400]}`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.6 }}>
                  {appeal.evidence}
                </Text>
              </Box>
            </Box>

            {/* Reviewer Notes */}
            {appeal.reviewerNotes && (
              <Box style={{ marginBottom: t.spacing[6] }}>
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>Reviewer Notes</Text>
                <Box style={{
                  padding: t.spacing[4],
                  backgroundColor: t.colors.primaryScale[50],
                  borderRadius: t.borderRadius.md,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: t.spacing[2],
                }}>
                  <MessageSquare size={14} color={t.colors.primaryScale[600]} style={{ marginTop: t.spacing[1], flexShrink: 0 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.6 }}>
                    {appeal.reviewerNotes}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Actions */}
            {isPending && (
              <Box style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: t.spacing[3],
                paddingTop: t.spacing[4],
                borderTop: `1px solid ${t.colors.neutral[100]}`,
              }}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Deny appeal"
                  onClick={handleDeny}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDeny(); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    backgroundColor: t.colors.common.white,
                    color: t.colors.errorScale[600],
                    border: `1px solid ${t.colors.errorScale[200]}`,
                    borderRadius: t.borderRadius.md,
                    cursor: 'pointer',
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <XCircle size={16} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.errorScale[600] }}>Deny</Text>
                </Box>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Approve appeal"
                  onClick={handleApprove}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleApprove(); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    backgroundColor: t.colors.successScale[600],
                    color: t.colors.common.white,
                    borderRadius: t.borderRadius.md,
                    cursor: 'pointer',
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <CheckCircle size={16} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Approve</Text>
                </Box>
              </Box>
            )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
