'use client';

/**
 * BhIndividualHome - Standard Preset
 * Slite-inspired recruiter dashboard with welcome hero, pipeline kanban,
 * schedule timeline, wizard onboarding, performance ring, recent candidates,
 * and token balance card.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhIndividualHomeProps, ScheduleItem, RecentCandidate } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  User, Calendar, Briefcase, Target, Zap, ChevronRight, Clock,
  Phone, Video, MapPin, Users, Gift, Play, CheckCircle, ArrowRight,
  TrendingUp, Eye, MessageSquare, MoreHorizontal, Coins,
} from 'lucide-react';

const SCHEDULE_TYPE_CONFIG: Record<ScheduleItem['type'], { label: string; iconKey: string }> = {
  'phone-screen': { label: 'Phone Screen', iconKey: 'phone' },
  'video-interview': { label: 'Video Interview', iconKey: 'video' },
  'onsite': { label: 'On-site', iconKey: 'mappin' },
  'debrief': { label: 'Debrief', iconKey: 'users' },
  'offer-call': { label: 'Offer Call', iconKey: 'gift' },
};

const CANDIDATE_STATUS_MAP: Record<NonNullable<RecentCandidate['status']>, { label: string; colorKey: 'primary' | 'info' | 'warning' | 'success' | 'error' | 'secondary' }> = {
  new: { label: 'New', colorKey: 'info' },
  screening: { label: 'Screening', colorKey: 'warning' },
  interviewing: { label: 'Interviewing', colorKey: 'primary' },
  offer: { label: 'Offer', colorKey: 'success' },
  hired: { label: 'Hired', colorKey: 'success' },
  rejected: { label: 'Rejected', colorKey: 'error' },
};

export const StandardBhIndividualHome = createPreset<BhIndividualHomeProps>({
  name: 'BhIndividualHome.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhIndividualHomeProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    const {
      welcome = { name: '', greeting: 'Welcome' }, pipelines = [], schedule = [], wizardSteps,
      performance, recentCandidates = [], tokenBalance,
      onCandidateClick, onScheduleAction, onJobClick,
      onWizardStepClick, onViewAllCandidates, onViewAllSchedule,
      onBuyTokens, className, style,
    } = props;

    const [showWizard, setShowWizard] = useState(() => {
      if (!wizardSteps) return false;
      return wizardSteps.some((s) => !s.completed);
    });
    const [selectedJob, setSelectedJob] = useState<string | null>(
      pipelines.length > 0 ? pipelines[0].jobId : null,
    );

    const scheduleIconMap: Record<string, React.ReactNode> = useMemo(() => ({
      phone: <Phone size={14} />,
      video: <Video size={14} />,
      mappin: <MapPin size={14} />,
      users: <Users size={14} />,
      gift: <Gift size={14} />,
    }), []);

    const completedWizardCount = useMemo(() => wizardSteps?.filter((s) => s.completed).length ?? 0, [wizardSteps]);
    const totalWizardCount = useMemo(() => wizardSteps?.length ?? 0, [wizardSteps]);
    const wizardProgress = useMemo(() => totalWizardCount > 0 ? (completedWizardCount / totalWizardCount) * 100 : 0, [completedWizardCount, totalWizardCount]);

    const performancePercent = useMemo(() => performance
      ? Math.min(100, Math.round((performance.hires / Math.max(performance.target, 1)) * 100))
      : 0, [performance]);
    const ringRadius = 54;
    const ringCircumference = useMemo(() => 2 * Math.PI * ringRadius, []);
    const ringOffset = useMemo(() => ringCircumference - (performancePercent / 100) * ringCircumference, [ringCircumference, performancePercent]);

    const selectedPipeline = useMemo(() => pipelines.find((p) => p.jobId === selectedJob) ?? pipelines[0], [pipelines, selectedJob]);

    const cardStyle = useMemo((): React.CSSProperties => ({
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      padding: `${tokens.spacing[5]}px`,
    }), [tokens, isGlass]);

    const stageColors = useMemo(() => [
      tokens.colors.neutral[400], tokens.colors.infoScale[500],
      tokens.colors.warningScale[500], tokens.colors.primaryScale[500],
      tokens.colors.successScale[500],
    ], [tokens]);

    const statusDotColors = useMemo((): Record<string, string> => ({
      upcoming: tokens.colors.infoScale[500],
      'in-progress': tokens.colors.warningScale[500],
      completed: tokens.colors.successScale[500],
      cancelled: tokens.colors.neutral[400],
    }), [tokens]);

    const handleCandidateClick = useCallback((id: string) => {
      onCandidateClick?.(id);
    }, [onCandidateClick]);

    const handleScheduleAction = useCallback((id: string, action: string) => {
      onScheduleAction?.(id, action);
    }, [onScheduleAction]);

    const handleJobClick = useCallback((jobId: string) => {
      setSelectedJob(jobId);
      onJobClick?.(jobId);
    }, [onJobClick]);

    const handleDismissWizard = useCallback(() => {
      setShowWizard(false);
    }, []);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    }), [entrance, tokens]);

    return (
      <Box className={className} style={{
        padding: `${tokens.spacing[6]}px`, backgroundColor: tokens.colors.neutral[50],
        minHeight: '100%', ...style,
      }}>
        <Box style={{
          display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5],
          maxWidth: 1200, margin: '0 auto',
        }}>
          {/* Welcome Hero */}
          <Box style={{
            ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
            borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`,
            padding: `${tokens.spacing[6]}px`,
            background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.primaryScale[100]})`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
              <Box style={{
                width: 56, height: 56, borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[200],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {welcome.avatar ? (
                  <Box
                    style={{ width: '100%', height: '100%', backgroundImage: `url(${welcome.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    role="img"
                    aria-label={welcome.name}
                  />
                ) : (
                  <User size={24} color={tokens.colors.primaryScale[600]} />
                )}
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1 }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize['2xl'], fontWeight: ptypo.headingWeight,
                  color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight,
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {welcome.greeting ?? 'Good morning'}, {welcome.name}
                </Text>
                {welcome.focusSummary && (
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600],
                    marginTop: tokens.spacing[1],
                  }}>
                    {welcome.focusSummary}
                  </Text>
                )}
              </Box>
              {welcome.todayCount !== undefined && (
                <Box style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  fontSize: tokens.typography.fontSize.sm,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                }}>
                  <Calendar size={14} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm }}>{welcome.todayCount} today</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Quick Start Wizard */}
          {showWizard && wizardSteps && wizardSteps.length > 0 && (
            <Box style={{
              ...cardStyle,
              borderLeft: `4px solid ${tokens.colors.primaryScale[500]}`,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: tokens.spacing[3],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Zap size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.lg, fontWeight: ptypo.headingWeight,
                    color: tokens.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing,
                  }}>
                    Get Started
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {completedWizardCount}/{totalWizardCount} complete
                  </Text>
                  <Box onClick={handleDismissWizard} role="button" tabIndex={0} aria-label="Dismiss wizard" onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDismissWizard(); } }} style={{ cursor: 'pointer' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      Dismiss
                    </Text>
                  </Box>
                </Box>
              </Box>

              <Box style={{
                width: '100%', height: 4, backgroundColor: tokens.colors.neutral[100],
                borderRadius: tokens.borderRadius.full, marginBottom: tokens.spacing[4], overflow: 'hidden' as const,
              }}>
                <Box style={{
                  width: `${wizardProgress}%`, height: '100%',
                  backgroundColor: tokens.colors.primaryScale[500],
                  borderRadius: tokens.borderRadius.full, transition: `width ${tokens.motion.hover}`,
                }} />
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {wizardSteps.map((step) => (
                  <Box
                    key={step.key}
                    onClick={() => !step.completed && onWizardStepClick?.(step.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: step.completed ? tokens.colors.successScale[50] : tokens.colors.common.white,
                      border: `1px solid ${step.completed ? tokens.colors.successScale[200] : tokens.colors.neutral[100]}`,
                      cursor: step.completed ? 'default' : 'pointer',
                      opacity: step.completed ? 0.7 : 1, transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Box style={{
                      width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                      backgroundColor: step.completed ? tokens.colors.successScale[500] : tokens.colors.neutral[200],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {step.completed ? (
                        <CheckCircle size={14} color={tokens.colors.common.white} />
                      ) : (
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[600],
                        }}>
                          {step.icon ?? ''}
                        </Text>
                      )}
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                        color: step.completed ? tokens.colors.neutral[500] : tokens.colors.neutral[900],
                        textDecoration: step.completed ? 'line-through' : 'none',
                      }}>
                        {step.label}
                      </Text>
                      {step.description && !step.completed && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400]}}>
                          {step.description}
                        </Text>
                      )}
                    </Box>
                    {!step.completed && <ArrowRight size={14} color={tokens.colors.neutral[400]} />}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Two-column layout */}
          <Box style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: tokens.spacing[5],
          }}>
            {/* Left column */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
              {/* Pipeline */}
              {pipelines.length > 0 && (
                <Box style={cardStyle}>
                  <Box style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Briefcase size={18} color={tokens.colors.neutral[600]} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        My Pipeline
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      {pipelines.map((p) => (
                        <Box
                          key={p.jobId}
                          onClick={() => { setSelectedJob(p.jobId); onJobClick?.(p.jobId); }}
                          style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            border: `1px solid ${selectedJob === p.jobId ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                            backgroundColor: selectedJob === p.jobId ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                            cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                            color: selectedJob === p.jobId ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                            whiteSpace: 'nowrap' as const,
                          }}>
                            {p.jobTitle}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {selectedPipeline && (
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], overflowX: 'auto' as const }}>
                      {selectedPipeline.stages.map((stage, idx) => {
                        const totalCandidates = selectedPipeline.stages.reduce((sum, s) => sum + s.count, 0);
                        const widthPercent = totalCandidates > 0 ? Math.max(15, (stage.count / totalCandidates) * 100) : 100 / selectedPipeline.stages.length;
                        const stageColor = stage.color ?? stageColors[idx % stageColors.length];

                        return (
                          <Box key={stage.key} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                            flex: `0 0 ${widthPercent}%`, minWidth: 80,
                            padding: `${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            backgroundColor: tokens.colors.neutral[50],
                            borderTop: `3px solid ${stageColor}`,
                          }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                            }}>
                              {stage.label}
                            </Text>
                            <Text style={{
                              fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold,
                              color: tokens.colors.neutral[900], marginTop: tokens.spacing[1],
                            }}>
                              {stage.count}
                            </Text>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              )}

              {/* Schedule */}
              {schedule.length > 0 && (
                <Box style={cardStyle}>
                  <Box style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Calendar size={18} color={tokens.colors.neutral[600]} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        Today's Schedule
                      </Text>
                    </Box>
                    {onViewAllSchedule && (
                      <Box onClick={onViewAllSchedule} style={{
                        display: 'flex', alignItems: 'center', gap: tokens.spacing[1], cursor: 'pointer',
                      }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.primaryScale[600],
                        }}>
                          View all
                        </Text>
                        <ChevronRight size={14} color={tokens.colors.primaryScale[600]} />
                      </Box>
                    )}
                  </Box>

                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {schedule.map((item) => {
                      const typeConfig = SCHEDULE_TYPE_CONFIG[item.type] || SCHEDULE_TYPE_CONFIG['phone-screen'];
                      const dotColor = statusDotColors[item.status ?? 'upcoming'];
                      const icon = scheduleIconMap[typeConfig.iconKey];

                      return (
                        <Box
                          key={item.id}
                          onClick={() => onScheduleAction?.(item.id, 'view')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            border: `1px solid ${tokens.colors.neutral[100]}`,
                            backgroundColor: tokens.colors.common.white,
                            cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Box style={{
                            width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                            backgroundColor: dotColor, flexShrink: 0,
                          }} />
                          <Box style={{
                            width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                            backgroundColor: tokens.colors.primaryScale[50],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, color: tokens.colors.primaryScale[600],
                          }}>
                            {icon}
                          </Box>
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[900],
                              overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                            }}>
                              {item.candidateName}
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500]}}>
                              {typeConfig.label} - {item.jobTitle}
                            </Text>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              <Clock size={12} color={tokens.colors.neutral[600]} />
                              <Text style={{
                                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                                color: tokens.colors.neutral[600],
                              }}>
                                {item.time}
                              </Text>
                            </Box>
                            {item.duration && (
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                {item.duration}
                              </Text>
                            )}
                            {item.type === 'video-interview' && (
                              <Box
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onScheduleAction?.(item.id, 'join'); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.lg,
                                  backgroundColor: tokens.colors.primaryScale[600],
                                  cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                <Play size={10} color={tokens.colors.common.white} />
                                <Text style={{
                                  fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                                  color: tokens.colors.common.white,
                                }}>
                                  Join
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Recent Candidates */}
              {recentCandidates.length > 0 && (
                <Box style={cardStyle}>
                  <Box style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Users size={18} color={tokens.colors.neutral[600]} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        Recent Candidates
                      </Text>
                      <Box style={{ ...createBadgeStyle(tokens, 'primary') }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{recentCandidates.length}</Text>
                      </Box>
                    </Box>
                    {onViewAllCandidates && (
                      <Box onClick={onViewAllCandidates} style={{
                        display: 'flex', alignItems: 'center', gap: tokens.spacing[1], cursor: 'pointer',
                      }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.primaryScale[600],
                        }}>
                          View all
                        </Text>
                        <ChevronRight size={14} color={tokens.colors.primaryScale[600]} />
                      </Box>
                    )}
                  </Box>

                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                    {recentCandidates.slice(0, 10).map((candidate) => {
                      const statusCfg = CANDIDATE_STATUS_MAP[candidate.status ?? 'new'] ?? CANDIDATE_STATUS_MAP.new;
                      const badgeStyle = createBadgeStyle(tokens, statusCfg.colorKey);

                      return (
                        <Box
                          key={candidate.id}
                          onClick={() => onCandidateClick?.((candidate.id ?? ''))}
                          style={{
                            display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            backgroundColor: tokens.colors.common.white,
                            border: `1px solid ${tokens.colors.neutral[100]}`,
                            cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Box style={{
                            width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.neutral[200],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0,
                          }}>
                            {candidate.avatar ? (
                              <Box
                                style={{ width: '100%', height: '100%', backgroundImage: `url(${candidate.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                role="img"
                                aria-label={candidate.name}
                              />
                            ) : (
                              <User size={14} color={tokens.colors.neutral[500]} />
                            )}
                          </Box>

                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[900],
                              overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                            }}>
                              {candidate.name}
                            </Text>
                            {candidate.jobTitle && (
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                {candidate.jobTitle}
                              </Text>
                            )}
                          </Box>

                          {/* Score bar */}
                          <Box style={{ width: 60, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: tokens.spacing[1] }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                              color: (candidate.score ?? 0) >= 80
                                ? tokens.colors.successScale[700]
                                : (candidate.score ?? 0) >= 50
                                  ? tokens.colors.warningScale[700]
                                  : tokens.colors.neutral[600],
                            }}>
                              {candidate.score ?? 0}%
                            </Text>
                            <Box style={{
                              width: '100%', height: 4, backgroundColor: tokens.colors.neutral[100],
                              borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const,
                            }}>
                              <Box style={{
                                width: `${candidate.score ?? 0}%`, height: '100%',
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: (candidate.score ?? 0) >= 80
                                  ? tokens.colors.successScale[500]
                                  : (candidate.score ?? 0) >= 50
                                    ? tokens.colors.warningScale[500]
                                    : tokens.colors.neutral[400],
                              }} />
                            </Box>
                          </Box>

                          <Box style={{ ...badgeStyle, fontSize: tokens.typography.fontSize.xs, flexShrink: 0 }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{statusCfg.label}</Text>
                          </Box>

                          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                            {[Eye, MessageSquare, MoreHorizontal].map((Icon, i) => (
                              <Box
                                key={i}
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (i === 0) onCandidateClick?.((candidate.id ?? '')); }}
                                style={{
                                  padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.md,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                <Icon size={14} color={tokens.colors.neutral[400]} />
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Right column */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
              {/* Performance Ring */}
              {performance && (
                <Box style={{
                  ...cardStyle,
                  display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                }}>
                  <Box style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    alignSelf: 'flex-start', marginBottom: tokens.spacing[4],
                  }}>
                    <Target size={18} color={tokens.colors.neutral[600]} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      Performance
                    </Text>
                  </Box>

                  <Box style={{ position: 'relative' as const, width: 128, height: 128 }}>
                    <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="64" cy="64" r={ringRadius} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="10" />
                      <circle
                        cx="64" cy="64" r={ringRadius} fill="none"
                        stroke={performancePercent >= 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500]}
                        strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={ringCircumference} strokeDashoffset={ringOffset}
                        style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                      />
                    </svg>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                      position: 'absolute' as const, top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)', textAlign: 'center' as const,
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight,
                      }}>
                        {performance.hires}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        of {performance.target}
                      </Text>
                    </Box>
                  </Box>

                  <Box style={{ marginTop: tokens.spacing[3], textAlign: 'center' as const }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                    }}>
                      {performance.label ?? 'Hires This Quarter'}
                    </Text>
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: tokens.spacing[1], marginTop: tokens.spacing[1],
                    }}>
                      <TrendingUp size={12} color={performancePercent >= 100 ? tokens.colors.successScale[600] : tokens.colors.primaryScale[600]} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                        color: performancePercent >= 100 ? tokens.colors.successScale[600] : tokens.colors.primaryScale[600],
                      }}>
                        {performancePercent}% of target
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Token Balance */}
              {tokenBalance && (() => {
                const usagePercent = tokenBalance.total
                  ? Math.round((tokenBalance.remaining / tokenBalance.total) * 100)
                  : null;
                const isLow = tokenBalance.remaining <= 5;

                return (
                  <Box style={{
                    ...cardStyle,
                    borderLeft: `4px solid ${isLow ? tokens.colors.warningScale[500] : tokens.colors.successScale[500]}`,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{
                          width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                          backgroundColor: isLow ? tokens.colors.warningScale[50] : tokens.colors.successScale[50],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Coins size={18} color={isLow ? tokens.colors.warningScale[600] : tokens.colors.successScale[600]} />
                        </Box>
                        <Box>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                          }}>
                            {tokenBalance.label ?? 'Interview Credits'}
                          </Text>
                          <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1] }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold,
                              color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight,
                            }}>
                              {tokenBalance.remaining}
                            </Text>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400],
                            }}>
                              remaining
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                      <Box style={{ textAlign: 'right' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          ${(tokenBalance.costPerInterview || 0).toFixed(2)} / interview
                        </Text>
                        {usagePercent !== null && (
                          <Box style={{
                            width: 80, height: 4, backgroundColor: tokens.colors.neutral[100],
                            borderRadius: tokens.borderRadius.full, marginTop: tokens.spacing[1],
                            overflow: 'hidden' as const,
                          }}>
                            <Box style={{
                              width: `${usagePercent}%`, height: '100%',
                              backgroundColor: isLow ? tokens.colors.warningScale[500] : tokens.colors.successScale[500],
                              borderRadius: tokens.borderRadius.full,
                            }} />
                          </Box>
                        )}
                        {onBuyTokens && (
                          <Box
                            onClick={onBuyTokens}
                            role="button"
                            tabIndex={0}
                            aria-label="Buy more interview credits"
                            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBuyTokens?.(); } }}
                            style={{
                              marginTop: tokens.spacing[2],
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                              borderRadius: badgeRadius,
                              backgroundColor: tokens.colors.primaryScale[600],
                              cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                              display: 'inline-block',
                            }}
                          >
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.common.white,
                            }}>
                              Buy More
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
