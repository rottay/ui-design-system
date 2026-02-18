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
  ScoringJobView,
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
  return (priority || '').charAt(0).toUpperCase() + (priority || '').slice(1);
}

function getStatusBadgeKey(status: ScoringJobStatus | string): 'primary' | 'success' | 'error' | 'warning' | 'secondary' {
  switch (status) {
    case 'pending': return 'secondary';
    case 'processing': return 'primary';
    case 'completed': return 'success';
    case 'failed': return 'error';
    default: return 'secondary';
  }
}

function getStatusLabel(status: ScoringJobStatus | string): string {
  return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
}

function getStatusIcon(status: ScoringJobStatus | string) {
  switch (status) {
    case 'pending': return Clock;
    case 'processing': return Loader;
    case 'completed': return CheckCircle;
    case 'failed': return XCircle;
    default: return Clock;
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

function getJobId(j: ScoringJobView): string {
  return j.job?.id ?? '';
}

function getJobStatus(j: ScoringJobView): string {
  return j.job?.status ?? 'pending';
}

function getJobPriority(j: ScoringJobView): ScoringJobPriority {
  return j.priorityLabel ?? 'normal';
}

function getJobCreatedAt(j: ScoringJobView): Date {
  return j.job?.createdAt ? new Date(j.job.createdAt) : new Date();
}

function sortJobs(jobs: ScoringJobView[], sortBy: SortKey): ScoringJobView[] {
  const priorityOrder: Record<ScoringJobPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
  const statusOrder: Record<string, number> = { processing: 0, pending: 1, failed: 3, completed: 4 };

  return [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return (priorityOrder[getJobPriority(a)] ?? 2) - (priorityOrder[getJobPriority(b)] ?? 2);
      case 'status':
        return (statusOrder[getJobStatus(a)] ?? 2) - (statusOrder[getJobStatus(b)] ?? 2);
      case 'time':
        return getJobCreatedAt(b).getTime() - getJobCreatedAt(a).getTime();
      default:
        return 0;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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
      jobs: rawJobs = [],
      stats = { totalJobs: 0, queued: 0, processing: 0, completed: 0, failed: 0, avgProcessingTime: 0 },
      onJobClick,
      onRetryJob,
      onCancelJob,
      onPauseJob,
      selectedJobId,
      loading,
      className,
      style,
    } = props;

    const jobs = Array.isArray(rawJobs) ? rawJobs : [];

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

          {/* Avg processing time + extended stats */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[4],
            marginBottom: t.spacing[4],
            flexWrap: 'wrap' as const,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Timer size={14} color={t.colors.neutral[500]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Avg processing: {formatDuration(stats.avgProcessingTime)}
              </Text>
            </Box>
            {stats.p95ProcessingTime !== undefined && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                P95: {formatDuration(stats.p95ProcessingTime)}
              </Text>
            )}
            {stats.avgQueueWaitTime !== undefined && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                Avg wait: {formatDuration(stats.avgQueueWaitTime)}
              </Text>
            )}
            {stats.throughputPerHour !== undefined && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {stats.throughputPerHour.toFixed(1)} jobs/hr
              </Text>
            )}
            {stats.errorRate !== undefined && (
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: stats.errorRate > 0.1 ? t.colors.errorScale[600] : t.colors.neutral[400],
              }}>
                Error rate: {(stats.errorRate * 100).toFixed(1)}%
              </Text>
            )}
            {stats.totalTokensUsed !== undefined && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                Total tokens: {stats.totalTokensUsed.toLocaleString()}
              </Text>
            )}
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
              {sortedJobs.map((jv, i) => {
                const id = getJobId(jv);
                const status = getJobStatus(jv);
                const priority = getJobPriority(jv);
                const StatusIcon = getStatusIcon(status as ScoringJobStatus);
                const isHovered = hoveredJobId === id;
                const isSelected = selectedJobId === id;
                const priorityColor = getPriorityColor(priority, t);

                return (
                  <Box
                    key={id || i}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${jv.candidateName ?? 'Unknown'}: ${jv.jobTitle ?? ''}, ${getStatusLabel(status as ScoringJobStatus)}, ${getPriorityLabel(priority)} priority`}
                    onClick={() => handleJobClick(id)}
                    onMouseEnter={() => setHoveredJobId(id)}
                    onMouseLeave={() => setHoveredJobId(null)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleJobClick(id);
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
                      color: status === 'failed'
                        ? t.colors.errorScale[50]
                        : status === 'completed'
                          ? t.colors.successScale[50]
                          : status === 'processing'
                            ? t.colors.primaryScale[50]
                            : t.colors.neutral[50],
                    })}>
                      <StatusIcon
                        size={16}
                        color={
                          status === 'failed'
                            ? t.colors.errorScale[600]
                            : status === 'completed'
                              ? t.colors.successScale[600]
                              : status === 'processing'
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
                          {jv.candidateName ?? 'Unknown'}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusBadgeKey(status as ScoringJobStatus)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getStatusLabel(status as ScoringJobStatus)}
                          </Text>
                        </Box>
                        {priority === 'urgent' && (
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
                        {priority === 'high' && (
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
                          {jv.jobTitle ?? ''}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>|</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {jv.rubricName ?? ''}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatDistanceToNow(getJobCreatedAt(jv), { addSuffix: true })}
                        </Text>
                        {jv.llmModel && (
                          <>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>|</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              {jv.llmModel}
                            </Text>
                          </>
                        )}
                      </Box>

                      {/* Retry count + tokens + dimensions info */}
                      {(jv.retryCount !== undefined && jv.retryCount > 0 || jv.tokensUsed !== undefined || jv.dimensionsScored !== undefined || jv.processingTimeMs !== undefined) && (
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap', marginTop: t.spacing[1] }}>
                          {jv.retryCount !== undefined && jv.retryCount > 0 && (
                            <Box style={{
                              ...createBadgeStyle(t, jv.retryCount >= (jv.maxRetries ?? 3) ? 'error' : 'warning'),
                              borderRadius: badgeRadius,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                            }}>
                              <RefreshCw size={9} />
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                                {jv.retryCount}/{jv.maxRetries ?? '?'}
                              </Text>
                            </Box>
                          )}
                          {jv.dimensionsScored !== undefined && jv.totalDimensions !== undefined && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {jv.dimensionsScored}/{jv.totalDimensions} dims
                            </Text>
                          )}
                          {jv.tokensUsed !== undefined && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {jv.tokensUsed.toLocaleString()} tokens
                            </Text>
                          )}
                          {jv.processingTimeMs !== undefined && status === 'completed' && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {formatDuration(jv.processingTimeMs)}
                            </Text>
                          )}
                        </Box>
                      )}

                      {/* Progress bar for processing jobs */}
                      {status === 'processing' && (
                        <Box style={{ marginTop: t.spacing[2] }}>
                          <Box style={{
                            height: 6,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.neutral[100],
                            overflow: 'hidden',
                          }}>
                            <Box style={{
                              height: '100%',
                              width: `${Math.round((jv.progress ?? 0) * 100)}%`,
                              borderRadius: t.borderRadius.full,
                              backgroundColor: t.colors.primaryScale[500],
                              transition: 'width 0.4s ease',
                            }} />
                          </Box>
                          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {Math.round((jv.progress ?? 0) * 100)}%
                            </Text>
                            {jv.estimatedDuration && jv.job?.startedAt && (
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                ETA: {formatDuration(Math.max(0, jv.estimatedDuration - (Date.now() - new Date(jv.job.startedAt).getTime())))}
                              </Text>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Error message for failed jobs */}
                      {status === 'failed' && jv.job?.errorMessage && (
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
                            {jv.job.errorMessage}
                          </Text>
                          {(jv.job?.attempts ?? 0) > 0 && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[400], marginLeft: t.spacing[1] }}>
                              (retried {jv.job?.attempts ?? 0}x)
                            </Text>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Actions (on hover) + chevron */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                      {isHovered && (
                        <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                          {status === 'failed' && (
                            <button
                              onClick={(e) => handleRetry(id, e)}
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
                          {status === 'processing' && (
                            <button
                              onClick={(e) => handlePause(id, e)}
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
                          {(status === 'pending' || status === 'processing') && (
                            <button
                              onClick={(e) => handleCancel(id, e)}
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
