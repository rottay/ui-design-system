'use client';

/**
 * BhIndividualHome - Standard Preset
 * Solo recruiter dashboard with pipeline, schedule, performance ring,
 * wizard onboarding, recent candidates, and token balance
 */

import {useState, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { BhIndividualHomeProps, ScheduleItem, RecentCandidate } from '../../core';
import {
  User, Calendar, Briefcase, Target, Zap, ChevronRight, Clock,
  Phone, Video, MapPin, Users, Gift, Play, CheckCircle, ArrowRight,
  TrendingUp, Star, Eye, MessageSquare, MoreHorizontal, Coins
} from 'lucide-react';

const SCHEDULE_TYPE_CONFIG: Record<ScheduleItem['type'], { label: string; iconKey: string }> = {
  'phone-screen': { label: 'Phone Screen', iconKey: 'phone' },
  'video-interview': { label: 'Video Interview', iconKey: 'video' },
  'onsite': { label: 'On-site', iconKey: 'mappin' },
  'debrief': { label: 'Debrief', iconKey: 'users' },
  'offer-call': { label: 'Offer Call', iconKey: 'gift' },
};

const CANDIDATE_STATUS_MAP: Record<RecentCandidate['status'], { label: string; colorKey: 'primary' | 'info' | 'warning' | 'success' | 'error' | 'secondary' }> = {
  new: { label: 'New', colorKey: 'info' },
  screening: { label: 'Screening', colorKey: 'warning' },
  interviewing: { label: 'Interviewing', colorKey: 'primary' },
  offer: { label: 'Offer', colorKey: 'success' },
  hired: { label: 'Hired', colorKey: 'success' },
  rejected: { label: 'Rejected', colorKey: 'error' },
};

export const StandardBhIndividualHome = createPreset<BhIndividualHomeProps>({
  name: 'BhIndividualHome.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhIndividualHomeProps>) => {
    const { Box, Stack } = primitives;

    const {
      welcome,
      pipelines = [],
      schedule = [],
      wizardSteps,
      performance,
      recentCandidates = [],
      tokenBalance,
      onCandidateClick,
      onScheduleAction,
      onJobClick,
      onWizardStepClick,
      onViewAllCandidates,
      onViewAllSchedule,
      onBuyTokens,
      className,
      style,
    } = props;

    const [showWizard, setShowWizard] = useState(() => {
      if (!wizardSteps) return false;
      return wizardSteps.some((s) => !s.completed);
    });
    const [selectedJob, setSelectedJob] = useState<string | null>(
      pipelines.length > 0 ? pipelines[0].jobId : null
    );
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);

    const scheduleIconMap: Record<string, React.ReactNode> = {
      phone: <Phone size={14} />,
      video: <Video size={14} />,
      mappin: <MapPin size={14} />,
      users: <Users size={14} />,
      gift: <Gift size={14} />,
    };

    const completedWizardCount = wizardSteps?.filter((s) => s.completed).length ?? 0;
    const totalWizardCount = wizardSteps?.length ?? 0;
    const wizardProgress = totalWizardCount > 0 ? (completedWizardCount / totalWizardCount) * 100 : 0;

    const performancePercent = performance
      ? Math.min(100, Math.round((performance.hires / Math.max(performance.target, 1)) * 100))
      : 0;
    const ringRadius = 54;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (performancePercent / 100) * ringCircumference;

    const selectedPipeline = pipelines.find((p) => p.jobId === selectedJob) ?? pipelines[0];

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    const sectionSubStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[500],
      margin: 0,
    };

    const linkStyle: React.CSSProperties = {
      ...hoverTransition,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.primaryScale[600],
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      background: 'none',
      border: 'none',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
    };

    /* ── Welcome Hero ─────────────────────────────────────────── */
    const renderWelcomeHero = () => {
      const heroStyle: React.CSSProperties = {
        ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
        padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
        background: isGlass && tokens.glass
          ? tokens.glass.bg
          : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.primaryScale[100]})`,
        position: 'relative' as const,
        overflow: 'hidden',
      };

      return (
        <div style={heroStyle}>
          {isGlass && tokens.glass && (
            <div style={{
              position: 'absolute' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backdropFilter: tokens.glass.blur,
              WebkitBackdropFilter: tokens.glass.blur,
              pointerEvents: 'none' as const,
            }} />
          )}
          <Stack direction="horizontal" gap={tokens.spacing[4]} align="center" style={{ position: 'relative' as const, zIndex: 1 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {welcome.avatar ? (
                <img src={welcome.avatar} alt={welcome.name} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
              ) : (
                <User size={24} color={tokens.colors.primaryScale[600]} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                margin: 0,
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {welcome.greeting ?? 'Good morning'}, {welcome.name}
              </h2>
              {welcome.focusSummary && (
                <p style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  margin: `${tokens.spacing[1]}px 0 0`,
                }}>
                  {welcome.focusSummary}
                </p>
              )}
            </div>
            {welcome.todayCount !== undefined && (
              <div style={{
                ...createBadgeStyle(tokens, 'primary'),
                fontSize: tokens.typography.fontSize.sm,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              }}>
                <Calendar size={14} style={{ marginRight: tokens.spacing[1] }} />
                {welcome.todayCount} today
              </div>
            )}
          </Stack>
        </div>
      );
    };

    /* ── Pipeline Preview (Compact Kanban) ────────────────────── */
    const renderPipeline = () => {
      if (pipelines.length === 0) return null;

      const stageColors = [
        tokens.colors.neutral[400],
        tokens.colors.infoScale[500],
        tokens.colors.warningScale[500],
        tokens.colors.primaryScale[500],
        tokens.colors.successScale[500],
      ];

      return (
        <div style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: tokens.spacing[4] }}>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <Briefcase size={18} color={tokens.colors.neutral[600]} />
              <h3 style={sectionTitleStyle}>My Pipeline</h3>
            </Stack>
            <Stack direction="horizontal" gap={tokens.spacing[1]}>
              {pipelines.map((p) => (
                <button
                  key={p.jobId}
                  onClick={() => {
                    setSelectedJob(p.jobId);
                    onJobClick?.(p.jobId);
                  }}
                  style={{
                    ...hoverTransition,
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                      selectedJob === p.jobId ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                    }`,
                    backgroundColor: selectedJob === p.jobId ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: selectedJob === p.jobId ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {p.jobTitle}
                </button>
              ))}
            </Stack>
          </Stack>

          {selectedPipeline && (
            <Stack direction="horizontal" gap={tokens.spacing[2]} style={{ overflowX: 'auto' as const }}>
              {selectedPipeline.stages.map((stage, idx) => {
                const totalCandidates = selectedPipeline.stages.reduce((sum, s) => sum + s.count, 0);
                const widthPercent = totalCandidates > 0 ? Math.max(15, (stage.count / totalCandidates) * 100) : 100 / selectedPipeline.stages.length;
                const stageColor = stage.color ?? stageColors[idx % stageColors.length];

                return (
                  <div
                    key={stage.key}
                    style={{
                      flex: `0 0 ${widthPercent}%`,
                      minWidth: 80,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      borderTop: `3px solid ${stageColor}`,
                    }}
                  >
                    <p style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[500],
                      margin: 0,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    }}>
                      {stage.label}
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      margin: `${tokens.spacing[1]}px 0 0`,
                    }}>
                      {stage.count}
                    </p>
                  </div>
                );
              })}
            </Stack>
          )}
        </div>
      );
    };

    /* ── Today's Schedule ──────────────────────────────────────── */
    const renderSchedule = () => {
      if (schedule.length === 0) return null;

      const statusDotColors: Record<string, string> = {
        upcoming: tokens.colors.infoScale[500],
        'in-progress': tokens.colors.warningScale[500],
        completed: tokens.colors.successScale[500],
        cancelled: tokens.colors.neutral[400],
      };

      return (
        <div style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: tokens.spacing[4] }}>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <Calendar size={18} color={tokens.colors.neutral[600]} />
              <h3 style={sectionTitleStyle}>Today&apos;s Schedule</h3>
            </Stack>
            {onViewAllSchedule && (
              <button onClick={onViewAllSchedule} style={linkStyle}>
                View all <ChevronRight size={14} />
              </button>
            )}
          </Stack>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {schedule.map((item) => {
              const typeConfig = SCHEDULE_TYPE_CONFIG[item.type];
              const dotColor = statusDotColors[item.status ?? 'upcoming'];
              const icon = scheduleIconMap[typeConfig.iconKey];

              return (
                <div
                  key={item.id}
                  style={{
                    ...cardInteractive,
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                  }}
                  onClick={() => onScheduleAction?.(item.id, 'view')}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: dotColor,
                    flexShrink: 0,
                  }} />
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {item.candidateName}
                    </p>
                    <p style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      margin: `${tokens.spacing[0]}px 0 0`,
                    }}>
                      {typeConfig.label} &middot; {item.jobTitle}
                    </p>
                  </div>
                  <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[600],
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <Clock size={12} />
                      {item.time}
                    </span>
                    {item.duration && (
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}>
                        {item.duration}
                      </span>
                    )}
                    {item.type === 'video-interview' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onScheduleAction?.(item.id, 'join'); }}
                        style={{
                          ...hoverTransition,
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.primaryScale[600],
                          color: tokens.colors.common.white,
                          border: 'none',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}
                      >
                        <Play size={10} /> Join
                      </button>
                    )}
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ── Quick Start Wizard ────────────────────────────────────── */
    const renderWizard = () => {
      if (!showWizard || !wizardSteps || wizardSteps.length === 0) return null;

      return (
        <div style={{
          ...cardBase,
          borderLeft: `4px solid ${tokens.colors.primaryScale[500]}`,
        }}>
          <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: tokens.spacing[3] }}>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <Zap size={18} color={tokens.colors.primaryScale[600]} />
              <h3 style={sectionTitleStyle}>Get Started</h3>
            </Stack>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                {completedWizardCount}/{totalWizardCount} complete
              </span>
              <button
                onClick={() => setShowWizard(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  padding: 0,
                }}
              >
                Dismiss
              </button>
            </Stack>
          </Stack>

          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: 4,
            backgroundColor: tokens.colors.neutral[100],
            borderRadius: tokens.borderRadius.full,
            marginBottom: tokens.spacing[4],
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${wizardProgress}%`,
              height: '100%',
              backgroundColor: tokens.colors.primaryScale[500],
              borderRadius: tokens.borderRadius.full,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {wizardSteps.map((step) => (
              <div
                key={step.key}
                onClick={() => !step.completed && onWizardStepClick?.(step.key)}
                style={{
                  ...hoverTransition,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: step.completed ? tokens.colors.successScale[50] : tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    step.completed ? tokens.colors.successScale[200] : tokens.colors.neutral[200]
                  }`,
                  cursor: step.completed ? 'default' : 'pointer',
                  opacity: step.completed ? 0.7 : 1,
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: step.completed ? tokens.colors.successScale[500] : tokens.colors.neutral[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {step.completed ? (
                    <CheckCircle size={14} color={tokens.colors.common.white} />
                  ) : (
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[600],
                    }}>
                      {step.icon ?? ''}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: step.completed ? tokens.colors.neutral[500] : tokens.colors.neutral[900],
                    margin: 0,
                    textDecoration: step.completed ? 'line-through' : 'none',
                  }}>
                    {step.label}
                  </p>
                  {step.description && !step.completed && (
                    <p style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      margin: `${tokens.spacing[0]}px 0 0`,
                    }}>
                      {step.description}
                    </p>
                  )}
                </div>
                {!step.completed && (
                  <ArrowRight size={14} color={tokens.colors.neutral[400]} />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    /* ── Performance Ring ──────────────────────────────────────── */
    const renderPerformanceRing = () => {
      if (!performance) return null;

      return (
        <div style={{
          ...cardBase,
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          padding: tokens.spacing[5],
        }}>
          <Stack direction="horizontal" align="center" gap={tokens.spacing[2]} style={{ alignSelf: 'flex-start', marginBottom: tokens.spacing[4] }}>
            <Target size={18} color={tokens.colors.neutral[600]} />
            <h3 style={sectionTitleStyle}>Performance</h3>
          </Stack>

          <div style={{ position: 'relative' as const, width: 128, height: 128 }}>
            <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={ringRadius}
                fill="none"
                stroke={tokens.colors.neutral[100]}
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={ringRadius}
                fill="none"
                stroke={performancePercent >= 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500]}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
              />
            </svg>
            <div style={{
              position: 'absolute' as const,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center' as const,
            }}>
              <p style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                margin: 0,
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {performance.hires}
              </p>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                margin: 0,
              }}>
                of {performance.target}
              </p>
            </div>
          </div>

          <div style={{ marginTop: tokens.spacing[3], textAlign: 'center' as const }}>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              margin: 0,
            }}>
              {performance.label ?? 'Hires This Quarter'}
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize.xs,
              color: performancePercent >= 100 ? tokens.colors.successScale[600] : tokens.colors.primaryScale[600],
              fontWeight: tokens.typography.fontWeight.medium,
              margin: `${tokens.spacing[1]}px 0 0`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[1],
            }}>
              <TrendingUp size={12} />
              {performancePercent}% of target
            </p>
          </div>
        </div>
      );
    };

    /* ── Recent Candidates ─────────────────────────────────────── */
    const renderRecentCandidates = () => {
      if (recentCandidates.length === 0) return null;

      const displayed = recentCandidates.slice(0, 10);

      return (
        <div style={cardBase}>
          <Stack direction="horizontal" align="center" justify="space-between" style={{ marginBottom: tokens.spacing[4] }}>
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <Users size={18} color={tokens.colors.neutral[600]} />
              <h3 style={sectionTitleStyle}>Recent Candidates</h3>
              <span style={{
                ...createBadgeStyle(tokens, 'primary'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                {recentCandidates.length}
              </span>
            </Stack>
            {onViewAllCandidates && (
              <button onClick={onViewAllCandidates} style={linkStyle}>
                View all <ChevronRight size={14} />
              </button>
            )}
          </Stack>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {displayed.map((candidate) => {
              const statusCfg = CANDIDATE_STATUS_MAP[candidate.status];
              const badgeStyle = useMemo(() => createBadgeStyle(tokens, statusCfg.colorKey), [tokens]);

              return (
                <div
                  key={candidate.id}
                  onClick={() => onCandidateClick?.(candidate.id)}
                  style={{
                    ...hoverTransition,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[200],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {candidate.avatar ? (
                      <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                    ) : (
                      <User size={14} color={tokens.colors.neutral[500]} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {candidate.name}
                    </p>
                    {candidate.jobTitle && (
                      <p style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        margin: 0,
                      }}>
                        {candidate.jobTitle}
                      </p>
                    )}
                  </div>

                  {/* Score bar */}
                  <div style={{ width: 60, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 2 }}>
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: candidate.score >= 80
                        ? tokens.colors.successScale[700]
                        : candidate.score >= 50
                          ? tokens.colors.warningScale[700]
                          : tokens.colors.neutral[600],
                    }}>
                      {candidate.score}%
                    </span>
                    <div style={{
                      width: '100%',
                      height: 4,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${candidate.score}%`,
                        height: '100%',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: candidate.score >= 80
                          ? tokens.colors.successScale[500]
                          : candidate.score >= 50
                            ? tokens.colors.warningScale[500]
                            : tokens.colors.neutral[400],
                      }} />
                    </div>
                  </div>

                  <span style={{
                    ...badgeStyle,
                    fontSize: tokens.typography.fontSize.xs,
                    flexShrink: 0,
                  }}>
                    {statusCfg.label}
                  </span>

                  <Stack direction="horizontal" gap={tokens.spacing[1]}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCandidateClick?.(candidate.id); }}
                      style={{
                        ...hoverTransition,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: tokens.spacing[1],
                        borderRadius: tokens.borderRadius.sm,
                        color: tokens.colors.neutral[400],
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      style={{
                        ...hoverTransition,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: tokens.spacing[1],
                        borderRadius: tokens.borderRadius.sm,
                        color: tokens.colors.neutral[400],
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <MessageSquare size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      style={{
                        ...hoverTransition,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        padding: tokens.spacing[1],
                        borderRadius: tokens.borderRadius.sm,
                        color: tokens.colors.neutral[400],
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </Stack>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ── Token Balance Mini-Card ────────────────────────────────── */
    const renderTokenBalance = () => {
      if (!tokenBalance) return null;

      const usagePercent = tokenBalance.total
        ? Math.round((tokenBalance.remaining / tokenBalance.total) * 100)
        : null;
      const isLow = tokenBalance.remaining <= 5;

      return (
        <div style={{
          ...cardBase,
          borderLeft: `4px solid ${isLow ? tokens.colors.warningScale[500] : tokens.colors.successScale[500]}`,
        }}>
          <Stack direction="horizontal" align="center" justify="space-between">
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isLow ? tokens.colors.warningScale[50] : tokens.colors.successScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Coins size={18} color={isLow ? tokens.colors.warningScale[600] : tokens.colors.successScale[600]} />
              </div>
              <div>
                <p style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  margin: 0,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  {tokenBalance.label ?? 'Interview Credits'}
                </p>
                <p style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {tokenBalance.remaining} <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.normal,
                    color: tokens.colors.neutral[400],
                  }}>remaining</span>
                </p>
              </div>
            </Stack>
            <div style={{ textAlign: 'right' as const }}>
              <p style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                margin: 0,
              }}>
                ${tokenBalance.costPerInterview.toFixed(2)} / interview
              </p>
              {usagePercent !== null && (
                <div style={{
                  width: 80,
                  height: 4,
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.full,
                  marginTop: tokens.spacing[1],
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${usagePercent}%`,
                    height: '100%',
                    backgroundColor: isLow ? tokens.colors.warningScale[500] : tokens.colors.successScale[500],
                    borderRadius: tokens.borderRadius.full,
                  }} />
                </div>
              )}
              {onBuyTokens && (
                <button
                  onClick={onBuyTokens}
                  style={{
                    ...hoverTransition,
                    marginTop: tokens.spacing[2],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    border: 'none',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Buy More
                </button>
              )}
            </div>
          </Stack>
        </div>
      );
    };

    /* ── Main Layout ───────────────────────────────────────────── */
    return (
      <div className={className} style={containerStyle}>
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[5],
          maxWidth: 1200,
          margin: '0 auto',
        }}>
          {/* Welcome Hero */}
          {renderWelcomeHero()}

          {/* Quick Start Wizard (conditional) */}
          {renderWizard()}

          {/* Two-column layout for main content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: tokens.spacing[5],
          }}>
            {/* Left column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[5],
            }}>
              {renderPipeline()}
              {renderSchedule()}
              {renderRecentCandidates()}
            </div>

            {/* Right column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[5],
            }}>
              {renderPerformanceRing()}
              {renderTokenBalance()}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
