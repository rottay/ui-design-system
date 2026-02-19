'use client';

/**
 * BhApprovalChain - Compact Preset
 * Condensed horizontal chain summary for sidebar/widgets.
 * Personality-driven, glass-aware.
 */

import { useMemo, useCallback } from 'react';
import {
  GitBranch, CheckCircle, XCircle, Clock, SkipForward,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,

  createDividerStyle,
} from '../../../helpers';
import type { BhApprovalChainProps, ApprovalChainStep } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStepIcon(status: ApprovalChainStep['status']) {
  switch (status) {
    case 'approved': return CheckCircle;
    case 'rejected': return XCircle;
    case 'pending': return Clock;
    case 'skipped': return SkipForward;
    default: return Clock;
  }
}

function getStepColor(status: ApprovalChainStep['status'], t: DesignTokens): string {
  switch (status) {
    case 'approved': return t.colors.successScale[500];
    case 'rejected': return t.colors.errorScale[500];
    case 'pending': return t.colors.warningScale[500];
    case 'skipped': return t.colors.neutral[400];
    default: return t.colors.neutral[400];
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhApprovalChain = createPreset<BhApprovalChainProps>({
  name: 'BhApprovalChain.Compact',
  render: (ctx: PresetContext<BhApprovalChainProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      steps: rawSteps = [],
      entityTitle,
      onStepClick,
      className,
      style,
    } = props;

    const steps = Array.isArray(rawSteps) ? rawSteps : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const sorted = useMemo(() => [...(steps ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [steps]);

    const completedCount = useMemo(
      () => steps.filter(s => s.status === 'approved').length,
      [steps],
    );

    const handleClick = useCallback((id: string) => {
      onStepClick?.(id);
    }, [onStepClick]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    const divider = useMemo(() => createDividerStyle(t), [t]);



    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
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
            <GitBranch size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Chain
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
            {completedCount}/{(steps ?? []).length}
          </Text>
        </Box>

        {entityTitle && (
          <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[50]}` }}>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[600],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {entityTitle}
            </Text>
          </Box>
        )}

        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {steps.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[2] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No steps</Text>
            </Box>
          )}

          {sorted.map((step, idx) => {
            const Icon = getStepIcon(step.status ?? 'pending');
            const color = getStepColor(step.status ?? 'pending', t);
            const isLast = idx === sorted.length - 1;

            return (
              <Box
                key={step.id}
                tabIndex={0}
                role="button"
                aria-label={`${step.approverName}: ${step.status}`}
                onClick={() => handleClick((step.id ?? ''))}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick((step.id ?? '')); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  cursor: 'pointer',
                  marginBottom: isLast ? 0 : t.spacing[2],
                }}
              >
                <Icon size={14} color={color} style={{ flexShrink: 0 }} />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {step.approverName ?? ''}
                  </Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color, flexShrink: 0 }}>
                  {step.status === 'approved' ? 'OK' : step.status === 'rejected' ? 'No' : step.status === 'skipped' ? 'Skip' : '...'}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
