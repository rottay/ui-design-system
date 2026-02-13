'use client';

/**
 * BhApprovalChain - Vertical Preset
 * Full vertical timeline showing approval chain steps
 * with status indicators, connectors, and comments.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  GitBranch, CheckCircle, XCircle, Clock,
  SkipForward, User, MessageSquare, Shield,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { BhApprovalChainProps, ApprovalChainStep } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_STEPS: ApprovalChainStep[] = [
  { id: 'step-1', approverName: 'Sarah Kim', approverRole: 'Hiring Manager', status: 'approved', decidedAt: new Date('2026-02-08T10:00:00'), comment: 'Looks great, strong candidate.', order: 1 },
  { id: 'step-2', approverName: 'Tom Walsh', approverRole: 'VP Engineering', status: 'approved', decidedAt: new Date('2026-02-09T14:30:00'), comment: 'Approved. Within budget.', order: 2 },
  { id: 'step-3', approverName: 'Lisa Park', approverRole: 'HR Director', status: 'pending', order: 3 },
  { id: 'step-4', approverName: 'Mark Rivera', approverRole: 'CFO', status: 'pending', order: 4 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStepConfig(status: ApprovalChainStep['status'], t: DesignTokens) {
  switch (status) {
    case 'approved':
      return { label: 'Approved', color: t.colors.successScale[600], bg: t.colors.successScale[50], border: t.colors.successScale[200], icon: CheckCircle };
    case 'rejected':
      return { label: 'Rejected', color: t.colors.errorScale[600], bg: t.colors.errorScale[50], border: t.colors.errorScale[200], icon: XCircle };
    case 'pending':
      return { label: 'Pending', color: t.colors.warningScale[600], bg: t.colors.warningScale[50], border: t.colors.warningScale[200], icon: Clock };
    case 'skipped':
      return { label: 'Skipped', color: t.colors.neutral[400], bg: t.colors.neutral[100], border: t.colors.neutral[200], icon: SkipForward };
  }
}

/* ================================================================== */
/*  Vertical Preset                                                    */
/* ================================================================== */

export const VerticalBhApprovalChain = createPreset<BhApprovalChainProps>({
  name: 'BhApprovalChain.Vertical',
  render: (ctx: PresetContext<BhApprovalChainProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      steps = MOCK_STEPS,
      entityTitle = 'Offer for Sarah Johnson - Sr. Engineer',
      entityType = 'Offer',
      currentStepId,
      onStepClick,
      loading = false,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const sorted = useMemo(() => [...steps].sort((a, b) => a.order - b.order), [steps]);

    const completedCount = useMemo(
      () => steps.filter(s => s.status === 'approved').length,
      [steps],
    );

    const handleClick = useCallback((id: string) => {
      onStepClick?.(id);
    }, [onStepClick]);

    return (
      <Box
        className={className}
        style={{ ...card, padding: 0, overflow: 'hidden', ...(accentBar ? accentLayout.outer : {}), ...style }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <GitBranch size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Approval Chain
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {entityType}: {entityTitle}
              </Text>
            </Box>
          </Box>

          {/* Progress summary */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            marginTop: t.spacing[3],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {completedCount} of {steps.length} steps completed
            </Text>
            <Box style={{
              flex: 1, height: 4, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.neutral[100], overflow: 'hidden',
            }}>
              <Box style={{
                height: '100%',
                width: `${(completedCount / steps.length) * 100}%`,
                backgroundColor: t.colors.successScale[500],
                borderRadius: t.borderRadius.full,
                transition: `width ${t.motion.hover}`,
              }} />
            </Box>
          </Box>
        </Box>

        {/* Chain steps */}
        <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {steps.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <GitBranch size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No approval steps defined
              </Text>
            </Box>
          )}

          {sorted.map((step, idx) => {
            const cfg = getStepConfig(step.status, t);
            const StepIcon = cfg.icon;
            const isCurrent = step.id === currentStepId || (step.status === 'pending' && idx === sorted.findIndex(s => s.status === 'pending'));
            const isLast = idx === sorted.length - 1;

            return (
              <Box
                key={step.id}
                style={{
                  ...animStyle(idx),
                  display: 'flex',
                  gap: t.spacing[4],
                }}
              >
                {/* Connector line and icon */}
                <Box style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: 32,
                }}>
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: cfg.bg,
                      border: `2px solid ${isCurrent ? cfg.color : cfg.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isCurrent ? `0 0 0 4px ${cfg.bg}` : 'none',
                    }}
                  >
                    <StepIcon size={16} color={cfg.color} />
                  </Box>
                  {!isLast && (
                    <Box style={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      backgroundColor: step.status === 'approved' ? t.colors.successScale[300] : t.colors.neutral[200],
                    }} />
                  )}
                </Box>

                {/* Step content */}
                <Box
                  tabIndex={0}
                  role="button"
                  aria-label={`${step.approverName}, ${step.approverRole}, ${cfg.label}`}
                  onClick={() => handleClick(step.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(step.id); } }}
                  style={{
                    flex: 1,
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderRadius: t.borderRadius.lg,
                    border: `1px solid ${isCurrent ? cfg.color : t.colors.neutral[100]}`,
                    backgroundColor: isCurrent ? cfg.bg : t.colors.common.white,
                    marginBottom: t.spacing[3],
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <User size={12} color={t.colors.neutral[500]} />
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                      }}>
                        {step.approverName}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: cfg.color,
                      padding: `0 ${t.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      backgroundColor: cfg.bg,
                    }}>
                      {cfg.label}
                    </Text>
                  </Box>

                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: step.comment ? t.spacing[2] : 0 }}>
                    {step.approverRole}
                    {step.decidedAt && ` - ${formatDistanceToNow(step.decidedAt, { addSuffix: true })}`}
                  </Text>

                  {step.comment && (
                    <Box style={{
                      display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                    }}>
                      <MessageSquare size={11} color={t.colors.neutral[400]} style={{ flexShrink: 0, marginTop: t.spacing[1] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontStyle: 'italic' }}>
                        {step.comment}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
        </Box>
      </Box>
    );
  },
});
