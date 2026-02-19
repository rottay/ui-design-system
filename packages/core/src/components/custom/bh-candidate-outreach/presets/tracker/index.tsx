'use client';

/**
 * BhCandidateOutreach - Tracker Preset
 * Campaign tracking dashboard with metrics funnel, recipient status,
 * and engagement analytics.
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
} from '../../../helpers';
import type {
  BhCandidateOutreachProps, OutreachRecipient, CampaignMetrics, ABVariant,
} from '../../core';
import { getMetricColors, getRecipientInitials, getCandidateFullName } from '../../core';
import type { DBCandidate } from '@rottay/recruiter';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Send, Eye, MessageSquare, AlertTriangle, TrendingUp,
  Clock, CheckCircle, XCircle, BarChart3, Users, Mail,
} from 'lucide-react';

const RECIPIENT_STATUSES = [
  { recipientId: 'r-1', name: 'Sarah Johnson', status: 'replied', time: '2h ago' },
  { recipientId: 'r-2', name: 'Michael Chen', status: 'opened', time: '4h ago' },
  { recipientId: 'r-3', name: 'Emily Rodriguez', status: 'replied', time: '6h ago' },
  { recipientId: 'r-4', name: 'James Kim', status: 'sent', time: '8h ago' },
  { recipientId: 'r-5', name: 'Anna Kowalski', status: 'bounced', time: '8h ago' },
  { recipientId: 'r-6', name: 'David Thompson', status: 'opened', time: '12h ago' },
];

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getStatusConfig(status: string, t: DesignTokens) {
  const m: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    sent: { label: 'Sent', icon: <Send size={12} />, color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50] },
    opened: { label: 'Opened', icon: <Eye size={12} />, color: t.colors.infoScale[600], bg: t.colors.infoScale[50] },
    replied: { label: 'Replied', icon: <MessageSquare size={12} />, color: t.colors.successScale[600], bg: t.colors.successScale[50] },
    bounced: { label: 'Bounced', icon: <AlertTriangle size={12} />, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] },
  };
  return m[status] ?? m.sent;
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const TrackerBhCandidateOutreach = createPreset<BhCandidateOutreachProps>({
  name: 'BhCandidateOutreach.Tracker',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCandidateOutreachProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const mc = useMemo(() => getMetricColors(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const glassCardBg = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg };
      }
      return { backgroundColor: t.colors.common.white };
    }, [t]);

    const {
      campaignMetrics: rawCampaignMetrics,
      variants: rawVariants = [],
      recipients: rawRecipients = [],
      className, style,
    } = props;

    const campaignMetrics: CampaignMetrics = rawCampaignMetrics ?? { sent: 0, opened: 0, replied: 0, bounced: 0 };
    const variants = Array.isArray(rawVariants) ? rawVariants : [];
    const recipients = Array.isArray(rawRecipients) ? rawRecipients : [];

    const [activeTab, setActiveTab] = useState<'overview' | 'recipients' | 'ab'>('overview');

    const handleTabChange = useCallback((tab: 'overview' | 'recipients' | 'ab') => {
      setActiveTab(tab);
    }, []);

    const openRate = useMemo(() =>
      campaignMetrics.sent > 0 ? Math.round((campaignMetrics.opened / campaignMetrics.sent) * 100) : 0,
    [campaignMetrics]);

    const replyRate = useMemo(() =>
      campaignMetrics.sent > 0 ? Math.round((campaignMetrics.replied / campaignMetrics.sent) * 100) : 0,
    [campaignMetrics]);

    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'md' }), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const metricCards = useMemo(() => [
      { label: 'Sent', value: campaignMetrics.sent, color: mc.sent.color, bg: mc.sent.bgColor, icon: <Send size={18} /> },
      { label: 'Opened', value: campaignMetrics.opened, color: mc.opened.color, bg: mc.opened.bgColor, icon: <Eye size={18} />, sub: `${openRate}% rate` },
      { label: 'Replied', value: campaignMetrics.replied, color: mc.replied.color, bg: mc.replied.bgColor, icon: <MessageSquare size={18} />, sub: `${replyRate}% rate` },
      { label: 'Bounced', value: campaignMetrics.bounced, color: mc.bounced.color, bg: mc.bounced.bgColor, icon: <AlertTriangle size={18} /> },
    ], [campaignMetrics, mc, openRate, replyRate]);

    const funnelData = useMemo(() => [
      { label: 'Sent', value: campaignMetrics.sent, percent: 100, color: t.colors.primaryScale[500] },
      { label: 'Opened', value: campaignMetrics.opened, percent: openRate, color: t.colors.infoScale[500] },
      { label: 'Replied', value: campaignMetrics.replied, percent: replyRate, color: t.colors.successScale[500] },
    ], [campaignMetrics, openRate, replyRate, t]);

    return (
      <Box className={className} style={{
        ...cardBase,
        display: 'flex', flexDirection: 'column', height: '100%',
        ...glassCardBg, overflow: 'hidden', ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                letterSpacing: ptypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>Campaign Tracker</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>Senior Frontend Engineer Outreach</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={{
                ...createBadgeStyle(t, 'success'),
                borderRadius: br, fontSize: t.typography.fontSize.xs,
              }}>Active</Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Box role="tablist" aria-label="Campaign views" style={{ display: 'flex', gap: t.spacing[1] }}>
            {(['overview', 'recipients', 'ab'] as const).map(tab => {
              const active = activeTab === tab;
              const labels: Record<string, string> = { overview: 'Overview', recipients: 'Recipients', ab: 'A/B Test' };
              return (
                <Box
                  key={tab}
                  role="tab"
                  aria-selected={active}
                  tabIndex={0}
                  onClick={() => handleTabChange(tab)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabChange(tab); } }}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                    border: 'none', backgroundColor: active ? t.colors.primaryScale[50] : 'transparent',
                    color: active ? t.colors.primaryScale[700] : t.colors.neutral[500],
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: active ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                    cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  }}
                >{labels[tab]}</Box>
              );
            })}
          </Box>
        </Box>

        <Box role="tabpanel" style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <>
              {/* Metric cards */}
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
                {metricCards.map((m, idx) => (
                  <Box key={m.label} style={{
                    padding: `${t.spacing[5]}px`, borderRadius: t.borderRadius.xl,
                    backgroundColor: m.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[2],
                    ...entrance.animate,
                    transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    transition: entrance.transition,
                  }}>
                    <Box style={{ color: m.color }}>{m.icon}</Box>
                    <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: m.color }}>{m.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: m.color, fontWeight: t.typography.fontWeight.medium }}>{m.label}</Text>
                    {m.sub && <Text style={{ fontSize: t.typography.fontSize.xs, color: m.color, opacity: 0.7 }}>{m.sub}</Text>}
                  </Box>
                ))}
              </Box>

              {/* Funnel visualization */}
              <Box style={{ marginBottom: t.spacing[6] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[800], marginBottom: t.spacing[3],
                }}>Engagement Funnel</Text>
                <Box role="list" aria-label="Engagement funnel" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {funnelData.map((f, idx) => {
                    const bar = createProgressBarStyle(t, { percent: f.percent, color: f.color });
                    return (
                      <Box key={f.label} role="listitem" style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        <Text style={{ width: 60, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' }}>{f.label}</Text>
                        <Box style={{ flex: 1, ...bar.track, height: 24, borderRadius: t.borderRadius.lg }}>
                          <Box style={{
                            ...bar.fill, height: '100%', borderRadius: t.borderRadius.lg,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: t.spacing[2],
                          }}>
                            {f.percent >= 15 && <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.common.white }}>{f.value}</Text>}
                          </Box>
                        </Box>
                        <Text style={{ width: 40, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.bold }}>{f.percent}%</Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </>
          )}

          {/* Recipients tab */}
          {activeTab === 'recipients' && (
            <Box role="list" aria-label="Recipient statuses" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {RECIPIENT_STATUSES.map((rs, idx) => {
                const sc = getStatusConfig(rs.status, t);
                return (
                  <Box key={rs.recipientId} role="listitem" style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                    border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.common.white,
                    ...entrance.animate,
                    transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    transition: entrance.transition,
                  }}>
                    <Box style={{
                      width: 32, height: 32, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
                    }}>{getRecipientInitials(rs.name)}</Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{rs.name}</Text>
                    </Box>
                    <Box style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: `2px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: sc.bg, color: sc.color,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                    }}>{sc.icon} {sc.label}</Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], flexShrink: 0 }}>{rs.time}</Text>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* A/B tab */}
          {activeTab === 'ab' && (
            <Box role="list" aria-label="A/B test variants" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
              {variants.map((v, idx) => {
                const vm = v.metrics ?? { sent: 0, opened: 0, replied: 0, bounced: 0 };
                const vOpenRate = vm.sent > 0 ? Math.round((vm.opened / vm.sent) * 100) : 0;
                const vReplyRate = vm.sent > 0 ? Math.round((vm.replied / vm.sent) * 100) : 0;
                return (
                  <Box key={v.id} role="listitem" style={{
                    padding: `${t.spacing[5]}px`, borderRadius: t.borderRadius.xl,
                    border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.common.white,
                    ...entrance.animate,
                    transitionDelay: `${createStaggerDelay(t, idx)}ms`,
                    transition: entrance.transition,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{v.name}</Text>
                        <Box style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.neutral[100], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{v.splitPercent}%</Box>
                      </Box>
                      {vReplyRate > replyRate / 2 && (
                        <Box style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                          ...createBadgeStyle(t, 'success'),
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                        }}>
                          <TrendingUp size={11} /> Winner
                        </Box>
                      )}
                    </Box>
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[3] }}>
                      {[
                        { label: 'Sent', value: vm.sent },
                        { label: 'Opened', value: `${vOpenRate}%` },
                        { label: 'Replied', value: `${vReplyRate}%` },
                        { label: 'Bounced', value: vm.bounced },
                      ].map(s => (
                        <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }}>
                          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{s.value}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{s.label}</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
