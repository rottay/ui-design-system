'use client';

/**
 * KycVerificationFlow - Status Preset
 * Compact status overview of verification
 */

import { createPreset, PresetContext } from '../../../factory';
import type { KycVerificationFlowProps } from '../../core';
import { getKycStatusColors, getStepLabel, STEP_ORDER } from '../../core';
import {
  createCardStyle,
  createProgressBarStyle,
  createAccentBarStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const StatusKycVerificationFlow = createPreset<KycVerificationFlowProps>({
  name: 'KycVerificationFlow.Status',
  render: ({ primitives, props, tokens }: PresetContext<KycVerificationFlowProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getKycStatusColors(tokens);

    const {
      verification,
      title = 'Verification Status',
      loading,
      className,
      style,
    } = props;

    const vColors = statusColors[verification.status];
    const currentStepIdx = STEP_ORDER.indexOf(verification.currentStep);
    const progress = verification.status === 'approved' ? 100 : Math.round(((currentStepIdx) / STEP_ORDER.length) * 100);
    const progressBar = createProgressBarStyle(tokens, { percent: progress });

    if (loading) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>Loading...</Box>;
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: vColors.dot })} />

        <Box style={{ padding: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: vColors.bg, color: vColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
              <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: vColors.dot, display: 'inline-block' }} />
              {verification.status}
            </span>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], fontWeight: tokens.typography.fontWeight.medium }}>{verification.subject.name}</span>
            <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs }}>{verification.level}</span>
          </Box>

          {/* Progress */}
          <Box style={{ marginBottom: tokens.spacing[3] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Progress</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{progress}%</span>
            </Box>
            <Box style={progressBar.track}><Box style={progressBar.fill} /></Box>
          </Box>

          {/* Step List */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            {STEP_ORDER.map((step, idx) => {
              const isCompleted = idx < currentStepIdx || verification.status === 'approved';
              const isCurrent = idx === currentStepIdx && verification.status !== 'approved';
              return (
                <Box key={step} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0` }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: tokens.borderRadius.full,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isCompleted ? tokens.colors.successScale[500] : isCurrent ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                    color: isCompleted ? tokens.colors.common.white : isCurrent ? tokens.colors.primaryScale[700] : tokens.colors.neutral[400],
                    fontSize: tokens.typography.fontSize.xs, flexShrink: 0,
                  }}>
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: isCompleted ? tokens.colors.neutral[500] : isCurrent ? tokens.colors.neutral[900] : tokens.colors.neutral[400],
                    fontWeight: isCurrent ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}>
                    {getStepLabel(step)}
                  </span>
                </Box>
              );
            })}
          </Box>

          {/* Dates */}
          <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[3], paddingTop: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            {verification.startedAt && <span>Started: {formatDistanceToNow(verification.startedAt, { addSuffix: true })}</span>}
            {verification.completedAt && <span>Completed: {formatDistanceToNow(verification.completedAt, { addSuffix: true })}</span>}
            {verification.expiresAt && <span>Expires: {verification.expiresAt.toLocaleDateString()}</span>}
          </Box>
        </Box>
      </Box>
    );
  },
});
