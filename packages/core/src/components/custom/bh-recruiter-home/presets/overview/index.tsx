'use client';

/**
 * BhRecruiterHome - Overview Preset
 * Full recruiter dashboard with KPI ribbon, pipeline snapshot, interviews,
 * quick actions, activity feed, notifications, AI suggestions, and performance metrics.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhRecruiterHomeProps,
  KpiStat,
  PipelineJob,
  UpcomingInterview,
  QuickAction,
  ActivityItem,
  Notification,
  AISuggestion,
  PerformanceMetric,
  NotificationType,
  ActivityType,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline polyline points from data array                 */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function sparklinePolygonPoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const line = sparklinePoints(data, width, height, padding);
  const lastX = padding + (data.length - 1) * ((width - padding * 2) / (data.length - 1 || 1));
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: progress circle dash offset                               */
/* ------------------------------------------------------------------ */
function progressCircle(value: number, target: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (target || 1), 1);
  const dashArray = `${pct * circumference} ${circumference}`;
  return { circumference, dashArray, pct };
}

/* ------------------------------------------------------------------ */
/*  Helper: format relative time                                      */
/* ------------------------------------------------------------------ */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? ' ago' : ' from now';

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds}s${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${suffix}`;
  const days = Math.floor(hours / 24);
  return `${days}d${suffix}`;
}

function formatInterviewTime(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

/* ------------------------------------------------------------------ */
/*  Overview Preset                                                   */
/* ------------------------------------------------------------------ */
export const OverviewBhRecruiterHome = createPreset<BhRecruiterHomeProps>({
  name: 'BhRecruiterHome.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhRecruiterHomeProps>) => {
    const { Box, Text } = primitives;

    const {
      recruiterName = 'Recruiter',
      kpiStats = [],
      pipelineJobs = [],
      upcomingInterviews = [],
      quickActions = [],
      activityFeed = [],
      notifications = [],
      aiSuggestions = [],
      performanceMetrics = [],
      onQuickAction,
      onPipelineJobClick,
      onInterviewClick,
      onNotificationDismiss,
      onSuggestionAccept,
      onSuggestionDismiss,
      onActivityClick,
      dateRangeLabel = 'Last 30 days',
      showAISuggestions = true,
      className,
      style,
    } = props;

    const [selectedJob, setSelectedJob] = useState<string | null>(
      pipelineJobs.length > 0 ? pipelineJobs[0].id : null
    );
    const [dateRange, setDateRange] = useState<string>(dateRangeLabel);
    const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
    const [notificationDismissed, setNotificationDismissed] = useState<Set<string>>(new Set());

    const isGlass = engine === 'modern' && !!tokens.glass;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    const filteredActivity = useMemo(() => {
      if (activityFilter === 'all') return activityFeed;
      return activityFeed.filter((a) => a.type === activityFilter);
    }, [activityFeed, activityFilter]);

    const visibleNotifications = useMemo(() => {
      return notifications.filter((n) => !notificationDismissed.has(n.id));
    }, [notifications, notificationDismissed]);

    const handleDismissNotification = (id: string) => {
      setNotificationDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      onNotificationDismiss?.(id);
    };

    /* ---------- Notification type styling ---------- */
    const notifStyle = (type: NotificationType) => {
      switch (type) {
        case 'breach':
          return {
            bg: tokens.colors.errorScale[50],
            border: tokens.colors.errorScale[200],
            icon: tokens.colors.errorScale[500],
            text: tokens.colors.errorScale[700],
          };
        case 'approval':
          return {
            bg: tokens.colors.warningScale[50],
            border: tokens.colors.warningScale[200],
            icon: tokens.colors.warningScale[500],
            text: tokens.colors.warningScale[700],
          };
        case 'candidate':
          return {
            bg: tokens.colors.infoScale[50],
            border: tokens.colors.infoScale[200],
            icon: tokens.colors.infoScale[500],
            text: tokens.colors.infoScale[700],
          };
      }
    };

    /* ---------- Activity type icon ---------- */
    const activityIcon = (type: ActivityType): { symbol: string; color: string } => {
      switch (type) {
        case 'applied':
          return { symbol: '\u{1F4E5}', color: tokens.colors.infoScale[500] };
        case 'interview':
          return { symbol: '\u{1F399}', color: tokens.colors.primaryScale[500] };
        case 'offer':
          return { symbol: '\u{1F4E8}', color: tokens.colors.successScale[500] };
        case 'hired':
          return { symbol: '\u{2705}', color: tokens.colors.successScale[600] };
        case 'rejected':
          return { symbol: '\u{274C}', color: tokens.colors.errorScale[500] };
        case 'note':
          return { symbol: '\u{1F4DD}', color: tokens.colors.warningScale[500] };
        case 'stage-change':
          return { symbol: '\u{27A1}', color: tokens.colors.secondaryScale[500] };
        default:
          return { symbol: '\u{1F4CB}', color: tokens.colors.neutral[400] };
      }
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                            */
    /* ------------------------------------------------------------------ */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  Header greeting                                             */}
        {/* =========================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[6],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[1],
              }}
            >
              Welcome back, {recruiterName}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Here is what is happening across your pipeline today.
            </Text>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}
          >
            <button
              onClick={() => setDateRange(dateRange)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              {dateRange} &#9662;
            </button>
          </div>
        </div>

        {/* =========================================================== */}
        {/*  1. KPI Stats Ribbon                                        */}
        {/* =========================================================== */}
        {kpiStats.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(kpiStats.length, 6)}, 1fr)`,
              gap: tokens.spacing[4],
              marginBottom: tokens.spacing[6],
            }}
          >
            {kpiStats.map((stat, idx) => {
              const trendColor =
                stat.trend === 'up'
                  ? tokens.colors.successScale[600]
                  : stat.trend === 'down'
                  ? tokens.colors.errorScale[600]
                  : tokens.colors.neutral[500];
              const trendArrow = stat.trend === 'up' ? '\u2191' : stat.trend === 'down' ? '\u2193' : '\u2192';
              const sparkData = stat.sparklineData ?? [];
              const sparkW = 80;
              const sparkH = 32;

              return (
                <div key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          fontWeight: tokens.typography.fontWeight.medium,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.04em',
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {stat.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                        }}
                      >
                        {stat.value}
                      </Text>
                    </div>
                    {stat.icon && (
                      <div
                        style={{
                          width: tokens.spacing[8],
                          height: tokens.spacing[8],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.primaryScale[50],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: tokens.colors.primaryScale[600],
                          fontSize: tokens.typography.fontSize.lg,
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: trendColor,
                        }}
                      >
                        {trendArrow} {stat.trendValue}%
                      </span>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                        }}
                      >
                        vs prev
                      </span>
                    </div>

                    {sparkData.length > 1 && (
                      <svg width={sparkW} height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`}>
                        <defs>
                          <linearGradient id={`spark-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="0%"
                              stopColor={stat.trend === 'up' ? tokens.colors.successScale[400] : tokens.colors.errorScale[400]}
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor={stat.trend === 'up' ? tokens.colors.successScale[400] : tokens.colors.errorScale[400]}
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={sparklinePolygonPoints(sparkData, sparkW, sparkH, 2)}
                          fill={`url(#spark-grad-${idx})`}
                        />
                        <polyline
                          points={sparklinePoints(sparkData, sparkW, sparkH, 2)}
                          fill="none"
                          stroke={stat.trend === 'up' ? tokens.colors.successScale[500] : tokens.colors.errorScale[500]}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Two column layout: main + sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: tokens.spacing[6],
          }}
        >
          {/* ===================== LEFT COLUMN ===================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* =========================================================== */}
            {/*  2. Pipeline Snapshot                                       */}
            {/* =========================================================== */}
            {pipelineJobs.length > 0 && (
              <div style={cardBase}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    Pipeline Snapshot
                  </Text>
                  <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                    {pipelineJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSelectedJob(job.id);
                          onPipelineJobClick?.(job.id);
                        }}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border:
                            selectedJob === job.id
                              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor:
                            selectedJob === job.id
                              ? tokens.colors.primaryScale[50]
                              : tokens.colors.common.white,
                          color:
                            selectedJob === job.id
                              ? tokens.colors.primaryScale[600]
                              : tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight:
                            selectedJob === job.id
                              ? tokens.typography.fontWeight.semibold
                              : tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          ...hoverStyle,
                        }}
                      >
                        {job.title}
                      </button>
                    ))}
                  </div>
                </div>

                {pipelineJobs.map((job) => {
                  if (selectedJob && selectedJob !== job.id) return null;
                  const totalCandidates = job.stages.reduce((s, st) => s + st.count, 0);
                  const maxCount = Math.max(...job.stages.map((st) => st.count), 1);
                  const barHeight = 28;
                  const stageColors = [
                    tokens.colors.primaryScale[500],
                    tokens.colors.primaryScale[400],
                    tokens.colors.infoScale[500],
                    tokens.colors.warningScale[500],
                    tokens.colors.successScale[500],
                    tokens.colors.secondaryScale[500],
                    tokens.colors.primaryScale[300],
                    tokens.colors.infoScale[400],
                  ];

                  return (
                    <div key={job.id} style={{ marginBottom: tokens.spacing[2] }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[3],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[700],
                          }}
                        >
                          {job.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {totalCandidates} candidates
                        </Text>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                        {job.stages.map((stage, si) => {
                          const pct = (stage.count / maxCount) * 100;
                          const color = stageColors[si % stageColors.length];
                          return (
                            <div
                              key={stage.name}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '120px 1fr 40px',
                                alignItems: 'center',
                                gap: tokens.spacing[3],
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[600],
                                  textAlign: 'right' as const,
                                  fontWeight: tokens.typography.fontWeight.medium,
                                }}
                              >
                                {stage.name}
                              </Text>
                              <div
                                style={{
                                  height: barHeight,
                                  backgroundColor: tokens.colors.neutral[100],
                                  borderRadius: tokens.borderRadius.sm,
                                  overflow: 'hidden',
                                  position: 'relative' as const,
                                }}
                              >
                                <div
                                  style={{
                                    position: 'absolute' as const,
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${pct}%`,
                                    backgroundColor: color,
                                    borderRadius: tokens.borderRadius.sm,
                                    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                                  }}
                                />
                              </div>
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.neutral[700],
                                }}
                              >
                                {stage.count}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* =========================================================== */}
            {/*  3. Upcoming Interviews Timeline                            */}
            {/* =========================================================== */}
            {upcomingInterviews.length > 0 && (
              <div style={cardBase}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Upcoming Interviews
                </Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {upcomingInterviews.map((interview) => {
                    const aiBadge = interview.isAI
                      ? createBadgeStyle(tokens, 'secondary')
                      : null;
                    const humanBadge = !interview.isAI
                      ? createBadgeStyle(tokens, 'primary')
                      : null;

                    return (
                      <div
                        key={interview.id}
                        onClick={() => onInterviewClick?.(interview.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[3],
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.neutral[50],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          ...hoverStyle,
                        }}
                        onMouseEnter={(e) => {
                          Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = 'none';
                        }}
                      >
                        {/* Candidate avatar */}
                        <div
                          style={{
                            width: tokens.spacing[10],
                            height: tokens.spacing[10],
                            borderRadius: tokens.borderRadius.full,
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: tokens.colors.primaryScale[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: tokens.colors.primaryScale[700],
                            fontSize: tokens.typography.fontSize.md,
                            fontWeight: tokens.typography.fontWeight.semibold,
                          }}
                        >
                          {interview.candidateAvatar ? (
                            <img
                              src={interview.candidateAvatar}
                              alt=""
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover' as const,
                              }}
                            />
                          ) : (
                            interview.candidateName.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap' as const,
                            }}
                          >
                            {interview.candidateName}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                              display: 'block',
                            }}
                          >
                            {interview.jobTitle} &middot; {interview.stageName}
                          </Text>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: tokens.spacing[1],
                            flexShrink: 0,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[700],
                            }}
                          >
                            {formatInterviewTime(interview.time)}
                          </Text>
                          <span
                            style={
                              interview.isAI
                                ? { ...aiBadge, fontSize: tokens.typography.fontSize.xs }
                                : { ...humanBadge, fontSize: tokens.typography.fontSize.xs }
                            }
                          >
                            {interview.isAI ? 'AI Screen' : 'In-Person'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/*  4. Quick Actions Grid                                      */}
            {/* =========================================================== */}
            {quickActions.length > 0 && (
              <div style={cardBase}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Quick Actions
                </Text>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: tokens.spacing[3],
                  }}
                >
                  {quickActions.map((action) => (
                    <div
                      key={action.key}
                      onClick={() => {
                        onQuickAction?.(action.key);
                        action.onClick?.();
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center' as const,
                        padding: tokens.spacing[4],
                        borderRadius: tokens.borderRadius.lg,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        ...hoverStyle,
                      }}
                      onMouseEnter={(e) => {
                        Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                        (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'none';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      }}
                    >
                      <div
                        style={{
                          width: tokens.spacing[10],
                          height: tokens.spacing[10],
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: tokens.colors.primaryScale[50],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: tokens.spacing[3],
                          color: tokens.colors.primaryScale[600],
                          fontSize: tokens.typography.fontSize.xl,
                        }}
                      >
                        {action.icon}
                      </div>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {action.label}
                      </Text>
                      {action.description && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {action.description}
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/*  5. Recent Activity Feed                                    */}
            {/* =========================================================== */}
            {activityFeed.length > 0 && (
              <div style={cardBase}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    Recent Activity
                  </Text>
                  <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {(['all', 'applied', 'interview', 'offer', 'hired'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border:
                            activityFilter === f
                              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor:
                            activityFilter === f ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                          color:
                            activityFilter === f
                              ? tokens.colors.primaryScale[600]
                              : tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight:
                            activityFilter === f
                              ? tokens.typography.fontWeight.semibold
                              : tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          textTransform: 'capitalize' as const,
                          ...hoverStyle,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[0] }}>
                  {filteredActivity.slice(0, 8).map((item) => {
                    const ai = activityIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onActivityClick?.(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[3],
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          borderRadius: tokens.borderRadius.sm,
                          ...hoverStyle,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor =
                            tokens.colors.neutral[50];
                          e.currentTarget.style.transform = tokens.motion.transform;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.md,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          {ai.symbol}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[800],
                              display: 'block',
                              lineHeight: tokens.typography.lineHeight.relaxed,
                            }}
                          >
                            {item.message}
                            {item.entityName && (
                              <span
                                style={{
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.primaryScale[600],
                                }}
                              >
                                {' '}
                                {item.entityName}
                              </span>
                            )}
                          </Text>
                        </div>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                            flexShrink: 0,
                            whiteSpace: 'nowrap' as const,
                          }}
                        >
                          {formatRelativeTime(item.time)}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===================== RIGHT COLUMN (SIDEBAR) ===================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* =========================================================== */}
            {/*  6. Notifications Sidebar                                   */}
            {/* =========================================================== */}
            {visibleNotifications.length > 0 && (
              <div style={cardBase}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    Notifications
                  </Text>
                  <div
                    style={{
                      ...createBadgeStyle(tokens, 'error'),
                      fontSize: tokens.typography.fontSize.xs,
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    }}
                  >
                    {visibleNotifications.length}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {visibleNotifications.map((notif) => {
                    const ns = notifStyle(notif.type);
                    return (
                      <div
                        key={notif.id}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: ns.bg,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${ns.border}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[2],
                        }}
                      >
                        <div
                          style={{
                            width: tokens.spacing[5],
                            height: tokens.spacing[5],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: ns.icon,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 2,
                          }}
                        >
                          <span
                            style={{
                              color: tokens.colors.common.white,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.bold,
                            }}
                          >
                            {notif.type === 'breach' ? '!' : notif.type === 'approval' ? '?' : '+'}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: ns.text,
                              fontWeight: tokens.typography.fontWeight.medium,
                              display: 'block',
                              lineHeight: tokens.typography.lineHeight.relaxed,
                            }}
                          >
                            {notif.message}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                              marginTop: tokens.spacing[1],
                              display: 'block',
                            }}
                          >
                            {formatRelativeTime(notif.time)}
                          </Text>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismissNotification(notif.id);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: tokens.colors.neutral[400],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            padding: tokens.spacing[1],
                            fontSize: tokens.typography.fontSize.sm,
                            flexShrink: 0,
                            lineHeight: 1,
                          }}
                        >
                          &#x2715;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/*  7. AI Suggestions Panel                                    */}
            {/* =========================================================== */}
            {showAISuggestions && aiSuggestions.length > 0 && (
              <div
                style={{
                  ...cardBase,
                  background: isGlass
                    ? tokens.glass?.bg
                    : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.secondaryScale[50]})`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  <div
                    style={{
                      width: tokens.spacing[6],
                      height: tokens.spacing[6],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    &#x2728;
                  </div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    AI Suggestions
                  </Text>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {aiSuggestions.map((suggestion) => {
                    const confidenceColor =
                      suggestion.confidence >= 80
                        ? 'success'
                        : suggestion.confidence >= 50
                        ? 'warning'
                        : 'error';
                    const confidenceBadge = useMemo(() => createBadgeStyle(tokens, confidenceColor as 'success' | 'warning' | 'error'), [tokens]);

                    return (
                      <div
                        key={suggestion.id}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.common.white,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {suggestion.action}
                          </Text>
                          <span
                            style={{
                              ...confidenceBadge,
                              fontSize: tokens.typography.fontSize.xs,
                              padding: `0 ${tokens.spacing[2]}px`,
                            }}
                          >
                            {suggestion.confidence}%
                          </span>
                        </div>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            display: 'block',
                            marginBottom: tokens.spacing[3],
                            lineHeight: tokens.typography.lineHeight.relaxed,
                          }}
                        >
                          {suggestion.reason}
                        </Text>
                        <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                          <button
                            onClick={() => onSuggestionAccept?.(suggestion.id)}
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: 'none',
                              backgroundColor: tokens.colors.primaryScale[600],
                              color: tokens.colors.common.white,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              ...hoverStyle,
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => onSuggestionDismiss?.(suggestion.id)}
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              backgroundColor: tokens.colors.common.white,
                              color: tokens.colors.neutral[600],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              ...hoverStyle,
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/*  8. Performance Mini-Chart                                  */}
            {/* =========================================================== */}
            {performanceMetrics.length > 0 && (
              <div style={cardBase}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Your Performance
                </Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                  {performanceMetrics.map((metric, mi) => {
                    const radius = 28;
                    const strokeWidth = 5;
                    const size = (radius + strokeWidth) * 2;
                    const { dashArray, pct } = progressCircle(metric.value, metric.target, radius);
                    const metricColors = [
                      { track: tokens.colors.primaryScale[100], fill: tokens.colors.primaryScale[500] },
                      { track: tokens.colors.successScale[100], fill: tokens.colors.successScale[500] },
                      { track: tokens.colors.infoScale[100], fill: tokens.colors.infoScale[500] },
                      { track: tokens.colors.warningScale[100], fill: tokens.colors.warningScale[500] },
                      { track: tokens.colors.secondaryScale[100], fill: tokens.colors.secondaryScale[500] },
                    ];
                    const mc = metricColors[mi % metricColors.length];

                    return (
                      <div
                        key={metric.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[3],
                        }}
                      >
                        <svg
                          width={size}
                          height={size}
                          viewBox={`0 0 ${size} ${size}`}
                          style={{ flexShrink: 0 }}
                        >
                          <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={mc.track}
                            strokeWidth={strokeWidth}
                          />
                          <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={mc.fill}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArray}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{
                              transition: `stroke-dasharray ${tokens.motion.hover}`,
                            }}
                          />
                          <text
                            x={size / 2}
                            y={size / 2}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={tokens.colors.neutral[900]}
                            fontSize={tokens.typography.fontSize.xs}
                            fontWeight={tokens.typography.fontWeight.bold}
                          >
                            {Math.round(pct * 100)}%
                          </text>
                        </svg>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              display: 'block',
                            }}
                          >
                            {metric.label}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                            }}
                          >
                            {metric.value} / {metric.target}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
