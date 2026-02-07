'use client';

/**
 * BhRecruiterHome - Compact Preset
 * Dense recruiter dashboard with compact table layouts and tighter spacing.
 * Optimized for power users who need maximum information density.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
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
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function miniSparkPoints(data: number[], w: number, h: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  return data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');
}

function formatShortTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? ' ago' : '';

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds}s${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${suffix}`;
  const days = Math.floor(hours / 24);
  return `${days}d${suffix}`;
}

function formatCompactTime(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return timeStr;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                    */
/* ------------------------------------------------------------------ */
export const CompactBhRecruiterHome = createPreset<BhRecruiterHomeProps>({
  name: 'BhRecruiterHome.Compact',
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
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

    const cardStyle = createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
      padding: tokens.spacing[3] as unknown as number,
    });

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

    const notifColor = (type: NotificationType) => {
      switch (type) {
        case 'breach':
          return { bg: tokens.colors.errorScale[50], dot: tokens.colors.errorScale[500], text: tokens.colors.errorScale[700] };
        case 'approval':
          return { bg: tokens.colors.warningScale[50], dot: tokens.colors.warningScale[500], text: tokens.colors.warningScale[700] };
        case 'candidate':
          return { bg: tokens.colors.infoScale[50], dot: tokens.colors.infoScale[500], text: tokens.colors.infoScale[700] };
      }
    };

    const activitySymbol = (type: ActivityType): string => {
      switch (type) {
        case 'applied': return '\u{1F4E5}';
        case 'interview': return '\u{1F399}';
        case 'offer': return '\u{1F4E8}';
        case 'hired': return '\u{2705}';
        case 'rejected': return '\u{274C}';
        case 'note': return '\u{1F4DD}';
        case 'stage-change': return '\u{27A1}';
        default: return '\u{1F4CB}';
      }
    };

    /* Section header helper */
    const SectionHeader = ({ children }: { children: string }) => (
      <Text
        style={{
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[500],
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          display: 'block',
          marginBottom: tokens.spacing[2],
        }}
      >
        {children}
      </Text>
    );

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
          padding: tokens.spacing[4],
          ...style,
        }}
      >
        {/* Header */}
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
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            Dashboard &mdash; {recruiterName}
          </Text>
          <button
            onClick={() => setDateRange(dateRange)}
            style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              cursor: 'pointer',
            }}
          >
            {dateRange} &#9662;
          </button>
        </div>

        {/* =========================================================== */}
        {/*  1. Compact KPI Stat Row                                    */}
        {/* =========================================================== */}
        {kpiStats.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(kpiStats.length, 6)}, 1fr)`,
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[4],
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

              return (
                <div
                  key={idx}
                  style={{
                    ...cardStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                >
                  {stat.icon && (
                    <div
                      style={{
                        width: tokens.spacing[7],
                        height: tokens.spacing[7],
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.primaryScale[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.primaryScale[600],
                        fontSize: tokens.typography.fontSize.sm,
                        flexShrink: 0,
                      }}
                    >
                      {stat.icon}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        display: 'block',
                        whiteSpace: 'nowrap' as const,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {stat.label}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[1] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {stat.value}
                      </Text>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: trendColor,
                        }}
                      >
                        {trendArrow}{stat.trendValue}%
                      </span>
                    </div>
                  </div>
                  {sparkData.length > 1 && (
                    <svg width={48} height={20} viewBox="0 0 48 20" style={{ flexShrink: 0 }}>
                      <polyline
                        points={miniSparkPoints(sparkData, 48, 20)}
                        fill="none"
                        stroke={stat.trend === 'up' ? tokens.colors.successScale[400] : tokens.colors.errorScale[400]}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Three-column dense layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 280px',
            gap: tokens.spacing[4],
          }}
        >
          {/* ===================== COLUMN 1 ===================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
            {/* =========================================================== */}
            {/*  2. Pipeline Table                                          */}
            {/* =========================================================== */}
            {pipelineJobs.length > 0 && (
              <div style={cardStyle}>
                <SectionHeader>Pipeline</SectionHeader>

                {/* Job selector tabs */}
                <div
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[1],
                    marginBottom: tokens.spacing[3],
                    flexWrap: 'wrap' as const,
                  }}
                >
                  {pipelineJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job.id);
                        onPipelineJobClick?.(job.id);
                      }}
                      style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border:
                          selectedJob === job.id
                            ? `1px solid ${tokens.colors.primaryScale[300]}`
                            : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                        backgroundColor:
                          selectedJob === job.id ? tokens.colors.primaryScale[50] : 'transparent',
                        color:
                          selectedJob === job.id
                            ? tokens.colors.primaryScale[600]
                            : tokens.colors.neutral[500],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight:
                          selectedJob === job.id
                            ? tokens.typography.fontWeight.semibold
                            : tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                      }}
                    >
                      {job.title}
                    </button>
                  ))}
                </div>

                {/* Stage table */}
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse' as const,
                    fontSize: tokens.typography.fontSize.xs,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: 'left' as const,
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                          borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                          color: tokens.colors.neutral[500],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        Stage
                      </th>
                      <th
                        style={{
                          textAlign: 'right' as const,
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                          borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                          color: tokens.colors.neutral[500],
                          fontWeight: tokens.typography.fontWeight.medium,
                          width: 40,
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          textAlign: 'left' as const,
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                          borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                          color: tokens.colors.neutral[500],
                          fontWeight: tokens.typography.fontWeight.medium,
                          width: '50%',
                        }}
                      >
                        Bar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineJobs
                      .filter((j) => !selectedJob || j.id === selectedJob)
                      .map((job) => {
                        const maxCount = Math.max(...job.stages.map((s) => s.count), 1);
                        const stageColors = [
                          tokens.colors.primaryScale[500],
                          tokens.colors.primaryScale[400],
                          tokens.colors.infoScale[500],
                          tokens.colors.warningScale[500],
                          tokens.colors.successScale[500],
                          tokens.colors.secondaryScale[500],
                        ];
                        return job.stages.map((stage, si) => (
                          <tr key={`${job.id}-${stage.name}`}>
                            <td
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                                color: tokens.colors.neutral[700],
                                fontWeight: tokens.typography.fontWeight.medium,
                                whiteSpace: 'nowrap' as const,
                              }}
                            >
                              {stage.name}
                            </td>
                            <td
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                                textAlign: 'right' as const,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[800],
                              }}
                            >
                              {stage.count}
                            </td>
                            <td
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                              }}
                            >
                              <div
                                style={{
                                  height: tokens.spacing[2],
                                  backgroundColor: tokens.colors.neutral[100],
                                  borderRadius: tokens.borderRadius.sm,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${(stage.count / maxCount) * 100}%`,
                                    backgroundColor: stageColors[si % stageColors.length],
                                    borderRadius: tokens.borderRadius.sm,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ));
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* =========================================================== */}
            {/*  4. Quick Actions (compact row)                             */}
            {/* =========================================================== */}
            {quickActions.length > 0 && (
              <div style={cardStyle}>
                <SectionHeader>Quick Actions</SectionHeader>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: tokens.spacing[2],
                  }}
                >
                  {quickActions.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => {
                        onQuickAction?.(action.key);
                        action.onClick?.();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.common.white,
                        cursor: 'pointer',
                        textAlign: 'left' as const,
                        ...hoverStyle,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          tokens.colors.neutral[50];
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          tokens.colors.common.white;
                      }}
                    >
                      <span
                        style={{
                          width: tokens.spacing[6],
                          height: tokens.spacing[6],
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.primaryScale[50],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: tokens.colors.primaryScale[600],
                          fontSize: tokens.typography.fontSize.sm,
                          flexShrink: 0,
                        }}
                      >
                        {action.icon}
                      </span>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {action.label}
                      </Text>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/*  8. Performance Compact                                     */}
            {/* =========================================================== */}
            {performanceMetrics.length > 0 && (
              <div style={cardStyle}>
                <SectionHeader>Performance</SectionHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {performanceMetrics.map((metric) => {
                    const pct = Math.min(metric.value / (metric.target || 1), 1);
                    const barColor =
                      pct >= 0.8
                        ? tokens.colors.successScale[500]
                        : pct >= 0.5
                        ? tokens.colors.warningScale[500]
                        : tokens.colors.errorScale[500];

                    return (
                      <div key={metric.label}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[700],
                              fontWeight: tokens.typography.fontWeight.medium,
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
                            {metric.value}/{metric.target}
                          </Text>
                        </div>
                        <div
                          style={{
                            height: tokens.spacing[1],
                            backgroundColor: tokens.colors.neutral[100],
                            borderRadius: tokens.borderRadius.full,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct * 100}%`,
                              backgroundColor: barColor,
                              borderRadius: tokens.borderRadius.full,
                              transition: `width ${tokens.motion.hover}`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===================== COLUMN 2 ===================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
            {/* =========================================================== */}
            {/*  3. Upcoming Interviews (compact table)                     */}
            {/* =========================================================== */}
            {upcomingInterviews.length > 0 && (
              <div style={cardStyle}>
                <SectionHeader>Upcoming Interviews</SectionHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[0] }}>
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => onInterviewClick?.(interview.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[1]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        cursor: 'pointer',
                        borderRadius: tokens.borderRadius.sm,
                        ...hoverStyle,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor =
                          tokens.colors.neutral[50];
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: tokens.spacing[7],
                          height: tokens.spacing[7],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                          color: tokens.colors.primaryScale[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {interview.candidateAvatar ? (
                          <img
                            src={interview.candidateAvatar}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                          />
                        ) : (
                          interview.candidateName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                            display: 'block',
                            whiteSpace: 'nowrap' as const,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {interview.candidateName}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            display: 'block',
                            whiteSpace: 'nowrap' as const,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {interview.jobTitle}
                        </Text>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          {formatCompactTime(interview.time)}
                        </Text>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: `0 ${tokens.spacing[1]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: '10px',
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: interview.isAI
                              ? tokens.colors.secondaryScale[100]
                              : tokens.colors.primaryScale[100],
                            color: interview.isAI
                              ? tokens.colors.secondaryScale[700]
                              : tokens.colors.primaryScale[700],
                          }}
                        >
                          {interview.isAI ? 'AI' : 'Human'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/*  5. Activity Feed (compact)                                 */}
            {/* =========================================================== */}
            {activityFeed.length > 0 && (
              <div style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <SectionHeader>Activity</SectionHeader>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value as ActivityType | 'all')}
                    style={{
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: '10px',
                      color: tokens.colors.neutral[600],
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">All</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[0] }}>
                  {filteredActivity.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onActivityClick?.(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[1]}px 0`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: tokens.typography.fontSize.xs, flexShrink: 0 }}>
                        {activitySymbol(item.type)}
                      </span>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          flex: 1,
                          lineHeight: tokens.typography.lineHeight.relaxed,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
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
                            {' '}{item.entityName}
                          </span>
                        )}
                      </Text>
                      <Text
                        style={{
                          fontSize: '10px',
                          color: tokens.colors.neutral[400],
                          flexShrink: 0,
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {formatShortTime(item.time)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===================== COLUMN 3 (Narrow Sidebar) ===================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
            {/* =========================================================== */}
            {/*  6. Notifications (compact)                                 */}
            {/* =========================================================== */}
            {visibleNotifications.length > 0 && (
              <div style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <SectionHeader>Alerts</SectionHeader>
                  <span
                    style={{
                      ...createBadgeStyle(tokens, 'error'),
                      fontSize: '10px',
                      padding: `0 ${tokens.spacing[1]}px`,
                    }}
                  >
                    {visibleNotifications.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {visibleNotifications.map((notif) => {
                    const nc = notifColor(notif.type);
                    return (
                      <div
                        key={notif.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: tokens.spacing[2],
                          padding: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: nc.bg,
                        }}
                      >
                        <span
                          style={{
                            width: tokens.spacing[2],
                            height: tokens.spacing[2],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: nc.dot,
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: nc.text,
                              fontWeight: tokens.typography.fontWeight.medium,
                              display: 'block',
                              lineHeight: tokens.typography.lineHeight.relaxed,
                            }}
                          >
                            {notif.message}
                          </Text>
                          <Text
                            style={{
                              fontSize: '10px',
                              color: tokens.colors.neutral[400],
                              display: 'block',
                              marginTop: 2,
                            }}
                          >
                            {formatShortTime(notif.time)}
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
                            padding: 0,
                            fontSize: tokens.typography.fontSize.xs,
                            lineHeight: 1,
                            flexShrink: 0,
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
            {/*  7. AI Suggestions (compact)                                */}
            {/* =========================================================== */}
            {showAISuggestions && aiSuggestions.length > 0 && (
              <div
                style={{
                  ...cardStyle,
                  background: isGlass
                    ? tokens.glass?.bg
                    : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.secondaryScale[50]})`,
                  border: `1px solid ${tokens.colors.primaryScale[200]}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <span style={{ fontSize: tokens.typography.fontSize.xs }}>&#x2728;</span>
                  <SectionHeader>AI Suggestions</SectionHeader>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {aiSuggestions.map((suggestion) => {
                    const confColor =
                      suggestion.confidence >= 80
                        ? 'success'
                        : suggestion.confidence >= 50
                        ? 'warning'
                        : 'error';

                    return (
                      <div
                        key={suggestion.id}
                        style={{
                          padding: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.common.white,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {suggestion.action}
                          </Text>
                          <span
                            style={{
                              ...createBadgeStyle(tokens, confColor as 'success' | 'warning' | 'error'),
                              fontSize: '10px',
                              padding: `0 ${tokens.spacing[1]}px`,
                            }}
                          >
                            {suggestion.confidence}%
                          </span>
                        </div>
                        <Text
                          style={{
                            fontSize: '10px',
                            color: tokens.colors.neutral[500],
                            display: 'block',
                            marginBottom: tokens.spacing[2],
                            lineHeight: tokens.typography.lineHeight.relaxed,
                          }}
                        >
                          {suggestion.reason}
                        </Text>
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          <button
                            onClick={() => onSuggestionAccept?.(suggestion.id)}
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              border: 'none',
                              backgroundColor: tokens.colors.primaryScale[600],
                              color: tokens.colors.common.white,
                              fontSize: '10px',
                              fontWeight: tokens.typography.fontWeight.semibold,
                              cursor: 'pointer',
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => onSuggestionDismiss?.(suggestion.id)}
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              backgroundColor: tokens.colors.common.white,
                              color: tokens.colors.neutral[600],
                              fontSize: '10px',
                              fontWeight: tokens.typography.fontWeight.medium,
                              cursor: 'pointer',
                            }}
                          >
                            Skip
                          </button>
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
