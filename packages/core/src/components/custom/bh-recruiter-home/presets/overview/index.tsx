'use client';

/**
 * BhRecruiterHome - Overview Preset
 * Full recruiter dashboard with KPI ribbon, pipeline kanban, upcoming interviews,
 * quick actions, activity feed, notifications, AI suggestions, and performance metrics.
 * 10/10 quality: zero raw HTML, personality-driven, glass-aware, ARIA.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createCardHoverStyles,
  createPersonalityAccentBar,
  formatDistanceToNow,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhRecruiterHomeProps, KpiStat, PipelineJob, UpcomingInterview,
  QuickAction, ActivityItem, Notification, AISuggestion, PerformanceMetric,
} from '../../core';
import { BH_RECRUITER_HOME_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  TrendingUp, TrendingDown, Minus, Users, Briefcase, Calendar, Clock,
  PlusCircle, Search, MessageSquare, ChevronRight,
  Bell, AlertTriangle, UserPlus, XCircle, Sparkles, CheckCircle,
  BarChart3, ArrowRight, X, Zap, FileText, Video,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_KPI: KpiStat[] = [
  { label: 'Open Roles', value: 12, trend: 'up', trendValue: 8, icon: <Briefcase size={18} /> },
  { label: 'Active Candidates', value: 248, trend: 'up', trendValue: 15, icon: <Users size={18} /> },
  { label: 'Interviews This Week', value: 9, trend: 'down', trendValue: 3, icon: <Calendar size={18} /> },
  { label: 'Avg. Time-to-Fill', value: '28d', trend: 'up', trendValue: 5, icon: <Clock size={18} /> },
];

const DEFAULT_PIPELINE: PipelineJob[] = [
  { id: 'j-1', title: 'Senior Frontend Engineer', stages: [{ name: 'Applied', count: 34 }, { name: 'Screen', count: 12 }, { name: 'Interview', count: 5 }, { name: 'Offer', count: 1 }] },
  { id: 'j-2', title: 'Product Designer', stages: [{ name: 'Applied', count: 21 }, { name: 'Screen', count: 8 }, { name: 'Interview', count: 3 }, { name: 'Offer', count: 0 }] },
  { id: 'j-3', title: 'Backend Engineer', stages: [{ name: 'Applied', count: 45 }, { name: 'Screen', count: 15 }, { name: 'Interview', count: 7 }, { name: 'Offer', count: 2 }] },
];

const DEFAULT_INTERVIEWS: UpcomingInterview[] = [
  { id: 'i-1', candidateName: 'Sarah Johnson', jobTitle: 'Sr Frontend Engineer', stageName: 'Technical Round', time: new Date(Date.now() + 2 * 3600_000), isAI: false },
  { id: 'i-2', candidateName: 'Michael Chen', jobTitle: 'Sr Frontend Engineer', stageName: 'AI Screening', time: new Date(Date.now() + 5 * 3600_000), isAI: true },
  { id: 'i-3', candidateName: 'Emily Rodriguez', jobTitle: 'Product Designer', stageName: 'Portfolio Review', time: new Date(Date.now() + 24 * 3600_000) },
];

const DEFAULT_ACTIONS: QuickAction[] = [
  { key: 'post-job', label: 'Post New Job', icon: <PlusCircle size={20} />, description: 'Create a new job listing' },
  { key: 'search', label: 'Search Candidates', icon: <Search size={20} />, description: 'Find talent in your pool' },
  { key: 'outreach', label: 'Send Outreach', icon: <MessageSquare size={20} />, description: 'Reach out to candidates' },
  { key: 'reports', label: 'View Reports', icon: <BarChart3 size={20} />, description: 'Analytics & insights' },
];

const DEFAULT_ACTIVITY: ActivityItem[] = [
  { id: 'a-1', type: 'applied', message: 'Sarah Johnson applied for Senior Frontend Engineer', time: new Date(Date.now() - 30 * 60_000), entityType: 'candidate', entityName: 'Sarah Johnson' },
  { id: 'a-2', type: 'interview', message: 'Technical interview completed for Michael Chen', time: new Date(Date.now() - 2 * 3600_000), entityType: 'interview' },
  { id: 'a-3', type: 'offer', message: 'Offer extended to David Park for Backend Engineer', time: new Date(Date.now() - 5 * 3600_000), entityType: 'offer', entityName: 'David Park' },
  { id: 'a-4', type: 'stage-change', message: 'Emily Rodriguez moved to Interview stage', time: new Date(Date.now() - 8 * 3600_000), entityType: 'candidate' },
  { id: 'a-5', type: 'hired', message: 'James Kim accepted offer for Product Designer', time: new Date(Date.now() - 24 * 3600_000), entityType: 'candidate', entityName: 'James Kim' },
];

const DEFAULT_NOTIFS: Notification[] = [
  { id: 'n-1', type: 'breach', message: '3 candidates pending review past SLA (48h)', time: new Date(Date.now() - 1 * 3600_000) },
  { id: 'n-2', type: 'approval', message: 'Offer for David Park awaiting approval', time: new Date(Date.now() - 3 * 3600_000) },
  { id: 'n-3', type: 'candidate', message: '5 new high-match candidates in your pipeline', time: new Date(Date.now() - 6 * 3600_000) },
];

const DEFAULT_SUGGESTIONS: AISuggestion[] = [
  { id: 's-1', action: 'Review Sarah Johnson\'s application', confidence: 95, reason: '98% match score, profile has been waiting 36h' },
  { id: 's-2', action: 'Schedule follow-up with Michael Chen', confidence: 88, reason: 'Technical round completed, strong positive signals' },
  { id: 's-3', action: 'Reach out to Emily Rodriguez', confidence: 82, reason: 'High-value passive candidate, recently updated profile' },
];

const DEFAULT_PERF: PerformanceMetric[] = [
  { label: 'Offers Accepted', value: 8, target: 10 },
  { label: 'Candidates Sourced', value: 45, target: 50 },
  { label: 'Avg Response Time', value: 4, target: 2 },
  { label: 'Pipeline Velocity', value: 72, target: 85 },
];

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getTrendIcon(trend: string) {
  if (trend === 'up') return <TrendingUp size={14} />;
  if (trend === 'down') return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

function getTrendColor(trend: string, t: DesignTokens) {
  if (trend === 'up') return t.colors.successScale[600];
  if (trend === 'down') return t.colors.errorScale[600];
  return t.colors.neutral[500];
}

function getActivityIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    applied: <UserPlus size={14} />,
    interview: <Video size={14} />,
    offer: <FileText size={14} />,
    hired: <CheckCircle size={14} />,
    rejected: <XCircle size={14} />,
    note: <MessageSquare size={14} />,
    'stage-change': <ArrowRight size={14} />,
  };
  return icons[type] ?? <Zap size={14} />;
}

function getNotifIcon(type: string, t: DesignTokens) {
  if (type === 'breach') return { icon: <AlertTriangle size={14} />, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] };
  if (type === 'approval') return { icon: <CheckCircle size={14} />, color: t.colors.warningScale[600], bg: t.colors.warningScale[50] };
  return { icon: <UserPlus size={14} />, color: t.colors.infoScale[600], bg: t.colors.infoScale[50] };
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const OverviewBhRecruiterHome = createPreset<BhRecruiterHomeProps>({
  name: 'BhRecruiterHome.Overview',
  render: ({ primitives, props, tokens: t }: PresetContext<BhRecruiterHomeProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const glassCardBg = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg };
      }
      return { backgroundColor: t.colors.common.white };
    }, [t]);

    const {
      recruiter,
      recruiterName: recruiterNameProp = BH_RECRUITER_HOME_DEFAULTS.recruiterName,
      kpiStats = DEFAULT_KPI,
      pipelineJobs = DEFAULT_PIPELINE,
      upcomingInterviews = DEFAULT_INTERVIEWS,
      quickActions = DEFAULT_ACTIONS,
      activityFeed = DEFAULT_ACTIVITY,
      notifications = DEFAULT_NOTIFS,
      aiSuggestions = DEFAULT_SUGGESTIONS,
      performanceMetrics = DEFAULT_PERF,
      showAISuggestions = true,
      dateRangeLabel = BH_RECRUITER_HOME_DEFAULTS.dateRangeLabel,
      onQuickAction, onPipelineJobClick, onInterviewClick,
      onNotificationDismiss, onSuggestionAccept, onSuggestionDismiss,
      onActivityClick,
      className, style,
    } = props;

    const recruiterName = recruiter
      ? `${recruiter.firstName ?? ''} ${recruiter.lastName ?? ''}`.trim() || recruiterNameProp
      : recruiterNameProp;

    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'md' }), [t]);

    const handleQuickAction = useCallback((key: string) => { onQuickAction?.(key); }, [onQuickAction]);
    const handlePipelineJobClick = useCallback((id: string) => { onPipelineJobClick?.(id); }, [onPipelineJobClick]);
    const handleInterviewClick = useCallback((id: string) => { onInterviewClick?.(id); }, [onInterviewClick]);
    const handleNotifDismiss = useCallback((id: string) => { onNotificationDismiss?.(id); }, [onNotificationDismiss]);
    const handleSuggestionAccept = useCallback((id: string) => { onSuggestionAccept?.(id); }, [onSuggestionAccept]);
    const handleSuggestionDismiss = useCallback((id: string) => { onSuggestionDismiss?.(id); }, [onSuggestionDismiss]);
    const handleActivityClick = useCallback((id: string) => { onActivityClick?.(id); }, [onActivityClick]);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column', gap: t.spacing[6],
        padding: `${t.spacing[6]}px`, ...style,
      }}>
        {/* Header greeting */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...entrance.animate, transition: entrance.transition }}>
          <Text style={{
            fontSize: t.typography.fontSize['2xl'],
            fontWeight: ptypo.headingWeight,
            letterSpacing: ptypo.headingLetterSpacing,
            color: t.colors.neutral[900],
          }}>
            Welcome back, {recruiterName}
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
            Here is your recruiting dashboard for {dateRangeLabel}
          </Text>
        </Box>

        {/* KPI Ribbon */}
        <Box role="list" aria-label="Key performance indicators" style={{ display: 'grid', gridTemplateColumns: `repeat(${(kpiStats ?? []).length || 1}, 1fr)`, gap: t.spacing[4] }}>
          {(kpiStats ?? []).map((kpi, idx) => (
            <Box key={kpi.label ?? idx} role="listitem" style={{
              ...cardBase, ...glassCardBg,
              padding: `${t.spacing[5]}px`, display: 'flex', alignItems: 'flex-start', gap: t.spacing[3],
              overflow: 'hidden', position: 'relative',
              ...entrance.animate,
              transitionDelay: `${createStaggerDelay(t, idx)}ms`,
              transition: entrance.transition,
            }}>
              {accentBar && <Box style={{ ...accentBar, position: 'absolute', top: 0, left: 0 }} />}
              <Box style={{
                ...createIconContainerStyle(t, { size: 44 }),
                backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600],
              }}>{kpi.icon}</Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>{kpi.label ?? ''}</Text>
                <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1.2 }}>{kpi.value ?? 0}</Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                  <Box style={{ color: getTrendColor(kpi.trend ?? 'flat', t) }}>{getTrendIcon(kpi.trend ?? 'flat')}</Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: getTrendColor(kpi.trend ?? 'flat', t), fontWeight: t.typography.fontWeight.medium }}>{kpi.trendValue ?? 0}%</Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Notifications bar */}
        {(notifications ?? []).length > 0 && (
          <Box role="alert" aria-label="Notifications" style={{
            ...cardBase, ...glassCardBg, padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            display: 'flex', flexDirection: 'column', gap: t.spacing[2],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
              <Bell size={14} style={{ color: t.colors.warningScale[600] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Notifications</Text>
            </Box>
            {(notifications ?? []).map(n => {
              const nc = getNotifIcon(n.type ?? 'candidate', t);
              return (
                <Box key={n.id} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  backgroundColor: nc.bg,
                }}>
                  <Box style={{ color: nc.color, flexShrink: 0 }}>{nc.icon}</Box>
                  <Text style={{ flex: 1, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{n.message ?? ''}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>{n.time ? formatDistanceToNow(n.time, { addSuffix: true }) : ''}</Text>
                  {onNotificationDismiss && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label="Dismiss notification"
                      onClick={() => handleNotifDismiss(n.id ?? '')}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotifDismiss(n.id ?? ''); } }}
                      style={{ color: t.colors.neutral[400], cursor: 'pointer', flexShrink: 0 }}
                    ><X size={12} /></Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Quick Actions */}
        <Box>
          <Text style={{ ...sectionHeaderStyle }}>Quick Actions</Text>
          <Box role="list" aria-label="Quick actions" style={{ display: 'grid', gridTemplateColumns: `repeat(${(quickActions ?? []).length || 1}, 1fr)`, gap: t.spacing[3] }}>
            {(quickActions ?? []).map((qa, idx) => (
              <Box
                key={qa.key}
                role="listitem"
                tabIndex={0}
                aria-label={qa.label}
                onClick={() => handleQuickAction(qa.key)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickAction(qa.key); } }}
                style={{
                  ...cardBase, ...glassCardBg, ...hoverStyles.base,
                  padding: `${t.spacing[5]}px`, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: t.spacing[2], cursor: 'pointer',
                  ...entrance.animate,
                  transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                }}
              >
                <Box style={{
                  ...createIconContainerStyle(t, { size: 44 }),
                  backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600],
                }}>{qa.icon}</Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{qa.label}</Text>
                {qa.description && <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{qa.description}</Text>}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Main content: Pipeline + sidebar */}
        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.spacing[5] }}>
          {/* Pipeline */}
          <Box>
            <Text style={{ ...sectionHeaderStyle }}>Active Pipeline</Text>
            <Box role="list" aria-label="Active pipeline jobs" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
              {(pipelineJobs ?? []).map((job, idx) => {
                const total = (job.stages ?? []).reduce((a, s) => a + (s.count ?? 0), 0);
                return (
                  <Box
                    key={job.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={job.title}
                    onClick={() => handlePipelineJobClick(job.id ?? '')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePipelineJobClick(job.id ?? ''); } }}
                    style={{
                      ...cardBase, ...glassCardBg, ...hoverStyles.base,
                      padding: `${t.spacing[4]}px`, cursor: 'pointer',
                      ...entrance.animate,
                      transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{job.title ?? ''}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], color: t.colors.neutral[400] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{total} candidates</Text>
                        <ChevronRight size={14} />
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                      {(job.stages ?? []).map((stage, si) => {
                        const colors = [t.colors.primaryScale[400], t.colors.infoScale[400], t.colors.warningScale[400], t.colors.successScale[400]];
                        return (
                          <Box key={stage.name ?? si} style={{ flex: 1, textAlign: 'center' }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1] }}>{stage.name ?? ''}</Text>
                            <Box style={{
                              height: 28, borderRadius: t.borderRadius.md,
                              backgroundColor: colors[si % colors.length],
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: (stage.count ?? 0) > 0 ? 1 : 0.3,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.common.white }}>{stage.count ?? 0}</Text>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Sidebar: Interviews + AI Suggestions */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[5] }}>
            {/* Upcoming Interviews */}
            <Box>
              <Text style={{ ...sectionHeaderStyle }}>Upcoming Interviews</Text>
              <Box role="list" aria-label="Upcoming interviews" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {(upcomingInterviews ?? []).map((iv, idx) => (
                  <Box
                    key={iv.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`Interview with ${iv.candidateName ?? 'Unknown'}`}
                    onClick={() => handleInterviewClick(iv.id ?? '')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInterviewClick(iv.id ?? ''); } }}
                    style={{
                      ...cardBase, ...glassCardBg,
                      padding: `${t.spacing[3]}px`, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: t.spacing[3],
                      transition: `all ${t.motion.hover}`,
                      ...entrance.animate,
                      transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    }}
                  >
                    <Box style={{
                      width: 36, height: 36, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
                    }}>
                      {(iv.candidateName ?? '').split(' ').map(p => p?.[0] ?? '').join('').slice(0, 2)}
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{iv.candidateName ?? ''}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{iv.stageName ?? ''} - {iv.jobTitle ?? ''}</Text>
                    </Box>
                    <Box style={{ textAlign: 'right', flexShrink: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600] }}>
                        {iv.time ? formatDistanceToNow(iv.time, { addSuffix: false }) : ''}
                      </Text>
                      {iv.isAI && (
                        <Box style={{
                          display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                          padding: `0 ${t.spacing[1]}px`, borderRadius: br, marginTop: t.spacing[1],
                          backgroundColor: t.colors.secondaryScale[50], color: t.colors.secondaryScale[700],
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                        }}><Sparkles size={8} /> AI</Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* AI Suggestions */}
            {showAISuggestions && (aiSuggestions ?? []).length > 0 && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                  <Sparkles size={12} style={{ color: t.colors.secondaryScale[600] }} />
                  <Text style={{ ...sectionHeaderStyle, marginBottom: 0 }}>AI Suggested Actions</Text>
                </Box>
                <Box role="list" aria-label="AI suggestions" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {(aiSuggestions ?? []).map((sg, idx) => (
                    <Box key={sg.id ?? idx} role="listitem" style={{
                      ...cardBase, ...glassCardBg,
                      padding: `${t.spacing[3]}px`, position: 'relative', overflow: 'hidden',
                      ...entrance.animate,
                      transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                      transition: entrance.transition,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[2] }}>
                        <Box style={{
                          ...createIconContainerStyle(t, { size: 28 }),
                          backgroundColor: t.colors.secondaryScale[50], color: t.colors.secondaryScale[600],
                        }}><Zap size={13} /></Box>
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{sg.action ?? ''}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{sg.reason ?? ''}</Text>
                        </Box>
                        <Box style={{
                          padding: `0 ${t.spacing[1]}px`, borderRadius: br,
                          backgroundColor: (sg.confidence ?? 0) >= 90 ? t.colors.successScale[50] : t.colors.warningScale[50],
                          color: (sg.confidence ?? 0) >= 90 ? t.colors.successScale[700] : t.colors.warningScale[700],
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                        }}>{sg.confidence ?? 0}%</Box>
                      </Box>
                      <Box style={{ display: 'flex', gap: t.spacing[1], marginTop: t.spacing[2], justifyContent: 'flex-end' }}>
                        <Box
                          role="button"
                          tabIndex={0}
                          aria-label={`Accept suggestion: ${sg.action ?? ''}`}
                          onClick={() => handleSuggestionAccept(sg.id ?? '')}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSuggestionAccept(sg.id ?? ''); } }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: br, border: 'none',
                            backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white,
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                            cursor: 'pointer', transition: `all ${t.motion.hover}`,
                          }}
                        ><CheckCircle size={10} /> Accept</Box>
                        <Box
                          role="button"
                          tabIndex={0}
                          aria-label={`Dismiss suggestion: ${sg.action ?? ''}`}
                          onClick={() => handleSuggestionDismiss(sg.id ?? '')}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSuggestionDismiss(sg.id ?? ''); } }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: br,
                            border: `1px solid ${t.colors.neutral[200]}`,
                            backgroundColor: t.colors.common.white, color: t.colors.neutral[600],
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                            cursor: 'pointer', transition: `all ${t.motion.hover}`,
                          }}
                        ><X size={10} /> Dismiss</Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Bottom row: Activity + Performance */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[5] }}>
          {/* Activity Feed */}
          <Box>
            <Text style={{ ...sectionHeaderStyle }}>Recent Activity</Text>
            <Box role="list" aria-label="Recent activity" style={{
              ...cardBase, ...glassCardBg, padding: `${t.spacing[3]}px`,
              display: 'flex', flexDirection: 'column',
            }}>
              {(activityFeed ?? []).map((act, idx) => (
                <Box
                  key={act.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={act.message ?? ''}
                  onClick={() => handleActivityClick(act.id ?? '')}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivityClick(act.id ?? ''); } }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px`, cursor: 'pointer',
                    borderBottom: idx < (activityFeed ?? []).length - 1 ? `1px solid ${t.colors.neutral[50]}` : undefined,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Box style={{
                    ...createIconContainerStyle(t, { size: 28 }),
                    backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600],
                  }}>{getActivityIcon(act.type ?? 'note')}</Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{act.message ?? ''}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400]}}>{act.time ? formatDistanceToNow(act.time, { addSuffix: true }) : ''}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Performance Metrics */}
          <Box>
            <Text style={{ ...sectionHeaderStyle }}>My Performance</Text>
            <Box role="list" aria-label="Performance metrics" style={{
              ...cardBase, ...glassCardBg, padding: `${t.spacing[4]}px`,
              display: 'flex', flexDirection: 'column', gap: t.spacing[3],
            }}>
              {(performanceMetrics ?? []).map((pm, idx) => {
                const pmValue = pm.value ?? 0;
                const pmTarget = pm.target ?? 0;
                const pct = pmTarget > 0 ? Math.min(100, Math.round((pmValue / pmTarget) * 100)) : 0;
                const onTrack = pct >= 80;
                const bar = createProgressBarStyle(t, {
                  percent: pct,
                  color: onTrack ? t.colors.successScale[500] : t.colors.warningScale[500],
                });
                return (
                  <Box key={pm.label ?? idx} role="listitem" style={{
                    ...entrance.animate,
                    transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    transition: entrance.transition,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{pm.label ?? ''}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: onTrack ? t.colors.successScale[600] : t.colors.warningScale[600] }}>
                        {pmValue}/{pmTarget}
                      </Text>
                    </Box>
                    <Box style={bar.track}>
                      <Box style={bar.fill} />
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
