'use client';

/**
 * BhOutreachCampaign - Manager Preset
 * Full campaign manager with status indicators, response rate bars,
 * and campaign analytics. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Send, Plus, Play, Pause, CheckCircle, FileText,
  Mail, Eye, MessageSquare, Calendar, ChevronRight,
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
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { BhOutreachCampaignProps, CampaignData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CAMPAIGNS: CampaignData[] = [
  { id: 'c-1', name: 'Senior Engineers Q1', status: 'active', sent: 245, opened: 178, replied: 42, startDate: new Date(Date.now() - 7 * 86400000) },
  { id: 'c-2', name: 'Product Designers Outreach', status: 'active', sent: 120, opened: 89, replied: 23, startDate: new Date(Date.now() - 14 * 86400000) },
  { id: 'c-3', name: 'Data Science Passive Sourcing', status: 'paused', sent: 340, opened: 201, replied: 34, startDate: new Date(Date.now() - 30 * 86400000) },
  { id: 'c-4', name: 'DevOps Re-engagement', status: 'completed', sent: 180, opened: 145, replied: 52, startDate: new Date(Date.now() - 45 * 86400000) },
  { id: 'c-5', name: 'Marketing VP Search', status: 'draft', sent: 0, opened: 0, replied: 0, startDate: new Date() },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusColor(status: CampaignData['status'], t: DesignTokens): string {
  switch (status) {
    case 'active': return t.colors.successScale[500];
    case 'paused': return t.colors.warningScale[500];
    case 'completed': return t.colors.infoScale[500];
    case 'draft': return t.colors.neutral[400];
  }
}

function getStatusBadgeKey(status: CampaignData['status']): 'success' | 'warning' | 'info' | 'secondary' {
  switch (status) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'completed': return 'info';
    case 'draft': return 'secondary';
  }
}

function getStatusIcon(status: CampaignData['status']) {
  switch (status) {
    case 'active': return Play;
    case 'paused': return Pause;
    case 'completed': return CheckCircle;
    case 'draft': return FileText;
  }
}

/* ================================================================== */
/*  Manager Preset                                                     */
/* ================================================================== */

export const ManagerBhOutreachCampaign = createPreset<BhOutreachCampaignProps>({
  name: 'BhOutreachCampaign.Manager',
  render: (ctx: PresetContext<BhOutreachCampaignProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      campaigns = MOCK_CAMPAIGNS,
      onCampaignClick,
      onCreateCampaign,
      selectedCampaignId,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleClick = useCallback((id: string) => { onCampaignClick?.(id); }, [onCampaignClick]);

    const totalSent = useMemo(() => campaigns.reduce((s, c) => s + c.sent, 0), [campaigns]);
    const totalReplied = useMemo(() => campaigns.reduce((s, c) => s + c.replied, 0), [campaigns]);
    const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === 'active').length, [campaigns]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
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
                <Send size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Outreach Campaigns
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Manage candidate outreach and track engagement
                </Text>
              </Box>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Create new campaign"
              onClick={() => onCreateCampaign?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateCampaign?.(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Plus size={14} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.common.white }}>
                New Campaign
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {/* Summary stats */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: t.spacing[4],
            marginBottom: t.spacing[6],
          }}>
            {[
              { label: 'Active Campaigns', value: activeCampaigns, icon: Play, color: t.colors.successScale },
              { label: 'Total Sent', value: totalSent, icon: Mail, color: t.colors.primaryScale },
              { label: 'Total Replies', value: totalReplied, icon: MessageSquare, color: t.colors.infoScale },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <Box
                  key={stat.label}
                  style={{ ...card, ...animStyle(i) }}
                  role="status"
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: stat.color[50] })}>
                      <StatIcon size={18} color={stat.color[600]} />
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                        {stat.value}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                        {stat.label}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Campaign list */}
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>All Campaigns</Text>
          {campaigns.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Send size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No campaigns created yet
              </Text>
            </Box>
          )}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
            {campaigns.map((campaign, i) => {
              const isHovered = hoveredId === campaign.id;
              const isSelected = selectedCampaignId === campaign.id;
              const openRate = campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0;
              const replyRate = campaign.sent > 0 ? (campaign.replied / campaign.sent) * 100 : 0;
              const StatusIcon = getStatusIcon(campaign.status);
              const progressBar = createProgressBarStyle(t, { percent: openRate, color: t.colors.primaryScale[500] });

              return (
                <Box
                  key={campaign.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Campaign: ${campaign.name}, Status: ${campaign.status}, Open rate: ${openRate.toFixed(0)}%`}
                  onClick={() => handleClick(campaign.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(campaign.id); } }}
                  onMouseEnter={() => setHoveredId(campaign.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    ...card,
                    ...hoverStyles.base,
                    ...(isHovered ? hoverStyles.hover : {}),
                    ...animStyle(i + 3),
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : card.backgroundColor,
                    borderColor: isSelected ? t.colors.primaryScale[200] : undefined,
                    cursor: 'pointer',
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[50] })}>
                        <StatusIcon size={16} color={getStatusColor(campaign.status, t)} />
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                        }}>
                          {campaign.name}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          Started {formatDistanceToNow(campaign.startDate, { addSuffix: true })}
                        </Text>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        ...createBadgeStyle(t, getStatusBadgeKey(campaign.status)),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {(campaign.status || '').charAt(0).toUpperCase() + (campaign.status || '').slice(1)}
                        </Text>
                      </Box>
                      <ChevronRight size={14} color={t.colors.neutral[300]} />
                    </Box>
                  </Box>

                  {/* Metrics */}
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[3], marginBottom: t.spacing[2] }}>
                    <Box role="status" aria-label={`Sent: ${campaign.sent}`}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Sent</Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{campaign.sent}</Text>
                    </Box>
                    <Box role="status" aria-label={`Opened: ${campaign.opened}`}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Opened</Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{campaign.opened}</Text>
                    </Box>
                    <Box role="status" aria-label={`Replied: ${campaign.replied}`}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Replied</Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{campaign.replied}</Text>
                    </Box>
                  </Box>

                  {/* Open rate bar */}
                  <Box>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Open rate</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{openRate.toFixed(0)}%</Text>
                    </Box>
                    <Box style={progressBar.track}>
                      <Box style={progressBar.fill} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
