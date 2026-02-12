'use client';

/**
 * BhRecruiterHome - Compact Preset
 * Dense recruiter dashboard with tighter spacing, mini metrics, and sparklines.
 * Optimized for power users who need maximum information density.
 */

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  Inbox,
  Mic,
  Bell,
  ShieldAlert,
  AlertTriangle,
  UserPlus,
  Sparkles,
  X,
  ChevronDown,
  Bot,
  User,
  Zap,
  BarChart3,
  Activity,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhRecruiterHomeProps,
  KpiStat,
  PipelineJob,
  UpcomingInterview,
  ActivityItem,
  Notification,
  AISuggestion,
  PerformanceMetric,
  NotificationType,
  ActivityType,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function miniSparkPoints(data: number[], w: number, h: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  return data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
}

function formatCompactTime(date: Date): string {
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return timeStr;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'applied': return Inbox;
    case 'interview': return Mic;
    case 'offer': return Send;
    case 'hired': return CheckCircle2;
    case 'rejected': return XCircle;
    case 'note': return FileText;
    case 'stage-change': return ArrowRight;
    default: return FileText;
  }
}

function getActivityColor(type: ActivityType, t: any) {
  switch (type) {
    case 'applied': return t.colors.infoScale[500];
    case 'interview': return t.colors.primaryScale[500];
    case 'offer': return t.colors.successScale[500];
    case 'hired': return t.colors.successScale[600];
    case 'rejected': return t.colors.errorScale[500];
    case 'note': return t.colors.warningScale[500];
    case 'stage-change': return t.colors.secondaryScale[500];
    default: return t.colors.neutral[400];
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_KPI: KpiStat[] = [
  { label: 'Active Candidates', value: 284, trend: 'up', trendValue: 12, sparklineData: [40, 45, 42, 50, 55, 60, 68] },
  { label: 'Open Roles', value: 18, trend: 'down', trendValue: 5, sparklineData: [22, 21, 20, 19, 18, 18, 18] },
  { label: 'Interviews', value: 7, trend: 'up', trendValue: 40, sparklineData: [3, 5, 4, 6, 5, 8, 7] },
  { label: 'Offers', value: 4, trend: 'flat', trendValue: 0, sparklineData: [3, 4, 3, 4, 5, 4, 4] },
  { label: 'TTH (days)', value: 23, trend: 'down', trendValue: 8, sparklineData: [28, 27, 25, 26, 24, 23, 23] },
  { label: 'Pipeline Value', value: '$1.2M', trend: 'up', trendValue: 15, sparklineData: [800, 850, 900, 950, 1000, 1100, 1200] },
];

const MOCK_PIPELINE: PipelineJob[] = [
  { id: 'j1', title: 'Sr. Frontend Eng.', stages: [{ name: 'Applied', count: 42 }, { name: 'Screen', count: 18 }, { name: 'Tech', count: 8 }, { name: 'Onsite', count: 3 }, { name: 'Offer', count: 1 }] },
  { id: 'j2', title: 'Product Manager', stages: [{ name: 'Applied', count: 65 }, { name: 'Screen', count: 24 }, { name: 'Interview', count: 12 }, { name: 'Final', count: 5 }, { name: 'Offer', count: 2 }] },
];

const MOCK_INTERVIEWS: UpcomingInterview[] = [
  { id: 'i1', candidateName: 'Sofia Martinez', jobTitle: 'Sr. Frontend Eng.', stageName: 'Technical', time: new Date(Date.now() + 2 * 3600000), isAI: false },
  { id: 'i2', candidateName: 'James Chen', jobTitle: 'Product Manager', stageName: 'AI Screen', time: new Date(Date.now() + 4 * 3600000), isAI: true },
  { id: 'i3', candidateName: 'Priya Sharma', jobTitle: 'DevOps Lead', stageName: 'Onsite', time: new Date(Date.now() + 24 * 3600000), isAI: false },
  { id: 'i4', candidateName: 'Marcus Johnson', jobTitle: 'Sr. Frontend Eng.', stageName: 'AI Screen', time: new Date(Date.now() + 26 * 3600000), isAI: true },
  { id: 'i5', candidateName: 'Lena Kowalski', jobTitle: 'Data Engineer', stageName: 'Technical', time: new Date(Date.now() + 28 * 3600000), isAI: false },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'applied', message: 'New application from', time: new Date(Date.now() - 600000), entityName: 'Elena Popov' },
  { id: 'a2', type: 'interview', message: 'Interview scheduled:', time: new Date(Date.now() - 1800000), entityName: 'David Kim' },
  { id: 'a3', type: 'stage-change', message: 'Moved to Onsite:', time: new Date(Date.now() - 3600000), entityName: 'Priya Sharma' },
  { id: 'a4', type: 'offer', message: 'Offer sent to', time: new Date(Date.now() - 7200000), entityName: 'Alex Rivera' },
  { id: 'a5', type: 'hired', message: 'Offer accepted:', time: new Date(Date.now() - 14400000), entityName: 'Nina Watanabe' },
  { id: 'a6', type: 'note', message: 'Feedback on', time: new Date(Date.now() - 18000000), entityName: 'Thomas Berg' },
];

const MOCK_NOTIFS: Notification[] = [
  { id: 'n1', type: 'breach', message: 'SLA breach: Screening exceeded 48h for Sr. Frontend Engineer', time: new Date(Date.now() - 1200000) },
  { id: 'n2', type: 'approval', message: 'Offer approval pending: Alex Rivera', time: new Date(Date.now() - 3600000) },
  { id: 'n3', type: 'candidate', message: '3 new high-match candidates for DevOps Lead', time: new Date(Date.now() - 5400000) },
];

const MOCK_AI: AISuggestion[] = [
  { id: 's1', action: 'Follow up with Sofia Martinez', confidence: 92, reason: 'Strong technical scores, 3 days since interview.' },
  { id: 's2', action: 'Repost DevOps Lead', confidence: 78, reason: 'Low engagement on current posting.' },
];

const MOCK_PERF: PerformanceMetric[] = [
  { label: 'Hires / month', value: 6, target: 8 },
  { label: 'Offer rate', value: 34, target: 40 },
  { label: 'CSAT', value: 88, target: 90 },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */
export const CompactBhRecruiterHome = createPreset<BhRecruiterHomeProps>({
  name: 'BhRecruiterHome.Compact',
  render: (ctx: PresetContext<BhRecruiterHomeProps>) => {
    const { primitives: { Box, Flex, Stack, Text }, props, tokens: t } = ctx;

    const {
      recruiterName = 'Recruiter',
      kpiStats = MOCK_KPI,
      pipelineJobs = MOCK_PIPELINE,
      upcomingInterviews = MOCK_INTERVIEWS,
      quickActions = [],
      activityFeed = MOCK_ACTIVITY,
      notifications = MOCK_NOTIFS,
      aiSuggestions = MOCK_AI,
      performanceMetrics = MOCK_PERF,
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

    const [selectedJob, setSelectedJob] = useState<string | null>(pipelineJobs[0]?.id ?? null);
    const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
    const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

    const cardStyle = createCardStyle(t, { padding: 16 });
    const hoverStyles = createCardHoverStyles(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const filteredActivity = useMemo(() => {
      if (activityFilter === 'all') return activityFeed;
      return activityFeed.filter((a) => a.type === activityFilter);
    }, [activityFeed, activityFilter]);

    const visibleNotifs = useMemo(() => notifications.filter((n) => !dismissedNotifs.has(n.id)), [notifications, dismissedNotifs]);

    const dismissNotif = (id: string) => {
      setDismissedNotifs((prev) => { const s = new Set(prev); s.add(id); return s; });
      onNotificationDismiss?.(id);
    };

    const notifIcon = (type: NotificationType) => {
      switch (type) {
        case 'breach': return { Icon: ShieldAlert, bg: t.colors.errorScale[50], dot: t.colors.errorScale[500], text: t.colors.errorScale[700] };
        case 'approval': return { Icon: AlertTriangle, bg: t.colors.warningScale[50], dot: t.colors.warningScale[500], text: t.colors.warningScale[700] };
        case 'candidate': return { Icon: UserPlus, bg: t.colors.infoScale[50], dot: t.colors.infoScale[500], text: t.colors.infoScale[700] };
      }
    };

    /* ---- Section Header ---- */
    const SH = ({ children, icon }: { children: string; icon?: React.ReactNode }) => (
      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
        {icon}
        <Text style={{ ...createPersonalitySectionHeaderStyle(t), marginBottom: 0 }}>{children}</Text>
      </Box>
    );

    /* ================================================================ */
    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: t.colors.neutral[50], padding: t.spacing[4], ...style }}>

        {/* ── Header ── */}
        <Flex align="center" justify="between" style={{ marginBottom: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Activity size={18} color={t.colors.primaryScale[500]} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
              {recruiterName}
            </Text>
          </Box>
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.sm, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], cursor: 'pointer' }}>
            <Calendar size={12} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{dateRangeLabel}</Text>
            <ChevronDown size={12} />
          </Box>
        </Flex>

        {/* ── KPI Row ── */}
        {kpiStats.length > 0 && (
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpiStats.length, 6)}, 1fr)`, gap: t.spacing[2], marginBottom: t.spacing[4] }}>
            {kpiStats.map((stat, idx) => {
              const trendColor = stat.trend === 'up' ? t.colors.successScale[600] : stat.trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500];
              const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
              const sparkData = stat.sparklineData ?? [];

              return (
                <Box key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 10, color: t.colors.neutral[500], display: 'block', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stat.label}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {stat.value}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TrendIcon size={10} color={trendColor} />
                        <Text style={{ fontSize: 10, fontWeight: t.typography.fontWeight.medium, color: trendColor }}>
                          {stat.trendValue}%
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                  {sparkData.length > 1 && (
                    <svg width={48} height={20} viewBox="0 0 48 20" style={{ flexShrink: 0 }}>
                      <polyline points={miniSparkPoints(sparkData, 48, 20)} fill="none" stroke={stat.trend === 'up' ? t.colors.successScale[400] : t.colors.errorScale[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── Three-Column Dense Layout ── */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 260px', gap: t.spacing[3] }}>

          {/* ── Column 1 ── */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>

            {/* Pipeline Table */}
            {pipelineJobs.length > 0 && (
              <Box style={cardStyle}>
                <SH icon={<BarChart3 size={12} color={t.colors.neutral[500]} />}>Pipeline</SH>
                <Box style={{ display: 'flex', gap: t.spacing[1], marginBottom: t.spacing[2], flexWrap: 'wrap' as const }}>
                  {pipelineJobs.map((job) => (
                    <Box
                      key={job.id}
                      onClick={() => { setSelectedJob(job.id); onPipelineJobClick?.(job.id); }}
                      style={{
                        padding: `2px ${t.spacing[2]}px`,
                        borderRadius: badgeRadius,
                        border: `1px solid ${selectedJob === job.id ? t.colors.primaryScale[300] : 'transparent'}`,
                        backgroundColor: selectedJob === job.id ? t.colors.primaryScale[50] : 'transparent',
                        color: selectedJob === job.id ? t.colors.primaryScale[600] : t.colors.neutral[500],
                        fontSize: 11,
                        fontWeight: selectedJob === job.id ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      {job.title}
                    </Box>
                  ))}
                </Box>
                {pipelineJobs.filter((j) => !selectedJob || j.id === selectedJob).map((job) => {
                  const maxCount = Math.max(...job.stages.map((s) => s.count), 1);
                  const stageColors = [t.colors.primaryScale[500], t.colors.primaryScale[400], t.colors.infoScale[500], t.colors.warningScale[500], t.colors.successScale[500]];
                  return (
                    <Box key={job.id} style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
                      {job.stages.map((stage, si) => (
                        <Box key={stage.name} style={{ display: 'grid', gridTemplateColumns: '68px 1fr 28px', alignItems: 'center', gap: t.spacing[1] }}>
                          <Text style={{ fontSize: 11, color: t.colors.neutral[600], textAlign: 'right' as const, fontWeight: t.typography.fontWeight.medium }}>
                            {stage.name}
                          </Text>
                          <Box style={{ height: 8, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                            <Box style={{ height: '100%', width: `${(stage.count / maxCount) * 100}%`, backgroundColor: stageColors[si % stageColors.length], borderRadius: t.borderRadius.sm }} />
                          </Box>
                          <Text style={{ fontSize: 11, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                            {stage.count}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Quick Actions (compact) */}
            {quickActions.length > 0 && (
              <Box style={cardStyle}>
                <SH icon={<Zap size={12} color={t.colors.neutral[500]} />}>Quick Actions</SH>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[1] }}>
                  {quickActions.map((action) => (
                    <Box
                      key={action.key}
                      onClick={() => { onQuickAction?.(action.key); action.onClick?.(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, cursor: 'pointer', ...hoverStyles.base }}
                      onMouseEnter={(e: any) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.backgroundColor = t.colors.common.white; }}
                    >
                      <Box style={{ ...createIconContainerStyle(t, { size: 24 }), flexShrink: 0 }}>
                        {action.icon}
                      </Box>
                      <Text style={{ fontSize: 11, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                        {action.label}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Performance bars */}
            {performanceMetrics.length > 0 && (
              <Box style={cardStyle}>
                <SH>Performance</SH>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {performanceMetrics.map((metric) => {
                    const pct = Math.min(metric.value / (metric.target || 1), 1);
                    const barColor = pct >= 0.8 ? t.colors.successScale[500] : pct >= 0.5 ? t.colors.warningScale[500] : t.colors.errorScale[500];
                    return (
                      <Box key={metric.label}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 11, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{metric.label}</Text>
                          <Text style={{ fontSize: 11, color: t.colors.neutral[500] }}>{metric.value}/{metric.target}</Text>
                        </Box>
                        <Box style={{ height: 4, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
                          <Box style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: `width ${t.transitions?.normal || t.motion.hover}` }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Column 2 ── */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>

            {/* Upcoming Interviews */}
            {upcomingInterviews.length > 0 && (
              <Box style={cardStyle}>
                <SH icon={<Clock size={12} color={t.colors.neutral[500]} />}>Interviews</SH>
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                  {upcomingInterviews.map((interview) => (
                    <Box
                      key={interview.id}
                      onClick={() => onInterviewClick?.(interview.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px 0`, borderBottom: `1px solid ${t.colors.neutral[100]}`, cursor: 'pointer', transition: `all ${t.motion.hover}` }}
                      onMouseEnter={(e: any) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Box style={{ width: 28, height: 28, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: t.colors.primaryScale[700], fontSize: 11, fontWeight: t.typography.fontWeight.semibold }}>
                        {interview.candidateName.charAt(0).toUpperCase()}
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 11, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {interview.candidateName}
                        </Text>
                        <Text style={{ fontSize: 10, color: t.colors.neutral[500], display: 'block', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {interview.jobTitle}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        <Text style={{ fontSize: 10, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                          {formatCompactTime(interview.time)}
                        </Text>
                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: `0 ${t.spacing[1]}px`, borderRadius: badgeRadius, fontSize: 10, fontWeight: t.typography.fontWeight.medium, backgroundColor: interview.isAI ? t.colors.secondaryScale[100] : t.colors.primaryScale[100], color: interview.isAI ? t.colors.secondaryScale[700] : t.colors.primaryScale[700] }}>
                          {interview.isAI ? <Bot size={8} /> : <User size={8} />}
                          {interview.isAI ? 'AI' : 'Live'}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Activity Feed */}
            {activityFeed.length > 0 && (
              <Box style={cardStyle}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                  <SH>Activity</SH>
                  <Box style={{ display: 'flex', gap: 2 }}>
                    {(['all', 'applied', 'interview', 'offer'] as const).map((f) => (
                      <Box
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          padding: `1px ${t.spacing[1]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: activityFilter === f ? t.colors.primaryScale[50] : 'transparent',
                          color: activityFilter === f ? t.colors.primaryScale[600] : t.colors.neutral[400],
                          fontSize: 10,
                          fontWeight: activityFilter === f ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                          textTransform: 'capitalize' as const,
                        }}
                      >
                        {f}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredActivity.slice(0, 6).map((item) => {
                    const Icon = getActivityIcon(item.type);
                    const color = getActivityColor(item.type, t);
                    return (
                      <Box
                        key={item.id}
                        onClick={() => onActivityClick?.(item.id)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[2], padding: `${t.spacing[1]}px 0`, borderBottom: `1px solid ${t.colors.neutral[100]}`, cursor: 'pointer', transition: `all ${t.motion.hover}` }}
                      >
                        <Icon size={12} color={color} style={{ flexShrink: 0, marginTop: 2 } as any} />
                        <Text style={{ fontSize: 11, color: t.colors.neutral[700], flex: 1, lineHeight: t.typography.lineHeight.relaxed, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                          {item.message}
                          {item.entityName && <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[600] }}> {item.entityName}</Text>}
                        </Text>
                        <Text style={{ fontSize: 10, color: t.colors.neutral[400], flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                          {formatDistanceToNow(item.time, { addSuffix: true })}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Column 3 (Narrow Sidebar) ── */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>

            {/* Notifications */}
            {visibleNotifs.length > 0 && (
              <Box style={cardStyle}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Bell size={12} color={t.colors.neutral[500]} />
                    <Text style={{ ...createPersonalitySectionHeaderStyle(t), marginBottom: 0 }}>Alerts</Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, 'error'), borderRadius: badgeRadius, fontSize: 10, padding: `0 ${t.spacing[1]}px` }}>
                    {visibleNotifs.length}
                  </Box>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {visibleNotifs.map((notif) => {
                    const ns = notifIcon(notif.type);
                    const NIcon = ns.Icon;
                    return (
                      <Box key={notif.id} style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[2], padding: t.spacing[2], borderRadius: t.borderRadius.sm, backgroundColor: ns.bg }}>
                        <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: ns.dot, flexShrink: 0, marginTop: 4 }} />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: 11, color: ns.text, fontWeight: t.typography.fontWeight.medium, display: 'block', lineHeight: t.typography.lineHeight.relaxed }}>
                            {notif.message}
                          </Text>
                          <Text style={{ fontSize: 10, color: t.colors.neutral[400], display: 'block', marginTop: 2 }}>
                            {formatDistanceToNow(notif.time, { addSuffix: true })}
                          </Text>
                        </Box>
                        <Box onClick={(e: any) => { e.stopPropagation(); dismissNotif(notif.id); }} style={{ color: t.colors.neutral[400], cursor: 'pointer', padding: 0, flexShrink: 0, lineHeight: 1 }}>
                          <X size={12} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* AI Suggestions */}
            {showAISuggestions && aiSuggestions.length > 0 && (
              <Box style={{ ...cardStyle, background: `linear-gradient(135deg, ${t.colors.primaryScale[50]}, ${t.colors.secondaryScale[50]})`, border: `1px solid ${t.colors.primaryScale[200]}` }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                  <Sparkles size={12} color={t.colors.primaryScale[500]} />
                  <Text style={{ ...createPersonalitySectionHeaderStyle(t), marginBottom: 0 }}>AI Suggestions</Text>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {aiSuggestions.map((s) => {
                    const confColor = s.confidence >= 80 ? 'success' : s.confidence >= 50 ? 'warning' : 'error';
                    return (
                      <Box key={s.id} style={{ padding: t.spacing[2], borderRadius: t.borderRadius.sm, backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[200]}` }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Text style={{ fontSize: 11, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{s.action}</Text>
                          <Box style={{ ...createBadgeStyle(t, confColor as any), borderRadius: badgeRadius, fontSize: 10, padding: `0 ${t.spacing[1]}px` }}>{s.confidence}%</Box>
                        </Box>
                        <Text style={{ fontSize: 10, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[2], lineHeight: t.typography.lineHeight.relaxed }}>
                          {s.reason}
                        </Text>
                        <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                          <Box onClick={() => onSuggestionAccept?.(s.id)} style={{ flex: 1, padding: `2px ${t.spacing[1]}px`, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, fontSize: 10, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const, transition: `all ${t.motion.hover}` }}>
                            Accept
                          </Box>
                          <Box onClick={() => onSuggestionDismiss?.(s.id)} style={{ flex: 1, padding: `2px ${t.spacing[1]}px`, borderRadius: t.borderRadius.sm, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], fontSize: 10, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', textAlign: 'center' as const, transition: `all ${t.motion.hover}` }}>
                            Skip
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
