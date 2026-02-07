'use client';

/**
 * ApprovalWorkflow - Summary Preset
 * Read-only compact card showing approval configuration overview
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ApprovalWorkflowProps } from '../../core';
import { getOutcomeColors, getStatusCategoryColors } from '../../core';

export const SummaryApprovalWorkflow = createPreset<ApprovalWorkflowProps>({
  name: 'ApprovalWorkflow.Summary',
  render: ({ primitives, props, tokens, engine }: PresetContext<ApprovalWorkflowProps>) => {
    const { Box } = primitives;
    const outcomeColors = getOutcomeColors(tokens);
    const categoryColors = getStatusCategoryColors(tokens);

    const {
      statuses,
      transitions,
      approvalRules,
      selectedStatusId,
      loading,
      className,
      style,
    } = props;

    const currentRule = approvalRules.length > 0 ? approvalRules[0] : null;

    const getTransitionById = (transitionId?: string) => {
      if (!transitionId) return null;
      return transitions.find(t => t.id === transitionId) ?? null;
    };

    const getStatusById = (statusId: string) => {
      return statuses.find(s => s.id === statusId) ?? null;
    };

    const selectedStatus = selectedStatusId ? getStatusById(selectedStatusId) : null;

    const approvedTransition = currentRule ? getTransitionById(currentRule.outcomes.approved.transitionId) : null;
    const declinedTransition = currentRule ? getTransitionById(currentRule.outcomes.declined.transitionId) : null;

    const approvedToStatus = approvedTransition ? getStatusById(approvedTransition.toStatus) : null;
    const declinedToStatus = declinedTransition ? getStatusById(declinedTransition.toStatus) : null;

    const maxVisibleAvatars = 5;
    const approvers = currentRule?.approvers ?? [];
    const visibleApprovers = approvers.slice(0, maxVisibleAvatars);
    const remainingCount = approvers.length - maxVisibleAvatars;

    return (
      <Box className={className} style={{
        backgroundColor: tokens.colors.common.white,
        borderRadius: tokens.borderRadius.lg,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        boxShadow: tokens.shadows.sm,
        padding: tokens.spacing[5],
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[4],
        maxWidth: 400,
        width: '100%',
        ...style,
      }}>
        {loading ? (
          <Box style={{
            padding: tokens.spacing[6],
            textAlign: 'center',
            color: tokens.colors.neutral[400],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            Loading...
          </Box>
        ) : (
          <>
            {/* Title */}
            <Box style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              Approval Configuration
            </Box>

            {/* Approver Avatars Row */}
            {approvers.length > 0 && (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  Approvers
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  {visibleApprovers.map((approver, index) => (
                    <Box
                      key={approver.id}
                      title={approver.name}
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        border: `2px solid ${tokens.colors.common.white}`,
                        marginLeft: index > 0 ? -tokens.spacing[2] : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: visibleApprovers.length - index,
                        backgroundColor: approver.avatar ? 'transparent' : tokens.colors.primaryScale[100],
                        color: tokens.colors.primaryScale[700],
                      }}
                    >
                      {approver.avatar ? (
                        <img
                          src={approver.avatar}
                          alt={approver.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: tokens.borderRadius.full,
                          }}
                        />
                      ) : (
                        approver.name.charAt(0).toUpperCase()
                      )}
                    </Box>
                  ))}
                  {remainingCount > 0 && (
                    <Box style={{
                      width: tokens.spacing[8],
                      height: tokens.spacing[8],
                      borderRadius: tokens.borderRadius.full,
                      border: `2px solid ${tokens.colors.common.white}`,
                      marginLeft: -tokens.spacing[2],
                      backgroundColor: tokens.colors.neutral[100],
                      color: tokens.colors.neutral[600],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 0,
                    }}>
                      +{remainingCount}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Outcomes */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                Outcomes
              </Box>

              {/* Approved outcome */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: outcomeColors.approved.bg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${outcomeColors.approved.border}`,
              }}>
                <Box style={{
                  width: tokens.spacing[5],
                  height: tokens.spacing[5],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.successScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M8.5 2.5L4 7.5L1.5 5" stroke={outcomeColors.approved.icon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  flex: 1,
                }}>
                  <span style={{ color: outcomeColors.approved.color, fontWeight: tokens.typography.fontWeight.medium }}>If approved</span>
                  {approvedTransition && approvedToStatus && (
                    <>
                      <span style={{ color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}> → </span>
                      <Box as="span" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `0 ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: categoryColors[approvedToStatus.category].bgColor,
                        fontSize: tokens.typography.fontSize.xs,
                        color: categoryColors[approvedToStatus.category].color,
                        verticalAlign: 'middle',
                      }}>
                        <Box style={{
                          width: tokens.spacing[1],
                          height: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: approvedTransition.statusBadgeColor ?? categoryColors[approvedToStatus.category].dotColor,
                        }} />
                        {approvedToStatus.name}
                      </Box>
                    </>
                  )}
                  {!approvedTransition && (
                    <span style={{ color: tokens.colors.neutral[400], fontStyle: 'italic', marginLeft: tokens.spacing[1] }}>Not configured</span>
                  )}
                </Box>
              </Box>

              {/* Declined outcome */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: outcomeColors.declined.bg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${outcomeColors.declined.border}`,
              }}>
                <Box style={{
                  width: tokens.spacing[5],
                  height: tokens.spacing[5],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.errorScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M7.5 2.5L2.5 7.5M2.5 2.5l5 5" stroke={outcomeColors.declined.icon} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  flex: 1,
                }}>
                  <span style={{ color: outcomeColors.declined.color, fontWeight: tokens.typography.fontWeight.medium }}>If declined</span>
                  {declinedTransition && declinedToStatus && (
                    <>
                      <span style={{ color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}> → </span>
                      <Box as="span" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `0 ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: categoryColors[declinedToStatus.category].bgColor,
                        fontSize: tokens.typography.fontSize.xs,
                        color: categoryColors[declinedToStatus.category].color,
                        verticalAlign: 'middle',
                      }}>
                        <Box style={{
                          width: tokens.spacing[1],
                          height: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: declinedTransition.statusBadgeColor ?? categoryColors[declinedToStatus.category].dotColor,
                        }} />
                        {declinedToStatus.name}
                      </Box>
                    </>
                  )}
                  {!declinedTransition && (
                    <span style={{ color: tokens.colors.neutral[400], fontStyle: 'italic', marginLeft: tokens.spacing[1] }}>Not configured</span>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Selected Status Badge */}
            {selectedStatus && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  Current status:
                </Box>
                <Box style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: categoryColors[selectedStatus.category].bgColor,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: categoryColors[selectedStatus.category].color,
                }}>
                  <Box style={{
                    width: tokens.spacing[2],
                    height: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: categoryColors[selectedStatus.category].dotColor,
                  }} />
                  {selectedStatus.name}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  },
});
