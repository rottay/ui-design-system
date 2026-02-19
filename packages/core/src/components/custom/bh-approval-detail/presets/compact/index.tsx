'use client';

/**
 * BhApprovalDetail - Compact Preset
 * Condensed approval detail card for inline/embedded usage.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Shield, CheckCircle, XCircle, Clock,
  FileText, User, Calendar, ChevronDown,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,
  createPersonalitySectionHeaderStyle,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhApprovalDetailProps, ApprovalDetailData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriorityConfig(priority: ApprovalDetailData['priority'] | undefined, t: DesignTokens) {
  switch (priority) {
    case 'high': return { label: 'High', badge: 'error' as const };
    case 'medium': return { label: 'Medium', badge: 'warning' as const };
    case 'low':
    default: return { label: 'Low', badge: 'secondary' as const };
  }
}

function getStepColor(status: string, t: DesignTokens): string {
  switch (status) {
    case 'approved': return t.colors.successScale[500];
    case 'rejected': return t.colors.errorScale[500];
    default: return t.colors.warningScale[500];
  }
}

function getStepIcon(status: string) {
  switch (status) {
    case 'approved': return CheckCircle;
    case 'rejected': return XCircle;
    default: return Clock;
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhApprovalDetail = createPreset<BhApprovalDetailProps>({
  name: 'BhApprovalDetail.Compact',
  render: (ctx: PresetContext<BhApprovalDetailProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      approval: raw_approval = {} as Partial<ApprovalDetailData>,
      onApprove,
      onReject,
      onClose,
      loading = false,
      className,
      style,
    } = props;

    const _approval = Array.isArray(raw_approval) ? raw_approval : ({} as Partial<ApprovalDetailData>);
    const approval = _approval ?? ({} as Partial<ApprovalDetailData>);

    const [expanded, setExpanded] = useState(false);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const priorityCfg = useMemo(() => getPriorityConfig(approval.priority, t), [approval.priority, t]);
    const isPending = approval.status === 'pending';

    const toggleExpand = useCallback(() => {
      setExpanded(prev => !prev);
    }, []);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{ ...card, ...animStyle, padding: 0, overflow: 'hidden', ...style }}
      >
        {/* Header */}
        <Box
          tabIndex={0}
          role="button"
          aria-label={`${approval.entityTitle} - click to expand`}
          aria-expanded={expanded}
          onClick={toggleExpand}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(); } }}
          style={{
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
            borderBottom: expanded ? `1px solid ${t.colors.neutral[100]}` : 'none',
          }}
        >
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {approval.entityTitle}
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={{ ...createBadgeStyle(t, priorityCfg.badge), borderRadius: badgeRadius, padding: `0 ${t.spacing[2]}px` }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{priorityCfg.label}</Text>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {approval.requestedAt ? formatDistanceToNow(approval.requestedAt, { addSuffix: true }) : ''}
              </Text>
            </Box>
          </Box>
          <ChevronDown
            size={14}
            color={t.colors.neutral[400]}
            style={{
              transition: `transform ${t.motion.hover}`,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        </Box>

        {/* Expanded content */}
        {expanded && (
          <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
            {/* Description */}
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], marginBottom: t.spacing[3], lineHeight: '1.5' }}>
              {approval.description}
            </Text>

            {/* Chain mini */}
            <Box style={{ marginBottom: t.spacing[3] }}>
              <Text style={{ ...createPersonalitySectionHeaderStyle(t), fontSize: t.typography.fontSize.xs, marginBottom: t.spacing[2] }}>
                Chain
              </Text>
              {(approval.chain ?? []).map((step, idx) => {
                const Icon = getStepIcon(step.status ?? 'pending');
                const color = getStepColor(step.status ?? 'pending', t);
                return (
                  <Box key={idx} style={{ display: 'flex', flexDirection: 'row' as const, alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                    <Icon size={12} color={color} style={{ flexShrink: 0 }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], flex: 1 }}>
                      {step.approverName ?? ''}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color, flexShrink: 0 }}>{step.status}</Text>
                  </Box>
                );
              })}
            </Box>

            {/* Actions */}
            {isPending && (onApprove || onReject) && (
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: t.spacing[2], paddingTop: t.spacing[3],
                borderTop: `1px solid ${t.colors.neutral[100]}`,
              }}>
                {onReject && (
                  <Box
                    tabIndex={0}
                    role="button"
                    aria-label="Reject"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onReject(); }}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReject(); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      border: `1px solid ${t.colors.errorScale[200]}`,
                      backgroundColor: t.colors.common.white,
                      cursor: 'pointer', transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <XCircle size={12} color={t.colors.errorScale[500]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600] }}>Reject</Text>
                  </Box>
                )}
                {onApprove && (
                  <Box
                    tabIndex={0}
                    role="button"
                    aria-label="Approve"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onApprove(); }}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onApprove(); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      border: 'none',
                      backgroundColor: t.colors.successScale[500],
                      cursor: 'pointer', transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <CheckCircle size={12} color={t.colors.common.white} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>Approve</Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  },
});
