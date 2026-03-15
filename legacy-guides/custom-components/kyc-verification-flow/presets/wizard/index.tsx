'use client';

/**
 * KycVerificationFlow - Wizard Preset
 * Step-by-step verification wizard
 */

import { createPreset, PresetContext } from '../../../factory';
import type { KycVerificationFlowProps } from '../../core';
import { getKycStatusColors, getStepLabel, STEP_ORDER } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createAccentBarStyle,
  createInteractiveCardStyle,
} from '../../../helpers';

export const WizardKycVerificationFlow = createPreset<KycVerificationFlowProps>({
  name: 'KycVerificationFlow.Wizard',
  render: ({ primitives, props, tokens }: PresetContext<KycVerificationFlowProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getKycStatusColors(tokens);

    const {
      verification,
      onStepComplete,
      onDocumentUpload,
      title = 'KYC Verification',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const currentStepIdx = STEP_ORDER.indexOf(verification.currentStep);
    const vColors = statusColors[verification.status];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top' })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Level: <strong style={{ color: tokens.colors.neutral[700] }}>{verification.level}</strong></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: vColors.bg, color: vColors.color, fontSize: tokens.typography.fontSize.xs }}>
              <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: vColors.dot, display: 'inline-block' }} />
              {verification.status}
            </span>
          </Box>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {/* Step Progress */}
            <Box style={{ display: 'flex', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
              {STEP_ORDER.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isPending = idx > currentStepIdx;

                return (
                  <Box key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < STEP_ORDER.length - 1 ? 1 : 'none' }}>
                    <Box style={{
                      width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isCompleted ? tokens.colors.successScale[500] : isCurrent ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                      color: isCompleted || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                      flexShrink: 0,
                    }}>
                      {isCompleted ? '✓' : idx + 1}
                    </Box>
                    {idx < STEP_ORDER.length - 1 && (
                      <Box style={{
                        flex: 1, height: 2, margin: `0 ${tokens.spacing[1]}px`,
                        backgroundColor: isCompleted ? tokens.colors.successScale[300] : tokens.colors.neutral[200],
                      }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Step Labels */}
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              {STEP_ORDER.map((step, idx) => {
                const isCurrent = idx === currentStepIdx;
                return (
                  <span key={step} style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: isCurrent ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                    fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    textAlign: 'center',
                    flex: 1,
                  }}>
                    {getStepLabel(step)}
                  </span>
                );
              })}
            </Box>

            {/* Current Step Content */}
            <Box style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[4] }}>
              <h4 style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: `0 0 ${tokens.spacing[2]}px` }}>
                {getStepLabel(verification.currentStep)}
              </h4>

              {verification.currentStep === 'document' && (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {verification.documents.map((doc) => (
                    <Box key={doc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                    }}>
                      <Box>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{doc.type.replace(/-/g, ' ')}</span>
                        {doc.fileName && <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{doc.fileName}</span>}
                      </Box>
                      <span style={{
                        padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full,
                        backgroundColor: doc.status === 'verified' ? tokens.colors.successScale[50] : doc.status === 'rejected' ? tokens.colors.errorScale[50] : tokens.colors.neutral[100],
                        color: doc.status === 'verified' ? tokens.colors.successScale[700] : doc.status === 'rejected' ? tokens.colors.errorScale[700] : tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        {doc.status}
                      </span>
                    </Box>
                  ))}
                  {onDocumentUpload && (
                    <button onClick={() => onDocumentUpload('id-card')} style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
                      border: `2px dashed ${tokens.colors.neutral[300]}`, backgroundColor: 'transparent',
                      color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      + Upload Document
                    </button>
                  )}
                </Box>
              )}

              {verification.currentStep !== 'document' && (
                <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], margin: 0 }}>
                  Complete the {getStepLabel(verification.currentStep).toLowerCase()} step to continue.
                </p>
              )}

              {onStepComplete && verification.status !== 'approved' && verification.status !== 'rejected' && (
                <button onClick={() => onStepComplete(verification.currentStep)} style={{
                  marginTop: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
                  border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Complete Step
                </button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
