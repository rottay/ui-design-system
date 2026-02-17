'use client';

/**
 * BhRecruiterHome - Compact Preset
 * Condensed recruiter dashboard with single-column layout: KPI row,
 * notifications, pipeline summary, upcoming interviews, and quick actions.
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
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhRecruiterHomeProps, KpiStat, PipelineJob, UpcomingInterview,
  QuickAction, Notification,
} from '../../core';
import { BH_RECRUITER_HOME_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  TrendingUp, TrendingDown, Minus, Users, Briefcase, Calendar, Clock,
  PlusCircle, Search, MessageSquare, ChevronRight, Bell,
  AlertTriangle, UserPlus, CheckCircle, X, Sparkles, BarChart3,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_KPI: KpiStat[] = [
  { label: 'Open Roles', value: 12, trend: 'up', trendValue: 8, icon: <Briefcase size={16} /> },
  { label: 'Active Candidates', value: 248, trend: 'up', trendValue: 15, icon: <Users size={16} /> },
  { label: 'Interviews', value: 9, trend: 'down', trendValue: 3, icon: <Calendar size={16} /> },
  { label: 'Time-to-Fill', value: '28d', trend: 'up', trendValue: 5, icon: <Clock size={16} /> },
];

const DEFAULT_PIPELINE: PipelineJob[] = [
  { id: 'j-1', title: 'Sr Frontend Engineer', stages: [{ name: 'Applied', count: 34 }, { name: 'Screen', count: 12 }, { name: 'Interview', count: 5 }, { name: 'Offer', count: 1 }] },
  { id: 'j-2', title: 'Product Designer', stages: [{ name: 'Applied', count: 21 }, { name: 'Screen', count: 8 }, { name: 'Interview', count: 3 }, { name: 'Offer', count: 0 }] },
];

const DEFAULT_INTERVIEWS: UpcomingInterview[] = [
  { id: 'i-1', candidateName: 'Sarah Johnson', jobTitle: 'Sr Frontend Engineer', stageName: 'Technical', time: new Date(Date.now() + 2 * 3600_000) },
  { id: 'i-2', candidateName: 'Michael Chen', jobTitle: 'Sr Frontend Engineer', stageName: 'AI Screen', time: new Date(Date.now() + 5 * 3600_000), isAI: true },
  { id: 'i-3', candidateName: 'Emily Rodriguez', jobTitle: 'Product Designer', stageName: 'Portfolio', time: new Date(Date.now() + 24 * 3600_000) },
];

const DEFAULT_NOTIFS: Notification[] = [
  { id: 'n-1', type: 'breach', message: '3 candidates past SLA (48h)', time: new Date(Date.now() - 3600_000) },
  { id: 'n-2', type: 'approval', message: 'Offer for David Park awaiting approval', time: new Date(Date.now() - 3 * 3600_000) },
];

const DEFAULT_ACTIONS: QuickAction[] = [
  { key: 'post-job', label: 'Post Job', icon: <PlusCircle size={16} /> },
  { key: 'search', label: 'Search', icon: <Search size={16} /> },
  { key: 'outreach', label: 'Outreach', icon: <MessageSquare size={16} /> },
  { key: 'reports', label: 'Reports', icon: <BarChart3 size={16} /> },
];

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getTrendIcon(trend: string) {
  if (trend === 'up') return <TrendingUp size={12} />;
  if (trend === 'down') return <TrendingDown size={12} />;
  return <Minus size={12} />;
}

function getTrendColor(trend: string, t: DesignTokens) {
  if (trend === 'up') return t.colors.successScale[600];
  if (trend === 'down') return t.colors.errorScale[600];
  return t.colors.neutral[500];
}

function getNotifStyle(type: string, t: DesignTokens) {
  if (type === 'breach') return { icon: <AlertTriangle size={12} />, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] };
  if (type === 'approval') return { icon: <CheckCircle size={12} />, color: t.colors.warningScale[600], bg: t.colors.warningScale[50] };
  return { icon: <UserPlus size={12} />, color: t.colors.infoScale[600], bg: t.colors.infoScale[50] };
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const CompactBhRecruiterHome = createPreset<BhRecruiterHomeProps>({
  name: 'BhRecruiterHome.Compact',
  render: ({ primitives, props, tokens: t }: PresetContext<BhRecruiterHomeProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const glassCardBg = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg };
      }
      return { backgroundColor: t.colors.common.white };
    }, [t]);

    const {
      recruiter,
      recruiterName: recruiterNameProp = BH_RECRUITER_HOME_DEFAULTS.recruiterName,
      kpiStats: rawKpiStats = DEFAULT_KPI,
      pipelineJobs: rawPipelineJobs = DEFAULT_PIPELINE,
      upcomingInterviews: rawUpcomingInterviews = DEFAULT_INTERVIEWS,
      quickActions: rawQuickActions = DEFAULT_ACTIONS,
      notifications: rawNotifications = DEFAULT_NOTIFS,
      dateRangeLabel = BH_RECRUITER_HOME_DEFAULTS.dateRangeLabel,
      onQuickAction, onPipelineJobClick, onInterviewClick,
      onNotificationDismiss,
      className, style,
    } = props;

    const kpiStats = Array.isArray(rawKpiStats) ? rawKpiStats : DEFAULT_KPI;
    const pipelineJobs = Array.isArray(rawPipelineJobs) ? rawPipelineJobs : DEFAULT_PIPELINE;
    const upcomingInterviews = Array.isArray(rawUpcomingInterviews) ? rawUpcomingInterviews : DEFAULT_INTERVIEWS;
    const quickActions = Array.isArray(rawQuickActions) ? rawQuickActions : DEFAULT_ACTIONS;
    const notifications = Array.isArray(rawNotifications) ? rawNotifications : DEFAULT_NOTIFS;

    const recruiterName = recruiter
      ? `${recruiter.firstName ?? ''} ${recruiter.lastName ?? ''}`.trim() || recruiterNameProp
      : recruiterNameProp;

    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm' }), [t]);

    const handleQuickAction = useCallback((key: string) => { onQuickAction?.(key); }, [onQuickAction]);
    const handlePipelineClick = useCallback((id: string) => { onPipelineJobClick?.(id); }, [onPipelineJobClick]);
    const handleInterviewClick = useCallback((id: string) => { onInterviewClick?.(id); }, [onInterviewClick]);
    const handleNotifDismiss = useCallback((id: string) => { onNotificationDismiss?.(id); }, [onNotificationDismiss]);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column', gap: t.spacing[4],
        padding: `${t.spacing[5]}px`, maxWidth: 600, ...style,
      }}>
        {/* Header */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...entrance.animate, transition: entrance.transition }}>
          <Text style={{
            fontSize: t.typography.fontSize.lg,
            fontWeight: ptypo.headingWeight,
            letterSpacing: ptypo.headingLetterSpacing,
            color: t.colors.neutral[900],
          }}>
            Hi, {recruiterName}
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{dateRangeLabel}</Text>
        </Box>

        {/* KPI row */}
        <Box role="list" aria-label="Key metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[2] }}>
          {(kpiStats ?? []).map((kpi, idx) => (
            <Box key={kpi.label ?? idx} role="listitem" style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
              ...cardBase, ...glassCardBg,
              padding: `${t.spacing[3]}px`, textAlign: 'center',
              ...entrance.animate,
              transitionDelay: `${createStaggerDelay(t, idx)}ms`,
              transition: entrance.transition,
            }}>
              <Box style={{ color: t.colors.primaryScale[500], marginBottom: t.spacing[1], display: 'flex', justifyContent: 'center' }}>{kpi.icon}</Box>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1 }}>{kpi.value}</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{kpi.label}</Text>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                <Box style={{ color: getTrendColor((kpi.trend ?? ''), t) }}>{getTrendIcon((kpi.trend ?? ''))}</Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: getTrendColor((kpi.trend ?? ''), t), fontWeight: t.typography.fontWeight.medium }}>{kpi.trendValue}%</Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Notifications */}
        {(notifications ?? []).length > 0 && (
          <Box role="alert" style={{
            ...cardBase, ...glassCardBg,
            padding: `${t.spacing[3]}px`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
              <Bell size={12} style={{ color: t.colors.warningScale[600] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Alerts</Text>
            </Box>
            {(notifications ?? []).map(n => {
              const ns = getNotifStyle(n.type ?? 'candidate', t);
              return (
                <Box key={n.id} style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.md,
                  backgroundColor: ns.bg, marginBottom: t.spacing[1],
                }}>
                  <Box style={{ color: ns.color, flexShrink: 0 }}>{ns.icon}</Box>
                  <Text style={{ flex: 1, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{n.message}</Text>
                  {onNotificationDismiss && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label="Dismiss"
                      onClick={() => handleNotifDismiss((n.id ?? ''))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotifDismiss((n.id ?? '')); } }}
                      style={{ color: t.colors.neutral[400], cursor: 'pointer', flexShrink: 0 }}
                    ><X size={10} /></Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Quick actions row */}
        <Box role="list" aria-label="Quick actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[2] }}>
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
                padding: `${t.spacing[3]}px`, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: t.spacing[1], cursor: 'pointer', textAlign: 'center',
              }}
            >
              <Box style={{
                ...createIconContainerStyle(t, { size: 32 }),
                backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600],
              }}>{qa.icon}</Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{qa.label}</Text>
            </Box>
          ))}
        </Box>

        {/* Pipeline */}
        <Box>
          <Text style={{ ...sectionHeaderStyle }}>Pipeline</Text>
          <Box role="list" aria-label="Pipeline jobs" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            {(pipelineJobs ?? []).map((job, idx) => {
              const total = (job.stages ?? []).reduce((a, s) => a + (s.count ?? 0), 0);
              return (
                <Box
                  key={job.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={job.title}
                  onClick={() => handlePipelineClick((job.id ?? ''))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePipelineClick((job.id ?? '')); } }}
                  style={{
                    ...cardBase, ...glassCardBg, ...hoverStyles.base,
                    padding: `${t.spacing[3]}px`, cursor: 'pointer',
                    ...entrance.animate,
                    transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    transition: entrance.transition,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{job.title}</Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{total}</Text>
                      <ChevronRight size={12} style={{ color: t.colors.neutral[400] }} />
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', gap: t.spacing[1], height: 4, borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
                    {(job.stages ?? []).map((stage, si) => {
                      const pct = total > 0 ? ((stage.count ?? 0) / total) * 100 : 0;
                      const colors = [t.colors.primaryScale[400], t.colors.infoScale[400], t.colors.warningScale[400], t.colors.successScale[400]];
                      return (
                        <Box key={stage.name} style={{
                          flex: pct || 0.5, height: '100%', backgroundColor: colors[si % colors.length],
                          borderRadius: t.borderRadius.full, minWidth: 2,
                        }} />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Upcoming interviews */}
        <Box>
          <Text style={{ ...sectionHeaderStyle }}>Next Interviews</Text>
          <Box role="list" aria-label="Upcoming interviews" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
            {(upcomingInterviews ?? []).map((iv, idx) => (
              <Box
                key={iv.id}
                role="listitem"
                tabIndex={0}
                aria-label={`Interview with ${iv.candidateName}`}
                onClick={() => handleInterviewClick((iv.id ?? ''))}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInterviewClick((iv.id ?? '')); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.common.white, cursor: 'pointer',
                  border: `1px solid ${t.colors.neutral[50]}`,
                  transition: `all ${t.motion.hover}`,
                  ...entrance.animate,
                  transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                }}
              >
                <Box style={{
                  width: 28, height: 28, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
                }}>{(iv.candidateName ?? '').split(' ').map(p => p[0]).join('').slice(0, 2)}</Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{iv.candidateName}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{iv.stageName}</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  {iv.isAI && (
                    <Box style={{
                      padding: `0 4px`, borderRadius: br,
                      backgroundColor: t.colors.secondaryScale[50], color: t.colors.secondaryScale[700],
                      fontSize: 8, fontWeight: t.typography.fontWeight.bold,
                      display: 'inline-flex', alignItems: 'center', gap: 2,
                    }}><Sparkles size={7} /> AI</Box>
                  )}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontWeight: t.typography.fontWeight.medium }}>
                    {formatDistanceToNow((iv.time ?? new Date()), { addSuffix: false })}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
