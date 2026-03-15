'use client';

/**
 * BhOnboardingPlaybook - Guided Preset
 * Step-by-step onboarding experience with module navigation,
 * current step detail, progress tracking, and resource access.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Play,
  BookOpen,
  CheckSquare,
  HelpCircle,
  Target,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Video,
  FileText,
  Link2,
  ExternalLink,
  Award,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createListItemStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createPersonalitySectionHeaderStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  clickableProps,
  listProps,
  listItemProps,
  formatDistanceToNow,
  ICON_SIZES,
} from '../../../helpers';
import type { BhOnboardingPlaybookProps, PlaybookStep, PlaybookModule } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStepTypeConfig(type: PlaybookStep['type']): {
  label: string;
  icon: typeof Play;
  color: 'primary' | 'info' | 'warning' | 'success' | 'error';
} {
  switch (type) {
    case 'video':
      return { label: 'Video', icon: Video, color: 'primary' };
    case 'reading':
      return { label: 'Reading', icon: BookOpen, color: 'info' };
    case 'task':
      return { label: 'Task', icon: CheckSquare, color: 'success' };
    case 'quiz':
      return { label: 'Quiz', icon: HelpCircle, color: 'warning' };
    case 'practice':
      return { label: 'Practice', icon: Target, color: 'error' };
    default:
      return { label: 'Step', icon: Circle, color: 'primary' };
  }
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'video':
      return Video;
    case 'document':
      return FileText;
    case 'link':
    default:
      return Link2;
  }
}

function getModuleStatus(mod: PlaybookModule): 'not_started' | 'in_progress' | 'completed' {
  if (mod.completedSteps === mod.totalSteps) return 'completed';
  if (mod.completedSteps > 0) return 'in_progress';
  return 'not_started';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const GuidedBhOnboardingPlaybook = createPreset<BhOnboardingPlaybookProps>(
  'GuidedBhOnboardingPlaybook',
  ({ primitives, props, tokens }: PresetContext<BhOnboardingPlaybookProps>) => {
    const { Box, Text, Button } = primitives;

    const {
      data,
      loading = false,
      onCompleteStep,
      onStartStep,
      onViewResource,
      currentStepId: externalStepId,
      className,
      style,
    } = props;

    const modules = data?.modules ?? [];

    // Find current step or first incomplete step
    const [internalStepId, setInternalStepId] = useState<string | null>(null);
    const activeStepId = externalStepId ?? internalStepId;

    const { activeModule, activeStep, allSteps, currentStepIndex } = useMemo(() => {
      const allSteps: Array<{ step: PlaybookStep; module: PlaybookModule }> = [];
      modules.forEach((mod) => {
        mod.steps.forEach((step) => {
          allSteps.push({ step, module: mod });
        });
      });

      let found = allSteps.find((s) => s.step.id === activeStepId);
      if (!found) {
        found = allSteps.find((s) => !s.step.completed);
      }
      if (!found && allSteps.length > 0) {
        found = allSteps[0];
      }

      return {
        activeModule: found?.module ?? null,
        activeStep: found?.step ?? null,
        allSteps,
        currentStepIndex: found ? allSteps.indexOf(found) : -1,
      };
    }, [modules, activeStepId]);

    const ptypo = getPersonalityTypography(tokens);
    const badgeRadius = getPersonalityBadgeRadius(tokens);

    const overallProgress = data?.overallProgress ?? 0;
    const overallBar = createProgressBarStyle(tokens, { percent: overallProgress });

    const handleNavStep = useCallback((stepId: string) => {
      setInternalStepId(stepId);
      onStartStep?.(stepId);
    }, [onStartStep]);

    const handlePrev = useCallback(() => {
      if (currentStepIndex > 0) {
        const prevStep = allSteps[currentStepIndex - 1];
        handleNavStep(prevStep.step.id);
      }
    }, [currentStepIndex, allSteps, handleNavStep]);

    const handleNext = useCallback(() => {
      if (currentStepIndex < allSteps.length - 1) {
        const nextStep = allSteps[currentStepIndex + 1];
        handleNavStep(nextStep.step.id);
      }
    }, [currentStepIndex, allSteps, handleNavStep]);

    // ========================================================================
    // SKELETON LOADING
    // ========================================================================

    if (loading) {
      const skelStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box className={className} style={{ ...style, display: 'flex', gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Box style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skelStyle, height: 70, width: '100%' }} />
            ))}
          </Box>
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            <Box style={{ ...skelStyle, height: 10, width: '100%' }} />
            <Box style={{ ...skelStyle, height: 40, width: '60%' }} />
            <Box style={{ ...skelStyle, height: 200, width: '100%' }} />
            <Box style={{ ...skelStyle, height: 120, width: '100%' }} />
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // EMPTY STATE
    // ========================================================================

    if (!modules.length) {
      return (
        <Box className={className} style={{ ...style, padding: tokens.spacing[4] }}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Award size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>
              No onboarding playbook available
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
              Contact your administrator to set up your onboarding program
            </Text>
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    return (
      <Box className={className} style={{ ...style, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        {/* Overall Progress Bar */}
        <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
              Overall Progress
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
              {Math.round(overallProgress)}%
            </Text>
          </Box>
          <Box style={overallBar.track}>
            <Box style={overallBar.fill} />
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            {data?.recruiterName ? `${data.recruiterName}'s onboarding` : 'Your onboarding journey'}
          </Text>
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
          {/* Module Navigation Sidebar */}
          <Box style={{ width: 280, flexShrink: 0 }}>
            <Box style={{ ...createCardStyle(tokens), position: 'sticky' as const, top: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              <Text style={{ ...createPersonalitySectionHeaderStyle(tokens), marginBottom: tokens.spacing[2] }}>
                Modules
              </Text>
              {modules.map((mod) => {
                const modStatus = getModuleStatus(mod);
                const isActive = activeModule?.id === mod.id;
                const modProgress = mod.totalSteps > 0 ? (mod.completedSteps / mod.totalSteps) * 100 : 0;
                const modBar = createProgressBarStyle(tokens, { percent: modProgress });

                return (
                  <Box
                    key={mod.id}
                    style={{
                      ...createListItemStyle(tokens, { active: isActive }),
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                    }}
                    onClick={() => {
                      const firstIncomplete = mod.steps.find((s) => !s.completed);
                      const targetStep = firstIncomplete ?? mod.steps[0];
                      if (targetStep) handleNavStep(targetStep.id);
                    }}
                    {...clickableProps(() => {
                      const firstIncomplete = mod.steps.find((s) => !s.completed);
                      const targetStep = firstIncomplete ?? mod.steps[0];
                      if (targetStep) handleNavStep(targetStep.id);
                    }, `Go to module: ${mod.title}`)}
                  >
                    {/* Progress ring placeholder */}
                    <Box style={{
                      width: 36,
                      height: 36,
                      borderRadius: tokens.borderRadius.full,
                      border: `3px solid ${modStatus === 'completed' ? tokens.colors.successScale[500] : modStatus === 'in_progress' ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                      backgroundColor: modStatus === 'completed' ? tokens.colors.successScale[50] : tokens.colors.common.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {modStatus === 'completed' ? (
                        <CheckCircle2 size={ICON_SIZES.section} style={{ color: tokens.colors.successScale[500] }} />
                      ) : (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: modStatus === 'in_progress' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }}>
                          {mod.order}
                        </Text>
                      )}
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                        color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                        lineHeight: 1.3,
                      }}>
                        {mod.title}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {mod.completedSteps}/{mod.totalSteps} steps
                      </Text>
                      <Box style={{ ...modBar.track, height: 4 }}>
                        <Box style={{ ...modBar.fill, height: 4 }} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Main Step Content */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {activeStep && activeModule && (() => {
              const stepCfg = getStepTypeConfig(activeStep.type);
              const StepIcon = stepCfg.icon;

              return (
                <>
                  {/* Step Header */}
                  <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{
                        ...createBadgeStyle(tokens, stepCfg.color),
                        borderRadius: badgeRadius,
                        gap: 4,
                      }}>
                        <StepIcon size={ICON_SIZES.inline} />
                        {stepCfg.label}
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          ~{activeStep.estimatedMinutes} min
                        </Text>
                      </Box>
                      {activeStep.completed && (
                        <Box style={{ ...createBadgeStyle(tokens, 'success'), borderRadius: badgeRadius, gap: 4, marginLeft: 'auto' }}>
                          <CheckCircle2 size={ICON_SIZES.inline} />
                          Completed
                        </Box>
                      )}
                    </Box>

                    <Text style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: ptypo.headingWeight,
                      color: tokens.colors.neutral[900],
                      letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      {activeStep.title}
                    </Text>

                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      color: tokens.colors.neutral[600],
                      lineHeight: 1.7,
                    }}>
                      {activeStep.description}
                    </Text>
                  </Box>

                  {/* Step Content Area */}
                  <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                    {activeStep.type === 'video' && (
                      <Box style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column' as const,
                        gap: tokens.spacing[2],
                      }}>
                        <Play size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[400] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                          Video content placeholder
                        </Text>
                      </Box>
                    )}

                    {activeStep.type === 'reading' && (
                      <Box style={{
                        padding: tokens.spacing[4],
                        backgroundColor: tokens.colors.neutral[50],
                        borderRadius: tokens.borderRadius.md,
                        borderLeft: `3px solid ${tokens.colors.infoScale[400]}`,
                      }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[700], lineHeight: 1.8 }}>
                          {activeStep.description}
                        </Text>
                      </Box>
                    )}

                    {activeStep.type === 'task' && (
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                        <Text style={createPersonalitySectionHeaderStyle(tokens)}>Task Checklist</Text>
                        <Box style={{
                          padding: tokens.spacing[3],
                          backgroundColor: tokens.colors.neutral[50],
                          borderRadius: tokens.borderRadius.md,
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}>
                          {activeStep.completed ? (
                            <CheckCircle2 size={ICON_SIZES.section} style={{ color: tokens.colors.successScale[500] }} />
                          ) : (
                            <Circle size={ICON_SIZES.section} style={{ color: tokens.colors.neutral[300] }} />
                          )}
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                            {activeStep.title}
                          </Text>
                        </Box>
                      </Box>
                    )}

                    {activeStep.type === 'quiz' && (
                      <Box style={{
                        padding: tokens.spacing[4],
                        backgroundColor: tokens.colors.warningScale[50],
                        borderRadius: tokens.borderRadius.md,
                        borderLeft: `3px solid ${tokens.colors.warningScale[400]}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                      }}>
                        <HelpCircle size={ICON_SIZES.feature} style={{ color: tokens.colors.warningScale[500] }} />
                        <Box>
                          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                            Knowledge Check
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: 2 }}>
                            Complete the quiz to verify your understanding
                          </Text>
                        </Box>
                      </Box>
                    )}

                    {activeStep.type === 'practice' && (
                      <Box style={{
                        padding: tokens.spacing[4],
                        backgroundColor: tokens.colors.primaryScale[50],
                        borderRadius: tokens.borderRadius.md,
                        borderLeft: `3px solid ${tokens.colors.primaryScale[400]}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                      }}>
                        <Target size={ICON_SIZES.feature} style={{ color: tokens.colors.primaryScale[500] }} />
                        <Box>
                          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                            Practice Exercise
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: 2 }}>
                            Apply what you have learned in a hands-on exercise
                          </Text>
                        </Box>
                      </Box>
                    )}

                    {/* Mark Complete Button */}
                    {!activeStep.completed && onCompleteStep && (
                      <Box style={{ display: 'flex', justifyContent: 'center', paddingTop: tokens.spacing[2] }}>
                        <Button onClick={() => onCompleteStep(activeStep.id)}>
                          <CheckCircle2 size={ICON_SIZES.section} />
                          Mark as Complete
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* Resources Section */}
                  {activeStep.resources.length > 0 && (
                    <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                      <Text style={createPersonalitySectionHeaderStyle(tokens)}>Resources</Text>
                      <Box {...listProps('Step resources')} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                        {activeStep.resources.map((resource, idx) => {
                          const ResIcon = getResourceIcon(resource.type);
                          return (
                            <Box
                              key={idx}
                              {...listItemProps()}
                              style={{
                                ...createListItemStyle(tokens),
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[2],
                              }}
                              onClick={() => onViewResource?.(resource.url)}
                              {...clickableProps(() => onViewResource?.(resource.url), `Open resource: ${resource.title}`)}
                            >
                              <ResIcon size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
                              <Box style={{ flex: 1 }}>
                                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                                  {resource.title}
                                </Text>
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                  {resource.type}
                                </Text>
                              </Box>
                              <ExternalLink size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* Navigation: Previous / Next */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: currentStepIndex > 0 ? 'pointer' : 'default',
                        opacity: currentStepIndex > 0 ? 1 : 0.4,
                        color: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.sm,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        transition: `background-color ${tokens.motion.hover}`,
                      }}
                      onClick={currentStepIndex > 0 ? handlePrev : undefined}
                      {...(currentStepIndex > 0 ? clickableProps(handlePrev, 'Previous step') : {})}
                    >
                      <ChevronLeft size={ICON_SIZES.section} />
                      Previous
                    </Box>

                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                      Step {currentStepIndex + 1} of {allSteps.length}
                    </Text>

                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: currentStepIndex < allSteps.length - 1 ? 'pointer' : 'default',
                        opacity: currentStepIndex < allSteps.length - 1 ? 1 : 0.4,
                        color: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.sm,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        transition: `background-color ${tokens.motion.hover}`,
                      }}
                      onClick={currentStepIndex < allSteps.length - 1 ? handleNext : undefined}
                      {...(currentStepIndex < allSteps.length - 1 ? clickableProps(handleNext, 'Next step') : {})}
                    >
                      Next
                      <ChevronRight size={ICON_SIZES.section} />
                    </Box>
                  </Box>
                </>
              );
            })()}
          </Box>
        </Box>
      </Box>
    );
  }
);

GuidedBhOnboardingPlaybook.displayName = 'GuidedBhOnboardingPlaybook';
