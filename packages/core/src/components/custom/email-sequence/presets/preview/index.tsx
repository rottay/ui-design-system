'use client';

/**
 * EmailSequence - Preview Preset
 * Read-only timeline view of sequence steps
 */

import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { EmailSequenceProps } from '../../core';
import {
  getSequenceStatusColors,
  getStepStatusColors,
  getDelayConnectorStyles,
  formatDelayDisplay,
} from '../../core';

export const PreviewEmailSequence = createPreset<EmailSequenceProps>({
  name: 'EmailSequence.Preview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EmailSequenceProps>) => {
    const { Box, Stack } = primitives;
    const sequenceStatusColors = getSequenceStatusColors(tokens);
    const stepStatusColors = getStepStatusColors(tokens);
    const delayStyles = getDelayConnectorStyles(tokens);

    const {
      title = 'Email Sequence',
      status = 'draft',
      steps: rawSteps = [],
      loading,
      className,
      style,
    } = props;

    const steps = Array.isArray(rawSteps) ? rawSteps : [];

    const statusStyle = sequenceStatusColors[status];

    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      'in-review': 'In Review',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      archived: 'Archived',
    };

    const stepStatusLabels: Record<string, string> = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      sent: 'Sent',
      failed: 'Failed',
      skipped: 'Skipped',
    };

    const truncateBody = (body: string, maxLength: number = 120): string => {
      if (body.length <= maxLength) return body;
      return body.substring(0, maxLength).trim() + '...';
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {title}
            </h2>
            <span style={{
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: statusStyle.color,
              backgroundColor: statusStyle.bgColor,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusStyle.border}`,
            }}>
              {statusLabels[status] ?? status}
            </span>
          </Box>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
          </span>
        </Box>

        {/* Timeline content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : steps.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No steps in this sequence
            </Box>
          ) : (
            <Stack direction="vertical" spacing="none">
              {steps.map((step, index) => {
                const sColors = stepStatusColors[step.status];
                const isLast = index === steps.length - 1;

                return (
                  <Box key={step.id}>
                    {/* Delay indicator between steps */}
                    {index > 0 && step.delay && (
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        paddingLeft: tokens.spacing[3],
                      }}>
                        {/* Timeline line segment with delay pill */}
                        <Box style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          width: tokens.spacing[3],
                        }}>
                          <Box style={{ width: 0, height: tokens.spacing[3], borderLeft: delayStyles.line.borderLeft }} />
                        </Box>
                        <Box style={{
                          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: delayStyles.pill.bgColor,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${delayStyles.pill.border}`,
                          color: delayStyles.pill.color,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          whiteSpace: 'nowrap',
                        }}>
                          Wait {formatDelayDisplay(step.delay)}
                        </Box>
                      </Box>
                    )}

                    {/* Step row with timeline dot + card */}
                    <Box style={{ display: 'flex', gap: tokens.spacing[3] }}>
                      {/* Timeline connector */}
                      <Box style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: tokens.spacing[6],
                        paddingLeft: tokens.spacing[0],
                      }}>
                        <Box style={{
                          width: tokens.spacing[3],
                          height: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: sColors.color,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                          boxShadow: `0 0 0 2px ${sColors.border}`,
                          flexShrink: 0,
                          marginTop: tokens.spacing[3],
                        }} />
                        {!isLast && (
                          <Box style={{
                            flex: 1,
                            width: tokens.spacing[1],
                            backgroundColor: tokens.colors.neutral[200],
                            minHeight: tokens.spacing[5],
                          }} />
                        )}
                      </Box>

                      {/* Step card */}
                      <Box style={{
                        flex: 1,
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        marginBottom: tokens.spacing[2],
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <span style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.bold,
                              color: tokens.colors.neutral[500],
                            }}>
                              #{step.order}
                            </span>
                            <span style={{
                              fontWeight: tokens.typography.fontWeight.semibold,
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[900],
                            }}>
                              {step.subject || '(No subject)'}
                            </span>
                          </Box>
                          <span style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: sColors.color,
                            backgroundColor: sColors.bgColor,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sColors.border}`,
                          }}>
                            {stepStatusLabels[step.status] ?? step.status}
                          </span>
                        </Box>

                        {/* Truncated body */}
                        {step.body && (
                          <Box style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                            lineHeight: tokens.typography.lineHeight.relaxed,
                          }}>
                            {truncateBody(step.body)}
                          </Box>
                        )}

                        {/* Meta info */}
                        <Box style={{ display: 'flex', gap: tokens.spacing[3], marginTop: tokens.spacing[2], flexWrap: 'wrap' }}>
                          {step.from && (
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              From: {step.from.value}
                            </span>
                          )}
                          {step.to && step.to.length > 0 && (
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              To: {step.to.map((r) => r.value).join(', ')}
                            </span>
                          )}
                          {step.savedAt && (
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              Saved: {new Date(step.savedAt).toLocaleDateString()}
                            </span>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>
    );
  },
});
