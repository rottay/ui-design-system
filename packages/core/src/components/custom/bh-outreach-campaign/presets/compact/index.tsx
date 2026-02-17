'use client';

/**
 * BhOutreachCampaign - Compact Preset
 * Condensed campaign list with status and basic metrics.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Send, Play, Pause, CheckCircle, FileText, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhOutreachCampaignProps, CampaignData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CAMPAIGNS: CampaignData[] = [
  { id: 'c-1', name: 'Senior Engineers Q1', status: 'active', sent: 245, opened: 178, replied: 42, startDate: new Date(Date.now() - 7 * 86400000) },
  { id: 'c-2', name: 'Product Designers', status: 'active', sent: 120, opened: 89, replied: 23, startDate: new Date(Date.now() - 14 * 86400000) },
  { id: 'c-3', name: 'Data Science Sourcing', status: 'paused', sent: 340, opened: 201, replied: 34, startDate: new Date(Date.now() - 30 * 86400000) },
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

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhOutreachCampaign = createPreset<BhOutreachCampaignProps>({
  name: 'BhOutreachCampaign.Compact',
  render: (ctx: PresetContext<BhOutreachCampaignProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      campaigns: rawCampaigns = MOCK_CAMPAIGNS,
      onCampaignClick,
      selectedCampaignId,
      className,
      style,
    } = props;

    const campaigns = Array.isArray(rawCampaigns) ? rawCampaigns : MOCK_CAMPAIGNS;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === 'active').length, [campaigns]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
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
            <Send size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Campaigns
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'success'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{activeCampaigns} active</Text>
          </Box>
        </Box>

        {/* Campaign list */}
        <Box role="list" aria-label="Outreach campaigns">
          {campaigns.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No campaigns
              </Text>
            </Box>
          )}
          {campaigns.map((campaign) => {
            const isSelected = selectedCampaignId === campaign.id;
            const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(0) : '0';
            return (
              <Box
                key={campaign.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${campaign.name}: ${campaign.status}, ${replyRate}% reply rate`}
                onClick={() => onCampaignClick?.(campaign.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCampaignClick?.(campaign.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{
                  width: 8, height: 8, borderRadius: t.borderRadius.full, flexShrink: 0,
                  backgroundColor: getStatusColor(campaign.status, t),
                }} />
                <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {campaign.name}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {campaign.sent} sent / {replyRate}% reply
                  </Text>
                </Box>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
