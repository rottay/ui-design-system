'use client';

/**
 * BhRecruiterHome - Overview Preset
 * Full recruiter dashboard with KPI ribbon, pipeline snapshot, interviews,
 * quick actions, activity feed, notifications, AI suggestions, and performance metrics.
 *
 * Slite-inspired: generous whitespace, clean typography, subtle card elevation.
 */

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Briefcase,
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
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  Sparkles,
  X,
  ChevronDown,
  Bot,
  User,
  Target,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createHoverStyle,
  createSurfaceStyle,
  createProgressBarStyle,
  getPersonalityBadgeRadius,
  createCardHoverStyles,
  createPersonalityAccentBar,
  createIconContainerStyle,
  getCardPadding,
  createPersonalitySectionHeaderStyle,
  createDividerStyle,
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
/*  Sparkline SVG helpers                                              */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, pad: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (width - pad * 2) / (data.length - 1 || 1);
  return data.map((v, i) => {
    const x = pad + i * step;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');
}

function sparklinePolygon(data: number[], w: number, h: number, pad: number): string {
  if (!data.length) return '';
  const line = sparklinePoints(data, w, h, pad);
  const lastX = pad + (data.length - 1) * ((w - pad * 2) / (data.length - 1 || 1));
  return `${pad},${h - pad} ${line} ${lastX},${h - pad}`;
}

/* ------------------------------------------------------------------ */
/*  Progress circle helper                                             */
/* ------------------------------------------------------------------ */
function progressCircle(value: number, target: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (target || 1), 1);
  const dashArray = `${pct * circumference} ${circumference}`;
  return { circumference, dashArray, pct };
}

/* ------------------------------------------------------------------ */
/*  Format interview time                                              */
/* ------------------------------------------------------------------ */
function formatInterviewTime(date: Date): string {
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

/* ------------------------------------------------------------------ */
/*  Activity type icon mapping                                         */
/* ------------------------------------------------------------------ */
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

function getActivityColor(type: ActivityType, tokens: any) {
  switch (type) {
    case 'applied': return tokens.colors.infoScale[500];
    case 'interview': return tokens.colors.primaryScale[500];
    case 'offer': return tokens.colors.successScale[500];
    case 'hired': return tokens.colors.successScale[600];
    case 'rejected': return tokens.colors.errorScale[500];
    case 'note': return tokens.colors.warningScale[500];
    case 'stage-change': return tokens.colors.secondaryScale[500];
    default: return tokens.colors.neutral[400];
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_KPI_STATS: KpiStat[] = [
  { label: 'Active Candidates', value: 284, trend: 'up', trendValue: 12, sparklineData: [40, 45, 42, 50, 55, 60, 68] },
  { label: 'Open Positions', value: 18, trend: 'down', trendValue: 5, sparklineData: [22, 21, 20, 19, 18, 18, 18] },
  { label: 'Interviews Today', value: 7, trend: 'up', trendValue: 40, sparklineData: [3, 5, 4, 6, 5, 8, 7] },
  { label: 'Offers Pending', value: 4, trend: 'flat', trendValue: 0, sparklineData: [3, 4, 3, 4, 5, 4, 4] },
  { label: 'Avg Time to Hire', value: '23d', trend: 'down', trendValue: 8, sparklineData: [28, 27, 25, 26, 24, 23, 23] },
];

const MOCK_PIPELINE_JOBS: PipelineJob[] = [
  { id: 'j1', title: 'Sr. Frontend Engineer', stages: [{ name: 'Applied', count: 42 }, { name: 'Screening', count: 18 }, { name: 'Technical', count: 8 }, { name: 'Onsite', count: 3 }, { name: 'Offer', count: 1 }] },
  { id: 'j2', title: 'Product Manager', stages: [{ name: 'Applied', count: 65 }, { name: 'Screening', count: 24 }, { name: 'Interview', count: 12 }, { name: 'Final', count: 5 }, { name: 'Offer', count: 2 }] },
  { id: 'j3', title: 'DevOps Lead', stages: [{ name: 'Applied', count: 31 }, { name: 'Screening', count: 10 }, { name: 'Technical', count: 6 }, { name: 'Onsite', count: 2 }, { name: 'Offer', count: 0 }] },
];

const MOCK_INTERVIEWS: UpcomingInterview[] = [
  { id: 'i1', candidateName: 'Sofia Martinez', jobTitle: 'Sr. Frontend Engineer', stageName: 'Technical Round', time: new Date(Date.now() + 2 * 3600000), isAI: false },
  { id: 'i2', candidateName: 'James Chen', jobTitle: 'Product Manager', stageName: 'AI Screening', time: new Date(Date.now() + 4 * 3600000), isAI: true },
  { id: 'i3', candidateName: 'Priya Sharma', jobTitle: 'DevOps Lead', stageName: 'Onsite Panel', time: new Date(Date.now() + 24 * 3600000), isAI: false },
  { id: 'i4', candidateName: 'Marcus Johnson', jobTitle: 'Sr. Frontend Engineer', stageName: 'AI Screening', time: new Date(Date.now() + 26 * 3600000), isAI: true },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'applied', message: 'New application received for', time: new Date(Date.now() - 600000), entityType: 'candidate', entityName: 'Elena Popov' },
  { id: 'a2', type: 'interview', message: 'Interview scheduled with', time: new Date(Date.now() - 1800000), entityType: 'candidate', entityName: 'David Kim' },
  { id: 'a3', type: 'stage-change', message: 'Moved to Onsite stage:', time: new Date(Date.now() - 3600000), entityType: 'candidate', entityName: 'Priya Sharma' },
  { id: 'a4', type: 'offer', message: 'Offer letter sent to', time: new Date(Date.now() - 7200000), entityType: 'candidate', entityName: 'Alex Rivera' },
  { id: 'a5', type: 'hired', message: 'Offer accepted by', time: new Date(Date.now() - 14400000), entityType: 'candidate', entityName: 'Nina Watanabe' },
  { id: 'a6', type: 'note', message: 'Feedback submitted for', time: new Date(Date.now() - 18000000), entityType: 'candidate', entityName: 'Thomas Berg' },
  { id: 'a7', type: 'rejected', message: 'Application declined for', time: new Date(Date.now() - 21600000), entityType: 'candidate', entityName: 'Chris Okafor' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'breach', message: 'SLA breach: Screening for Sr. Frontend Engineer exceeded 48h limit', time: new Date(Date.now() - 1200000) },
  { id: 'n2', type: 'approval', message: 'Offer approval pending for Alex Rivera - Product Manager', time: new Date(Date.now() - 3600000) },
  { id: 'n3', type: 'candidate', message: '3 new high-match candidates for DevOps Lead position', time: new Date(Date.now() - 5400000) },
];

const MOCK_AI_SUGGESTIONS: AISuggestion[] = [
  { id: 's1', action: 'Schedule follow-up with Sofia Martinez', confidence: 92, reason: 'Technical round completed 3 days ago with strong scores. Delay risks losing the candidate.' },
  { id: 's2', action: 'Repost DevOps Lead on Stack Overflow', confidence: 78, reason: 'Current posting has low engagement. Stack Overflow yielded 3x more qualified candidates last quarter.' },
];

const MOCK_PERFORMANCE: PerformanceMetric[] = [
  { label: 'Hires this month', value: 6, target: 8 },
  { label: 'Interview-to-Offer rate', value: 34, target: 40 },
  { label: 'Candidate satisfaction', value: 88, target: 90 },
];

/* ================================================================== */
/*  Overview Preset                                                    */
/* ================================================================== */
export const OverviewBhRecruiterHome = createPreset<BhRecruiterHomeProps>({
  name: 'BhRecruiterHome.Overview',
  render: (ctx: PresetContext<BhRecruiterHomeProps>) => {
    const { primitives: { Box, Flex, Stack, Text }, props, tokens: t } = ctx;

    const {
      recruiterName = 'Recruiter',
      kpiStats = MOCK_KPI_STATS,
      pipelineJobs = MOCK_PIPELINE_JOBS,
      upcomingInterviews = MOCK_INTERVIEWS,
      quickActions = [],
      activityFeed = MOCK_ACTIVITY,
      notifications = MOCK_NOTIFICATIONS,
      aiSuggestions = MOCK_AI_SUGGESTIONS,
      performanceMetrics = MOCK_PERFORMANCE,
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

    const cardBase = createCardStyle(t, { padding: 28 });
    const cardPadding = getCardPadding(t);
    const hoverStyles = createCardHoverStyles(t);
    const sectionHeader = createPersonalitySectionHeaderStyle(t);
    const badgeRadius = getPersonalityBadgeRadius(t);
    const dividerStyle = createDividerStyle(t);

    const filteredActivity = useMemo(() => {
      if (activityFilter === 'all') return activityFeed;
      return activityFeed.filter((a) => a.type === activityFilter);
    }, [activityFeed, activityFilter]);

    const visibleNotifs = useMemo(() => notifications.filter((n) => !dismissedNotifs.has(n.id)), [notifications, dismissedNotifs]);

    const dismissNotif = (id: string) => {
      setDismissedNotifs((prev) => { const s = new Set(prev); s.add(id); return s; });
      onNotificationDismiss?.(id);
    };

    /* ---- Notification styling ---- */
    const notifStyle = (type: NotificationType) => {
      switch (type) {
        case 'breach': return { bg: t.colors.errorScale[50], border: t.colors.errorScale[200], icon: t.colors.errorScale[500], text: t.colors.errorScale[700], Icon: ShieldAlert };
        case 'approval': return { bg: t.colors.warningScale[50], border: t.colors.warningScale[200], icon: t.colors.warningScale[500], text: t.colors.warningScale[700], Icon: AlertTriangle };
        case 'candidate': return { bg: t.colors.infoScale[50], border: t.colors.infoScale[200], icon: t.colors.infoScale[500], text: t.colors.infoScale[700], Icon: UserPlus };
      }
    };

    /* ---- Reusable: Section Title ---- */
    const SectionTitle = ({ children }: { children: string }) => (
      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
        {children}
      </Text>
    );

    /* ---- Reusable: KPI Card ---- */
    const KpiCard = ({ stat, index }: { stat: KpiStat; index: number }) => {
      const trendColor = stat.trend === 'up' ? t.colors.successScale[600] : stat.trend === 'down' ? t.colors.errorScale[600] : t.colors.neutral[500];
      const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
      const sparkData = stat.sparklineData ?? [];
      const sparkW = 80;
      const sparkH = 32;

      return (
        <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box style={{ flex: 1 }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: t.spacing[1] }}>
                {stat.label}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                {stat.value}
              </Text>
            </Box>
            {stat.icon && (
              <Box style={createIconContainerStyle(t, { size: 40 })}>
                {stat.icon}
              </Box>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <TrendIcon size={14} color={trendColor} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: trendColor }}>
                {stat.trendValue}%
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                vs prev
              </Text>
            </Box>
            {sparkData.length > 1 && (
              <svg width={sparkW} height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`}>
                <defs>
                  <linearGradient id={`spark-ov-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stat.trend === 'up' ? t.colors.successScale[400] : t.colors.errorScale[400]} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={stat.trend === 'up' ? t.colors.successScale[400] : t.colors.errorScale[400]} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={sparklinePolygon(sparkData, sparkW, sparkH, 2)} fill={`url(#spark-ov-${index})`} />
                <polyline points={sparklinePoints(sparkData, sparkW, sparkH, 2)} fill="none" stroke={stat.trend === 'up' ? t.colors.successScale[500] : t.colors.errorScale[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  Render                                                          */
    /* ================================================================ */
    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: t.colors.neutral[50], padding: t.spacing[7], ...style }}>

        {/* ── Header Greeting ──────────────────────────────────── */}
        <Flex align="center" justify="between" style={{ marginBottom: t.spacing[7] }}>
          <Stack gap={1}>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
              Welcome back, {recruiterName}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
              Here is what is happening across your pipeline today.
            </Text>
          </Stack>
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], cursor: 'pointer', ...hoverStyles.base }}>
            <Calendar size={14} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{dateRangeLabel}</Text>
            <ChevronDown size={14} />
          </Box>
        </Flex>

        {/* ── KPI Ribbon ───────────────────────────────────────── */}
        {kpiStats.length > 0 && (
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpiStats.length, 5)}, 1fr)`, gap: t.spacing[4], marginBottom: t.spacing[7] }}>
            {kpiStats.map((stat, idx) => <KpiCard key={idx} stat={stat} index={idx} />)}
          </Box>
        )}

        {/* ── Two-Column Layout ────────────────────────────────── */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: t.spacing[6] }}>

          {/* ── LEFT COLUMN ── */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[6] }}>

            {/* ── Pipeline Snapshot ── */}
            {pipelineJobs.length > 0 && (
              <Box style={cardBase}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
                  <SectionTitle>Pipeline Snapshot</SectionTitle>
                  <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                    {pipelineJobs.map((job) => (
                      <Box
                        key={job.id}
                        onClick={() => { setSelectedJob(job.id); onPipelineJobClick?.(job.id); }}
                        style={{
                          padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                          borderRadius: badgeRadius,
                          border: `1px solid ${selectedJob === job.id ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                          backgroundColor: selectedJob === job.id ? t.colors.primaryScale[50] : t.colors.common.white,
                          color: selectedJob === job.id ? t.colors.primaryScale[600] : t.colors.neutral[600],
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: selectedJob === job.id ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        {job.title}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {pipelineJobs.filter((j) => !selectedJob || j.id === selectedJob).map((job) => {
                  const totalCandidates = job.stages.reduce((s, st) => s + st.count, 0);
                  const maxCount = Math.max(...job.stages.map((st) => st.count), 1);
                  const stageColors = [t.colors.primaryScale[500], t.colors.primaryScale[400], t.colors.infoScale[500], t.colors.warningScale[500], t.colors.successScale[500], t.colors.secondaryScale[500]];

                  return (
                    <Box key={job.id}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                          {job.title}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {totalCandidates} candidates
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                        {job.stages.map((stage, si) => {
                          const pct = (stage.count / maxCount) * 100;
                          const color = stageColors[si % stageColors.length];
                          return (
                            <Box key={stage.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 40px', alignItems: 'center', gap: t.spacing[3] }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], textAlign: 'right' as const, fontWeight: t.typography.fontWeight.medium }}>
                                {stage.name}
                              </Text>
                              <Box style={{ height: 24, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden', position: 'relative' as const }}>
                                <Box style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: t.borderRadius.sm, transition: `width ${t.transitions?.normal || t.motion.hover}` }} />
                              </Box>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                                {stage.count}
                              </Text>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* ── Upcoming Interviews ── */}
            {upcomingInterviews.length > 0 && (
              <Box style={cardBase}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.infoScale[50] })}>
                    <Calendar size={16} color={t.colors.infoScale[600]} />
                  </Box>
                  <SectionTitle>Upcoming Interviews</SectionTitle>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                  {upcomingInterviews.map((interview) => (
                    <Box
                      key={interview.id}
                      onClick={() => onInterviewClick?.(interview.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[50], cursor: 'pointer', ...hoverStyles.base }}
                      onMouseEnter={(e: any) => Object.assign(e.currentTarget.style, hoverStyles.hover)}
                      onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <Box style={{ width: 40, height: 40, borderRadius: t.borderRadius.full, overflow: 'hidden', flexShrink: 0, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.primaryScale[700], fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold }}>
                        {interview.candidateAvatar
                          ? <img src={interview.candidateAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                          : interview.candidateName.charAt(0).toUpperCase()}
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {interview.candidateName}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                          {interview.jobTitle} &middot; {interview.stageName}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: t.spacing[1], flexShrink: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                          {formatInterviewTime(interview.time)}
                        </Text>
                        <Box style={{ ...createBadgeStyle(t, interview.isAI ? 'secondary' : 'primary'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {interview.isAI ? <Bot size={10} /> : <User size={10} />}
                          {interview.isAI ? 'AI Screen' : 'In-Person'}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ── Quick Actions ── */}
            {quickActions.length > 0 && (
              <Box style={cardBase}>
                <SectionTitle>Quick Actions</SectionTitle>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[3], marginTop: t.spacing[4] }}>
                  {quickActions.map((action) => (
                    <Box
                      key={action.key}
                      onClick={() => { onQuickAction?.(action.key); action.onClick?.(); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' as const, padding: t.spacing[5], borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, cursor: 'pointer', ...hoverStyles.base }}
                      onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); e.currentTarget.style.boxShadow = t.shadows.md; }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <Box style={{ ...createIconContainerStyle(t, { size: 44 }), marginBottom: t.spacing[3] }}>
                        {action.icon}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block', marginBottom: t.spacing[1] }}>
                        {action.label}
                      </Text>
                      {action.description && (
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {action.description}
                        </Text>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ── Recent Activity Feed ── */}
            {activityFeed.length > 0 && (
              <Box style={cardBase}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
                  <SectionTitle>Recent Activity</SectionTitle>
                  <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                    {(['all', 'applied', 'interview', 'offer', 'hired'] as const).map((f) => (
                      <Box
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          border: `1px solid ${activityFilter === f ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                          backgroundColor: activityFilter === f ? t.colors.primaryScale[50] : t.colors.common.white,
                          color: activityFilter === f ? t.colors.primaryScale[600] : t.colors.neutral[500],
                          fontSize: t.typography.fontSize.xs,
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
                  {filteredActivity.slice(0, 8).map((item) => {
                    const ActivityIcon = getActivityIcon(item.type);
                    const iconColor = getActivityColor(item.type, t);
                    return (
                      <Box
                        key={item.id}
                        onClick={() => onActivityClick?.(item.id)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[3], padding: `${t.spacing[3]}px ${t.spacing[2]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, cursor: 'pointer', transition: `all ${t.motion.hover}`, borderRadius: t.borderRadius.sm }}
                        onMouseEnter={(e: any) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                        onMouseLeave={(e: any) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Box style={{ ...createIconContainerStyle(t, { size: 28, color: `${iconColor}15` }), marginTop: 2 }}>
                          <ActivityIcon size={14} color={iconColor} />
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], lineHeight: t.typography.lineHeight.relaxed }}>
                            {item.message}
                            {item.entityName && (
                              <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[600] }}>
                                {' '}{item.entityName}
                              </Text>
                            )}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                          {formatDistanceToNow(item.time, { addSuffix: true })}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* ── RIGHT COLUMN (Sidebar) ── */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[6] }}>

            {/* ── Notifications ── */}
            {visibleNotifs.length > 0 && (
              <Box style={cardBase}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Bell size={18} color={t.colors.neutral[700]} />
                    <SectionTitle>Notifications</SectionTitle>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, padding: `0 ${t.spacing[2]}px` }}>
                    {visibleNotifs.length}
                  </Box>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {visibleNotifs.map((notif) => {
                    const ns = notifStyle(notif.type);
                    const NotifIcon = ns.Icon;
                    return (
                      <Box key={notif.id} style={{ padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: ns.bg, border: `1px solid ${ns.border}`, display: 'flex', alignItems: 'flex-start', gap: t.spacing[2] }}>
                        <Box style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, backgroundColor: ns.icon, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                          <NotifIcon size={12} color={t.colors.common.white} />
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: ns.text, fontWeight: t.typography.fontWeight.medium, display: 'block', lineHeight: t.typography.lineHeight.relaxed }}>
                            {notif.message}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1], display: 'block' }}>
                            {formatDistanceToNow(notif.time, { addSuffix: true })}
                          </Text>
                        </Box>
                        <Box
                          onClick={(e: any) => { e.stopPropagation(); dismissNotif(notif.id); }}
                          style={{ color: t.colors.neutral[400], cursor: 'pointer', padding: t.spacing[1], flexShrink: 0, lineHeight: 1, transition: `all ${t.motion.hover}` }}
                        >
                          <X size={14} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── AI Suggestions ── */}
            {showAISuggestions && aiSuggestions.length > 0 && (
              <Box style={{ ...cardBase, background: `linear-gradient(135deg, ${t.colors.primaryScale[50]}, ${t.colors.secondaryScale[50]})`, border: `1px solid ${t.colors.primaryScale[200]}` }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
                  <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.primaryScale[100] })}>
                    <Sparkles size={14} color={t.colors.primaryScale[600]} />
                  </Box>
                  <SectionTitle>AI Suggestions</SectionTitle>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                  {aiSuggestions.map((suggestion) => {
                    const confColor = suggestion.confidence >= 80 ? 'success' : suggestion.confidence >= 50 ? 'warning' : 'error';
                    return (
                      <Box key={suggestion.id} style={{ padding: t.spacing[4], borderRadius: t.borderRadius.md, backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[200]}` }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                            {suggestion.action}
                          </Text>
                          <Box style={{ ...createBadgeStyle(t, confColor as any), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, padding: `0 ${t.spacing[2]}px` }}>
                            {suggestion.confidence}%
                          </Box>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[3], lineHeight: t.typography.lineHeight.relaxed }}>
                          {suggestion.reason}
                        </Text>
                        <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                          <Box
                            onClick={() => onSuggestionAccept?.(suggestion.id)}
                            style={{ flex: 1, padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: 'none', backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer', transition: `all ${t.motion.hover}`, textAlign: 'center' as const }}
                          >
                            Accept
                          </Box>
                          <Box
                            onClick={() => onSuggestionDismiss?.(suggestion.id)}
                            style={{ flex: 1, padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, textAlign: 'center' as const }}
                          >
                            Dismiss
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── Performance ── */}
            {performanceMetrics.length > 0 && (
              <Box style={cardBase}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
                  <Target size={18} color={t.colors.neutral[700]} />
                  <SectionTitle>Your Performance</SectionTitle>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[5] }}>
                  {performanceMetrics.map((metric, mi) => {
                    const radius = 28;
                    const strokeWidth = 5;
                    const size = (radius + strokeWidth) * 2;
                    const { dashArray, pct } = progressCircle(metric.value, metric.target, radius);
                    const colors = [
                      { track: t.colors.primaryScale[100], fill: t.colors.primaryScale[500] },
                      { track: t.colors.successScale[100], fill: t.colors.successScale[500] },
                      { track: t.colors.infoScale[100], fill: t.colors.infoScale[500] },
                      { track: t.colors.warningScale[100], fill: t.colors.warningScale[500] },
                    ];
                    const mc = colors[mi % colors.length];

                    return (
                      <Box key={metric.label} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
                          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={mc.track} strokeWidth={strokeWidth} />
                          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={mc.fill} strokeWidth={strokeWidth} strokeDasharray={dashArray} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: `stroke-dasharray ${t.motion.hover}` }} />
                          <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={t.colors.neutral[900]} fontSize={t.typography.fontSize.xs} fontWeight={t.typography.fontWeight.bold}>
                            {Math.round(pct * 100)}%
                          </text>
                        </svg>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], display: 'block' }}>
                            {metric.label}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {metric.value} / {metric.target}
                          </Text>
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
