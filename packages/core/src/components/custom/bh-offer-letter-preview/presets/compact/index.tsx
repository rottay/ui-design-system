'use client';

/**
 * BhOfferLetterPreview - Compact Preset
 * Condensed offer summary card with key terms.
 */

import { useState, useMemo, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Award } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhOfferLetterPreviewProps, OfferLetterData } from '../../core';
import { offerToLetterData } from '../../core';
import type { DesignTokens } from '../../../../../types';

const MOCK_LETTER: OfferLetterData = {
  candidateName: 'Sarah Johnson',
  position: 'Senior Frontend Engineer',
  salary: 137000,
  startDate: 'March 15, 2026',
  benefits: ['Health insurance', '401(k)', '20 PTO days', 'Remote work'],
};

export const CompactBhOfferLetterPreview = createPreset<BhOfferLetterPreviewProps>({
  name: 'BhOfferLetterPreview.Compact',
  render: (ctx: PresetContext<BhOfferLetterPreviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      offer,
      candidateName: candidateNameProp,
      letterData: letterDataProp,
      companyName = '',
      currency = '$',
      onDownload,
      className,
      style,
    } = props;

    const letterData = letterDataProp
      ?? (offer ? offerToLetterData(offer, candidateNameProp) : { candidateName: '', position: '', salary: 0, startDate: '', benefits: [] });


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

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
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <FileText size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Offer Letter
            </Text>
          </Box>
          {onDownload && (
            <Box
              tabIndex={0}
              role="button"
              aria-label="Download"
              onClick={() => onDownload()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDownload(); } }}
              style={{
                ...createBadgeStyle(t, 'primary'),
                borderRadius: badgeRadius,
                cursor: 'pointer',
                padding: `1px ${t.spacing[2]}px`,
              }}
            >
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Download</Text>
            </Box>
          )}
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[900],
            marginBottom: t.spacing[1],
          }}>
            {letterData.candidateName}
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[3] }}>
            {letterData.position} at {companyName}
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <DollarSign size={12} color={t.colors.successScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>Salary:</Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
              }}>
                {currency}{(letterData.salary ?? 0).toLocaleString()}/yr
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Calendar size={12} color={t.colors.infoScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>Start:</Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.neutral[800],
              }}>
                {letterData.startDate}
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[2] }}>
              <Award size={12} color={t.colors.warningScale[500]} style={{ marginTop: t.spacing[1], flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                {letterData.benefits.join(' -- ')}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
