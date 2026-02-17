'use client';

/**
 * BhApprovalDetail - Drawer Preset
 * Full approval detail panel with entity info, chain visualization,
 * attachments, comment input, and approve/reject actions.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Shield, X, CheckCircle, XCircle, Clock,
  FileText, Briefcase, DollarSign, Users,
  MessageSquare, Paperclip, Send, AlertTriangle,
  User, Calendar,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
  createPersonalitySectionHeaderStyle,
} from '../../../helpers';
import type { BhApprovalDetailProps, ApprovalDetailData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_APPROVAL: ApprovalDetailData = {
  id: 'ap-1',
  entityType: 'offer',
  entityTitle: 'Offer for Sarah Johnson - Senior Frontend Engineer',
  requestedBy: 'Tom Walsh',
  requestedAt: new Date('2026-02-10T14:30:00'),
  description: 'Offer package for Senior Frontend Engineer position at Acme Corp. Includes base salary of $180,000, signing bonus of $15,000, and standard benefits package. Candidate has 8 years of experience and is currently interviewing at two other companies.',
  priority: 'high',
  status: 'pending',
  chain: [
    { approverName: 'Sarah Kim', status: 'approved', decidedAt: new Date('2026-02-11T10:00:00') },
    { approverName: 'Tom Walsh', status: 'approved', decidedAt: new Date('2026-02-11T14:30:00') },
    { approverName: 'Lisa Park', status: 'pending' },
    { approverName: 'Mark Rivera', status: 'pending' },
  ],
  attachments: [
    { name: 'offer_letter_v2.pdf', type: 'pdf' },
    { name: 'compensation_breakdown.xlsx', type: 'spreadsheet' },
    { name: 'candidate_profile.pdf', type: 'pdf' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ENTITY_ICONS: Partial<Record<NonNullable<ApprovalDetailData['entityType']>, typeof Briefcase>> = {
  offer: FileText,
  position: Briefcase,
  budget: DollarSign,
  job: Users,
  client: Users,
  impersonation_request: FileText,
};

function getPriorityConfig(priority: ApprovalDetailData['priority'] | undefined, t: DesignTokens) {
  switch (priority) {
    case 'high': return { label: 'High', badge: 'error' as const, color: t.colors.errorScale[600] };
    case 'medium': return { label: 'Medium', badge: 'warning' as const, color: t.colors.warningScale[600] };
    case 'low':
    default: return { label: 'Low', badge: 'secondary' as const, color: t.colors.neutral[500] };
  }
}

function getStatusConfig(status: string, t: DesignTokens) {
  switch (status) {
    case 'approved': return { label: 'Approved', color: t.colors.successScale[600], icon: CheckCircle };
    case 'rejected': return { label: 'Rejected', color: t.colors.errorScale[600], icon: XCircle };
    default: return { label: 'Pending', color: t.colors.warningScale[600], icon: Clock };
  }
}

function getFileIcon(type: string) {
  return FileText;
}

/* ================================================================== */
/*  Drawer Preset                                                      */
/* ================================================================== */

export const DrawerBhApprovalDetail = createPreset<BhApprovalDetailProps>({
  name: 'BhApprovalDetail.Drawer',
  render: (ctx: PresetContext<BhApprovalDetailProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      approval: raw_approval = MOCK_APPROVAL,
      onApprove,
      onReject,
      onComment,
      onClose,
      loading = false,
      className,
      style,
    } = props;

    const _approval = Array.isArray(raw_approval) ? raw_approval : MOCK_APPROVAL;
    const approval = _approval ?? MOCK_APPROVAL;

    const [comment, setComment] = useState('');

    const card = useMemo(() => createCardStyle(t, { elevation: 'lg', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const priorityCfg = useMemo(() => getPriorityConfig(approval.priority, t), [approval.priority, t]);
    const EntityIcon = (approval.entityType ? ENTITY_ICONS[approval.entityType] : undefined) ?? FileText;
    const isPending = approval.status === 'pending';

    const handleComment = useCallback(() => {
      if (comment.trim()) {
        onComment?.(comment.trim());
        setComment('');
      }
    }, [comment, onComment]);

    const completedSteps = useMemo(
      () => (approval.chain ?? []).filter(s => s.status === 'approved').length,
      [approval.chain],
    );

    return (
      <Box
        className={className}
        style={{
          ...card,
          ...animStyle,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          ...(accentBar ? accentLayout.outer : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? { ...accentLayout.inner, display: 'flex', flexDirection: 'column' as const, height: '100%' } : {}}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          flexShrink: 0,
        }}>
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <EntityIcon size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: ptypo.headingWeight,
                    color: t.colors.neutral[900],
                    letterSpacing: ptypo.headingLetterSpacing,
                  }}>
                    {approval.entityTitle}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{
                    ...createBadgeStyle(t, priorityCfg.badge),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{priorityCfg.label}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {(approval.entityType || '').charAt(0).toUpperCase() + (approval.entityType || '').slice(1)}
                  </Text>
                </Box>
              </Box>
            </Box>
            {onClose && (
              <Box
                tabIndex={0}
                role="button"
                aria-label="Close"
                onClick={onClose}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); } }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white, cursor: 'pointer',
                }}
              >
                <X size={16} color={t.colors.neutral[500]} />
              </Box>
            )}
          </Box>
        </Box>

        {/* Scrollable body */}
        <Box style={{ flex: 1, overflowY: 'auto', padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {/* Metadata */}
          <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[5] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <User size={12} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                {approval.requestedBy ?? ''}
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Calendar size={12} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                {approval.requestedAt ? formatDistanceToNow(approval.requestedAt, { addSuffix: true }) : ''}
              </Text>
            </Box>
          </Box>

          {/* Description */}
          <Text style={{
            ...createPersonalitySectionHeaderStyle(t),
          }}>
            Description
          </Text>
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderRadius: t.borderRadius.lg,
            backgroundColor: t.colors.neutral[50],
            border: `1px solid ${t.colors.neutral[100]}`,
            marginBottom: t.spacing[5],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: '1.6' }}>
              {approval.description}
            </Text>
          </Box>

          {/* Approval Chain */}
          <Text style={{
            ...createPersonalitySectionHeaderStyle(t),
          }}>
            Approval Chain ({completedSteps}/{(approval.chain ?? []).length})
          </Text>
          <Box style={{ marginBottom: t.spacing[5] }}>
            {(approval.chain ?? []).map((step, idx) => {
              const stepCfg = getStatusConfig(step.status ?? 'pending', t);
              const StepIcon = stepCfg.icon;
              const isLast = idx === (approval.chain ?? []).length - 1;

              return (
                <Box key={idx} style={{ display: 'flex', gap: t.spacing[3], marginBottom: isLast ? 0 : t.spacing[1] }}>
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                    <StepIcon size={16} color={stepCfg.color} />
                    {!isLast && (
                      <Box style={{
                        width: 1, flex: 1, minHeight: 12,
                        backgroundColor: step.status === 'approved' ? t.colors.successScale[300] : t.colors.neutral[200],
                      }} />
                    )}
                  </Box>
                  <Box style={{ flex: 1, paddingBottom: isLast ? 0 : t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                        {step.approverName ?? ''}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: stepCfg.color }}>{stepCfg.label}</Text>
                    </Box>
                    {step.decidedAt && (
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {formatDistanceToNow(step.decidedAt, { addSuffix: true })}
                      </Text>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Attachments */}
          {approval.attachments && approval.attachments.length > 0 && (
            <Box style={{ marginBottom: t.spacing[5] }}>
              <Text style={{
                ...createPersonalitySectionHeaderStyle(t),
              }}>
                Attachments ({approval.attachments.length})
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {approval.attachments.map((att, idx) => (
                  <Box
                    key={idx}
                    tabIndex={0}
                    role="button"
                    aria-label={`Attachment: ${att.name}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      border: `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: t.colors.neutral[50],
                      cursor: 'pointer',
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Paperclip size={12} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], flex: 1 }}>
                      {att.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      {(att.type || '').toUpperCase()}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Comment input */}
          {onComment && isPending && (
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{
                ...createPersonalitySectionHeaderStyle(t),
              }}>
                Add Comment
              </Text>
              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                <Box style={{ flex: 1, position: 'relative' }}>
                  <MessageSquare size={14} style={{ position: 'absolute', left: t.spacing[3], top: t.spacing[3], color: t.colors.neutral[400] }} />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comment..."
                    aria-label="Comment"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px ${t.spacing[8]}px`,
                      borderRadius: t.borderRadius.md,
                      border: `1px solid ${t.colors.neutral[200]}`,
                      backgroundColor: t.colors.common.white,
                      fontSize: t.typography.fontSize.sm,
                      color: t.colors.neutral[900],
                      outline: 'none',
                      resize: 'vertical' as const,
                      fontFamily: 'inherit',
                    }}
                  />
                </Box>
                <Box
                  tabIndex={0}
                  role="button"
                  aria-label="Submit comment"
                  onClick={handleComment}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleComment(); } }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: t.borderRadius.md,
                    backgroundColor: comment.trim() ? t.colors.primaryScale[500] : t.colors.neutral[200],
                    cursor: comment.trim() ? 'pointer' : 'not-allowed',
                    flexShrink: 0, alignSelf: 'flex-end',
                  }}
                >
                  <Send size={14} color={t.colors.common.white} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer actions */}
        {isPending && (onApprove || onReject) && (
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: t.spacing[3], flexShrink: 0,
            backgroundColor: t.colors.neutral[50],
          }}>
            {onReject && (
              <Box
                tabIndex={0}
                role="button"
                aria-label="Reject approval"
                onClick={onReject}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReject(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${t.colors.errorScale[200]}`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.errorScale[600],
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <XCircle size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.errorScale[600] }}>Reject</Text>
              </Box>
            )}
            {onApprove && (
              <Box
                tabIndex={0}
                role="button"
                aria-label="Approve"
                onClick={onApprove}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onApprove(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                  borderRadius: badgeRadius,
                  border: 'none',
                  backgroundColor: t.colors.successScale[500],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.semibold,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <CheckCircle size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Approve</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Non-pending status banner */}
        {!isPending && (
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: approval.status === 'approved' ? t.colors.successScale[50] : t.colors.errorScale[50],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: t.spacing[2], flexShrink: 0,
          }}>
            {approval.status === 'approved'
              ? <CheckCircle size={16} color={t.colors.successScale[600]} />
              : <XCircle size={16} color={t.colors.errorScale[600]} />
            }
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: approval.status === 'approved' ? t.colors.successScale[700] : t.colors.errorScale[700],
            }}>
              This approval has been {approval.status}
            </Text>
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
