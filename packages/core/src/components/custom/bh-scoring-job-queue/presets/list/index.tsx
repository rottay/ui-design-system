'use client';

/**
 * BhScoringJobQueue - List Preset
 * Full scoring job queue with stats bar, sortable job list,
 * progress indicators, priority borders, and action buttons.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ListOrdered, Clock, CheckCircle, XCircle, Pause, Play,
  RefreshCw, AlertTriangle, ChevronRight, Loader, Zap,
  ArrowUpDown, Timer, RotateCcw, Ban, Activity,
} from 'lucide-react';
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
  formatDistanceToNow,
  createProgressBarStyle,
} from '../../../helpers';
import type {
  BhScoringJobQueueProps,
  ScoringJob,
  ScoringJobStatus,
  ScoringJobPriority,
  QueueStats,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriorityColor(priority: ScoringJobPriority, t: DesignTokens): string {
  switch (priority) {
    case 'urgent': return t.colors.errorScale[600];
    case 'high': return t.colors.warningScale[600];
    case 'normal': return t.colors.primaryScale[500];
    case 'low': return t.colors.neutral[400];
  }
}

function getPriorityLabel(priority: ScoringJobPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getStatusBadgeKey(status: ScoringJobStatus): 'primary' | 'success' | 'error' | 'warning' | 'secondary' {
  switch (status) {
    case 'queued': return 'secondary';
    case 'processing': return 'primary';
    case 'completed': return 'success';
    case 'failed': return 'error';
    case 'paused': return 'warning';
  }
}

function getStatusLabel(status: ScoringJobStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusIcon(status: ScoringJobStatus) {
  switch (status) {
    case 'queued': return Clock;
    case 'processing': return Loader;
    case 'completed': return CheckCircle;
    case 'failed': return XCircle;
    case 'paused': return Pause;
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

type SortKey = 'priority' | 'status' | 'time';

function sortJobs(jobs: ScoringJob[], sortBy: SortKey): ScoringJob[] {
  const priorityOrder: Record<ScoringJobPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
  const statusOrder: Record<ScoringJobStatus, number> = { processing: 0, queued: 1, paused: 2, failed: 3, completed: 4 };

  return [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        return statusOrder[a.status] - statusOrder[b.status];
      case 'time':
        return b.queuedAt.getTime() - a.queuedAt.getTime();
      default:
        return 0;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_STATS: QueueStats = {
  totalJobs: 42,
  queued: 12,
  processing: 5,
  completed: 20,
  failed: 3,
  avgProcessingTime: 45000,
};

const MOCK_JOBS: ScoringJob[] = [
  { id: 'sj-1', scorableId: 'sc-1', candidateName: 'Sarah Johnson', jobTitle: 'Senior Frontend Engineer', rubricName: 'Technical Assessment v2', status: 'processing', progress: 0.65, priority: 'urgent', queuedAt: new Date(Date.now() - 120000), startedAt: new Date(Date.now() - 60000), estimatedDuration: 90000, retryCount: 0 },
  { id: 'sj-2', scorableId: 'sc-2', candidateName: 'Michael Chen', jobTitle: 'Backend Developer', rubricName: 'System Design Rubric', status: 'processing', progress: 0.3, priority: 'high', queuedAt: new Date(Date.now() - 300000), startedAt: new Date(Date.now() - 120000), estimatedDuration: 120000, retryCount: 0 },
  { id: 'sj-3', scorableId: 'sc-3', candidateName: 'Emily Rodriguez', jobTitle: 'Full Stack Engineer', rubricName: 'Code Review Assessment', status: 'queued', progress: 0, priority: 'normal', queuedAt: new Date(Date.now() - 600000), retryCount: 0 },
  { id: 'sj-4', scorableId: 'sc-4', candidateName: 'James Kim', jobTitle: 'DevOps Engineer', rubricName: 'Infrastructure Rubric', status: 'failed', progress: 0.45, priority: 'high', queuedAt: new Date(Date.now() - 1800000), startedAt: new Date(Date.now() - 1200000), errorMessage: 'Timeout: LLM provider did not respond within 60s', retryCount: 2 },
  { id: 'sj-5', scorableId: 'sc-5', candidateName: 'Anna Kowalski', jobTitle: 'Data Scientist', rubricName: 'ML Knowledge Assessment', status: 'completed', progress: 1, priority: 'normal', queuedAt: new Date(Date.now() - 3600000), startedAt: new Date(Date.now() - 3540000), completedAt: new Date(Date.now() - 3500000), retryCount: 0 },
  { id: 'sj-6', scorableId: 'sc-6', candidateName: 'David Park', jobTitle: 'Senior Frontend Engineer', rubricName: 'Technical Assessment v2', status: 'paused', progress: 0.2, priority: 'low', queuedAt: new Date(Date.now() - 7200000), startedAt: new Date(Date.now() - 7000000), retryCount: 0 },
  { id: 'sj-7', scorableId: 'sc-7', candidateName: 'Lisa Wang', jobTitle: 'Product Manager', rubricName: 'PM Case Study Rubric', status: 'queued', progress: 0, priority: 'urgent', queuedAt: new Date(Date.now() - 180000), retryCount: 0 },
];

/* ================================================================== */
/*  List Preset                                                        */
/* ================================================================== */

export const ListBhScoringJobQueue = createPreset<BhScoringJobQueueProps>({
  name: 'BhScoringJobQueue.List',
  render: (ctx: PresetContext<BhScoringJobQueueProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      jobs = MOCK_JOBS,
      stats = MOCK_STATS,
      onJobClick,
      onRetryJob,
      onCancelJob,
      onPauseJob,
      selectedJobId,
      loading,
      className,
      style,
    } = props;

    const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>('priority');


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const sortedJobs = useMemo(() => sortJobs(jobs, sortBy), [jobs, sortBy]);

    const handleJobClick = useCallback((id: string) => {
      onJobClick?.(id);
    }, [onJobClick]);

    const handleRetry = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onRetryJob?.(id);
    }, [onRetryJob]);

    const handleCancel = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onCancelJob?.(id);
    }, [onCancelJob]);

    const handlePause = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onPauseJob?.(id);
    }, [onPauseJob]);

    const cycleSortBy = useCallback(() => {
      setSortBy((prev) => {
        if (prev === 'priority') return 'status';
        if (prev === 'status') return 'time';
        return 'priority';
      });
    }, []);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* Stats card config */
    const statCards = useMemo(() => [
      { label: 'Total', value: stats.totalJobs, icon: ListOrdered, color: t.colors.primaryScale },
      { label: 'Queued', value: stats.queued, icon: Clock, color: t.colors.neutral },
      { label: 'Processing', value: stats.processing, icon: Activity, color: t.colors.infoScale },
      { label: 'Completed', value: stats.completed, icon: CheckCircle, color: t.colors.successScale },
      { label: 'Failed', value: stats.failed, icon: XCircle, color: t.colors.errorScale },
    ], [stats, t]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <ListOrdered size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Scoring Job Queue
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  AI scoring pipeline status and management
                </Text>
              </Box>
            </Box>
            {stats.processing > 0 && (
              <Box style={{
                ...createBadgeStyle(t, 'primary'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Loader size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{stats.processing} processing</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Stats Cards Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {statCards.map((sc, i) => {
              const Icon = sc.icon;
              return (
                <Box
                  key={sc.label}
                  style={{
                    ...card,
                    ...hoverStyles.base,
                    ...animStyle(i),
                  }}
                  role="status"
                  aria-label={`${sc.label}: ${sc.value}`}
                >
                  {accentBar && <Box style={accentBar} />}


                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: sc.color[50] })}>
                      <Icon size={18} color={sc.color[600]} />
                    </Box>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize['2xl'],
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {sc.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    marginTop: t.spacing[1],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {sc.label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Avg processing time */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            marginBottom: t.spacing[4],
          }}>
            <Timer size={14} color={t.colors.neutral[500]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              Avg processing time: {formatDuration(stats.avgProcessingTime)}
            </Text>
          </Box>

          {/* Job List */}
          <Box style={{ ...card, ...animStyle(5), padding: 0 }}>
            {/* Sort controls header */}
            <Box style={{
              padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[800],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
              }}>
                Jobs
              </Text>
              <button
                onClick={cycleSortBy}
                aria-label={`Sort by ${sortBy}. Click to change.`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600],
                  cursor: 'pointer',
                  fontSize: t.typography.fontSize.xs,
                  fontFamily: 'inherit',
                }}
              >
                <ArrowUpDown size={12} />
                Sort: {sortBy}
              </button>
            </Box>

            <Box role="list" aria-label="Scoring jobs">
              {sortedJobs.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <ListOrdered size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No scoring jobs in queue
                  </Text>
                </Box>
              )}
              {sortedJobs.map((job, i) => {
                const StatusIcon = getStatusIcon(job.status);
                const isHovered = hoveredJobId === job.id;
                const isSelected = selectedJobId === job.id;
                const priorityColor = getPriorityColor(job.priority, t);

                return (
                  <Box
                    key={job.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${job.candidateName}: ${job.jobTitle}, ${getStatusLabel(job.status)}, ${getPriorityLabel(job.priority)} priority`}
                    onClick={() => handleJobClick(job.id)}
                    onMouseEnter={() => setHoveredJobId(job.id)}
                    onMouseLeave={() => setHoveredJobId(null)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleJobClick(job.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      borderLeft: `3px solid ${priorityColor}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? t.colors.primaryScale[50]
                        : isHovered
                          ? t.colors.neutral[50]
                          : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    {/* Priority + Status icon */}
                    <Box style={createIconContainerStyle(t, {
                      size: 36,
                      color: job.status === 'failed'
                        ? t.colors.errorScale[50]
                        : job.status === 'completed'
                          ? t.colors.successScale[50]
                          : job.status === 'processing'
                            ? t.colors.primaryScale[50]
                            : t.colors.neutral[50],
                    })}>
                      <StatusIcon
                        size={16}
                        color={
                          job.status === 'failed'
                            ? t.colors.errorScale[600]
                            : job.status === 'completed'
                              ? t.colors.successScale[600]
                              : job.status === 'processing'
                                ? t.colors.primaryScale[600]
                                : t.colors.neutral[500]
                        }
                      />
                    </Box>

                    {/* Job info */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {job.candidateName}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusBadgeKey(job.status)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getStatusLabel(job.status)}
                          </Text>
                        </Box>
                        {job.priority === 'urgent' && (
                          <Box style={{
                            ...createBadgeStyle(t, 'error'),
                            borderRadius: badgeRadius,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                          }}>
                            <Zap size={10} />
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>Urgent</Text>
                          </Box>
                        )}
                        {job.priority === 'high' && (
                          <Box style={{
                            ...createBadgeStyle(t, 'warning'),
                            borderRadius: badgeRadius,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>High</Text>
                          </Box>
                        )}
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {job.jobTitle}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>|</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {job.rubricName}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatDistanceToNow(job.queuedAt, { addSuffix: true })}
                        </Text>
                      </Box>

                      {/* Progress bar for processing jobs */}
                      {job.status === 'processing' && (
                        <Box style={{ marginTop: t.spacing[2] }}>
                          <Box style={{
                            height: 6,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.neutral[100],
                            overflow: 'hidden',
                          }}>
                            <Box style={{
                              height: '100%',
                              width: `${Math.round(job.progress * 100)}%`,
                              borderRadius: t.borderRadius.full,
                              backgroundColor: t.colors.primaryScale[500],
                              transition: 'width 0.4s ease',
                            }} />
                          </Box>
                          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {Math.round(job.progress * 100)}%
                            </Text>
                            {job.estimatedDuration && job.startedAt && (
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                ETA: {formatDuration(Math.max(0, job.estimatedDuration - (Date.now() - job.startedAt.getTime())))}
                              </Text>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Error message for failed jobs */}
                      {job.status === 'failed' && job.errorMessage && (
                        <Box style={{ 
                          marginTop: t.spacing[2],
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          backgroundColor: t.colors.errorScale[50],
                          borderRadius: t.borderRadius.sm,
                          display: 'flex',
                          alignItems: 'center',
                          gap: t.spacing[1],
                        }}>
                          <AlertTriangle size={10} color={t.colors.errorScale[500]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[700] }}>
                            {job.errorMessage}
                          </Text>
                          {job.retryCount > 0 && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[400], marginLeft: t.spacing[1] }}>
                              (retried {job.retryCount}x)
                            </Text>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Actions (on hover) + chevron */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                      {isHovered && (
                        <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                          {job.status === 'failed' && (
                            <button
                              onClick={(e) => handleRetry(job.id, e)}
                              aria-label="Retry job"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: t.borderRadius.md,
                                border: `1px solid ${t.colors.neutral[200]}`,
                                backgroundColor: t.colors.common.white, color: t.colors.primaryScale[600],
                                cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                                transition: `transform ${t.motion.hover}`,
                              }}
                            >
                              <RotateCcw size={13} />
                            </button>
                          )}
                          {job.status === 'processing' && (
                            <button
                              onClick={(e) => handlePause(job.id, e)}
                              aria-label="Pause job"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: t.borderRadius.md,
                                border: `1px solid ${t.colors.neutral[200]}`,
                                backgroundColor: t.colors.common.white, color: t.colors.warningScale[600],
                                cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                                transition: `transform ${t.motion.hover}`,
                              }}
                            >
                              <Pause size={13} />
                            </button>
                          )}
                          {job.status === 'paused' && (
                            <button
                              onClick={(e) => handlePause(job.id, e)}
                              aria-label="Resume job"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: t.borderRadius.md,
                                border: `1px solid ${t.colors.neutral[200]}`,
                                backgroundColor: t.colors.common.white, color: t.colors.successScale[600],
                                cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                                transition: `transform ${t.motion.hover}`,
                              }}
                            >
                              <Play size={13} />
                            </button>
                          )}
                          {(job.status === 'queued' || job.status === 'processing' || job.status === 'paused') && (
                            <button
                              onClick={(e) => handleCancel(job.id, e)}
                              aria-label="Cancel job"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: t.borderRadius.md,
                                border: `1px solid ${t.colors.neutral[200]}`,
                                backgroundColor: t.colors.common.white, color: t.colors.errorScale[500],
                                cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                                transition: `transform ${t.motion.hover}`,
                              }}
                            >
                              <Ban size={13} />
                            </button>
                          )}
                        </Box>
                      )}
                      <ChevronRight size={14} color={t.colors.neutral[300]} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
