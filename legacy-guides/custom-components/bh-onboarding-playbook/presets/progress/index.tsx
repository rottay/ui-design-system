'use client';

/**
 * BhOnboardingPlaybook - Progress Preset
 * Overview dashboard showing overall progress, module cards,
 * mentor info, milestones timeline, and recent activity.
 */

import { useMemo } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  User,
  Calendar,
  TrendingUp,
  Target,
  Loader2,
  ChevronRight,
  BarChart3,
  Zap,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  createStatValueStyle,
  createStatLabelStyle,
  createStatCardLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  clickableProps,
  formatDistanceToNow,
  formatDate,
  ICON_SIZES,
} from '../../../helpers';
import type { BhOnboardingPlaybookProps, PlaybookModule } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getModuleStatus(mod: PlaybookModule): 'not_started' | 'in_progress' | 'completed' {
  if (mod.completedSteps === mod.totalSteps && mod.totalSteps > 0) return 'completed';
  if (mod.completedSteps > 0) return 'in_progress';
  return 'not_started';
}

function getModuleStatusConfig(status: ReturnType<typeof getModuleStatus>): {
  label: string;
  color: 'success' | 'primary' | 'secondary';
  icon: typeof CheckCircle2;
} {
  switch (status) {
    case 'completed':
      return { label: 'Completed', color: 'success', icon: CheckCircle2 };
    case 'in_progress':
      return { label: 'In Progress', color: 'primary', icon: Play };
    case 'not_started':
    default:
      return { label: 'Not Started', color: 'secondary', icon: Circle };
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ProgressBhOnboardingPlaybook = createPreset<BhOnboardingPlaybookProps>(
  'ProgressBhOnboardingPlaybook',
  ({ primitives, props, tokens }: PresetContext<BhOnboardingPlaybookProps>) => {
    const { Box, Text, Button } = primitives;

    const {
      data,
      loading = false,
      onStartStep,
      className,
      style,
    } = props;

    const modules = data?.modules ?? [];

    const ptypo = getPersonalityTypography(tokens);
    const badgeRadius = getPersonalityBadgeRadius(tokens);

    const overallProgress = data?.overallProgress ?? 0;
    const overallBar = createProgressBarStyle(tokens, { percent: overallProgress });

    // Calculate stats
    const stats = useMemo(() => {
      let totalSteps = 0;
      let completedSteps = 0;
      let totalModules = modules.length;
      let completedModules = 0;

      modules.forEach((mod) => {
        totalSteps += mod.totalSteps;
        completedSteps += mod.completedSteps;
        if (mod.completedSteps === mod.totalSteps && mod.totalSteps > 0) {
          completedModules++;
        }
      });

      return { totalSteps, completedSteps, totalModules, completedModules };
    }, [modules]);

    // Recently completed steps for activity feed
    const recentActivity = useMemo(() => {
      const activities: Array<{ stepTitle: string; moduleTitle: string; completedAt: Date }> = [];
      modules.forEach((mod) => {
        mod.steps.forEach((step) => {
          if (step.completed && step.completedAt) {
            activities.push({
              stepTitle: step.title,
              moduleTitle: mod.title,
              completedAt: step.completedAt instanceof Date ? step.completedAt : new Date(step.completedAt),
            });
          }
        });
      });
      return activities.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, 8);
    }, [modules]);

    // ========================================================================
    // SKELETON LOADING
    // ========================================================================

    if (loading) {
      const skelStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box className={className} style={{ ...style, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skelStyle, height: 100, width: '100%' }} />
            ))}
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skelStyle, height: 140, width: '100%' }} />
            ))}
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
              No onboarding data available
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
              Onboarding progress will appear here once it starts
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
        {/* Header with Progress Ring */}
        <Box style={{ ...createCardStyle(tokens, { elevation: 'md' }), display: 'flex', alignItems: 'center', gap: tokens.spacing[5] }}>
          {/* Progress Ring */}
          <Box style={{
            width: 100,
            height: 100,
            borderRadius: tokens.borderRadius.full,
            border: `6px solid ${tokens.colors.neutral[100]}`,
            position: 'relative' as const,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: `conic-gradient(${tokens.colors.primaryScale[500]} ${overallProgress}%, ${tokens.colors.neutral[100]} ${overallProgress}%)`,
          }}>
            <Box style={{
              width: 82,
              height: 82,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.common.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column' as const,
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                {Math.round(overallProgress)}%
              </Text>
            </Box>
          </Box>

          {/* Info */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: ptypo.headingWeight,
              color: tokens.colors.neutral[900],
              letterSpacing: ptypo.headingLetterSpacing,
            }}>
              {data?.recruiterName ? `${data.recruiterName}'s Onboarding` : 'Onboarding Progress'}
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  Started {data?.startedAt ? formatDate(data.startedAt) : '--'}
                </Text>
              </Box>
              {data?.estimatedCompletion && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Target size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    Est. completion {formatDate(data.estimatedCompletion)}
                  </Text>
                </Box>
              )}
            </Box>
            <Box style={overallBar.track}>
              <Box style={overallBar.fill} />
            </Box>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          <Box style={createStatCardLayout(tokens)}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={createStatLabelStyle(tokens, { personality: ptypo })}>Modules</Text>
            </Box>
            <Text style={createStatValueStyle(tokens)}>
              {stats.completedModules}/{stats.totalModules}
            </Text>
          </Box>
          <Box style={createStatCardLayout(tokens)}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <CheckCircle2 size={ICON_SIZES.section} style={{ color: tokens.colors.successScale[500] }} />
              <Text style={createStatLabelStyle(tokens, { personality: ptypo })}>Steps Done</Text>
            </Box>
            <Text style={createStatValueStyle(tokens)}>
              {stats.completedSteps}/{stats.totalSteps}
            </Text>
          </Box>
          <Box style={createStatCardLayout(tokens)}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <TrendingUp size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
              <Text style={createStatLabelStyle(tokens, { personality: ptypo })}>Progress</Text>
            </Box>
            <Text style={createStatValueStyle(tokens)}>
              {Math.round(overallProgress)}%
            </Text>
          </Box>
          <Box style={createStatCardLayout(tokens)}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Zap size={ICON_SIZES.section} style={{ color: tokens.colors.infoScale[500] }} />
              <Text style={createStatLabelStyle(tokens, { personality: ptypo })}>Remaining</Text>
            </Box>
            <Text style={createStatValueStyle(tokens)}>
              {stats.totalSteps - stats.completedSteps}
            </Text>
          </Box>
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
          {/* Module Cards */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            <Text style={createPersonalitySectionHeaderStyle(tokens)}>Modules</Text>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[3] }}>
              {modules.map((mod, index) => {
                const modStatus = getModuleStatus(mod);
                const statusCfg = getModuleStatusConfig(modStatus);
                const StatusIcon = statusCfg.icon;
                const modProgress = mod.totalSteps > 0 ? (mod.completedSteps / mod.totalSteps) * 100 : 0;
                const modBar = createProgressBarStyle(tokens, { percent: modProgress });
                const entrance = createEntranceAnimation(tokens, { index });

                return (
                  <Box
                    key={mod.id}
                    style={{
                      ...createCardStyle(tokens, { interactive: true }),
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: tokens.spacing[3],
                      ...entrance.initial,
                      animation: entrance.transition !== 'none' ? `entrance ${entrance.transition}` : undefined,
                    }}
                    onClick={() => {
                      const firstIncomplete = mod.steps.find((s) => !s.completed);
                      const targetStep = firstIncomplete ?? mod.steps[0];
                      if (targetStep) onStartStep?.(targetStep.id);
                    }}
                    {...clickableProps(() => {
                      const firstIncomplete = mod.steps.find((s) => !s.completed);
                      const targetStep = firstIncomplete ?? mod.steps[0];
                      if (targetStep) onStartStep?.(targetStep.id);
                    }, `Go to module: ${mod.title}`)}
                  >
                    {/* Header */}
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box style={{
                        width: 40,
                        height: 40,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: modStatus === 'completed' ? tokens.colors.successScale[50] : modStatus === 'in_progress' ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <StatusIcon
                          size={ICON_SIZES.feature}
                          style={{
                            color: modStatus === 'completed' ? tokens.colors.successScale[500] : modStatus === 'in_progress' ? tokens.colors.primaryScale[500] : tokens.colors.neutral[400],
                          }}
                        />
                      </Box>
                      <Box style={{ ...createBadgeStyle(tokens, statusCfg.color), borderRadius: badgeRadius }}>
                        {statusCfg.label}
                      </Box>
                    </Box>

                    {/* Title + Description */}
                    <Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginBottom: 4,
                      }}>
                        {mod.title}
                      </Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as any,
                        overflow: 'hidden' as const,
                      }}>
                        {mod.description}
                      </Text>
                    </Box>

                    {/* Progress */}
                    <Box style={{ marginTop: 'auto' }}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {mod.completedSteps}/{mod.totalSteps} steps
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600] }}>
                          {Math.round(modProgress)}%
                        </Text>
                      </Box>
                      <Box style={modBar.track}>
                        <Box style={modBar.fill} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Right Sidebar: Mentor + Activity */}
          <Box style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {/* Mentor Card */}
            {data?.mentorName && (
              <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                <Text style={createPersonalitySectionHeaderStyle(tokens)}>Your Mentor</Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Box style={{
                    width: 48,
                    height: 48,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={ICON_SIZES.feature} style={{ color: tokens.colors.primaryScale[600] }} />
                  </Box>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      {data.mentorName}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                      Assigned Mentor
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Milestones Timeline */}
            <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              <Text style={createPersonalitySectionHeaderStyle(tokens)}>Milestones</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {modules.map((mod, idx) => {
                  const modStatus = getModuleStatus(mod);
                  const isCompleted = modStatus === 'completed';
                  const isInProgress = modStatus === 'in_progress';

                  return (
                    <Box key={mod.id} style={{ display: 'flex', gap: tokens.spacing[2] }}>
                      {/* Timeline line + dot */}
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', width: 20, flexShrink: 0 }}>
                        <Box style={{
                          width: 12,
                          height: 12,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: isCompleted ? tokens.colors.successScale[500] : isInProgress ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                          flexShrink: 0,
                        }} />
                        {idx < modules.length - 1 && (
                          <Box style={{
                            width: 2,
                            flex: 1,
                            minHeight: 20,
                            backgroundColor: isCompleted ? tokens.colors.successScale[200] : tokens.colors.neutral[200],
                          }} />
                        )}
                      </Box>
                      <Box style={{ paddingBottom: tokens.spacing[2] }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: isInProgress ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          color: isCompleted ? tokens.colors.successScale[700] : isInProgress ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                        }}>
                          {mod.title}
                        </Text>
                        {isCompleted && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[500] }}>
                            Completed
                          </Text>
                        )}
                        {isInProgress && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500] }}>
                            {mod.completedSteps}/{mod.totalSteps} steps
                          </Text>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                <Text style={createPersonalitySectionHeaderStyle(tokens)}>Recent Activity</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                  {recentActivity.map((activity, idx) => (
                    <Box key={idx} style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'flex-start' }}>
                      <CheckCircle2 size={ICON_SIZES.label} style={{ color: tokens.colors.successScale[500], marginTop: 2, flexShrink: 0 }} />
                      <Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                          {activity.stepTitle}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          {activity.moduleTitle} -- {formatDistanceToNow(activity.completedAt, { addSuffix: true })}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);

ProgressBhOnboardingPlaybook.displayName = 'ProgressBhOnboardingPlaybook';
