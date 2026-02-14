'use client';

/**
 * BhScoringJobQueue - Compact Preset
 * Summary card with key stats and top 3 active jobs.
 * Designed for sidebar or widget placement. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ListOrdered, Clock, CheckCircle, XCircle, Loader,
  Activity, ChevronRight, Zap, AlertTriangle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
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

const MOCK_JOBS: ScoringJobView[] = [
  { job: { id: 'sj-1', status: 'processing' as const, attempts: 0, createdAt: new Date(Date.now() - 120000), startedAt: new Date(Date.now() - 60000) } as any, candidateName: 'Sarah Johnson', jobTitle: 'Senior Frontend Engineer', rubricName: 'Technical Assessment v2', progress: 0.65, priorityLabel: 'urgent', estimatedDuration: 90000 },
  { job: { id: 'sj-2', status: 'processing' as const, attempts: 0, createdAt: new Date(Date.now() - 300000), startedAt: new Date(Date.now() - 120000) } as any, candidateName: 'Michael Chen', jobTitle: 'Backend Developer', rubricName: 'System Design Rubric', progress: 0.3, priorityLabel: 'high', estimatedDuration: 120000 },
  { job: { id: 'sj-3', status: 'pending' as const, attempts: 0, createdAt: new Date(Date.now() - 600000) } as any, candidateName: 'Emily Rodriguez', jobTitle: 'Full Stack Engineer', rubricName: 'Code Review Assessment', progress: 0, priorityLabel: 'normal' },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhScoringJobQueue = createPreset<BhScoringJobQueueProps>({
  name: 'BhScoringJobQueue.Compact',
  render: (ctx: PresetContext<BhScoringJobQueueProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      jobs = [],
      stats = { totalJobs: 0, queued: 0, processing: 0, completed: 0, failed: 0, avgProcessingTime: 0 },
      onJobClick,
      selectedJobId,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onJobClick?.(id);
    }, [onJobClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Get the top 3 active jobs (processing first, then pending) */
    const activeJobs = useMemo(() => {
      const statusOrder: Record<string, number> = { processing: 0, pending: 1, failed: 3, completed: 4 };
      return [...jobs]
        .sort((a, b) => (statusOrder[a.job?.status ?? 'pending'] ?? 2) - (statusOrder[b.job?.status ?? 'pending'] ?? 2))
        .slice(0, 3);
    }, [jobs]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <ListOrdered size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Scoring Queue
            </Text>
          </Box>
          {stats.processing > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{stats.processing}</Text>
            </Box>
          )}
        </Box>

        {/* Mini progress bar showing queue completion */}
        <Box style={{
          display: 'flex',
          height: 4,
          overflow: 'hidden',
        }} role="img" aria-label={`Queue progress: ${stats.completed} of ${stats.totalJobs} completed`}>
          {stats.totalJobs > 0 && (
            <>
              <Box style={{
                flex: stats.completed / stats.totalJobs,
                backgroundColor: t.colors.successScale[500],
                transition: 'flex 0.4s ease',
              }} />
              <Box style={{
                flex: stats.processing / stats.totalJobs,
                backgroundColor: t.colors.primaryScale[500],
                transition: 'flex 0.4s ease',
              }} />
              <Box style={{
                flex: stats.failed / stats.totalJobs,
                backgroundColor: t.colors.errorScale[500],
                transition: 'flex 0.4s ease',
              }} />
              <Box style={{
                flex: stats.queued / stats.totalJobs,
                backgroundColor: t.colors.neutral[200],
                transition: 'flex 0.4s ease',
              }} />
            </>
          )}
        </Box>

        {/* Stats row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {[
            { label: 'Queued', value: stats.queued, color: t.colors.neutral[600] },
            { label: 'Active', value: stats.processing, color: t.colors.primaryScale[600] },
            { label: 'Failed', value: stats.failed, color: t.colors.errorScale[600] },
          ].map((s) => (
            <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }} role="status" aria-label={`${s.label}: ${s.value}`}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: s.color,
                display: 'block',
              }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {s.label}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Top active jobs */}
        <Box role="list" aria-label="Active scoring jobs">
          {activeJobs.map((jv, i) => {
            const id = jv.job?.id ?? '';
            const status = jv.job?.status ?? 'pending';
            const priority = jv.priorityLabel ?? 'normal';
            const isSelected = selectedJobId === id;
            return (
              <Box
                key={id || i}
                role="listitem"
                tabIndex={0}
                aria-label={`${jv.candidateName ?? 'Unknown'}: ${getStatusLabel(status)}`}
                onClick={() => handleClick(id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  borderLeft: `2px solid ${getPriorityColor(priority, t)}`,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 1 }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {jv.candidateName ?? 'Unknown'}
                    </Text>
                    <Box style={{
                      ...createBadgeStyle(t, getStatusBadgeKey(status)),
                      borderRadius: badgeRadius,
                      padding: `0px ${t.spacing[1]}px`,
                    }}>
                      <Text style={{ fontSize: 9 }}>{getStatusLabel(status)}</Text>
                    </Box>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {jv.jobTitle ?? ''}
                  </Text>
                  {/* Mini progress for processing */}
                  {status === 'processing' && (
                    <Box style={{
                      height: 3,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.neutral[100],
                      overflow: 'hidden',
                      marginTop: 3,
                    }}>
                      <Box style={{
                        height: '100%',
                        width: `${Math.round((jv.progress ?? 0) * 100)}%`,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.primaryScale[500],
                        transition: 'width 0.4s ease',
                      }} />
                    </Box>
                  )}
                </Box>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
          {activeJobs.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No active jobs
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
